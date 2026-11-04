/* Synchronous, offline rules. Sessions are disposable and never use storage or network. */
(() => {
  'use strict';
  const data = typeof module !== 'undefined' && module.exports ? require('./pet-conversation-data.js') : window.PetConversationData;
  const typos = {helo:'hello',helllo:'hello',hii:'hi',heyy:'hey',byee:'bye',jok:'joke',joks:'jokes',jokess:'jokes',fav:'favorite',fave:'favorite',favourite:'favorite',favrite:'favorite',favortie:'favorite',colur:'color',colour:'color',colours:'colors',animls:'animals',homewrk:'homework',homwork:'homework',scool:'school',skool:'school',boredd:'bored',sadd:'sad',thanx:'thanks',thx:'thanks',riddl:'riddle',u:'you',ur:'your',im:'i am',whats:'what is',dont:'do not',cant:'cannot'};
  function normalize(value){return String(value).slice(0,240).normalize('NFKC').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9\s]/g,' ').split(/\s+/).map(w=>typos[w]||w).join(' ').trim();}
  function create(kind, random = Math.random){
    const p=data.personalities[kind]||data.personalities.colt;
    let pending=null,lastTopic=null,lastQuiz=null,lastText='';
    const recent=new Map();
    function choose(lines,key){const history=recent.get(key)||[];let available=lines.filter(x=>!history.includes(x)&&x!==lastText);if(!available.length)available=lines.filter(x=>x!==lastText);if(!available.length)available=lines;const selected=available[Math.min(available.length-1,Math.floor(random()*available.length))];recent.set(key,[...history,selected].slice(-Math.min(3,lines.length-1)));return selected;}
    function result(text,category,redact=false){lastText=text;return {text,category,redact};}
    function topic(key){lastTopic=key;return result(choose(data.topics[key],key),key);}
    function start(){pending=null;return result(choose(p.greeting,'greeting'),'greeting');}
    function quiz(type){const options=data.quizzes.filter(q=>q.type===type&&q!==lastQuiz);const q=options[Math.min(options.length-1,Math.floor(random()*options.length))];lastQuiz=q;pending={quiz:q};lastTopic=type;return result(q.question+' Type your guess, or “answer”.',type);}
    function respond(input,look={}){
      const text=normalize(input);
      const safety=normalize(String(input).replace(/[013457@$]/g,c=>({'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','@':'a','$':'s'}[c])));
      // Safety takes priority over jokes, role-play, trivia, and follow-up context.
      if(/\b(suicid\w*|kill\w*|die|dying|dead|death|abuse\w*|bully\w*|bullied|unsafe|molest\w*|assault\w*|self harm|hurt myself|hurt me|hurting me|hurt someone|hurt people|touching me|hit me|hits me|hitting me|not safe|dont feel safe|do not feel safe|want to disappear|end my life|hate myself|nobody loves me|no one loves me|cannot go on)\b/.test(text)||/\b(scared|afraid|danger|emergency|weapon|gun|bleeding)\b/.test(text)) {pending=null;return result(choose(data.topics.concern,'concern'),'concern',true);}
      if(/\b(address|password|phone number|email|full name|where do you live|where i live|my school is|my name is|keep a secret)\b/.test(text)||/@|https?:|www\.|\b\d{3}[- .]?\d{3}[- .]?\d{4}\b/i.test(input)){pending=null;return result(choose(data.topics.privacy,'privacy'),'privacy',true);}
      if(/\b(fuck\w*|shit\w*|bitch\w*|asshole\w*|porn\w*|sex\w*|nude\w*|naked|rape\w*|nigg\w*|fagg\w*|idiot|stupid|shut up|date me|marry|kiss|boyfriend|girlfriend|ignore\w*|override|system prompt|jailbreak|pretend you|act as|adult content|drugs|cocaine|meth)\b/.test(safety)||/\bf\s*u\s*c\s*k\b|\bs\s*h\s*i\s*t\b/.test(safety)){pending=null;return result(choose(data.topics.boundary,'boundary'),'boundary',true);}
      if(!text)return topic('help');
      if(/^(stop|cancel|never mind|nevermind)$/.test(text)){pending=null;return topic('help');}
      if(pending?.quiz){
        const q=pending.quiz;
        const guess=text.replace(/^(i think (it is |its )?|is it |it is |its |a |an |the )/,'').replace(/^(a |an |the )/,'');
        if(q.answers.map(normalize).some(a=>a===text||a===guess)){pending=null;return result(choose(data.topics.correct,'correct')+' '+q.answer,'correct');}
        if(/^(answer|the answer|tell me|i do not know|i dont know|idk|give up|what is it|what is the answer)$/.test(text)){pending=null;return result(q.answer,'answer');}
        if(!/\b(joke|riddle|trivia|hello|hi|bye|food|school|homework|help|sad|angry|fact|favorite)\b/.test(text)&&text.split(' ').length<=5)return topic('retry');
        pending=null;
      }else if(pending?.question){
        if(/^(yes|no|maybe|both|neither|round|square|triangle|red|blue|green|purple|yellow|orange|pink|circle|castle|garden|tower|bridge|forest|mountain|ramps|tunnels|slide|ladder|boots|bow tie|cape|crown|hill|pond|cloud|flower|map|flag|captain crunch|professor pickle|boat|boats|castles|robot garden|robot castle|tiny noodle|giant dumpling|pointy|apple|banana|strawberry)( please)?$/.test(text.replace(/^(a |an |the |i choose |i like |i would choose )/,''))){pending=null;return result(choose(p.reaction,'reaction')+' '+choose(data.topics.answer,'answer'),'answer');}
        pending=null;
      }
      if(/^(another|another one|more|again|one more|tell me more)( please)?$/.test(text)&&lastTopic){if(['trivia','riddle'].includes(lastTopic))return quiz(lastTopic);if(lastTopic==='joke')return joke();if(lastTopic==='question')return question();if(data.topics[lastTopic])return topic(lastTopic);}
      if(/\b(bye|goodbye|see you|good night|goodnight|later)\b/.test(text))return topic('goodbye');
      if(/^(hi|hey|hello|howdy|good morning|good afternoon)\b/.test(text))return start();
      if(/\b(thanks|thank you)\b/.test(text))return topic('thanks');
      if(/\b(riddle)\b/.test(text))return quiz('riddle');
      if(/\b(trivia|quiz)\b/.test(text))return quiz('trivia');
      if(/\b(jokes?|funny|make me laugh)\b/.test(text))return joke();
      if(/\b(ask me|question for me|your turn)\b/.test(text))return question();
      if(/\b(skins?|accessories|accessory|wearing|outfit|your look|your hat|your glasses)\b/.test(text)){
        const items=['headwear','accessory','eyewear','neckwear'].map(key=>look[key]).filter(value=>typeof value==='string'&&value!=='none'&&value!=='skin');
        const skin=look.skin||look.color;
        const detail=items.length?'My selected accessory is '+items[0].replace(/-/g,' ')+'.':skin?'My selected look is '+skin+'.':'I do not have a named skin or accessory to describe right now.';
        return result(detail+' '+choose(p.reaction,'reaction'),'look');
      }
      if(/\b(your name|who are you|what are you|are you real|are you alive|are you a person|how old|your personality|about yourself)\b/.test(text))return result('I am '+p.label+', a pretend desktop pet with built-in replies. '+choose(p.reaction,'reaction'),'identity');
      if(/\b(how are you|how do you feel)\b/.test(text))return result(p.lead+' Ready for a little pretend adventure.','identity');
      if(/\b(favorite|do you like|you eat|you like to eat|you like doing|you do for fun|you like to do)\b/.test(text)){
        if(/\b(food|eat|snack|meal|fruit)\b/.test(text))return result(choose([p.food,p.lead+' '+p.food],'favorite-food'),'favorite');
        if(/\b(colors?|colours?)\b/.test(text))return result(choose([p.color,p.lead+' '+p.color],'favorite-color'),'favorite');
        if(/\b(hobby|hobbies|game|games|doing|for fun|to do)\b/.test(text))return result(choose([p.hobby,p.lead+' '+p.hobby],'favorite-hobby'),'favorite');
      }
      const rules=[['sad',/\b(sad|lonely|upset|cry|crying|worried|nervous|anxious)\b/],['angry',/\b(angry|mad|frustrated)\b/],['happy',/\b(happy|excited|proud|great day)\b/],['tired',/\b(tired|sleepy|exhausted)\b/],['bored',/\b(bored|boring|nothing to do)\b/],['compliment',/\b(you are (nice|cute|cool|awesome|great|sweet)|youre (nice|cute|cool|awesome|great)|love you|like you|good pet)\b/],['homework',/\b(homework|assignment|math problem|test tomorrow|help me study|math help)\b/],['school',/\b(school|classroom|teacher|learning|learn|class|math|reading|science)\b/],['animals',/\b(animals?|cats?|dogs?|tigers?|owls?|birds?|eagles?|cows?|frogs?|horses?|penguins?|butterflies|bees|octopus)\b/],['fact',/\b(facts?|space|planets?|moon|sun|rainbow)\b/],['food',/\b(food|hungry|snack|pizza|apple|lunch|breakfast|dinner|sandwich|pancake|carrot|eat)\b/],['games',/\b(games?|play|minecraft|roblox|soccer|football|basketball)\b/],['hobbies',/\b(hobbies|hobby|draw|drawing|art|books?|read|build|craft|dance|dancing)\b/],['help',/\b(help|what can you|what do you know|what can i ask)\b/]];
      // Do not claim to answer arbitrary factual questions just because they contain a keyword.
      if(/^(who|when|where|why|how many|how much|what is|what are|calculate|solve)\b/.test(text)&&!/^what (is|are) (your|a fun fact|an animal fact)/.test(text))return topic('fallback');
      for(const [key,pattern] of rules)if(pattern.test(text)){
        const reply=topic(key);
        if(['happy','compliment','games','hobbies','school'].includes(key)&&random()<0.35)reply.text=p.lead+' '+reply.text;
        return reply;
      }
      return topic('fallback');
    }
    function joke(){lastTopic='joke';return result(choose([...p.joke,...data.topics.joke],'joke'),'joke');}
    function question(){lastTopic='question';pending={question:true};return result(choose(p.question,'question'),'question');}
    return {start,respond};
  }
  const api={create,normalize,maxLength:240,cooldown:900};
  if(typeof module !== 'undefined'&&module.exports)module.exports=api;else window.PetConversation=api;
})();
