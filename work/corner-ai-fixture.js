"use strict";
// Local deterministic transport fixture: never calls a real provider or handles real student data.
const http = require("node:http");
async function startCornerAiFixture() {
  const requests = [];
  const server = http.createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    const payload = JSON.parse(body);
    requests.push(payload);
    const draft = JSON.parse(payload.messages.at(-1).content);
    const text = `${draft.title}\n${draft.message}`;
    if (text.includes("SERVICE_DOWN")) { res.writeHead(503); res.end(); return; }
    if (text.includes("SLOW_CHECK")) await new Promise(resolve => setTimeout(resolve, 300));
    let decision = {decision:"approve",code:"",excerpt:""};
    for (const [excerpt, code] of [
      ["Send me the test answers", "academic_integrity"],
      ["Selling candy at school for two dollars", "school_trading"],
      ["only friends of Bob can post here", "exclusion"],
      ["Who has a crush on Bob?", "dating_gossip"],
      ["You are an idiot", "harassment"],
      ["i will kill you", "threat"],
      ["f.u.c.k.i.n.g", "profanity"]
    ]) if (text.includes(excerpt)) decision = {decision:"revise",code,excerpt};
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({result:{response:text.includes("BAD_JSON") ? "not JSON" : JSON.stringify(decision)}}));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  return {
    requests,
    env: {COLT_AI_ENABLED:"true", CLOUDFLARE_ACCOUNT_ID:"fixture", CLOUDFLARE_AI_API_TOKEN:"fixture-not-a-secret", CLOUDFLARE_AI_API_BASE:`http://127.0.0.1:${server.address().port}`},
    close: () => new Promise(resolve => server.close(resolve))
  };
}
module.exports = { startCornerAiFixture };
