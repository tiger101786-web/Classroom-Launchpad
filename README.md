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

