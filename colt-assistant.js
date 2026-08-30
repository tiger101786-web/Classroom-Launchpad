(function createColtAssistant(globalObject) {
  "use strict";

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’']/g, "'")
      .replace(/[^a-z0-9@.'\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 300);
  }

  function words(value) {
    return normalizeText(value).split(/\s+/).filter(Boolean);
  }

  function editDistance(left, right) {
    const a = String(left || "");
    const b = String(right || "");
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let row = 1; row <= a.length; row += 1) {
      let diagonal = previous[0];
      previous[0] = row;
      for (let column = 1; column <= b.length; column += 1) {
        const old = previous[column];
        previous[column] = Math.min(
          previous[column] + 1,
          previous[column - 1] + 1,
          diagonal + (a[row - 1] === b[column - 1] ? 0 : 1)
        );
        diagonal = old;
      }
    }
    return previous[b.length];
  }

  function similarity(left, right) {
    const a = normalizeText(left);
    const b = normalizeText(right);
    if (!a || !b) return 0;
    if (a === b) return 1;
    const longest = Math.max(a.length, b.length);
    return longest ? 1 - editDistance(a, b) / longest : 0;
  }

  function phraseMatches(input, phrase) {
    const normalizedInput = normalizeText(input);
    const normalizedPhrase = normalizeText(phrase);
    if (!normalizedInput || !normalizedPhrase) return false;
    if (normalizedPhrase.length < 4) return words(normalizedInput).includes(normalizedPhrase);
    if (normalizedInput.includes(normalizedPhrase)) return true;
    if (similarity(normalizedInput, normalizedPhrase) >= 0.82) return true;
    const inputWords = words(normalizedInput);
    const phraseWords = words(normalizedPhrase);
    return phraseWords.every(phraseWord => inputWords.some(inputWord => (
      inputWord === phraseWord
      || (phraseWord.length >= 4 && inputWord.length >= 3 && similarity(inputWord, phraseWord) >= 0.72)
    )));
  }

  function matchesAny(input, phrases) {
    return (Array.isArray(phrases) ? phrases : []).some(phrase => phraseMatches(input, phrase));
  }

  function looksSensitive(input) {
    const raw = String(input || "");
    const normalized = normalizeText(raw);
    const email = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i.test(raw);
    const credential = /\b(my\s+)?(password|passcode|activation\s*code|login\s*code|pin)\s*(is|=|:)\s*\S+/i.test(raw);
    const privateRecord = /\b(what\s+is|tell\s+me|show\s+me)\s+(my\s+)?(grade|grades|record|records|email|account)\b/i.test(normalized);
    const studentIdentity = /\bmy\s+(full\s+)?name\s+is\b/i.test(normalized);
    return email || credential || privateRecord || studentIdentity;
  }

  function safeApprovedLinks(getLinks) {
    const entries = typeof getLinks === "function" ? getLinks() : [];
    const seen = new Set();
    return (Array.isArray(entries) ? entries : []).flatMap(entry => {
      if (!entry || entry.active === false) return [];
      const id = String(entry.id || "").slice(0, 100);
      const title = String(entry.title || "").trim().slice(0, 120);
      const instruction = String(entry.instruction || "").trim().slice(0, 500);
      const category = String(entry.category || "").trim().slice(0, 80);
      const url = String(entry.url || "").trim();
      let protocol = "";
      try {
        protocol = new URL(url).protocol;
      } catch {
        return [];
      }
      if (!id || !title || !category || !["http:", "https:"].includes(protocol) || seen.has(id)) return [];
      seen.add(id);
      return [{ id, title, instruction, category }];
    });
  }

  function categoryForInput(input, knowledge, categories) {
    const available = new Set(Array.isArray(categories) ? categories : []);
    let best = null;
    let bestScore = 0;
    Object.entries(knowledge.categoryKeywords || {}).forEach(([category, phrases]) => {
      if (!available.has(category)) return;
      (Array.isArray(phrases) ? phrases : []).forEach(phrase => {
        if (!phraseMatches(input, phrase)) return;
        const score = normalizeText(input).includes(normalizeText(phrase)) ? 1 : similarity(input, phrase);
        if (score > bestScore) {
          best = category;
          bestScore = score;
        }
      });
    });
    return best;
  }

  function matchingWebsite(input, links) {
    const normalizedInput = normalizeText(input);
    const meaningful = words(normalizedInput).filter(word => ![
      "a", "an", "the", "to", "can", "i", "go", "open", "show", "me", "website", "site", "please"
    ].includes(word));
    let best = null;
    let bestScore = 0;
    links.forEach(link => {
      const title = normalizeText(link.title);
      let score = normalizedInput.includes(title) ? 1 : similarity(meaningful.join(" "), title);
      if (meaningful.some(word => word.length >= 4 && title.split(/\s+/).some(titleWord => similarity(word, titleWord) >= 0.78))) {
        score = Math.max(score, 0.82);
      }
      if (score > bestScore) {
        best = link;
        bestScore = score;
      }
    });
    return bestScore >= 0.72 ? best : null;
  }

  function categoryRecommendations(category, links, limit, excludedIds = new Set()) {
    return links
      .filter(link => link.category === category && !excludedIds.has(link.id))
      .slice(0, limit);
  }

  function choice(label, value, kind = "prompt") {
    return { label: String(label), value: String(value), kind };
  }

  function createResponder(options) {
    const knowledge = options.knowledge || {};
    const getLinks = options.getLinks || (() => []);
    const getCategories = options.getCategories || (() => []);
    const getRules = options.getRules || (() => knowledge.classroomRules || []);
    const getTodayDirections = options.getTodayDirections || (() => "");
    const isLinksReady = options.isLinksReady || (() => true);
    const limit = Math.max(1, Math.min(3, Number(knowledge.recommendationLimit) || 3));
    const state = {
      lastCategory: "",
      lastIntent: "",
      lastResponse: null,
      shownLinkIds: new Map(),
      responseCounters: new Map()
    };

    function pickResponse(key, responses, fallback = "") {
      const choices = Array.isArray(responses) ? responses.filter(Boolean) : [responses].filter(Boolean);
      if (!choices.length) return fallback;
      const index = state.responseCounters.get(key) || 0;
      state.responseCounters.set(key, index + 1);
      return choices[index % choices.length];
    }

    function record(response, intent, category = "") {
      const safeResponse = response || { text: knowledge.responses.unknown };
      state.lastIntent = intent;
      if (category) state.lastCategory = category;
      state.lastResponse = {
        ...safeResponse,
        recommendations: Array.isArray(safeResponse.recommendations) ? [...safeResponse.recommendations] : undefined,
        choices: Array.isArray(safeResponse.choices) ? [...safeResponse.choices] : undefined,
        list: Array.isArray(safeResponse.list) ? [...safeResponse.list] : undefined
      };
      return safeResponse;
    }

    function activityChoices() {
      return (knowledge.activityChoices || []).map(item => choice(item.label, item.category, "category"));
    }

    function mainHelpChoices() {
      return [
        choice("Choose an activity", "Help me choose an activity."),
        choice("Find a website", "Show me a website."),
        choice("Classroom rules", "What are the classroom rules?"),
        choice("Computer help", "I need help with my computer.")
      ];
    }

    function recommendCategory(category, showMore = false) {
      if (!isLinksReady()) return record({ text: knowledge.responses.linksLoading }, "links-loading");
      const links = safeApprovedLinks(getLinks);
      const previouslyShown = showMore && state.lastCategory === category
        ? state.shownLinkIds.get(category) || new Set()
        : new Set();
      let recommendations = categoryRecommendations(category, links, limit, previouslyShown);
      let wrapped = false;
      if (!recommendations.length && previouslyShown.size) {
        recommendations = categoryRecommendations(category, links, limit);
        previouslyShown.clear();
        wrapped = true;
      }
      if (!recommendations.length) return record({ text: knowledge.responses.noApprovedMatches }, "no-matches", category);
      recommendations.forEach(link => previouslyShown.add(link.id));
      state.shownLinkIds.set(category, previouslyShown);
      const totalInCategory = links.filter(link => link.category === category).length;
      const hasMore = totalInCategory > recommendations.length;
      return record({
        text: wrapped
          ? `We reached the end, so here are the first approved ${category} choices again.`
          : showMore
            ? `Here are more approved ${category} choices:`
            : `${knowledge.responses.recommendationsIntro} ${category}`,
        recommendations,
        reminder: knowledge.externalLinks.reminder,
        choices: [
          ...(hasMore ? [choice("Show me more", "Show me more.")] : []),
          choice("Choose something else", "Help me choose an activity.")
        ]
      }, "category-recommendation", category);
    }

    function respond(rawInput) {
      const input = String(rawInput || "").slice(0, 300);
      const normalized = normalizeText(input);
      const conversation = knowledge.conversationKeywords || {};
      const conversationResponses = knowledge.conversationResponses || {};
      if (!normalized) return record({ text: "Type a short classroom question or choose one of the buttons." }, "empty");

      if (looksSensitive(input)) {
        return record({ text: knowledge.responses.privateInformation, sensitive: true }, "privacy");
      }

      if (matchesAny(normalized, knowledge.intentKeywords.loginHelp)) {
        return record({
          text: knowledge.responses.loginHelp,
          sensitive: /\b(password|activation|code|pin)\b/i.test(normalized)
        }, "login-help");
      }

      if (matchesAny(normalized, knowledge.intentKeywords.permission)) {
        return record({ text: knowledge.responses.permission }, "permission");
      }

      if (matchesAny(normalized, knowledge.intentKeywords.unapprovedWebsite)) {
        return record({ text: knowledge.responses.unapprovedWebsite }, "unapproved-website");
      }

      const troubleshootingItems = knowledge.troubleshooting || [];
      let troubleshooting = troubleshootingItems.find(item => matchesAny(normalized, item.keywords));
      if (!troubleshooting) {
        const problemWords = [
          "fix", "broken", "problem", "problems", "issue", "issues", "trouble",
          "difficulty", "not working", "does not work", "doesn't work", "wont work",
          "won't work", "cannot use", "can't use"
        ];
        const deviceTroubleshooting = [
          { id: "keyboard", words: ["keyboard", "keys"] },
          { id: "mouse", words: ["mouse", "trackpad", "cursor", "pointer"] },
          { id: "no-sound", words: ["sound", "audio", "volume"] },
          { id: "headphones", words: ["headphones", "headphone", "earbuds"] },
          { id: "website-loading", words: ["website", "site", "page"] },
          { id: "email", words: ["email", "message", "attachment"] },
          { id: "usb", words: ["usb", "flash drive", "thumb drive"] },
          { id: "wifi", words: ["wifi", "wi-fi", "internet", "connection", "offline"] },
          { id: "camera-microphone", words: ["camera", "webcam", "microphone", "mic"] },
          { id: "charging", words: ["charger", "charging", "battery", "power"] },
          { id: "download-upload", words: ["download", "upload", "file"] },
          { id: "copy-paste", words: ["copy", "paste", "clipboard"] },
          { id: "screen-display", words: ["screen", "display", "brightness"] }
        ];
        const deviceMatch = deviceTroubleshooting.find(item => (
          matchesAny(normalized, item.words) && matchesAny(normalized, problemWords)
        ));
        if (deviceMatch) {
          troubleshooting = troubleshootingItems.find(item => item.id === deviceMatch.id);
        }
      }
      if (troubleshooting) {
        return record({
          text: troubleshooting.response,
          choices: [choice("I still need help", "I still need help with this computer problem.")]
        }, "troubleshooting");
      }

      if (matchesAny(normalized, ["still need help", "still not working", "did not fix", "didn't fix"])) {
        return record({ text: "Please stop troubleshooting and ask Mr. Nieves for help." }, "escalation");
      }

      if (matchesAny(normalized, knowledge.intentKeywords.todayDirections)) {
        const directions = String(getTodayDirections() || "").trim();
        return record({
          text: directions
            ? `${knowledge.responses.todayDirectionsIntro}\n${directions}`
            : "Today’s directions are not available yet. Please check with Mr. Nieves."
        }, "today-directions");
      }

      if (matchesAny(normalized, knowledge.intentKeywords.classroomRules)) {
        return record({
          text: knowledge.responses.rulesIntro,
          list: getRules(),
          choices: [choice("Help me choose an activity", "Help me choose an activity.")]
        }, "classroom-rules");
      }

      if (matchesAny(normalized, knowledge.intentKeywords.earlyFinisher)) {
        return record({
          text: knowledge.earlyFinisher.response,
          choices: (knowledge.earlyFinisher.followUps || []).map(label => choice(label, label))
        }, "early-finisher");
      }

      if (matchesAny(normalized, knowledge.intentKeywords.navigationHelp)) {
        return record({ text: knowledge.responses.navigation }, "navigation");
      }

      if (matchesAny(normalized, knowledge.intentKeywords.computerHelp)) {
        return record({
          text: knowledge.responses.computerHelp,
          choices: (knowledge.troubleshootingChoices || []).map(label => choice(label, label))
        }, "computer-help");
      }

      if (matchesAny(normalized, conversation.repeat)) {
        if (!state.lastResponse) {
          return record({ text: conversationResponses.noContextForRepeat }, "conversation-repeat");
        }
        return record({
          ...state.lastResponse,
          text: `Sure—here it is again:\n${state.lastResponse.text}`
        }, "conversation-repeat", state.lastCategory);
      }

      if (matchesAny(normalized, conversation.more) || matchesAny(normalized, conversation.negativeChoice)) {
        if (state.lastCategory) return recommendCategory(state.lastCategory, true);
        return record({
          text: conversationResponses.noContextForMore,
          choices: activityChoices()
        }, "conversation-more");
      }

      if (matchesAny(normalized, conversation.greeting)) {
        return record({
          text: pickResponse("greeting", conversationResponses.greeting),
          choices: mainHelpChoices()
        }, "conversation-greeting");
      }

      if (
        matchesAny(normalized, conversation.capabilities)
        && !matchesAny(normalized, knowledge.intentKeywords.chooseActivity)
      ) {
        return record({
          text: conversationResponses.capabilities,
          choices: mainHelpChoices()
        }, "conversation-capabilities");
      }

      if (matchesAny(normalized, conversation.identity)) {
        return record({
          text: conversationResponses.identity,
          choices: [choice("What can you do?", "What can you do?")]
        }, "conversation-identity");
      }

      if (matchesAny(normalized, conversation.wellbeing)) {
        return record({
          text: pickResponse("wellbeing", conversationResponses.wellbeing),
          choices: mainHelpChoices()
        }, "conversation-wellbeing");
      }

      if (matchesAny(normalized, conversation.thanks)) {
        return record({
          text: pickResponse("thanks", conversationResponses.thanks),
          choices: [choice("Choose another activity", "Help me choose an activity.")]
        }, "conversation-thanks");
      }

      if (matchesAny(normalized, conversation.goodbye)) {
        return record({ text: pickResponse("goodbye", conversationResponses.goodbye) }, "conversation-goodbye");
      }

      if (matchesAny(normalized, conversation.joke)) {
        return record({
          text: pickResponse("jokes", conversationResponses.jokes),
          choices: [
            choice("Another joke", "Tell me a joke."),
            choice("Choose an activity", "Help me choose an activity.")
          ]
        }, "conversation-joke");
      }

      if (matchesAny(normalized, conversation.bored)) {
        return record({
          text: conversationResponses.bored,
          choices: activityChoices()
        }, "conversation-bored");
      }

      if (matchesAny(normalized, conversation.encouragement)) {
        return record({
          text: conversationResponses.encouragement,
          choices: [
            choice("Computer help", "I need help with my computer."),
            choice("Ask Mr. Nieves", "I still need help.")
          ]
        }, "conversation-encouragement");
      }

      if (matchesAny(normalized, conversation.compliment)) {
        return record({
          text: conversationResponses.compliment,
          choices: [choice("What can you do?", "What can you do?")]
        }, "conversation-compliment");
      }

      if (matchesAny(normalized, conversation.affirmative)) {
        if (state.lastCategory) return recommendCategory(state.lastCategory, true);
        return record({
          text: conversationResponses.noContextForYes,
          choices: mainHelpChoices()
        }, "conversation-affirmative");
      }

      const categories = getCategories();
      const requestedCategory = categoryForInput(normalized, knowledge, categories);
      if (requestedCategory) return recommendCategory(requestedCategory);

      if (isLinksReady()) {
        const approvedLinks = safeApprovedLinks(getLinks);
        const website = matchingWebsite(normalized, approvedLinks);
        if (website) {
          const shown = state.shownLinkIds.get(website.category) || new Set();
          shown.add(website.id);
          state.shownLinkIds.set(website.category, shown);
          return record({
            text: knowledge.responses.recommendationsIntro,
            recommendations: [website],
            reminder: knowledge.externalLinks.reminder,
            choices: [choice("Show me more", "Show me more.")]
          }, "website-recommendation", website.category);
        }
      }

      if (matchesAny(normalized, knowledge.intentKeywords.chooseActivity)) {
        return record({
          text: "What kind of approved activity would you like?",
          choices: activityChoices()
        }, "choose-activity");
      }

      if (matchesAny(normalized, knowledge.intentKeywords.websiteSearch)) {
        return record(isLinksReady()
          ? { text: knowledge.responses.unapprovedWebsite }
          : { text: knowledge.responses.linksLoading }, "website-search");
      }

      return record({
        text: pickResponse("unknown", knowledge.unknownQuestionResponses, knowledge.responses.unknown),
        choices: [choice("What can you do?", "What can you do?")]
      }, "unknown");
    }

    function resetContext() {
      state.lastCategory = "";
      state.lastIntent = "";
      state.lastResponse = null;
      state.shownLinkIds.clear();
      state.responseCounters.clear();
    }

    function getContextSnapshot() {
      return {
        lastCategory: state.lastCategory,
        lastIntent: state.lastIntent,
        lastResponse: state.lastResponse ? {
          ...state.lastResponse,
          recommendations: Array.isArray(state.lastResponse.recommendations) ? [...state.lastResponse.recommendations] : undefined,
          choices: Array.isArray(state.lastResponse.choices) ? [...state.lastResponse.choices] : undefined,
          list: Array.isArray(state.lastResponse.list) ? [...state.lastResponse.list] : undefined
        } : null,
        shownLinkIds: Array.from(state.shownLinkIds, ([category, ids]) => [category, Array.from(ids)]),
        responseCounters: Array.from(state.responseCounters)
      };
    }

    function restoreContext(snapshot) {
      const source = snapshot && typeof snapshot === "object" ? snapshot : {};
      state.lastCategory = String(source.lastCategory || "");
      state.lastIntent = String(source.lastIntent || "");
      state.lastResponse = source.lastResponse || null;
      state.shownLinkIds = new Map(
        Array.isArray(source.shownLinkIds)
          ? source.shownLinkIds.map(([category, ids]) => [category, new Set(Array.isArray(ids) ? ids : [])])
          : []
      );
      state.responseCounters = new Map(Array.isArray(source.responseCounters) ? source.responseCounters : []);
    }

    return { respond, recommendCategory, resetContext, getContextSnapshot, restoreContext };
  }

  function buildElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = String(text);
    return element;
  }

  function mountAssistant() {
    const knowledge = globalObject.COLT_ASSISTANT_KNOWLEDGE;
    const bridge = globalObject.ClassroomLaunchpadAssistantData;
    const root = document.getElementById("coltAssistantRoot");
    if (!knowledge || !bridge || !root || knowledge.enabled === false) return;

    const responder = createResponder({
      knowledge,
      getLinks: bridge.getApprovedLinks,
      getCategories: bridge.getCategories,
      getRules: bridge.getClassroomRules,
      getTodayDirections: bridge.getTodayDirections,
      isLinksReady: bridge.isApprovedLinksReady
    });

    const launcher = buildElement("button", "colt-assistant-launcher");
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Open Colt Assistant");
    launcher.setAttribute("aria-expanded", "false");
    const launcherMark = buildElement("span", "colt-assistant-launcher-mark", "C");
    launcherMark.setAttribute("aria-hidden", "true");
    launcher.append(launcherMark, buildElement("span", "", knowledge.assistantName));

    const panel = buildElement("section", "colt-assistant-panel");
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-labelledby", "coltAssistantTitle");

    const header = buildElement("header", "colt-assistant-header");
    const headingWrap = buildElement("div", "colt-assistant-heading");
    const headingMark = buildElement("span", "colt-assistant-heading-mark");
    headingMark.setAttribute("aria-hidden", "true");
    const headingHorse = document.createElement("img");
    headingHorse.src = "assets/colt-radio-header-portrait.png?v=20260829-guided-ai";
    headingHorse.alt = "";
    headingMark.append(headingHorse);
    const titleWrap = buildElement("div");
    const kicker = buildElement("span", "feature-kicker", "Private Classroom Helper");
    const title = buildElement("h2", "", knowledge.assistantName);
    title.id = "coltAssistantTitle";
    titleWrap.append(kicker, title);
    headingWrap.append(headingMark, titleWrap);
    const close = buildElement("button", "colt-assistant-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Close Colt Assistant");
    header.append(headingWrap, close);

    const toolbar = buildElement("nav", "colt-assistant-toolbar");
    toolbar.setAttribute("aria-label", "Colt Assistant controls");
    const home = buildElement("button", "colt-assistant-tool", "Home");
    home.type = "button";
    home.setAttribute("aria-label", "Return to Colt Assistant home");
    const back = buildElement("button", "colt-assistant-tool", "Back");
    back.type = "button";
    back.disabled = true;
    back.setAttribute("aria-label", "Go back one Colt Assistant step");
    const readAloud = buildElement("button", "colt-assistant-tool is-read", "Read Aloud");
    readAloud.type = "button";
    readAloud.setAttribute("aria-label", "Read the latest Colt Assistant response aloud");
    if (!("speechSynthesis" in globalObject) || !("SpeechSynthesisUtterance" in globalObject)) readAloud.hidden = true;
    toolbar.append(home, back, readAloud);

    const modeNav = buildElement("nav", "colt-assistant-modes");
    modeNav.setAttribute("aria-label", "Choose a Colt Assistant mode");
    const helpMode = buildElement("button", "colt-assistant-mode is-active", "Classroom Help");
    const guidedMode = buildElement("button", "colt-assistant-mode", "Guided AI");
    const imageMode = buildElement("button", "colt-assistant-mode", "Create Image");
    [helpMode, guidedMode, imageMode].forEach(button => {
      button.type = "button";
      button.setAttribute("aria-pressed", button === helpMode ? "true" : "false");
    });
    helpMode.dataset.assistantMode = "help";
    guidedMode.dataset.assistantMode = "guided";
    imageMode.dataset.assistantMode = "image";
    modeNav.append(helpMode, guidedMode, imageMode);

    const conversation = buildElement("div", "colt-assistant-conversation");
    conversation.setAttribute("aria-live", "polite");
    conversation.setAttribute("aria-label", "Colt Assistant conversation");

    const footer = buildElement("footer", "colt-assistant-footer");
    const clear = buildElement("button", "colt-assistant-clear", "Clear Conversation");
    clear.type = "button";
    const form = buildElement("form", "colt-assistant-form");
    const label = buildElement("label", "sr-only", "Ask Colt Assistant");
    label.htmlFor = "coltAssistantInput";
    const input = buildElement("input", "colt-assistant-input");
    input.id = "coltAssistantInput";
    input.type = "text";
    input.maxLength = 600;
    input.autocomplete = "off";
    input.placeholder = "Ask a classroom question…";
    const send = buildElement("button", "primary-btn", "Send");
    send.type = "submit";
    form.append(label, input, send);
    footer.append(clear, form);
    panel.append(header, toolbar, modeNav, conversation, footer);
    root.append(launcher, panel);

    const conversationHistory = [];
    const guidedHistory = [];
    let activeMode = "help";
    let aiConfig = null;
    let requestInProgress = false;
    let lastReadableText = "";
    let isReading = false;

    function scrollConversation() {
      conversation.scrollTop = conversation.scrollHeight;
    }

    function stopReading() {
      if ("speechSynthesis" in globalObject) globalObject.speechSynthesis.cancel();
      isReading = false;
      readAloud.textContent = "Read Aloud";
      readAloud.setAttribute("aria-label", "Read the latest Colt Assistant response aloud");
    }

    function updateBackButton() {
      back.disabled = conversationHistory.length === 0;
    }

    function saveConversationStep() {
      if (activeMode === "image") {
        conversationHistory.length = 0;
        updateBackButton();
        return;
      }
      conversationHistory.push({
        nodes: Array.from(conversation.childNodes).map(node => node.cloneNode(true)),
        context: responder.getContextSnapshot(),
        lastReadableText
      });
      if (conversationHistory.length > 20) conversationHistory.shift();
      updateBackButton();
    }

    function appendUserMessage(text, sensitive) {
      const row = buildElement("div", "colt-assistant-message-row is-student");
      const bubble = buildElement(
        "div",
        "colt-assistant-message is-student",
        sensitive ? knowledge.responses.sensitiveHidden : text
      );
      row.append(bubble);
      conversation.append(row);
    }

    function appendChoices(choices) {
      if (!Array.isArray(choices) || !choices.length) return;
      const wrap = buildElement("div", "colt-assistant-choices");
      if (choices.some(item => item.kind === "primary")) wrap.classList.add("is-primary-menu");
      if (choices.some(item => item.kind === "more-option")) wrap.classList.add("is-more-menu");
      choices.forEach(item => {
        const button = buildElement("button", "colt-assistant-choice", item.label);
        button.type = "button";
        button.dataset.choiceValue = item.value;
        button.dataset.choiceKind = item.kind || "prompt";
        if (item.kind === "primary" || item.kind === "focus") button.classList.add("is-primary");
        if (item.kind === "more") button.classList.add("is-more");
        wrap.append(button);
      });
      conversation.append(wrap);
    }

    function appendRecommendations(recommendations, reminder) {
      if (!Array.isArray(recommendations)) return;
      recommendations.slice(0, 3).forEach(link => {
        const card = buildElement("article", "colt-assistant-recommendation");
        card.append(
          buildElement("h3", "", link.title),
          buildElement("p", "instruction", link.instruction || "Choose this teacher-approved website."),
          buildElement("p", "meta", link.category)
        );
        const open = buildElement("button", "primary-btn", "Open Website");
        open.type = "button";
        open.dataset.approvedLinkId = link.id;
        card.append(open);
        conversation.append(card);
      });
      if (reminder) conversation.append(buildElement("p", "colt-assistant-reminder", reminder));
    }

    function appendAssistantResponse(response) {
      const row = buildElement("div", "colt-assistant-message-row is-assistant");
      const bubble = buildElement("div", "colt-assistant-message is-assistant");
      const paragraphs = String(response.text || knowledge.responses.unknown).split("\n");
      paragraphs.forEach(line => bubble.append(buildElement("p", "", line)));
      if (Array.isArray(response.list) && response.list.length) {
        const list = buildElement("ol", "colt-assistant-list");
        response.list.forEach(item => list.append(buildElement("li", "", item)));
        bubble.append(list);
      }
      row.append(bubble);
      conversation.append(row);
      appendRecommendations(response.recommendations, response.reminder);
      appendChoices(response.choices);
      lastReadableText = [
        response.text,
        ...(Array.isArray(response.list) ? response.list : [])
      ].filter(Boolean).join(". ");
      scrollConversation();
    }

    function appendLoadingMessage(text) {
      const row = buildElement("div", "colt-assistant-message-row is-assistant colt-assistant-loading-row");
      const bubble = buildElement("div", "colt-assistant-message is-assistant colt-assistant-loading", text);
      bubble.setAttribute("role", "status");
      row.append(bubble);
      conversation.append(row);
      scrollConversation();
      return row;
    }

    function appendGeneratedImage(payload) {
      const card = buildElement("article", "colt-assistant-image-card");
      const image = document.createElement("img");
      image.src = String(payload.image || "");
      image.alt = String(payload.label || "AI-generated classroom image");
      const details = buildElement("div", "colt-assistant-image-details");
      details.append(
        buildElement("span", "feature-kicker", "AI-Generated"),
        buildElement("strong", "", "Classroom Image Creator"),
        buildElement("p", "", String(payload.prompt || ""))
      );
      const download = document.createElement("a");
      download.className = "primary-btn colt-assistant-image-download";
      download.href = image.src;
      download.download = "colt-assistant-image.png";
      download.textContent = "Download Image";
      details.append(download);
      card.append(image, details);
      conversation.append(card);
      lastReadableText = "Your classroom image is ready. AI-generated images can make mistakes, so review it before using it in schoolwork.";
      conversation.append(buildElement("p", "colt-assistant-reminder", lastReadableText));
      scrollConversation();
    }

    async function fetchAssistantJson(path, options = {}) {
      const response = await fetch(path, {
        credentials: "same-origin",
        ...options,
        headers: { "Content-Type": "application/json", ...(options.headers || {}) }
      });
      let payload = {};
      try {
        payload = await response.json();
      } catch {}
      if (!response.ok) {
        const error = new Error(payload.error || "Colt Assistant could not complete that request.");
        error.code = payload.code || "ASSISTANT_ERROR";
        throw error;
      }
      return payload;
    }

    async function loadAiConfig() {
      if (aiConfig && !aiConfig.error) return aiConfig;
      try {
        aiConfig = await fetchAssistantJson("/api/colt-assistant/config", { method: "GET", headers: {} });
      } catch (error) {
        aiConfig = { enabled: false, imageEnabled: false, error: error.message };
      }
      // A signed-out request can fail before a student logs in. Keep the tabs
      // available in that case so the configuration can be retried after login.
      if (!aiConfig.error) {
        guidedMode.disabled = !aiConfig.enabled;
        imageMode.disabled = !aiConfig.imageEnabled;
      }
      return aiConfig;
    }

    function appendHomeMenu() {
      appendChoices((knowledge.primaryActions || []).map(item => choice(item.label, item.prompt, item.kind)));
      appendChoices([choice("More Help", "__more_help__", "more")]);
    }

    function addWelcome() {
      if (activeMode === "guided") {
        appendAssistantResponse({
          text: "Guided AI helps you think through schoolwork without doing the assignment for you. Tell me what you are learning and what you have tried so far.\nDo not enter your name, email, password, activation code, phone number, or home address."
        });
        return;
      }
      if (activeMode === "image") {
        appendAssistantResponse({
          text: "Describe a school-appropriate educational image, diagram, poster, background, or story scene. Do not include private information or photographs of students."
        });
        return;
      }
      appendAssistantResponse({ text: knowledge.welcomeMessage });
      appendHomeMenu();
    }

    async function submitPrompt(value) {
      const prompt = String(value || "").trim().slice(0, activeMode === "image" ? 400 : 600);
      if (!prompt || requestInProgress) return;
      saveConversationStep();
      input.value = "";
      if (activeMode === "help") {
        const response = responder.respond(prompt);
        appendUserMessage(prompt, response.sensitive);
        appendAssistantResponse(response);
        input.focus();
        return;
      }
      if (looksSensitive(prompt)) {
        appendUserMessage(prompt, true);
        appendAssistantResponse({ text: knowledge.responses.sensitiveHidden });
        input.focus();
        return;
      }
      appendUserMessage(prompt, false);
      requestInProgress = true;
      send.disabled = true;
      input.disabled = true;
      const loading = appendLoadingMessage(activeMode === "image" ? "Creating a classroom-safe image…" : "Thinking of a helpful next step…");
      try {
        if (activeMode === "image") {
          const payload = await fetchAssistantJson("/api/colt-assistant/image", {
            method: "POST",
            body: JSON.stringify({ prompt })
          });
          loading.remove();
          appendGeneratedImage(payload);
        } else {
          const payload = await fetchAssistantJson("/api/colt-assistant/chat", {
            method: "POST",
            body: JSON.stringify({ prompt, history: guidedHistory.slice(-8) })
          });
          loading.remove();
          appendAssistantResponse({ text: payload.answer });
          guidedHistory.push({ role: "user", content: prompt }, { role: "assistant", content: payload.answer });
          if (guidedHistory.length > 16) guidedHistory.splice(0, guidedHistory.length - 16);
        }
      } catch (error) {
        loading.remove();
        appendAssistantResponse({ text: error.message });
      } finally {
        requestInProgress = false;
        send.disabled = false;
        input.disabled = false;
        input.focus();
      }
    }

    async function changeMode(mode) {
      if (!new Set(["help", "guided", "image"]).has(mode) || requestInProgress) return;
      if (mode !== "help") {
        const config = await loadAiConfig();
        if ((mode === "guided" && !config.enabled) || (mode === "image" && !config.imageEnabled)) {
          conversation.replaceChildren();
          appendAssistantResponse({ text: config.error || "This private AI mode is not available until Mr. Nieves finishes connecting the Windows AI service." });
          return;
        }
      }
      activeMode = mode;
      modeNav.querySelectorAll("[data-assistant-mode]").forEach(button => {
        const selected = button.dataset.assistantMode === mode;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      conversationHistory.length = 0;
      conversation.replaceChildren();
      responder.resetContext();
      input.placeholder = mode === "guided"
        ? "What are you learning?"
        : mode === "image"
          ? "Describe an educational image…"
          : "Ask a classroom question…";
      send.textContent = mode === "image" ? "Create" : "Send";
      addWelcome();
      updateBackButton();
      input.focus();
    }

    function openPanel() {
      panel.hidden = false;
      launcher.setAttribute("aria-expanded", "true");
      launcher.hidden = true;
      globalObject.dispatchEvent(new CustomEvent("colt-assistant-opened"));
      input.focus();
    }

    function closePanel() {
      stopReading();
      panel.hidden = true;
      launcher.hidden = false;
      launcher.setAttribute("aria-expanded", "false");
      launcher.focus();
    }

    function clearConversation() {
      stopReading();
      conversationHistory.length = 0;
      responder.resetContext();
      if (activeMode === "guided") guidedHistory.length = 0;
      conversation.replaceChildren();
      addWelcome();
      updateBackButton();
      input.focus();
    }

    function goBack() {
      const previous = conversationHistory.pop();
      if (!previous) return;
      stopReading();
      responder.restoreContext(previous.context);
      conversation.replaceChildren(...previous.nodes.map(node => node.cloneNode(true)));
      lastReadableText = previous.lastReadableText || "";
      updateBackButton();
      scrollConversation();
      input.focus();
    }

    function showMoreHelp() {
      saveConversationStep();
      appendUserMessage("More Help", false);
      appendAssistantResponse({
        text: "What else can I help you with?",
        choices: (knowledge.moreHelpActions || []).map(item => choice(item.label, item.prompt, "more-option"))
      });
      input.focus();
    }

    function focusQuestionInput() {
      if (lastReadableText === knowledge.responses.askQuestion) {
        input.focus();
        return;
      }
      saveConversationStep();
      appendAssistantResponse({ text: knowledge.responses.askQuestion });
      input.focus();
    }

    function toggleReadAloud() {
      if (isReading) {
        stopReading();
        return;
      }
      if (!lastReadableText || !("speechSynthesis" in globalObject)) return;
      globalObject.speechSynthesis.cancel();
      const utterance = new globalObject.SpeechSynthesisUtterance(lastReadableText);
      utterance.rate = 0.92;
      utterance.pitch = 1;
      utterance.onend = stopReading;
      utterance.onerror = stopReading;
      isReading = true;
      readAloud.textContent = "Stop Reading";
      readAloud.setAttribute("aria-label", "Stop reading Colt Assistant response");
      globalObject.speechSynthesis.speak(utterance);
    }

    function updateVisibility() {
      const screen = bridge.getCurrentScreen();
      const hiddenScreens = new Set(["coltRun", "pin", "login", "account", "dashboard", "edit", "changePin"]);
      const shouldHide = hiddenScreens.has(screen);
      root.hidden = shouldHide;
      root.classList.toggle("has-class-timer", Boolean(document.querySelector(".class-timer-badge")));
      if (shouldHide && !panel.hidden) {
        panel.hidden = true;
        launcher.hidden = false;
      }
    }

    launcher.addEventListener("click", openPanel);
    close.addEventListener("click", closePanel);
    home.addEventListener("click", clearConversation);
    back.addEventListener("click", goBack);
    readAloud.addEventListener("click", toggleReadAloud);
    clear.addEventListener("click", clearConversation);
    form.addEventListener("submit", event => {
      event.preventDefault();
      submitPrompt(input.value);
    });
    modeNav.addEventListener("click", event => {
      const button = event.target.closest("[data-assistant-mode]");
      if (button) changeMode(button.dataset.assistantMode);
    });
    conversation.addEventListener("click", event => {
      const approvedButton = event.target.closest("[data-approved-link-id]");
      if (approvedButton) {
        bridge.openApprovedLink(approvedButton.dataset.approvedLinkId);
        return;
      }
      const choiceButton = event.target.closest("[data-choice-value]");
      if (!choiceButton) return;
      const kind = choiceButton.dataset.choiceKind;
      if (kind === "focus") {
        focusQuestionInput();
        return;
      }
      if (kind === "more") {
        showMoreHelp();
        return;
      }
      saveConversationStep();
      appendUserMessage(choiceButton.textContent, false);
      const response = kind === "category"
        ? responder.recommendCategory(choiceButton.dataset.choiceValue)
        : responder.respond(choiceButton.dataset.choiceValue);
      appendAssistantResponse(response);
      input.focus();
    });
    panel.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePanel();
      }
    });
    globalObject.addEventListener("classroom-launchpad-rendered", updateVisibility);
    globalObject.addEventListener("colt-radio-opened", () => {
      if (!panel.hidden) closePanel();
    });

    addWelcome();
    updateVisibility();
  }

  const api = {
    normalizeText,
    similarity,
    looksSensitive,
    safeApprovedLinks,
    createResponder
  };

  globalObject.ColtAssistantCore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountAssistant);
    else mountAssistant();
  }
})(typeof window !== "undefined" ? window : globalThis);
