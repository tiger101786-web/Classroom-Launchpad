const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const start=source.indexOf('function spotlightCollectionKey(');
const end=source.indexOf('function renderStudentSpotlightFolderCollage(',start);
const context=vm.createContext({});
vm.runInContext(source.slice(start,end),context);
const collect=context.studentSpotlightCollections;
const empty=collect([]);
assert.equal(empty.length,1);
assert.equal(empty[0].name,'Design a Fall Festival');
assert.equal(empty[0].items.length,0);
const projects=[
 {id:'a',collectionName:'Design a Fall Festival',displayName:'Zoe',title:'My Festival'},
 {id:'b',collectionName:' design a fall festival ',displayName:'Alex',title:'Autumn Design'},
 {id:'c',collectionName:'Existing Assignment',displayName:'Sam',title:'Keep Me'}
];
const grouped=collect(projects);
assert.equal(grouped.length,2);
assert.equal(grouped[0].items.length,2);
assert.equal(grouped[0].items[0].id,'b');
assert.equal(grouped[1].items[0].id,'c');
assert.equal(projects[0].id,'a','Input projects must not be reordered');
assert(source.includes('const folderNames = studentSpotlightCollections(studentSpotlights).map(collection => collection.name);'));
console.log('PASS: empty Fall Festival folder, teacher folder choices, case-insensitive grouping, existing assignments preserved.');
