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

When opened through the server, Colt Corner topics/replies, muted students, and website requests are saved in `data/classroom-launchpad-db.json`.

When opened directly as a file, data is saved in the browser's local storage on the same computer and browser profile.

