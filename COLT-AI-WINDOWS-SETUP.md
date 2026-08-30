# Colt Assistant Local AI Setup for Windows

Colt Assistant now includes three modes inside one panel:

1. **Classroom Help** — the existing browser-based Launchpad helper. It remains available without an AI model.
2. **Guided AI** — connects to a locally hosted Ollama text model and coaches students toward answers.
3. **Create Image** — connects to a locally hosted ComfyUI image model and returns the image inside Colt Assistant.

Students never need an Ollama, ComfyUI, Microsoft, or other external AI account.

## Important deployment choice

The default endpoints use `127.0.0.1`, so the Classroom Launchpad Node server and the local AI programs must be running on the same Windows computer.

If Classroom Launchpad remains hosted on Render, `127.0.0.1` refers to the Render server—not a classroom PC. In that setup, the school must provide a secured, school-approved endpoint that Render can reach and set the endpoint environment variables accordingly. Do not expose Ollama or ComfyUI directly to the public internet.

For the strongest privacy and no recurring AI charges, run Classroom Launchpad and both model services on a capable school-controlled Windows computer and restrict access to the school network.

## Text model

Install Ollama for Windows and download the model selected by the school. The default Classroom Launchpad configuration expects:

```text
COLT_AI_TEXT_ENDPOINT=http://127.0.0.1:11434/api/chat
COLT_AI_TEXT_MODEL=llama3.2:3b
```

Change `COLT_AI_TEXT_MODEL` when using a different locally installed model.

## Image model

Install ComfyUI on the same Windows computer and add a school-approved Stable Diffusion checkpoint. The default configuration expects:

```text
COLT_AI_IMAGE_ENDPOINT=http://127.0.0.1:8188
COLT_AI_IMAGE_MODEL=sd_xl_base_1.0.safetensors
```

The image model value must exactly match the checkpoint filename shown in ComfyUI. Classroom Launchpad requests a 512 × 512 image using ComfyUI's built-in workflow nodes and returns a temporary preview to the student.

## Classroom Launchpad settings

These environment variables control the feature:

```text
COLT_AI_ENABLED=true
COLT_AI_IMAGE_ENABLED=true
COLT_AI_TEXT_ENDPOINT=http://127.0.0.1:11434/api/chat
COLT_AI_TEXT_MODEL=llama3.2:3b
COLT_AI_IMAGE_ENDPOINT=http://127.0.0.1:8188
COLT_AI_IMAGE_MODEL=sd_xl_base_1.0.safetensors
```

Set either enable flag to `false` to turn off that feature without removing it.

## Built-in protections

- Only authenticated students and the teacher can use AI modes.
- The server accepts AI requests only from Classroom Launchpad's own origin.
- Student names, emails, passwords, activation codes, phone numbers, and addresses are blocked before a request is sent.
- Guided AI receives protected academic-coach instructions on every request.
- Student chat history remains in the current panel only and is not written to the Launchpad database.
- Text requests are rate-limited per account.
- Image requests are limited to four per account per hour.
- Unsafe image prompt patterns are blocked before generation.
- Images are labeled as AI-generated.

Local model software may maintain its own temporary cache, queue history, or logs. School IT should configure retention and cleanup for Ollama and ComfyUI according to school policy.

## Recommended school controls

- Use a dedicated Windows account for the AI services.
- Restrict the model ports to the Launchpad server with Windows Firewall.
- Keep the model services off the public internet.
- Select model licenses approved by the school.
- Review the selected text and image models before student use.
- Keep Image Creator disabled until its checkpoint and safety behavior have been tested.
- Display the school's AI-use expectations to students before enabling the feature.
