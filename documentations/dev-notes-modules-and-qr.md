# Dev notes: building the modules section, the QR feature, and the "All" default

A retrospective on three changes to this static, zero-build, zero-dependency site
(`index.html` + `app.js` + `data.js` + `styles.css`, IIFE style, `localStorage` with an in-memory
fallback). Written so other projects can reuse the reasoning, not just the code.

---

## 1. The English multiple-choice **modules** section

**Goal:** let a webmaster add quiz "modules" (JSON files of MC questions) that appear in a
selectable list, separate from the existing English→Arabic quiz.

### The constraint that shaped everything
**GitHub Pages is static — it cannot list a directory.** So "load every file in `/modules`" is
impossible from the browser. There is no server to enumerate files.

**Solution:** a **manifest registry**. `modules/manifest.json` lists each module
(`id`, `file`, `title`, `description`, `count`). The app fetches the manifest to render the list,
and only fetches an individual module's questions when the user opens it. Adding a module is a
**two-step** webmaster action: drop the `.json` in `modules/` **and** add an entry to the manifest,
then push. (A recurring support issue was people doing only step one — the file exists but never
appears, because nothing registers it.)

### Design decisions that worked
- **Separate page** (`modules.html` + `modules.js`) instead of bolting onto the Arabic quiz. Kept
  the working quiz untouched and the concerns clean. Reused `styles.css` and the same IIFE
  patterns (`shuffle`, `load`/`save`, screen show/hide, toast).
- **`fetch()` of pure `.json`** (vs. a `.js` file assigning a global). Cleaner data, but note the
  trade-off below.
- **Per-module review pile**, namespaced storage keys: `engl114mc_miss_<id>` / `engl114mc_stat_<id>`,
  distinct from the Arabic quiz's `engl114_*`. Namespacing storage per feature avoided cross-quiz
  collisions.
- **`answerIndex` is 0-based**, options are strings, and there's a **validator** on load: every
  question must have a non-empty prompt, ≥2 string options, an in-range integer `answerIndex`, and
  `feedback.incorrect`. Invalid questions are **skipped with a surfaced count**; a module with zero
  valid questions won't open. This made hand-authored / LLM-generated files fail *gracefully*
  instead of crashing the list.
- **Render everything with `textContent`, never `innerHTML`** for author-supplied text → no HTML
  injection, and quotes/apostrophes/Arabic "just work."
- **Bilingual (Arabic-dominant) hints & feedback** for the Saudi EFL audience: `prompt`/`options`
  stay English (they're what's tested), while `hint` and `feedback` are mainly Arabic. Containers
  use `dir="auto"` + the Arabic font stack so mixed text renders with correct bidi.

### Gotchas
- **`fetch()` is blocked on `file://`.** Double-clicking `modules.html` locally won't load modules;
  you need a local server (`python -m http.server`) or the live site. (The Arabic quiz still works
  offline because it uses a `<script>` global, not `fetch`.) Document this loudly.
- **Relative fetch paths only.** The site lives under a subpath (`/engl114-vocab-quiz/`), so fetch
  `modules/manifest.json`, never `/modules/...` — a leading slash breaks under the project subpath.
- **Use `Promise.allSettled`-style resilience** so one 404/broken module never blocks the whole
  list.
- **Keep question `id`s stable.** The review pile references questions by id; renaming an id drops
  saved progress for it.

---

## 2. The **QR code** feature

**Goal:** a button on the main page that pops up a QR so students don't type the URL.

### Design decision: pre-generated **static** QR, not a runtime service
The site promises "nothing leaves the browser; no tracking." Calling an external QR image API at
runtime would break that and add a failure point. So the QR is a **static asset committed to the
repo** (`qr-home.svg`), displayed in a modal from a local file. Zero external calls at runtime,
works offline, no dependency.

### How it was built
- **Generated the SVG at build time** with the `qrcode` npm package installed into a scratch dir
  (build-time only — not a runtime dependency), encoding the exact site URL with error-correction
  level M.
- **Verified the payload by decoding it back** (`sharp` + `jsqr`) to confirm it encodes exactly
  `https://…/engl114-vocab-quiz/` before shipping. Don't trust a QR you haven't decoded.
- **A minimal modal**: button toggles a `.hide` class; close via ×, backdrop click (`[data-close]`),
  or `Esc`. The `Esc` handler was added to the *existing* global `keydown` listener with a guard so
  it doesn't interfere with the quiz's `1–4 / Enter` keys (check modal-open first, then `return`).
- The modal also shows the URL as text and an **"Open link"** anchor, so on desktop it "routes"
  too.

### Gotcha that cost real time: **browser cache made a working feature look broken**
After deploy, clicking the button "did nothing" on the live site but worked locally. Root cause:
GitHub Pages serves assets with `cache-control: max-age=600`. The browser had the **new
`index.html`** (button visible) but a **stale cached `app.js`** (no handler) → button with no
listener. The deployed files were correct the whole time.

**How we proved it:** fetched the live `app.js` with a cache-buster and `grep`ed for the handler —
it was present and identical to local. So the fault was the *browser's* cache, fixed by a hard
refresh (Ctrl/Cmd+F5). Lesson: **when "it works locally but not live," check the live asset with a
cache-buster before touching code**, and consider cache-busting query strings (`app.js?v=2`) for
frequently-updated JS/CSS.

---

## 3. Defaulting the round length to **All**

Small change, worth recording the reasoning. The module quizzes reuse the Arabic quiz's
10/20/All round-length selector, which defaulted to **20**. But modules are a **testing** feature —
sampling 20 of 62 questions undercuts the point. Changed the default to **All** in two places that
must stay in sync:
- `modules.html`: the pressed segment (`aria-pressed="true"`) moved to the `All` button.
- `modules.js`: initial `lenChoice = 0` (0 = All).

**Lesson:** UI default state (the `aria-pressed` button) and JS default state (`lenChoice`) are two
sources of truth for the same setting — change both, or the highlighted button won't match actual
behavior.

---

## Cross-cutting lessons

1. **Static hosting has no directory listing** — a manifest/registry is the standard workaround;
   accept the small "register it too" authoring step.
2. **Namespace `localStorage` per feature** to avoid cross-feature collisions.
3. **Validate and skip, don't crash** — hand/LLM-authored content will have mistakes; degrade
   gracefully and surface a count.
4. **`textContent` over `innerHTML`** for any author/user-supplied strings.
5. **Prefer local static assets over runtime third-party calls** when a privacy/offline promise
   exists (the QR).
6. **Verify generated artifacts** (decode the QR; parse the JSON) before shipping.
7. **Browser/CDN cache will lie to you.** Confirm live with a cache-buster; hard-refresh before
   concluding a deploy failed. See the companion runbook
   [`github-pages-legacy-to-actions.md`](github-pages-legacy-to-actions.md).
