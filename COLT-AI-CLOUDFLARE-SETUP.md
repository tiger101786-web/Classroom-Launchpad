# Colt Assistant: Free Cloudflare Setup

Colt Assistant uses Cloudflare Workers AI for responsive Guided AI communication while Classroom Launchpad remains hosted on Render. Students interact only with Colt Assistant and do not need Cloudflare accounts.

Cloudflare's Workers Free plan includes a daily AI allowance. When the allowance is exhausted, requests stop until the next daily reset instead of generating a bill.

## One-time Cloudflare setup

1. Create a free Cloudflare account.
2. In the Cloudflare dashboard, open **Workers & Pages**, then **Workers AI**.
3. Choose **Use REST API**.
4. Create a Workers AI API token with Workers AI Read and Edit permissions.
5. Copy the API token and your Cloudflare Account ID. Treat the token like a password.

## Add the private values to Render

Open the Classroom Launchpad web service in Render, choose **Environment**, and add:

```text
CLOUDFLARE_ACCOUNT_ID=your Cloudflare account ID
CLOUDFLARE_AI_API_TOKEN=your private Workers AI token
COLT_AI_ENABLED=true
```

Do not place either Cloudflare value in GitHub, website JavaScript, screenshots, or student instructions. Render redeploys the website after the environment values are saved.

The default model is:

```text
COLT_AI_TEXT_MODEL=@cf/meta/llama-3.2-3b-instruct
```

That optional environment value only needs to be added if a different supported Cloudflare text model is selected later.

## Student experience

- Students log in to Classroom Launchpad normally.
- They open Colt Assistant and choose **Guided AI**.
- Questions and replies stay inside the existing Colt Assistant panel.
- No Cloudflare login, browser extension, separate AI website, or classroom computer server is required.
- Classroom Help remains available if Cloudflare is temporarily unavailable or the daily free allowance has been used.

## Privacy and classroom controls

Classroom Launchpad rejects common passwords, activation codes, email addresses, phone numbers, names, and addresses before contacting Cloudflare. It sends only a protected academic-coach instruction, limited recent conversation context, and the current question. It does not write prompts or replies to the Launchpad database.

Cloudflare states that Workers AI customer content is not used to train its AI models or improve Cloudflare or third-party services without explicit consent. School approval and teacher supervision are still required before enabling hosted AI for students.

## Free-use limits

The server limits each account to 24 Guided AI requests per ten minutes to protect the shared classroom allowance. Cloudflare controls the overall daily free allowance. If it is exhausted, Colt Assistant shows a simple reset message and continues offering Classroom Help.
