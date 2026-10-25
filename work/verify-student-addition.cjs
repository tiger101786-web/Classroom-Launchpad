const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const email = 'mansoor.yatak@scscolts.org';
const migration = '2026-10-25-add-mansoor-yatak-grade-6';
const origin = 'http://127.0.0.1:8164';
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-roster-test-'));
const dbPath = path.join(dataDir, 'classroom-launchpad-db.json');
const server = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: { ...process.env, PORT: '8164', DATA_DIR: dataDir,
    TEACHER_PIN: '654321', SESSION_SECRET: 'isolated-roster-test', STUDENT_EMAIL_DOMAIN: 'scscolts.org' },
  stdio: 'ignore'
});

(async () => {
  try {
    let ready = false;
    for (let attempt = 0; attempt < 80; attempt++) {
      try { if ((await fetch(origin + '/api/health')).ok) { ready = true; break; } } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert(ready, 'Test server must start');
    const login = await fetch(origin + '/api/auth/teacher', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin },
      body: JSON.stringify({ pin: '654321' })
    });
    assert.equal(login.status, 200);
    const cookie = login.headers.get('set-cookie').split(';')[0];
    async function roster() {
      const response = await fetch(origin + '/api/approved-students', { headers: { Cookie: cookie, Origin: origin } });
      assert.equal(response.status, 200);
      return (await response.json()).students;
    }
    const students = await roster();
    const student = students.find(item => item.email === email);
    assert(student);
    assert.equal(student.name, 'Mansoor Yatak');
    assert.equal(student.grade, '6');
    assert.equal((await roster()).filter(item => item.email === email).length, 1);
    let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    assert(db.appliedDataMigrations.includes(migration));
    assert.equal(db.approvedStudents.find(item => item.email === email).passwordHash, '');

    // Simulate deploying onto a database where the account already exists.
    db.appliedDataMigrations = db.appliedDataMigrations.filter(id => id !== migration);
    const existing = db.approvedStudents.find(item => item.email === email);
    existing.passwordHash = 'test-existing-hash';
    existing.passwordSalt = 'test-existing-salt';
    existing.name = 'Existing display name';
    fs.writeFileSync(dbPath, JSON.stringify(db));
    await roster();
    db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    assert.deepEqual(db.approvedStudents.find(item => item.email === email), existing);

    // A teacher can later remove the account without the migration recreating it.
    db.approvedStudents = db.approvedStudents.filter(item => item.email !== email);
    fs.writeFileSync(dbPath, JSON.stringify(db));
    assert(!(await roster()).some(item => item.email === email));
    console.log('PASS: Grade 6 addition, no duplicates, existing account preserved, one-time migration.');
  } finally {
    server.kill();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
