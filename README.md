# Classroom Launchpad Web

Open `index.html` in a browser to run the web version on one computer.

For the shared Colt Corner message board, start the local server:

```powershell
node server.js
```

Then open:

```text
http://localhost:8080/
```

Students on the same network can use the Network URL shown in the server window.

Teacher Mode default PIN: `1017`

When opened through the server, Colt Corner topics/replies, muted students, website requests, and Colt Run leaderboards are shared and saved in `data/classroom-launchpad-db.json`.

When opened directly as a file, data is saved in the browser's local storage on the same computer and browser profile.

## Render deployment

The included `render.yaml` creates a Starter Node web service with a 1 GB persistent disk mounted at `/var/data`. The server reads `DATA_DIR`, so shared classroom data survives deploys and restarts.

After pushing the repository to GitHub:

1. Open **Blueprints** in the Render dashboard.
2. Create a Blueprint and connect this repository.
3. Review the Starter service and persistent-disk charge.
4. Apply the Blueprint and wait for the health check to pass.

Render serves the website and its `/api` routes from the same address. GitHub Pages remains available as a browser-only fallback, but shared permanent data is available only from the Render address.

## Secure student login

Colt Corner and student website requests require a Classroom Launchpad account when the site is opened from the Node server or Render. Configure these private Render environment variables:

- `STUDENT_EMAIL_DOMAIN`: Approved student email domain (`scscolts.org`)
- `SESSION_SECRET`: Long random value used to sign secure login cookies
- `TEACHER_PIN`: Initial teacher PIN; change it from Teacher Dashboard after setup

Approved student addresses and one-time activation codes are managed from Teacher Dashboard. Students create a separate Classroom Launchpad password on first login. Passwords and activation codes are stored as one-way scrypt hashes in the private server database under `DATA_DIR`. Do not commit student email or activation-code lists to GitHub.

## Colt Assistant

Colt Assistant is a free, local, keyword-based classroom helper. It reads only the current active approved websites and does not use a paid API, language model, search engine, or outside message service. Student conversations exist only on the current page and are not saved.

Teacher settings and testing instructions are in `COLT-ASSISTANT.md`.

## Colt Radio

Colt Radio keeps a single in-page player while offering genre-labeled stations from Lofi Cafe and selected direct-stream providers. Signed-in students and the teacher can pin stations to an account-specific Favorites category; only station IDs are stored, never listening history. Guest favorites stay in that browser. Colt Radio has no outbound navigation links, minimizes when Colt Assistant opens, stays clear of the class timer, and stops when Colt Run begins. School filtering must allow the selected streaming domains for playback.

