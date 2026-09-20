(function (root) {
  "use strict";
  const styles = [["none", "None"], ["silver", "Brushed Silver"], ["gold", "Warm Gold"], ["pearl", "Pearl"], ["rose", "Rose Gold"], ["glass", "Midnight Glass"], ["crimson", "Crimson Classic"], ["colt", "Colt Pride"]];
  const groups = [
    ["Creativity & discovery", ["Stay Curious", "Dream It. Create It.", "Small Steps, Big Ideas", "Imagine What’s Possible", "Make Something Amazing", "Think Outside the Box"]],
    ["Confidence & perseverance", ["Progress Over Perfection", "Keep Going. Keep Growing.", "Mistakes Help Me Learn", "Brave Enough to Try", "Challenge Accepted", "I Can Figure It Out"]],
    ["Kindness & community", ["Choose Kindness", "Everyone Belongs", "Better Together", "Be Someone’s Sunshine", "Lead with Kindness", "Proud to Be a Colt"]],
    ["Faith & purpose", ["Let Your Light Shine", "Walk by Faith", "Faith, Hope & Love", "Created with Purpose", "Serve with Love", "Use Your Gifts for Good"]]
  ];
  const mottos = groups.flatMap(([group, labels], groupIndex) => labels.map((label, index) => ({ id: `m${groupIndex}-${index}`, label, group })));
  const valid = value => !!value && styles.some(([id]) => id === value.style) && mottos.some(item => item.id === value.motto);
  const clean = value => valid(value) ? { style: value.style, motto: value.motto } : { style: "none", motto: "m0-0" };
  function art(value) {
    const selection = clean(value);
    if (selection.style === "none") return "";
    const text = mottos.find(item => item.id === selection.motto).label;
    return `<div class="motto-plaque motto-plaque-${selection.style}" data-plaque-style="${selection.style}">${selection.style === "colt" ? '<img src="assets/motto-plaque-colt.png" alt="" aria-hidden="true">' : ""}<span>${text}</span></div>`;
  }
  function render(session) { return session.authenticated ? art(session.homePlaque) : ""; }
  function open({ selected, save, onSave }) {
    document.querySelector(".motto-plaque-dialog")?.remove();
    let draft = clean(selected);
    let saving = false;
    const dialog = document.createElement("dialog");
    dialog.className = "launch-scene-dialog motto-plaque-dialog";
    dialog.setAttribute("aria-labelledby", "mottoPlaqueTitle");
    dialog.innerHTML = `<div class="launch-scene-dialog-heading"><h2 id="mottoPlaqueTitle">Choose your motto plaque</h2><button type="button" class="outline-btn" data-plaque-close aria-label="Close motto chooser">✕</button></div><p>Choose a message and a design for your own homepage. Nothing changes for classmates.</p><div id="mottoPlaquePreview"></div><label class="motto-select-label" for="mottoPlaqueText">Your motto</label><select id="mottoPlaqueText">${groups.map(([group]) => `<optgroup label="${group}">${mottos.filter(item => item.group === group).map(item => `<option value="${item.id}" ${item.id === draft.motto ? "selected" : ""}>${item.label}</option>`).join("")}</optgroup>`).join("")}</select><fieldset class="motto-designs"><legend>Plaque design</legend><div class="motto-design-grid">${styles.map(([id, label]) => `<button type="button" data-plaque-choice="${id}" aria-pressed="${id === draft.style}">${id === "none" ? '<span class="motto-none">No plaque</span>' : art({ style: id, motto: draft.motto })}<strong>${label}</strong></button>`).join("")}</div></fieldset><p id="mottoPlaqueStatus" role="status"></p><div class="launch-scene-dialog-actions"><button type="button" class="outline-btn" data-plaque-close>Cancel</button><button type="button" class="primary-btn" id="saveMottoPlaque">Save plaque</button></div>`;
    document.body.append(dialog);
    const update = () => {
      dialog.querySelector("#mottoPlaquePreview").innerHTML = art(draft) || '<p class="motto-none">Your homepage will have no plaque.</p>';
      dialog.querySelectorAll("[data-plaque-choice]").forEach(button => {
        button.setAttribute("aria-pressed", String(button.dataset.plaqueChoice === draft.style));
        const plaque = button.querySelector(".motto-plaque");
        if (plaque) plaque.outerHTML = art({ ...draft, style: button.dataset.plaqueChoice });
      });
    };
    const close = () => { if (saving) return; dialog.close(); dialog.remove(); document.querySelector('[data-action="mottoPlaque"]')?.focus(); };
    dialog.querySelectorAll("[data-plaque-close]").forEach(button => button.addEventListener("click", close));
    dialog.addEventListener("cancel", event => { event.preventDefault(); close(); });
    dialog.querySelector("#mottoPlaqueText").addEventListener("change", event => { draft = { ...draft, motto: event.target.value }; update(); });
    dialog.querySelectorAll("[data-plaque-choice]").forEach(button => button.addEventListener("click", () => { draft = { ...draft, style: button.dataset.plaqueChoice }; update(); }));
    dialog.querySelector("#saveMottoPlaque").addEventListener("click", async () => {
      saving = true;
      dialog.querySelectorAll("button, select").forEach(control => { control.disabled = true; });
      dialog.querySelector("#mottoPlaqueStatus").textContent = "Saving your plaque…";
      try { const result = await save(draft); saving = false; close(); onSave(result); }
      catch (error) {
        saving = false;
        dialog.querySelectorAll("button, select").forEach(control => { control.disabled = false; });
        dialog.querySelector("#mottoPlaqueStatus").textContent = error.message || "Could not save. Please try again.";
      }
    });
    update();
    dialog.showModal();
  }
  const api = { styles, mottos, valid, clean, art, render, open };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.MottoPlaques = api;
})(typeof window !== "undefined" ? window : globalThis);
