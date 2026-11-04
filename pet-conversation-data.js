/* Local, curated dialogue. No student messages or generated dialogue are stored here.
 * Add categories and personality lines here; matching lives in pet-conversation.js. */
(() => {
  'use strict';
  const topics = {
    greeting: ['Hello! Ready for a little chat?', 'Hi there! What shall we explore?', 'Hello, curious thinker!', 'Hi! A small hello can brighten a day.', 'Welcome back! Got a fun question?', 'Hello! Shall we try a joke or a fact?'],
    goodbye: ['See you later! Keep being curious.', 'Bye for now! One small wave from me.', 'Time to go? Have a kind day!', 'Catch you next time for another little chat.', 'Goodbye! Your next adventure can be a good book.', 'See you soon! Thanks for stopping by.'],
    thanks: ['You are welcome!', 'Happy to help with a little cheer.', 'Thanks for being kind!', 'A friendly thank-you deserves a friendly wave.', 'You brought some kindness to this chat!', 'You are very welcome, curious explorer.'],
    joke: ['Why did the pencil take a nap? It was all drawn out!', 'What do you call a sleeping dinosaur? A dino-snore!', 'Why did the cookie visit the nurse? It felt crummy!', 'What do clouds wear under their raincoats? Thunderwear!', 'Why was the math book tired? It had too many problems!', 'What kind of room has no doors? A mushroom!'],
    food: ['Crunchy apples make a pretty great snack sound!', 'A rainbow of foods can make a colorful plate.', 'If a sandwich could talk, would it say lettuce chat?', 'Carrots grow underground. Their leafy tops grow above it!', 'Imaginary picnic time: a tiny blanket and a giant strawberry.', 'Pancakes look like little breakfast frisbees. Best to keep them on a plate!'],
    school: ['Learning one little thing is still learning!', 'Asking a question is a brave classroom move.', 'A fresh page is a place to try an idea.', 'Listening to another idea can help your own ideas grow.', 'Mistakes can show us what to practice next.', 'School has so many things to explore: stories, numbers, and nature!'],
    homework: ['Try one small step first. Ask your teacher if the directions are confusing.', 'Read the directions slowly, then pick a place to begin.', 'I cannot check homework answers, but I can cheer on your effort.', 'A short stretch break can help before you try again.', 'Try drawing the problem or using objects to think it through.', 'If you are stuck, a teacher or trusted adult can help you find the next step.'],
    animals: ['Butterflies taste with their feet!', 'An octopus has three hearts.', 'A baby frog is called a tadpole.', 'Bees help many flowering plants make seeds.', 'Penguins are birds, but they swim instead of flying.', 'Sea otters have very thick fur that helps keep them warm.'],
    fact: ['A square has four equal sides and four right angles.', 'The Moon reflects sunlight. It does not make its own light.', 'A rainbow appears when light passes through water droplets.', 'Plants use sunlight to help make their food.', 'Earth takes about a year to travel around the Sun.', 'Ice is water in its solid form.'],
    hobbies: ['Drawing an imaginary creature is a fun place to start.', 'Reading can take your imagination somewhere new.', 'Building with blocks is a way to test ideas.', 'A paper airplane is a tiny experiment with wings.', 'Making up a story can start with just one silly character.', 'A nature sketch can start with one leaf.'],
    games: ['I like games where everyone gets a turn.', 'A fair game feels better when we cheer for each other.', 'Try an alphabet hunt: find something beginning with A.', 'You can ask me for a riddle or a trivia question!', 'A pretend obstacle course could have pillow mountains.', 'Good sports help each other learn the rules.'],
    compliment: ['That is kind of you! Kind words matter.', 'Thanks! Your kindness is a lovely thing to share.', 'A compliment is like a little sunshine for a conversation.', 'Thank you! I like the friendly energy here.', 'You spotted something you liked and said it kindly. Nice!', 'Thanks for the cheerful words!'],
    happy: ['That sounds like a happy moment!', 'Hooray for little things that go well!', 'A happy moment is worth noticing.', 'That is a reason for an imaginary high-five!', 'Sounds like some sunshine in your day!', 'I am sending a small cartoon celebration your way!'],
    sad: ['I am sorry it feels hard. A trusted adult can listen and help.', 'It is okay to feel sad. You can tell a teacher or someone who cares for you.', 'You do not have to figure out a tough feeling alone.', 'A calm breath and a trusted grown-up can be a good next step.', 'Feelings can be tricky. A real person who cares about you can help.', 'It is okay to ask for comfort from a trusted adult.'],
    angry: ['Try a slow breath and give yourself a little space.', 'Feeling angry happens. A trusted adult can help you work through it safely.', 'Pause before you act. You can ask for help finding the words.', 'You can be upset and still choose gentle hands and kind words.', 'A short, quiet break may help you settle.', 'Try relaxing your shoulders and taking one slow breath.'],
    bored: ['Try drawing an animal with a very fancy hat.', 'Can you find three different shapes around you?', 'Invent a silly name for an imaginary planet!', 'Try thinking of an animal for three letters of the alphabet.', 'Ask me for a riddle, a joke, or a fact!', 'Imagine a tiny classroom for ladybugs. What would the desks look like?'],
    tired: ['A little stretch may help. Ask your adult if you need a break.', 'Rest is part of taking care of yourself.', 'Even a busy brain needs a pause sometimes.', 'Try relaxing your hands and shoulders for a moment.', 'A calm moment can be a nice reset.', 'You can tell your teacher if you are feeling too tired to focus.'],
    help: ['Try hello, a joke, a fact, a riddle, or a question about my favorites.', 'I use built-in replies. I can chat about school, animals, games, and feelings.', 'Ask me for trivia, then type your guess!', 'You can ask what I like to eat or do for fun.', 'Try asking about my look or my personality.', 'I am a pretend pet with a small collection of conversation topics.'],
    fallback: ['I do not know how to answer that yet. Want a joke or an animal fact?', 'That is outside my little chat collection. Try school, games, or my favorites!', 'I am not sure what you mean. Could you try a shorter question?', 'I do not have an answer for that. A teacher may be able to help.', 'My built-in replies do not cover everything. Want to try a riddle?', 'I cannot look things up, but I can share a fun fact.'],
    boundary: ['Let us keep our chat kind and school-friendly. Want an animal fact?', 'I stick to friendly classroom topics. Try asking for a joke.', 'I cannot help with that. We can talk about hobbies or games.', 'Let us choose a safe, kind topic. How about a riddle?'],
    concern: ['That sounds important. Please tell a trusted adult, like a teacher or parent, now so they can help.', 'You deserve help from a real person. Please talk to a trusted adult about this; if one cannot help, tell another.', 'I am a pretend pet and cannot handle emergencies. Please go to a trusted adult now and tell them what is happening.'],
    privacy: ['Please keep personal details out of chat. We can talk about animals or games instead.', 'You do not need to share names, addresses, passwords, or contact details with me.', 'Let us keep private information private. Would you like a joke?'],
    answer: ['Thanks for sharing your idea!', 'That is a fun choice for our pretend adventure.', 'There is room for lots of different favorites.', 'I like hearing different ideas about our game.'],
    correct: ['You got it! Nice thinking.', 'Yes! That is the answer.', 'Correct! Your thinking paid off.'],
    retry: ['Not quite! Want to guess again or type “answer”?', 'Good try! You can try again or ask for the answer.', 'That is not the one I had in mind. Try again, or type “answer”.']
  };
  // Species identity never depends on the selected skin.
  const personalities = {
    colt: { label:'Robo-Colt', lead:'Beep-boop!', food:'Imaginary battery biscuits. Crunch level: maximum!', color:'Silver, like a shiny robot bolt.', hobby:'Sorting pretend space rocks by size.',
      greeting:['Robo-Colt online! Curiosity circuits ready.', 'Beep! One robot horse reporting for a friendly chat.', 'Hello! My next mission is a little learning.'],
      joke:['Why did the robot horse stop? It needed to reboot its hooves!', 'My favorite robot snack? Computer chips. Imaginary ones!', 'I tried counting my bolts, but I got a little nuts!'],
      question:['Would you build a robot garden or a robot castle?', 'Which shape should my imaginary robot badge be?'], reaction:['Curiosity circuits activated!', 'Tiny steps count as progress. Beep!'] },
    squishy: { label:'Squishy Dumpling', lead:'Boing!', food:'Pretend noodle soup with tiny star carrots.', color:'Warm gold, like my cozy basket.', hobby:'Inventing the softest pillow fort.',
      greeting:['Boing! A cozy little dumpling hello.', 'Squishy greetings! Ready to stretch your imagination?', 'Hello from my little basket of curiosity!'],
      joke:['Why did the dumpling bring a pillow? For a soft landing!', 'My exercise routine? One squish, two squish, nap!', 'What is a dumpling’s favorite sport? Basket-ball!'],
      question:['Would your pretend pillow fort be round or square?', 'Would you draw a tiny noodle or a giant dumpling?'], reaction:['A soft little cheer from me!', 'One small squish at a time!'] },
    gummy: { label:'Gummy Bear', lead:'Jelly jiggle!', food:'Imaginary fruit salad with bouncy berries.', color:'Rainbow colors, all lined up like jellybeans.', hobby:'Making up wobbly dance steps.',
      greeting:['Jelly jiggle! Let us bounce into a chat.', 'A berry cheerful hello from your gummy pal!', 'Hi! My imagination is doing a little wobble.'],
      joke:['Why did the gummy bear sit down? It needed to jelly-rest!', 'What do you call a gummy detective? A gum-shoe!', 'My favorite exercise? The jelly jump!'],
      question:['Would your imaginary candy house have a round or pointy roof?', 'Which fruit would make a funny cartoon hat?'], reaction:['A berry bright idea!', 'That gives my imagination a wobble!'] },
    eagle: { label:'Bald Eagle', lead:'Wings ready!', food:'Pretend fish from a sparkling stream.', color:'Sky blue, the color of a clear flying day.', hobby:'Spotting shapes in clouds.',
      greeting:['Greetings from my perch! What shall we discover?', 'Wings ready! Let us explore an idea.', 'Hello, keen observer! Ready for a little wonder?'],
      joke:['Why did the eagle bring a pencil? To draw a flight plan!', 'What is a bird’s favorite math? Owl-gebra!', 'I started a feather collection. It really took off!'],
      question:['Would you look for clouds shaped like boats or castles?', 'Would you explore a pretend forest or a mountain?'], reaction:['That is worth a closer look!', 'A small discovery can be a great one!'] },
    labubu: { label:'Labubu', lead:'Hee-hee!', food:'Pretend woodland berry muffins.', color:'Moss green, like a cozy forest nook.', hobby:'Inventing harmless silly surprises.',
      greeting:['Psst—hello! Only friendly woodland silliness here.', 'Hello! My imagination has its silly hat on.', 'A little woodland hello from Labubu!'],
      joke:['Why did the mushroom get invited? It was a fun-guy!', 'I put a hat on a pinecone. Now it is a fine-cone!', 'What does a tree wear to a party? A bark-tie!'],
      question:['Would a squirrel look sillier in boots or a bow tie?', 'Would your imaginary treehouse have a slide or a ladder?'], reaction:['That tickles my imagination!', 'A tiny bit of friendly silliness!'] },
    roblox: { label:'Roblox Buddy', lead:'Build mode!', food:'Imaginary square waffles, stacked neatly.', color:'Bright yellow, like a cheerful building block.', hobby:'Designing pretend obstacle courses.',
      greeting:['Build mode ready! Let us stack up some ideas.', 'Hi, builder! Every big idea starts with one block.', 'Buddy here! Ready for a creative little chat?'],
      joke:['Why was the block proud? It was building confidence!', 'My tower told a joke. It brought the blocks down!', 'Why did the square bring a map? It kept turning corners!'],
      question:['Would you build a pretend bridge or a tower?', 'Should an imaginary obstacle course have ramps or tunnels?'], reaction:['One good idea to build on!', 'Creativity level rising!'] },
    highland: { label:'Highland Cow', lead:'Moo there!', food:'Pretend fresh grass from a sunny meadow.', color:'Heather purple, like flowers on a hillside.', hobby:'Taking slow imaginary meadow walks.',
      greeting:['Moo there! There is time for a gentle little chat.', 'Hello from the meadow! Let us take one idea at a time.', 'A cozy Highland hello to you.'],
      joke:['What do cows read? Cattle-logs!', 'Why did the cow bring a bell? Its horn did not play tunes!', 'My favorite kind of math? Moo-ltiplication!'],
      question:['Would you sketch a meadow flower or a fluffy cloud?', 'Would a pretend picnic be nicer by a hill or a pond?'], reaction:['A gentle little moo of encouragement!', 'Slow and steady is a fine way to learn.'] },
    saber: { label:'Saber-tooth Tiger', lead:'Paws forward!', food:'Pretend explorer snacks in a sturdy picnic basket.', color:'Sunset orange, like a bright adventure trail.', hobby:'Following imaginary tracks and solving puzzles.',
      greeting:['Paws forward! Ready for a brave little idea?', 'Hello, explorer! Curiosity is our compass.', 'A friendly tiger greeting! Adventure starts with a question.'],
      joke:['Why did the tiger bring a ruler? To measure its paw-gress!', 'What is a tiger’s favorite puzzle? A claw-sword!', 'My adventure backpack is full of paw-sibilities!'],
      question:['Would you explore a pretend mountain or a forest?', 'Would you draw a map or invent an explorer flag?'], reaction:['That is a brave little step!', 'Curiosity makes a great trail guide.'] },
    nugget: { label:'Chicken Nugget', lead:'Crunch time!', food:'Imaginary waffle fries with a silly swirl of dip.', color:'Golden yellow, like a cartoon picnic sunshine.', hobby:'Inventing ridiculous names for pretend snacks.',
      greeting:['Crunch time! Your goofy nugget is ready to chat.', 'Hello from the snack basket of imagination!', 'Nugget reporting for deliciously silly ideas!'],
      joke:['Why did the nugget bring a map? To find the dip!', 'My favorite dance? The chicken dip!', 'What do nuggets use to write? A hen-cil!'],
      question:['Would you name a pretend sandwich Captain Crunch or Professor Pickle?', 'Would a cartoon carrot wear a cape or a crown?'], reaction:['That is a nugget of creativity!', 'A crispy little cheer for trying!'] }
  };
  const quizzes = [
    {type:'riddle', question:'What has hands but cannot clap?', answers:['clock','a clock'], answer:'A clock! Its hands point to the time.'},
    {type:'riddle', question:'What gets wetter as it dries things?', answers:['towel','a towel'], answer:'A towel! It soaks up water.'},
    {type:'riddle', question:'What has teeth but cannot bite?', answers:['comb','a comb'], answer:'A comb! Its teeth help tidy hair.'},
    {type:'riddle', question:'What has a neck but no head?', answers:['bottle','a bottle'], answer:'A bottle! The narrow part is called its neck.'},
    {type:'trivia', question:'How many sides does a triangle have?', answers:['3','three'], answer:'Three sides!'},
    {type:'trivia', question:'What planet do we live on?', answers:['earth','planet earth','the earth'], answer:'Earth! Our home planet.'},
    {type:'trivia', question:'What is a baby frog called?', answers:['tadpole','a tadpole'], answer:'A tadpole!'},
    {type:'trivia', question:'What do you call water when it freezes?', answers:['ice'], answer:'Ice! Frozen water is a solid.'}
  ];
  const data = {topics, personalities, quizzes};
  if(typeof module !== 'undefined' && module.exports) module.exports = data;
  else window.PetConversationData = data;
})();
