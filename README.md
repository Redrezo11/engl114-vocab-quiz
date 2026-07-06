# Word Bank — ENGL114 Vocabulary Quiz

A small static web app for self-testing the **ENGL114** core midterm vocabulary (the general
academic word list from the exam specs). It shows an English word and four Arabic options;
words you miss are saved to a **review pile** (in `localStorage`) so you can retest just the
weak ones later. Plain HTML, CSS, and JavaScript — no build step, no dependencies. 184 words.

## Files
- `index.html` — page structure
- `styles.css` — styling
- `data.js` — the word list (English word + Arabic meaning)
- `app.js` — quiz engine, scoring, review-pile logic
- `modules.html` / `modules.js` — the separate **English multiple-choice modules** quiz (see below)
- `modules/` — module JSON files + `manifest.json` registry
- `.nojekyll` — serve files as-is on GitHub Pages

## Run locally
Open `index.html` in a browser. Everything is client-side.

## Publish on GitHub Pages
1. Create a repo, e.g. `engl114-vocab-quiz`.
2. Put these files in the repo root and push:
   ```bash
   git init && git add . && git commit -m "Word Bank ENGL114 quiz"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/engl114-vocab-quiz.git
   git push -u origin main
   ```
3. **Settings → Pages → Deploy from a branch → `main` / `(root)` → Save**.
4. Live at `https://YOUR-USERNAME.github.io/engl114-vocab-quiz/` in ~1 minute.

## Editing the words
Edit `data.js`. Each card is `{ t: "assume", a: "يفترض" }` — `t` is the English word,
`a` is the Arabic answer. Add/remove/edit freely.

---

# English multiple-choice modules

A second, separate quiz lives at [`modules.html`](modules.html) (linked from the home page). It
runs **English-only multiple-choice** questions grouped into **modules** — each module is one JSON
file in the [`modules/`](modules/) folder. It's aimed at **Saudi EFL learners**, so hints and
feedback are written in a **mix of Arabic and English** to scaffold understanding. This is
completely independent of the Arabic word-bank quiz (separate page, separate progress).

## How loading works (and why there's a manifest)
GitHub Pages is static — it **cannot list a directory** — so the app can't "find" your files on
its own. Instead, [`modules/manifest.json`](modules/manifest.json) is a **registry** you edit: it
lists every module so the app knows what exists. The module list is built from the manifest; each
question file is only fetched when a learner opens that module.

## Add a new module (webmaster workflow)
1. Have an LLM produce a `.json` file following the **schema** below (see the author prompt).
2. **Validate the JSON** (paste into your editor / jsonlint) and remove any ```` ```json ```` code
   fences — the file must be pure JSON.
3. Drop the file into `modules/` (e.g. `modules/unit4.json`).
4. Add one entry to `modules/manifest.json`:
   ```json
   { "id": "engl114-unit4", "file": "unit4.json",
     "title": "Unit 4 — Collocations", "description": "…", "count": 30 }
   ```
   The `id` must be **unique** (it namespaces that module's saved progress — never reuse one).
5. `git add . && git commit && git push`. Pages rebuilds and the module appears in the list.

> **Local testing:** the modules page uses `fetch()`, which browsers **block on `file://`**. So
> double-clicking `modules.html` won't load modules. Run a quick local server from the project
> root — `python -m http.server 8000`, then open `http://localhost:8000/modules.html` — or just
> test on the live Pages site. (The Arabic quiz still works offline; only this page needs a server.)

> **Full authoring spec for the LLM:** see
> [`documentations/module-authoring-guide.md`](documentations/module-authoring-guide.md) — a
> complete, copy-pasteable brief covering the schema, the 0-based `answerIndex`, validation rules,
> and the Arabic-dominant language policy.

## Module JSON schema
One file = one module = one quiz. `answerIndex` is **0-based** (0 = first option).

```json
{
  "schemaVersion": 1,
  "id": "engl114-unit3-word-choice",
  "title": "Unit 3 — Word Choice",
  "description": "Academic word choice and collocation.",
  "shuffleQuestions": true,
  "shuffleOptions": true,
  "questions": [
    {
      "id": "q1",
      "prompt": "Choose the word that best completes the sentence: \"The results were ___, leaving no doubt.\"",
      "options": ["conclusive", "tentative", "ambiguous", "arbitrary"],
      "answerIndex": 0,
      "hint": [
        "conclusive = قاطع / حاسم",
        "leaving no doubt = لا يترك مجالاً للشك — so we need a strong, definite word."
      ],
      "feedback": {
        "correct": "Correct ✓ 'conclusive' يعني قاطع/حاسم — it matches 'no doubt'.",
        "incorrect": "The answer is 'conclusive' (قاطع، نهائي). 'tentative' (غير مؤكد) و 'ambiguous' (غامض) تدلّ على عدم اليقين — they don't fit a definite result."
      }
    }
  ]
}
```

| Field | Required | Notes |
|---|---|---|
| `schemaVersion` | yes | integer, currently `1`. |
| `id` | yes | unique kebab-case string; namespaces saved progress. |
| `title` | yes | shown in the module list. |
| `description` | no | one line under the title. |
| `shuffleQuestions` | no | default `true`; set `false` for lesson-ordered decks. |
| `shuffleOptions` | no | default `true`; set **`false`** if a question uses "All of the above" / order-dependent options. |
| `questions[].id` | yes | stable per question — the review pile references it; changing/removing it drops that saved entry. |
| `questions[].prompt` | yes | non-empty English string. |
| `questions[].options` | yes | array of **≥ 2** strings (4 is typical; 3–5 supported). |
| `questions[].answerIndex` | yes | **0-based** index of the correct option. |
| `questions[].hint` | no | string **or** array of strings; revealed by the **Hint** button before answering. |
| `questions[].feedback.correct` | no | shown on a correct pick (falls back to "Correct!"). |
| `questions[].feedback.incorrect` | yes | the **universal** explanation shown on any wrong pick (grammar / word-choice teaching). |

Invalid questions (bad `answerIndex`, fewer than 2 options, missing `feedback.incorrect`) are
**skipped** with a notice; a module with zero valid questions won't open. All text is rendered as
plain text (no HTML), so quotes/apostrophes/Arabic are safe.

## LLM author prompt (copy-paste)
> You are writing an English vocabulary quiz **module** for **Saudi EFL learners** as a single
> JSON file. Output **only** valid JSON (no markdown fences, no comments) matching this shape:
> `{ "schemaVersion":1, "id":"<unique-kebab-id>", "title":"…", "description":"…",
> "shuffleQuestions":true, "shuffleOptions":true, "questions":[ { "id":"q1", "prompt":"…",
> "options":["…","…","…","…"], "answerIndex":<0-based int>, "hint":["…"],
> "feedback":{ "correct":"…", "incorrect":"…" } } ] }`.
> Rules: `prompt` and `options` are **English only** (that's what's being tested). `hint`,
> `feedback.correct`, and `feedback.incorrect` must be **mainly Arabic**, using English only when
> necessary (the target vocabulary word itself, or a grammar label) — explain meanings and reasons
> in Arabic. `feedback.incorrect` is
> one *universal* explanation shown for any wrong answer: say what the right word means and why the
> others don't fit. `answerIndex` is 0-based and must point to the correct option. Give each
> question a unique `id`. Produce N questions.

## Storage keys (important if you host more than one of these quizzes)
`localStorage` is shared across all pages on the same domain. The Arabic word bank uses keys
prefixed `engl114_`; the English modules use `engl114mc_miss_<moduleId>` /
`engl114mc_stat_<moduleId>` (one review pile per module); the medical quiz uses `mvq_`. So all of
these keep **separate** progress even under the same GitHub account. If you clone this for another
deck, change the storage-key prefixes to keep its progress separate too.

## Notes
- Progress is per-browser and per-device (no cross-device sync); clearing browser data resets it.
- Fonts load from Google Fonts with system fallbacks. No tracking; nothing leaves the browser.
