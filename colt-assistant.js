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
    if (normalizedInput.includes(normalizedPhrase)) return true;
    if (normalizedPhrase.length < 4) return false;
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

  function categoryRecommendations(category, links, limit) {
    return links.filter(link => link.category === category).slice(0, limit);
  }

  function choice(label, value, kind = "prompt") {
    return { label: String(label), value: String(value), kind };
  }

  function createResponder(options) {
    const knowledge = options.knowledge || {};
    const getLinks = options.getLinks || (() => []);
    const getCategories = options.getCategories || (() => []);
    const getRules = options.getRules || (() => knowledge.classroomRules || []);
    const isLinksReady = options.isLinksReady || (() => true);
    const limit = Math.max(1, Math.min(3, Number(knowledge.recommendationLimit) || 3));

    function recommendCategory(category) {
      if (!isLinksReady()) return { text: knowledge.responses.linksLoading };
      const links = safeApprovedLinks(getLinks);
      const recommendations = categoryRecommendations(category, links, limit);
      if (!recommendations.length) return { text: knowledge.responses.noApprovedMatches };
      return {
        text: `${knowledge.responses.recommendationsIntro} ${category}`,
        recommendations,
        reminder: knowledge.externalLinks.reminder,
        choices: [choice("Show another category", "Help me choose an activity.")]
      };
    }

    function respond(rawInput) {
      const input = String(rawInput || "").slice(0, 300);
      const normalized = normalizeText(input);
      if (!normalized) return { text: "Type a short classroom question or choose one of the buttons." };

      if (looksSensitive(input)) {
        return { text: knowledge.responses.privateInformation, sensitive: true };
      }

      if (matchesAny(normalized, knowledge.intentKeywords.loginHelp)) {
        return { text: knowledge.responses.loginHelp, sensitive: /\b(password|activation|code|pin)\b/i.test(normalized) };
      }

      if (matchesAny(normalized, knowledge.intentKeywords.permission)) {
        return { text: knowledge.responses.permission };
      }

      if (matchesAny(normalized, knowledge.intentKeywords.unapprovedWebsite)) {
        return { text: knowledge.responses.unapprovedWebsite };
      }

      const troubleshooting = (knowledge.troubleshooting || []).find(item => matchesAny(normalized, item.keywords));
      if (troubleshooting) {
        return {
          text: troubleshooting.response,
          choices: [choice("I still need help", "I still need help with this computer problem.")]
        };
      }

      if (matchesAny(normalized, ["still need help", "still not working", "did not fix", "didn't fix"])) {
        return { text: "Please stop troubleshooting and ask Mr. Nieves for help." };
      }

      if (matchesAny(normalized, knowledge.intentKeywords.classroomRules)) {
        return {
          text: knowledge.responses.rulesIntro,
          list: getRules(),
          choices: [choice("Help me choose an activity", "Help me choose an activity.")]
        };
      }

      if (matchesAny(normalized, knowledge.intentKeywords.earlyFinisher)) {
        return {
          text: knowledge.earlyFinisher.response,
          choices: (knowledge.earlyFinisher.followUps || []).map(label => choice(label, label))
        };
      }

      if (matchesAny(normalized, knowledge.intentKeywords.navigationHelp)) {
        return { text: knowledge.responses.navigation };
      }

      if (matchesAny(normalized, knowledge.intentKeywords.computerHelp)) {
        return {
          text: knowledge.responses.computerHelp,
          choices: (knowledge.troubleshootingChoices || []).map(label => choice(label, label))
        };
      }

      const categories = getCategories();
      const requestedCategory = categoryForInput(normalized, knowledge, categories);
      if (requestedCategory) return recommendCategory(requestedCategory);

      if (isLinksReady()) {
        const approvedLinks = safeApprovedLinks(getLinks);
        const website = matchingWebsite(normalized, approvedLinks);
        if (website) {
          return {
            text: knowledge.responses.recommendationsIntro,
            recommendations: [website],
            reminder: knowledge.externalLinks.reminder
          };
        }
      }

      if (matchesAny(normalized, knowledge.intentKeywords.chooseActivity)) {
        return {
          text: "What kind of approved activity would you like?",
          choices: (knowledge.activityChoices || []).map(item => choice(item.label, item.category, "category"))
        };
      }

      if (matchesAny(normalized, knowledge.intentKeywords.websiteSearch)) {
        return isLinksReady()
          ? { text: knowledge.responses.unapprovedWebsite }
          : { text: knowledge.responses.linksLoading };
      }

      return { text: knowledge.responses.unknown };
    }

    return { respond, recommendCategory };
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
    const headingMark = buildElement("span", "colt-assistant-heading-mark", "C");
    headingMark.setAttribute("aria-hidden", "true");
    const titleWrap = buildElement("div");
    const kicker = buildElement("span", "feature-kicker", "Classroom Helper");
    const title = buildElement("h2", "", knowledge.assistantName);
    title.id = "coltAssistantTitle";
    titleWrap.append(kicker, title);
    headingWrap.append(headingMark, titleWrap);
    const close = buildElement("button", "colt-assistant-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Close Colt Assistant");
    header.append(headingWrap, close);

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
    input.maxLength = 300;
    input.autocomplete = "off";
    input.placeholder = "Ask a classroom question…";
    const send = buildElement("button", "primary-btn", "Send");
    send.type = "submit";
    form.append(label, input, send);
    footer.append(clear, form);
    panel.append(header, conversation, footer);
    root.append(launcher, panel);

    function scrollConversation() {
      conversation.scrollTop = conversation.scrollHeight;
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
      choices.forEach(item => {
        const button = buildElement("button", "colt-assistant-choice", item.label);
        button.type = "button";
        button.dataset.choiceValue = item.value;
        button.dataset.choiceKind = item.kind || "prompt";
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
      scrollConversation();
    }

    function addWelcome() {
      appendAssistantResponse({ text: knowledge.welcomeMessage });
      appendChoices((knowledge.suggestedQuestions || []).map(label => choice(label, label)));
    }

    function submitPrompt(value) {
      const prompt = String(value || "").trim().slice(0, 300);
      if (!prompt) return;
      const response = responder.respond(prompt);
      appendUserMessage(prompt, response.sensitive);
      appendAssistantResponse(response);
      input.value = "";
      input.focus();
    }

    function openPanel() {
      panel.hidden = false;
      launcher.setAttribute("aria-expanded", "true");
      launcher.hidden = true;
      input.focus();
    }

    function closePanel() {
      panel.hidden = true;
      launcher.hidden = false;
      launcher.setAttribute("aria-expanded", "false");
      launcher.focus();
    }

    function clearConversation() {
      conversation.replaceChildren();
      addWelcome();
      input.focus();
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
    clear.addEventListener("click", clearConversation);
    form.addEventListener("submit", event => {
      event.preventDefault();
      submitPrompt(input.value);
    });
    conversation.addEventListener("click", event => {
      const approvedButton = event.target.closest("[data-approved-link-id]");
      if (approvedButton) {
        bridge.openApprovedLink(approvedButton.dataset.approvedLinkId);
        return;
      }
      const choiceButton = event.target.closest("[data-choice-value]");
      if (!choiceButton) return;
      appendUserMessage(choiceButton.textContent, false);
      const response = choiceButton.dataset.choiceKind === "category"
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
