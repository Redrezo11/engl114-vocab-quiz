# English Midterm Practice (multi-course)

A small static web app for midterm self-study in KSU English courses (Saudi EFL learners, A1–A2).
The site hosts **several courses**. Each one gets the same sections:

- **Course home / Word Bank** (`course.html?course=<id>`): the course's core vocabulary as
  English→Arabic matching. Missed words go to a **review pile** that you can retest later.
- **Practice Modules** (`modules.html?course=<id>`): English multiple-choice modules in
  **Vocabulary** and **Grammar** tabs, with bilingual (mainly Arabic) hints and feedback.
- **Grammar Reference** (`grammar-reference.html?course=<id>`): bilingual study notes, one per
  grammar topic. Each topic can be linked to directly with `#<slug>`.

The root, [index.html](index.html), is a **course picker**. Current courses are **ENGL114** (live)
and **ENGL 102/103B** (scaffolded, content coming).

Plain HTML, CSS, and JavaScript, with no build step and no dependencies.

## How it's organised
```
index.html  course.html  modules.html  grammar-reference.html  styles.css  qr-home.svg
js/
  core.js               shared helpers + course loader (window.EC); loaded by every page
  picker.js             index.html: course list + QR modal
  wordbank.js           course.html: Word Bank quiz
  modules.js            modules.html: module list + MCQ engine
  grammar-reference.js  grammar-reference.html: accordion of topics
courses/
  index.json            registry of courses (GitHub Pages can't list folders)
  <id>/course.json      titles, ticker words, section paths
  <id>/wordbank.json    Word Bank words  { "words": [ { "t": "assume", "a": "يفترض" } ] }
  <id>/modules.json     module manifest (vocabulary + grammar tabs)
  <id>/vocabulary/      vocabulary module files
  <id>/grammar/reference.json   grammar topics
  <id>/grammar/modules/         grammar module files
documentations/         authoring guides + dev notes
```

Every page reads `?course=<id>`, loads `courses/index.json` and `courses/<id>/course.json`, and
fills in its own title, eyebrow, ticker, and links. A missing, unknown, or disabled course id
sends the learner back to the picker. All links between pages keep `?course=`.

**Adding a course, or filling in an existing one:** see
[`documentations/course-authoring-guide.md`](documentations/course-authoring-guide.md).

## Run locally
All pages load their content with `fetch()`, which browsers **block on `file://`**. Run a local
server from the project root:
```
python -m http.server 8000
```
Then open `http://localhost:8000/`, or test on the live Pages site.

## Publish on GitHub Pages
Pushing to `main` deploys automatically through
[.github/workflows/deploy.yml](.github/workflows/deploy.yml) (GitHub Actions; `.nojekyll` serves
files as-is). Live at `https://redrezo11.github.io/engl114-vocab-quiz/`. Pages caches assets for
about 10 minutes, so when you change `.js` or `.css`, bump the `?v=` number on the `<script>` /
`<link>` tags in all four HTML pages.

## Editing the words
Edit `courses/<id>/wordbank.json`. Each entry is `{ "t": "assume", "a": "يفترض" }`: `t` is the
English word and `a` is the Arabic answer (`pos` is optional and not used yet). The counts and the
options update automatically.

---

# Multiple-choice modules

Each module is one JSON file inside a course folder, and is listed in that course's
**`courses/<id>/modules.json`** manifest. The list on `modules.html` is built from the manifest; a
module's questions are only fetched when a learner opens it.

## Vocabulary vs Grammar tabs
The tab is chosen by each manifest entry's **`category`** (`"vocabulary"` or `"grammar"`; it
defaults to `vocabulary`). Both kinds use the **same** JSON schema and engine. Vocabulary files go
in `courses/<id>/vocabulary/`, and grammar files go in `courses/<id>/grammar/modules/`. Each grammar
question also has a `topicSlug`, which links its **Hint** to
`grammar-reference.html?course=<id>#<slug>`.

## Add a new module (webmaster workflow)
1. Have an LLM produce a `.json` file that follows the schema below. The full briefs are
   [`documentations/module-authoring-guide.md`](documentations/module-authoring-guide.md) (vocabulary)
   and [`documentations/grammar-module-authoring-guide.md`](documentations/grammar-module-authoring-guide.md)
   (grammar).
2. **Validate the JSON** and remove any ```` ```json ```` fences. The file must be pure JSON.
3. Save it in the course folder, for example `courses/engl114/vocabulary/unit4.json`.
4. Add one entry to `courses/<id>/modules.json`. The `file` path is **relative to the course folder**:
   ```json
   { "id": "engl114-unit4", "file": "vocabulary/unit4.json", "category": "vocabulary",
     "title": "Unit 4 — Collocations", "description": "…", "count": 30 }
   ```
   The `id` must be **unique** within the course, because it namespaces that module's saved
   progress. Never reuse one.
5. `git add . && git commit && git push`. Pages rebuilds and the module appears in the list.

## Module JSON schema (vocabulary + grammar)
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

## Storage keys
`localStorage` is shared by every page on the same domain, so all keys are namespaced by course:

| What | Key |
|---|---|
| Word Bank review pile / stats | `ec:<course>:wb:miss` / `ec:<course>:wb:stat` |
| Module review pile / stats | `ec:<course>:mod:<moduleId>:miss` / `ec:<course>:mod:<moduleId>:stat` |
| Reserved (future grammar features) | `ec:<course>:ccq:<slug>:…`, `ec:<course>:pres:<slug>:seen` |

Keys from before the multi-course change (`engl114_*`, `engl114mc_*`) are no longer read. The
medical quiz on the same account uses `mvq_`.

## Notes
- Progress is per-browser and per-device (no cross-device sync). Clearing browser data resets it.
- Old links without `?course=` (for example `grammar-reference.html#tag-questions`) now land on the
  course picker.
- Fonts load from Google Fonts with system fallbacks. There is no tracking, and nothing leaves the browser.
