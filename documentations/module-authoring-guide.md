# Module Authoring Guide

**Audience:** an LLM (or a human) generating a quiz **module** file for the ENGL114 English
multiple-choice quiz at [`modules.html`](../modules.html).

**Your job:** output **one JSON file** that contains a list of multiple-choice question objects.
The app (`modules.js`) reads that file and renders the quiz. Follow this spec exactly — anything
that doesn't match is silently skipped, and a whole file that isn't valid JSON won't load at all.

---

## 0. The single most important rule: output format

- Output **pure JSON only**. No prose before or after. **No ` ```json ` code fences.** No comments
  (JSON does not allow `//` or `/* */`). No trailing commas.
- The file is UTF-8. Arabic text is expected and fully supported.
- One file = **one module** = one quiz.

If you are asked for "a module about Unit 4," you return the JSON object below — nothing else.

---

## 1. Language policy (critical for this project)

This quiz is for **Saudi EFL learners**. Therefore:

| Field | Language |
|---|---|
| `prompt` | **English only** — this is the question being tested. |
| `options` | **English only** — these are the answers being tested. |
| `hint` | **Mainly Arabic**, using English only when necessary. |
| `feedback.correct` | **Mainly Arabic**, using English only when necessary. |
| `feedback.incorrect` | **Mainly Arabic**, using English only when necessary. |

"English only when necessary" means: keep the explanation in Arabic, and switch to English **only**
for (a) the target English vocabulary words themselves, and (b) unavoidable grammar labels. For
example, refer to the word being learned as `conclusive` (English) but explain what it means and
why it fits **in Arabic** (`تعني «قاطع/حاسم»`).

> Rule of thumb: a learner who reads only the Arabic parts of your feedback should still fully
> understand why the answer is right and why the others are wrong.

---

## 2. File shape

```json
{
  "schemaVersion": 1,
  "id": "engl114-unit4-collocations",
  "title": "Unit 4 — Collocations",
  "description": "اختيار الكلمة الصحيحة في السياق الأكاديمي.",
  "shuffleQuestions": true,
  "shuffleOptions": true,
  "questions": [
    {
      "id": "q1",
      "prompt": "Choose the word that best completes the sentence: \"The results were ___, leaving no doubt about the conclusion.\"",
      "options": ["conclusive", "tentative", "ambiguous", "arbitrary"],
      "answerIndex": 0,
      "hint": [
        "الكلمة المطلوبة تعني «قاطع / حاسم» — أي لا تترك مجالاً للشك.",
        "لاحظ عبارة «leaving no doubt» (لا تترك شكاً)، فنحتاج كلمة قوية ومؤكدة."
      ],
      "feedback": {
        "correct": "أحسنت ✓ كلمة conclusive تعني «قاطع/حاسم»، وهي تناسب «no doubt» (لا شك).",
        "incorrect": "الإجابة الصحيحة هي conclusive (قاطع/نهائي). أمّا tentative فتعني «مبدئي/غير مؤكد»، و ambiguous تعني «غامض»، و arbitrary تعني «عشوائي» — وكلها لا تدل على نتيجة قاطعة لا شك فيها."
      }
    }
  ]
}
```

---

## 3. Field-by-field reference

### Module-level fields

| Field | Required | Type | Notes |
|---|---|---|---|
| `schemaVersion` | ✅ | integer | Always `1`. |
| `id` | ✅ | string | **Unique** kebab-case identifier (e.g. `engl114-unit4-collocations`). It namespaces the learner's saved progress — **never reuse an id** across different files. |
| `title` | ✅ | string | Short display name shown in the module list. May be English or Arabic. |
| `description` | ⬜ | string | One line under the title. |
| `shuffleQuestions` | ⬜ | boolean | Default `true`. Set `false` only for decks that must stay in lesson order. |
| `shuffleOptions` | ⬜ | boolean | Default `true`. **Set `false`** for any module whose questions use "All of the above", "Both A and B", or otherwise depend on option order. |
| `questions` | ✅ | array | One or more question objects (see below). No upper limit. |

### Question-level fields

| Field | Required | Type | Notes |
|---|---|---|---|
| `id` | ✅ | string | **Stable, unique within the file** (e.g. `q1`, `q2`). The review pile references questions by this id — if you later change or remove an id, that saved entry is dropped. |
| `prompt` | ✅ | string | The question, **in English**. Non-empty. Rendered as plain text (write real quotes; they are safe). |
| `options` | ✅ | array of strings | **At least 2** options (4 is typical; 3–5 supported). **English.** |
| `answerIndex` | ✅ | integer | **0-based** index into `options`. `0` = first option, `1` = second, etc. Must be within range. |
| `hint` | ⬜ | string **or** array of strings | Shown when the learner presses the **Hint** button *before* answering. Mainly Arabic. Use an **array** for multiple short lines (rendered as bullets); use a **string** for a single line. |
| `feedback` | ✅ | object | Contains `correct` and `incorrect` (below). |
| `feedback.correct` | ⬜ | string | Shown when the learner picks the right option. If omitted, the app shows a plain "Correct!". Prefer to provide it (mainly Arabic) so the learner sees *why* it was right. |
| `feedback.incorrect` | ✅ | string | The **universal** explanation shown when the learner picks **any** wrong option. It is not per-option: write one explanation that (1) states the correct word and its Arabic meaning, and (2) briefly says why the other choices don't fit. Mainly Arabic. |

---

## 4. `answerIndex` — the #1 source of mistakes

`answerIndex` is **0-based**. If the correct answer is the **first** option, `answerIndex` is `0`
(not `1`). Double-check every question: `options[answerIndex]` must be the correct word.

```
"options": ["conclusive", "tentative", "ambiguous", "arbitrary"],
"answerIndex": 0        →  correct answer is "conclusive"
```

---

## 5. What the app enforces (so you don't waste questions)

`modules.js` validates each question on load and **silently skips** any that fail these checks:

- `prompt` is a non-empty string.
- `options` is an array of **≥ 2** non-empty strings.
- `answerIndex` is an integer **in range** `0 … options.length - 1`.
- `feedback.incorrect` is a non-empty string.

A question missing `feedback.correct` is **kept** (it falls back to "Correct!"). A module with
**zero** valid questions won't open. So: every question must have a valid `answerIndex` and a
non-empty `feedback.incorrect`.

---

## 6. Writing good bilingual feedback (worked example)

Question tests the word **clarify**.

```json
{
  "id": "q2",
  "prompt": "Which word means to make something clear or easier to understand?",
  "options": ["clarify", "confuse", "conceal", "complicate"],
  "answerIndex": 0,
  "hint": "الكلمة الصحيحة تعني «يوضّح» — ابحث عن الفعل الذي يجعل الأمور واضحة.",
  "feedback": {
    "correct": "أحسنت ✓ كلمة clarify تعني «يوضّح»، أي يجعل الشيء أوضح وأسهل فهماً.",
    "incorrect": "الإجابة الصحيحة هي clarify (يوضّح). أمّا confuse فتعني «يُربك»، و conceal تعني «يُخفي»، و complicate تعني «يُعقّد» — وهي عكس معنى «التوضيح»."
  }
}
```

Notice: the English words `clarify`, `confuse`, `conceal`, `complicate` stay in English (they are
the vocabulary), but every explanation of meaning is in Arabic.

---

## 7. After you produce the file (registration step)

A generated `.json` file is not enough on its own — GitHub Pages cannot list a directory, so the
app finds modules through a registry. The webmaster must:

1. Save your JSON as `modules/<name>.json` (e.g. `modules/unit4.json`).
2. Add one entry to [`modules/manifest.json`](../modules/manifest.json):
   ```json
   {
     "id": "engl114-unit4-collocations",
     "file": "unit4.json",
     "category": "vocabulary",
     "title": "Unit 4 — Collocations",
     "description": "اختيار الكلمة الصحيحة في السياق الأكاديمي.",
     "count": 30
   }
   ```
   The manifest `id` **must match** the `id` inside the module file. `count` is the number of
   questions (used only for display). `category` is **`"vocabulary"` or `"grammar"`** — it decides
   which tab the module appears under on the modules page; if omitted it defaults to `"vocabulary"`.
3. Commit and push. GitHub Pages rebuilds and the module appears in the list.

If you (the LLM) are asked to produce the manifest entry too, output it separately and clearly
labelled — do **not** paste it inside the module file.

---

## 8. Final checklist before returning a module

- [ ] Output is **pure JSON**, no fences, no comments, no trailing commas.
- [ ] `schemaVersion` is `1`; `id` is unique kebab-case; `title` present.
- [ ] Every question has a unique `id`.
- [ ] `prompt` and `options` are **English**; `options` has ≥ 2 entries.
- [ ] `answerIndex` is **0-based** and `options[answerIndex]` is truly the correct answer.
- [ ] `feedback.incorrect` is present on **every** question and is **mainly Arabic**.
- [ ] `hint` and `feedback.correct` (where used) are **mainly Arabic**, English only for the
      target words / grammar labels.
- [ ] If any question depends on option order, set `"shuffleOptions": false` at module level.
