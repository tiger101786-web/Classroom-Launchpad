/*
 * Colt Assistant teacher settings
 * --------------------------------
 * Edit the words inside quotation marks to adjust the assistant.
 * Website names and addresses do not belong here. Colt Assistant always
 * reads the current approved websites directly from Classroom Launchpad.
 */
(function loadColtAssistantKnowledge(globalObject) {
  const knowledge = {
    enabled: true,
    assistantName: "Colt Assistant",
    welcomeMessage: "Hi! I’m the Colt Assistant. I can help you find an approved activity, understand classroom rules, or solve a simple computer problem. What do you need?",
    recommendationLimit: 3,
    externalLinks: {
      openInNewTab: true,
      reminder: "Stay on the assigned activity and ask Mr. Nieves before switching."
    },
    primaryActions: [
      { label: "Find an Activity", prompt: "Help me choose an activity.", kind: "primary" },
      { label: "Today’s Directions", prompt: "What are today’s directions?", kind: "primary" },
      { label: "Computer Help", prompt: "I need help with my computer.", kind: "primary" },
      { label: "Ask a Question", prompt: "", kind: "focus" }
    ],
    moreHelpActions: [
      { label: "Classroom Rules", prompt: "What are the classroom rules?" },
      { label: "I Finished Early", prompt: "What can I do when I’m finished?" },
      { label: "Using Launchpad", prompt: "How do I use Classroom Launchpad?" },
      { label: "What Can You Do?", prompt: "What can you do?" }
    ],
    suggestedQuestions: [
      "What can you do?",
      "Help me choose an activity.",
      "Show me creative websites.",
      "What can I do when I’m finished?",
      "What are the classroom rules?",
      "I need help with my computer.",
      "Show me logic games.",
      "Show me science websites."
    ],
    classroomRules: [
      "Stay on approved websites.",
      "Work quietly.",
      "Keep headphone volume low.",
      "Do not switch activities without permission.",
      "Ask before visiting an unlisted website.",
      "Use respectful and school-appropriate language."
    ],
    activityChoices: [
      { label: "Create something", category: "Creative Projects" },
      { label: "Play a learning game", category: "Review Games" },
      { label: "Solve a puzzle", category: "Logic Games" },
      { label: "Explore science", category: "Social Studies & Science" },
      { label: "Explore social studies", category: "Social Studies & Science" },
      { label: "Practice computer skills", category: "Computer Skills" },
      { label: "Watch a class video", category: "Class Videos" }
    ],
    categoryKeywords: {
      "Typing Practice": ["typing", "keyboard practice", "type faster", "keyboarding"],
      "Social Studies & Science": ["science", "social studies", "geography", "maps", "nature", "countries", "animals", "explore science"],
      "Computer Skills": ["computer skills", "digital skills", "internet safety", "mouse practice", "technology practice"],
      "Review Games": ["game", "learning game", "review game", "quiz game", "study game"],
      "Logic Games": ["logic", "puzzle", "brain game", "strategy", "thinking game"],
      "Creative Projects": ["creative", "create", "make something", "draw", "drawing", "art", "design", "music", "paint", "wana dra", "want to draw"],
      "Class Videos": ["video", "class video", "watch", "educational video"]
    },
    intentKeywords: {
      chooseActivity: ["choose an activity", "pick an activity", "what should i do", "help me choose", "something to do", "show me a game"],
      earlyFinisher: ["finished", "finish early", "early finisher", "done with my work", "done early", "when i finish", "when i'm finished"],
      classroomRules: ["rules", "expectations", "classroom rules", "what am i allowed", "class rules"],
      computerHelp: ["computer help", "help with my computer", "computer problem", "something is not working"],
      todayDirections: ["today's directions", "todays directions", "today's launch", "todays launch", "what do i do first", "what are we doing today", "what is today's assignment"],
      permission: ["can i switch", "may i switch", "switch activities", "do i have permission", "can i leave this activity"],
      loginHelp: ["login", "log in", "sign in", "account", "activation code", "password reset"],
      navigationHelp: ["how do i use", "where do i click", "return to classroom launchpad", "go back to classroom launchpad", "get back to launchpad", "find the home page"],
      unapprovedWebsite: ["not on the list", "unlisted website", "different website", "another website", "website that is not approved"],
      websiteSearch: ["find a website", "show me a website", "website for", "open website", "can i go to"]
    },
    conversationKeywords: {
      greeting: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "hi colt", "hello colt"],
      capabilities: ["what can you do", "what can u do", "how can you help", "can you help me", "help me", "what do you do"],
      identity: ["who are you", "what are you", "what is your name", "what's your name", "are you a person", "are you human", "are you a robot"],
      wellbeing: ["how are you", "how are u", "how is it going", "how's it going", "are you okay"],
      thanks: ["thank you", "thanks", "thank u", "thx", "that helped"],
      goodbye: ["bye", "goodbye", "see you", "see ya", "later"],
      more: ["show me more", "more choices", "another choice", "another one", "something else", "give me another", "other websites"],
      negativeChoice: ["no", "no thanks", "not that one", "i don't like those", "different choice"],
      affirmative: ["yes", "yes please", "sure", "okay", "ok", "sounds good"],
      repeat: ["say that again", "repeat that", "what did you say"],
      joke: ["tell me a joke", "another joke", "computer joke", "make me laugh"],
      bored: ["i am bored", "i'm bored", "this is boring", "nothing to do"],
      encouragement: ["this is hard", "i can't do this", "i dont understand", "i don't understand", "i am confused", "i'm confused"],
      compliment: ["you are cool", "you're cool", "good job", "you are helpful", "awesome"]
    },
    conversationResponses: {
      greeting: [
        "Hi! I’m ready to help. What would you like to do?",
        "Hello! Would you like an activity, a website, or computer help?",
        "Hey there! Let’s find something teacher-approved for you."
      ],
      capabilities: "I can help you find approved websites, choose an activity, review classroom rules, and solve simple computer problems. I can also understand some greetings and follow-up questions.",
      identity: "I’m Colt Assistant, a classroom helper built into Classroom Launchpad. I’m not a person, and I only use teacher-approved local information.",
      wellbeing: [
        "I’m ready and happy to help! What do you need?",
        "I’m doing great and ready for a classroom question.",
        "Ready to help! Should we find an activity or solve a computer problem?"
      ],
      thanks: [
        "You’re welcome!",
        "Happy to help!",
        "You got it! Let me know if you need another approved choice."
      ],
      goodbye: [
        "Goodbye! Have a great class.",
        "See you later! Remember to stay on your assigned activity.",
        "Bye! Ask Mr. Nieves if you need anything else."
      ],
      jokes: [
        "Why did the computer go to art class? It wanted to improve its graphics!",
        "What is a computer’s favorite snack? Microchips!",
        "Why was the keyboard so relaxed? It had plenty of space!"
      ],
      bored: "Let’s find a teacher-approved activity. What sounds interesting?",
      encouragement: "That’s okay. Try one small step at a time. Tell me what part is confusing, or ask Mr. Nieves if you need help with your assignment.",
      compliment: "Thank you! I’m glad I could help.",
      noContextForMore: "I can show more choices after we pick a category. What kind of activity would you like?",
      noContextForYes: "Great! What would you like help with?",
      noContextForRepeat: "Tell me what you would like repeated, or choose one of the classroom help buttons."
    },
    earlyFinisher: {
      response: "First, check Today’s Launch and make sure your assigned work is complete. Then choose a teacher-approved activity.",
      followUps: ["Create something", "Play a learning game", "Solve a puzzle", "Practice computer skills"]
    },
    troubleshooting: [
      {
        id: "no-sound",
        keywords: ["no sound", "sound does not work", "cannot hear", "can't hear", "audio not working"],
        response: "1. Check the website’s volume button.\n2. Make sure the Chromebook volume is not muted.\n3. Check that your headphones are fully plugged in.\n4. If there is still no sound, ask Mr. Nieves."
      },
      {
        id: "headphones",
        keywords: ["headphones not working", "headphone problem", "earbuds not working"],
        response: "1. Push the headphone plug in completely.\n2. Check that the volume is low but not muted.\n3. Try the website once more.\n4. Ask Mr. Nieves before changing any computer settings."
      },
      {
        id: "website-loading",
        keywords: ["website not loading", "site not loading", "page not loading", "website won't open", "site won't open"],
        response: "1. Wait a few seconds.\n2. Refresh the page one time.\n3. Return to Classroom Launchpad and try the approved button again.\n4. If it still does not load, ask Mr. Nieves."
      },
      {
        id: "frozen-page",
        keywords: ["frozen", "page is stuck", "screen is stuck", "not responding"],
        response: "1. Wait a few seconds.\n2. Refresh the page one time.\n3. If the computer is still frozen, stop and ask Mr. Nieves."
      },
      {
        id: "keyboard",
        keywords: [
          "keyboard not typing", "keyboard won't type", "keys not working", "cannot type", "can't type",
          "fix my keyboard", "keyboard problem", "keyboard is broken", "keyboard not working"
        ],
        response: "1. Click once inside the box where you want to type.\n2. Try one letter.\n3. Check that no key is being held down.\n4. If it still does not type, ask Mr. Nieves."
      },
      {
        id: "mouse",
        keywords: ["mouse not working", "trackpad not working", "cursor not moving", "pointer not moving"],
        response: "1. Move one finger gently on the trackpad.\n2. Click once and wait.\n3. If you use a mouse, check that it is connected.\n4. Ask Mr. Nieves before unplugging other equipment."
      },
      {
        id: "closed-page",
        keywords: ["closed a page", "accidentally closed", "closed my tab", "lost my page"],
        response: "Open Classroom Launchpad from your bookmark or use your browser’s back button. Then choose the approved website again."
      },
      {
        id: "return-launchpad",
        keywords: ["return to classroom launchpad", "go back to classroom launchpad", "get back to launchpad", "lost classroom launchpad"],
        response: "Use the Classroom Launchpad bookmark in your browser. If its tab is still open, click that tab. Ask Mr. Nieves if you cannot find it."
      }
    ],
    responses: {
      computerHelp: "Tell me which simple computer problem you have.",
      permission: "You may need permission before switching activities. Please check with Mr. Nieves.",
      loginHelp: "Please do not enter your password or activation code here. Ask Mr. Nieves for login or account help.",
      unapprovedWebsite: "That website is not currently on the approved list. Ask Mr. Nieves before visiting it.",
      privateInformation: "Please do not enter names, passwords, email addresses, grades, or other private information. Ask Mr. Nieves for help.",
      unknown: "I’m not sure about that one. Please ask Mr. Nieves.",
      noApprovedMatches: "I could not find an active approved website for that request. Please ask Mr. Nieves.",
      linksLoading: "The approved website list is still loading. Please wait a moment and try again.",
      navigation: "Use the search box to find an approved website, or choose a Website Category on the home page. Use the Classroom Launchpad bookmark to return from another page.",
      todayDirectionsIntro: "Here are Mr. Nieves’s current directions:",
      askQuestion: "Type a short classroom question below. Please do not enter your name, email, password, grade, or other private information.",
      rulesIntro: "Here are the Classroom Launchpad expectations:",
      recommendationsIntro: "Here are approved choices:",
      sensitiveHidden: "Private information was hidden."
    },
    troubleshootingChoices: [
      "No sound",
      "Headphones not working",
      "Website not loading",
      "Frozen page",
      "Keyboard not typing",
      "Mouse not working",
      "Accidentally closed a page",
      "Return to Classroom Launchpad",
      "Login trouble"
    ],
    unknownQuestionResponses: [
      "I’m not sure about that one. Please ask Mr. Nieves.",
      "I can only help with approved classroom activities and simple computer problems. Please ask Mr. Nieves."
    ]
  };

  globalObject.COLT_ASSISTANT_KNOWLEDGE = knowledge;
  if (typeof module !== "undefined" && module.exports) module.exports = knowledge;
})(typeof window !== "undefined" ? window : globalThis);
