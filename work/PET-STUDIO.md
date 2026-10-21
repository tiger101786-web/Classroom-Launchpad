# Production Pet Studio

The approved preview is integrated through `pet-studio.js` and scoped `pet-studio.css`.
The account menu's My Pet entry and both pets' customize actions open one native modal.

- The original live pet nodes move into the modal and return to their original locations on close. There are no duplicate SVG IDs or companion animation controllers.
- `companion-picker.js` owns the account preferences, API save queue, retry handling, radio state, selection and account isolation. Studio never writes a second preferences store.
- Each pet retains its independent name, skin, accessories, size, motion and sleep settings. Undo restores the prior edit. Trying a dance is temporary and does not stop real radio playback.
- Existing controllers retain hidden controls as their action adapters; only Studio is presented to users.
- Images in `assets/pet-studio/` are screenshots of the real skin renderers, captured by `work/verify-pet-studio.cjs`. The standalone preview is preserved under `work/`.
- Sleep timers do not put a pet to sleep while its Studio is open. Explicit sleep still works.

Validation: `npm run test:studio` exercises production UI and saved preferences for teacher and student accounts, reload, undo, error/retry, mobile layout, reduced motion and logout. `npm run test:robo` also runs the earlier controller/animation suite, where only the new UI script is suppressed so the engine contracts remain independently testable. `npm run build` includes the new script.
