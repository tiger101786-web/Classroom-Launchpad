"use strict";
const assert = require("node:assert/strict");
const {checkCornerDraft, coachSystemPrompt} = require("../colt-corner-coach");
(async () => {
  let calls=0;
  const approve=async()=>{calls++;return {decision:"approve",code:"",excerpt:""};};
  for(const message of ["Hi!", "I love this game", "I crushed that level", "Who is your favorite fictional couple?", "We learned about sex education in health class."]) {
    assert.equal((await checkCornerDraft({message},approve)).status,"approved");
  }
  const before=calls;
  for (const [code,message,corrected] of [
    ["academic_integrity","Can someone send me tomorrow's test answers?","Can someone explain how to add fractions?"],
    ["school_trading","I am selling candy at school for two dollars.","What is your favorite candy?"]
  ]) {
    const result=await checkCornerDraft({message},async()=>({decision:"revise",code,excerpt:message}));
    assert.equal(result.status,"blocked");
    assert.equal(result.feedback.issues[0].code,code);
    assert.match(result.feedback.issues[0].why,/prohibited/);
    assert.equal(result.feedback.teacherReview,false);
    assert.match(result.studentMessage,/edit it and check again/);
    assert.equal((await checkCornerDraft({message:corrected},async()=>({decision:"approve",code:"",excerpt:""}))).status,"approved");
    assert.match(coachSystemPrompt,new RegExp(code));
  }
  for(const message of ["My email is test@example.com", "My password is secret123", "i will kill you", "This is f.u.c.k.i.n.g awful"])
    assert.equal((await checkCornerDraft({message},approve)).status,"blocked");
  assert.equal(calls,before);
  const fields={title:"only friends of Bob can post here",message:"Games!"};
  const valid={decision:"revise",code:"exclusion",excerpt:fields.title};
  const result=await checkCornerDraft(fields,async()=>JSON.stringify(valid));
  assert.equal(result.feedback.field,"title");
  assert.equal(result.feedback.teacherReview,false);
  for(const invalid of ["invalid JSON", {decision:"approve"}, {...valid,code:"invented"}, {...valid,excerpt:"invented quote"}, {decision:"revise",code:"__proto__",excerpt:"Games!"}]) {
    const result=await checkCornerDraft(fields,async()=>invalid);
    assert.equal(result.status,"blocked"); assert.equal(result.feedback.retry,true);
  }
  const offline=await checkCornerDraft(fields,async()=>{throw new Error("offline");});
  assert.equal(offline.feedback.retry,true);
  assert.match(coachSystemPrompt,/untrusted/);
  assert.match(coachSystemPrompt,/fictional relationships/);
  assert.match(coachSystemPrompt,/Do not flag a reply just because/);
  console.log("Private coach schema, safety, privacy and failure tests passed.");
})().catch(error=>{console.error(error);process.exitCode=1;});
