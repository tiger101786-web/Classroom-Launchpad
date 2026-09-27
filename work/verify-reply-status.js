const fs=require("fs"),vm=require("vm"),assert=require("assert/strict");
(async()=>{
 const server=fs.readFileSync("server.js","utf8"),app=fs.readFileSync("app.js","utf8");
 const message={id:"old",studentEmail:"a@school.test",studentName:"A",senderRole:"student",message:"Thank you",createdAt:"2026-09-27T10:00:00Z",readByTeacher:true};
 let db={directMessages:[message]},writes=0,response,body,role="teacher",origin=true;
 const ctx=vm.createContext({crypto:{randomUUID:()=> "generated"},normalizeEmail:x=>String(x||"").toLowerCase(),cleanText:(x,n)=>String(x||"").slice(0,n),cleanMultilineText:(x,n)=>String(x||"").slice(0,n),cleanGrade:x=>x||"",requireSameOrigin:()=>origin,requireRole:(req,res,roles)=>roles.includes(role)?{role}:null,readBody:async()=>body,readDb:()=>JSON.parse(JSON.stringify(db)),writeDb:x=>{db=JSON.parse(JSON.stringify(x));writes++;},visibleDirectMessages:x=>x,sendJson:(res,status,data)=>{response={status,data};}});
 const normalizer=server.slice(server.indexOf("function normalizeDirectMessages("),server.indexOf("function cleanGrade("));
 const start=server.indexOf('  if (pathname === "/api/direct-messages/reply-status"');
 const end=server.indexOf('  if (pathname === "/api/direct-messages/read"',start);
 vm.runInContext(normalizer+'\nasync function route(){const pathname="/api/direct-messages/reply-status",req={method:"PATCH"},res={};'+server.slice(start,end)+'}',ctx);
 body={studentEmail:message.studentEmail,messageId:"old",noReplyNeeded:true};await ctx.route();assert.equal(response.status,200);assert.equal(db.directMessages[0].noReplyNeeded,true);
 // Simulate database serialization and normalization on reload.
 assert.equal(ctx.normalizeDirectMessages(JSON.parse(JSON.stringify(db.directMessages)))[0].noReplyNeeded,true);
 const client=vm.createContext({});vm.runInContext(app.slice(app.indexOf("function normalizeDirectMessages("),app.indexOf("function unreadDirectMessageCount(")),client);
 assert.equal(client.normalizeDirectMessages(db.directMessages)[0].noReplyNeeded,true);
 // A newer message arriving before the request is not resolved by an old-message action.
 db.directMessages.push({...message,id:"new",createdAt:"2026-09-27T11:00:00Z",readByTeacher:false});await ctx.route();
 assert.equal(db.directMessages[1].noReplyNeeded,false);assert.equal(db.directMessages[1].readByTeacher,false);
 const rowsCtx=vm.createContext({directMessages:db.directMessages,approvedStudents:[{email:message.studentEmail,name:"A"}],formatStudentFirstLast:x=>x});
 vm.runInContext(app.slice(app.indexOf("function teacherInboxRows("),app.indexOf("function renderDashboardMessages(")),rowsCtx);
 assert.equal(rowsCtx.teacherInboxRows()[0].needsReply,true);
 body.noReplyNeeded=false;await ctx.route();assert.equal(db.directMessages[0].noReplyNeeded,false);
 const before=writes;role="student";await ctx.route();assert.equal(writes,before);
 role="teacher";origin=false;await ctx.route();assert.equal(writes,before);
 origin=true;body={...body,messageId:"missing"};await ctx.route();assert.equal(response.status,400);assert.equal(writes,before);
 body={...body,messageId:"old",noReplyNeeded:"true"};await ctx.route();assert.equal(response.status,400);assert.equal(writes,before);
 console.log("Reply status: persistence, both normalizers, undo, new-message reopening, stale-message safety, teacher-only/origin guards and invalid inputs passed.");
})().catch(e=>{console.error(e);process.exitCode=1});
