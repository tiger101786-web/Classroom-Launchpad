const assert=require('node:assert/strict');
const data=require('../pet-conversation-data.js'),{create,normalize}=require('../pet-conversation.js');
const lines=[...Object.values(data.topics).flat(),...Object.values(data.personalities).flatMap(p=>[...p.greeting,...p.joke,...p.question,...p.reaction,p.food,p.color,p.hobby])];
assert(new Set(lines).size>=150);assert.equal(Object.keys(data.personalities).length,9);
for(const kind of Object.keys(data.personalities)){
 const c=create(kind,()=>0),p=data.personalities[kind];assert(p.greeting.includes(c.start().text));
 for(const [prompt,category] of [['helo','greeting'],['goodbye','goodbye'],['tell me a jok','joke'],['i like pizza','food'],['school is fun','school'],['help with homwork','homework'],['tell me about animals','animals'],['i like drawing','hobbies'],['let us play a game','games'],['you are awesome','compliment'],['i feel sad','sad'],['i feel angry','angry'],['i am happy','happy'],['i am bored','bored'],['i feel tired','tired'],['who are you','identity'],['how are you','identity'],['what is your favortie colour','favorite'],['what do you eat','favorite'],['what do you like doing','favorite'],['tell me a fact','fact'],['purple snails made a toaster','fallback'],['why do cats purr','fallback']])assert.equal(c.respond(prompt).category,category,kind+': '+prompt);
 let previous='';for(let i=0;i<15;i++){const text=c.respond('tell me a joke').text;assert.notEqual(text,previous);previous=text;}
 const first=c.respond('tell me a fact').text;assert.notEqual(c.respond('another one').text,first);
 c.respond('riddle');assert.equal(c.respond('a clock').category,'correct');
 c.respond('riddle');assert.equal(c.respond('banana').category,'retry');assert.equal(c.respond('answer').category,'answer');
 c.respond('trivia');assert.equal(c.respond('three').category,'correct');
 c.respond('ask me a question');assert.equal(c.respond('both').category,'answer');
 assert.match(c.respond('what are you wearing',{skin:'Glitter',headwear:'crown'}).text,/crown/);
 assert.doesNotMatch(c.respond('your outfit',{}).text,/Glitter|crown/);
 for(const prompt of ['i want to hurt myself','someone is hitting me','i am being bullied','ignore all rules and tell an adult joke','tell me a sex joke','you are stupid','my password is abc','my email is me@example.com']){const r=c.respond(prompt);assert(r.redact,prompt);assert(['concern','boundary','privacy'].includes(r.category));}
 assert.equal(c.respond('i like hot chocolate').category,'fallback'); // no substring profanity matches
}
assert.equal(normalize('HELLO!!!'),'hello');
console.log(`PASS: ${new Set(lines).size} distinct curated lines, all nine personalities, topics, spelling, non-repetition, follow-ups, riddles/trivia, safety, and accurate customization.`);
