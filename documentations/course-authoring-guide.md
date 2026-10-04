# Course Authoring Guide — adding and maintaining a course

**Audience:** the webmaster, or an LLM helping them, who adds a new course to the site or fills in
an existing course's content.

The site hosts **several courses**. Every course gets the same four sections, from the same pages:

| Section | Page | Content file(s) |
|---|---|---|
| Course home + Word Bank (English → Arabic) | `course.html?course=<id>` | `courses/<id>/wordbank.json` |
| Vocabulary + grammar MCQ modules | `modules.html?course=<id>` | `courses/<id>/modules.json` + module files |
| Grammar reference | `grammar-reference.html?course=<id>` | `courses/<id>/grammar/reference.json` |
| Course picker (all courses) | `index.html` | `courses/index.json` |

The page code is shared. **A course is just a folder of JSON files plus one line in the registry.**

---

## 1. Folder layout

```
courses/
  index.json                    registry — which courses exist (picker order)
  <id>/
    course.json                 course metadata: titles, ticker words, section paths
    wordbank.json               Word Bank words
    modules.json                module manifest (both tabs)
    vocabulary/                 vocabulary module files
    grammar/
      reference.json            grammar topics (slug = join key for everything grammar)
      modules/                  grammar module files
      manifest.json             FUTURE — per-topic resources (slides, CCQs); see §6
      presentations/            FUTURE — one file per topic slug
      ccq/                      FUTURE — one file per topic slug
```

GitHub Pages can't list a folder, which is why both the course registry and the module manifest
exist. A file only appears on the site once it is listed in one of them.

---

## 2. Add a new course (checklist)

1. **Choose an id.** It must be lowercase letters, digits and hyphens, 2–32 characters, and must not
   start with a hyphen (`^[a-z0-9][a-z0-9-]{1,31}$`). Examples: `engl114`, `engl102`. The id appears in URLs and in
   saved-progress keys, so **never rename it** once learners use it.
2. **Create the folder** `courses/<id>/` with these four starter files:
   - `course.json` (see §3)
   - `wordbank.json` → `{ "schemaVersion": 1, "words": [] }`
   - `modules.json` → `{ "schemaVersion": 1, "version": 1, "modules": [] }`
   - `grammar/reference.json` → `{ "topics": [] }`
   You can copy `courses/engl102/` as a template.
3. **Register it** in `courses/index.json` by adding `{ "id": "<id>", "enabled": true }`. The array
   order is the order the picker shows the courses in.
4. **Test locally** (§7), then commit and push.

While a course has no content, every page shows a friendly empty state ("coming soon",
"No modules yet", "No grammar topics yet") rather than an error. Set `"status": "draft"` to show a
**Coming soon** pill on its picker card.

---

## 3. `course.json`

```json
{
  "schemaVersion": 1,
  "id": "engl102",
  "code": "ENGL 102/103B",
  "title_en": "ENGL 102/103B Midterm Practice",
  "title_ar": "التدريب على اختبار منتصف الفصل — ENGL 102/103B",
  "description_en": "One line for the picker card.",
  "description_ar": "سطر واحد لبطاقة المقرر.",
  "level": "CEFR A1–A2",
  "status": "draft",
  "ticker": { "home": ["clothes", "describe"], "modules": ["…"], "grammar": ["…"] },
  "sections": {
    "wordbank": { "file": "wordbank.json" },
    "modules":  { "manifest": "modules.json" },
    "grammar":  { "reference": "grammar/reference.json" }
  }
}
```

| Field | Required | Notes |
|---|---|---|
| `id` | yes | must equal the folder name **and** the registry id, or the course won't load |
| `code` | yes | short label; used in the browser tab title and on the picker card |
| `title_en` | yes | shown in each page's eyebrow and on the picker card |
| `title_ar`, `description_en`, `description_ar`, `level` | no | picker card |
| `status` | no | `"live"` (default) or `"draft"`. Draft shows a "Coming soon" pill, but the pages still open |
| `ticker.home` / `.modules` / `.grammar` | no | words for the scrolling strip on each page. A missing page falls back to `home`. On the grammar page it falls back to the topic titles. With no words at all, the strip is hidden |
| `sections.*` | no | paths relative to `courses/<id>/`. The defaults are shown above, so you only change them to move a file |

To **hide** a course entirely, set `"enabled": false` on its line in `courses/index.json`. It
disappears from the picker, and direct links send learners back to the picker.

---

## 4. Word Bank — `wordbank.json`

```json
{ "schemaVersion": 1, "words": [ { "t": "assume", "a": "يفترض", "pos": "verb" } ] }
```

- `t` is the English word or phrase (shown as the question), and `a` is its Arabic meaning (the answer).
  Both are required. An entry missing either one is skipped.
- `pos` is optional and is not used by the quiz yet.
- A repeated `t` is skipped (with a console warning). The review pile stores words by `t`, so
  changing a word's `t` drops it from learners' review piles.
- Wrong options are other words' Arabic meanings, so the bank needs **at least 2 words** to start,
  and 4 or more for full four-option questions.

---

## 5. Modules and grammar reference

- **Vocabulary modules:** [module-authoring-guide.md](module-authoring-guide.md). Files go in
  `courses/<id>/vocabulary/`, and the manifest `file` is `vocabulary/<name>.json`.
- **Grammar modules:** [grammar-module-authoring-guide.md](grammar-module-authoring-guide.md). Files
  go in `courses/<id>/grammar/modules/`, and the manifest `file` is `grammar/modules/<name>.json`.
- **Hints:** [hint-writing-guidelines.md](hint-writing-guidelines.md).
- **Grammar reference:** `courses/<id>/grammar/reference.json` uses the same topic shape as ENGL114's
  (`id, slug, title_en, title_ar, explanation_en, explanation_ar, structure, examples[], common_mistakes[]`).
  A topic's `slug` becomes its deep link (`grammar-reference.html?course=<id>#<slug>`), and it is the
  `topicSlug` that grammar questions use.

Module and question `id`s are saved-progress keys. **Never rename or reuse them.**

---

## 6. Planned grammar expansion (reserved slots, not built yet)

The grammar area will grow beyond the reference and MCQ modules, for example with **slide
presentations** per topic and **concept-checking questions (CCQs)**. Everything is keyed by the
topic `slug`:

```json
// courses/<id>/grammar/manifest.json
{ "schemaVersion": 1,
  "topics": [ { "slug": "tag-questions",
                "presentation": "presentations/tag-questions.json",
                "ccq": "ccq/tag-questions.json",
                "modules": ["engl114-grammar-test1"] } ] }
```

- Paths are relative to `courses/<id>/grammar/`. Each key is optional for every topic.
- It is turned on by adding `"manifest": "grammar/manifest.json"` under `sections.grammar` in
  `course.json`. The core exposes this as `ctx.paths.grammarManifest`, and
  `js/grammar-reference.js` already has an empty branch where a per-topic **Practice / Slides /
  CCQ** row (`.gref-actions`) will go.
- New pages (for example `presentation.html?course=<id>&topic=<slug>`) should start the same way the
  existing ones do: `var ctx = await EC.loadCourse(); if(!ctx) return; EC.applyChrome(ctx, {…});`.
- Reserved storage keys: `ec:<id>:ccq:<slug>:…` and `ec:<id>:pres:<slug>:seen`.

---

## 7. Test before pushing

`fetch()` doesn't work on `file://`, so run a local server from the repo root:

```
python -m http.server 8000
```

Then check these pages:

- `http://localhost:8000/`: the new course card appears.
- `/course.html?course=<id>`: the word count is right, and the Modules and Grammar links include `?course=<id>`.
- `/modules.html?course=<id>`: both tabs list the right modules, and a grammar hint links to `grammar-reference.html?course=<id>#<slug>`.
- `/grammar-reference.html?course=<id>#<slug>`: that topic opens.
- The DevTools console shows no errors, and there are no 404s.

Check the JSON and the links between files across all courses:

```
node -e "const fs=require('fs');for(const c of JSON.parse(fs.readFileSync('courses/index.json')).courses){const b='courses/'+c.id+'/';const cj=JSON.parse(fs.readFileSync(b+'course.json'));if(cj.id!==c.id)throw c.id;const m=JSON.parse(fs.readFileSync(b+'modules.json'));const slugs=new Set(JSON.parse(fs.readFileSync(b+'grammar/reference.json')).topics.map(t=>t.slug));for(const e of m.modules){const mod=JSON.parse(fs.readFileSync(b+e.file));if(mod.id!==e.id)throw e.id;for(const q of mod.questions)if(q.topicSlug&&!slugs.has(q.topicSlug))console.warn('bad slug',c.id,e.id,q.id,q.topicSlug)}console.log('ok',c.id,m.modules.length,'modules',slugs.size,'topics',JSON.parse(fs.readFileSync(b+'wordbank.json')).words.length,'words')}"
```

Expected output is one `ok <id> …` line per course and no `bad slug` lines.

GitHub Pages caches files for about 10 minutes. When you change a `.js` or `.css` file, bump the `?v=`
number on its `<script>` / `<link>` tags in all four HTML pages.
