# Grammar Module Authoring & Import Guide

**Audience:** an LLM (or human) that produces **grammar** multiple-choice modules for the ENGL114
site and imports them so they appear under the **Grammar** tab on
[modules.html](../modules.html).

Grammar modules use the **same JSON schema and quiz engine as vocabulary modules** — the shared,
exhaustive field rules live in [module-authoring-guide.md](module-authoring-guide.md) and all apply
here. This document adds the **three grammar-specific things**:

1. Each question has a **`topicSlug`** linking it to a topic in the grammar reference.
2. Grammar module files live in their **own directory, `modules/grammar/`** (kept separate from
   vocabulary files so the two never get mixed up).
3. The manifest entry sets **`"category": "grammar"`** and points `file` at the grammar subfolder.

---

## 0. Output format (most important)

- Output **pure JSON only** — no markdown ` ```json ` fences, no comments, no trailing commas.
- UTF-8. Arabic text is expected and fully supported.
- **One file = one module = one quiz.**

---

## 1. Language policy (Saudi EFL learners)

| Field | Language |
|---|---|
| `prompt`, `options` | **English only** — this is what's being tested. Options may be words, verb forms, or **whole sentences** ("choose the correct sentence"). |
| `hint`, `feedback.correct`, `feedback.incorrect` | **Mainly Arabic**, English only for the target words / grammar labels. |

A learner who reads only the Arabic parts should still understand why the answer is right and the
others are wrong.

---

## 2. Question schema (grammar)

```json
{
  "id": "g9",
  "prompt": "Choose the correct form: \"She ___ her homework already.\"",
  "options": ["has finished", "have finished", "finished", "is finishing"],
  "answerIndex": 0,
  "topicSlug": "aux-have-present-perfect",
  "hint": "للفعل الماضي المرتبط بالحاضر (already) نستخدم المضارع التام: has/have + التصريف الثالث.",
  "feedback": {
    "correct": "أحسنت ✓ مع she نستخدم has + finished (المضارع التام).",
    "incorrect": "الإجابة الصحيحة has finished. كلمة already تدل على المضارع التام، ومع she نستخدم has (لا have)."
  }
}
```

| Field | Required | Notes |
|---|---|---|
| `id` | ✅ | unique within the file (e.g. `g1`, `g2`); the review pile references it. |
| `prompt` | ✅ | English question. Non-empty. |
| `options` | ✅ | array of **≥ 2** English strings (4 typical). |
| `answerIndex` | ✅ | **0-based** index of the correct option. |
| `topicSlug` | ✅ (grammar) | one of the slugs in §3. Powers the Hint→topic link. |
| `hint` | ⬜ | string or array of strings; mainly Arabic. |
| `feedback.correct` | ⬜ | shown on a correct pick (falls back to "Correct!"). |
| `feedback.incorrect` | ✅ | the universal explanation on any wrong pick; mainly Arabic. |

**What `topicSlug` does:** when the learner presses **Hint**, the app shows the hint text **plus a
link** "📖 Study this grammar topic →" that opens `grammar-reference.html#<topicSlug>` in a new tab,
jumping straight to that topic's explanation. The Hint button appears if a question has a `hint`, a
`topicSlug`, or both.

Module-level fields (`schemaVersion`, `id`, `title`, `description`, `shuffleQuestions`,
`shuffleOptions`) are identical to the base guide.

---

## 3. Valid `topicSlug` values (the 13 midterm topics)

Use an **exact** match from this list (source: [`grammar-reference.json`](../grammar-reference.json)).
An unknown slug still links, but the reference page won't auto-open a topic.

| slug | topic |
|---|---|
| `aux-do-present-past` | Auxiliary 'do' (do/does/did), simple present & past |
| `aux-be-present-continuous` | 'be' + present continuous (am/is/are + -ing) |
| `compound-sentences` | Compound sentences (comma + and/but/or/so) |
| `present-real-conditional` | Present real conditional (If + present, present) |
| `future-real-conditional` | Future real conditional (If + present, will + base) |
| `aux-be-past-continuous` | 'be' + past continuous (was/were + -ing) |
| `tag-questions` | Tag questions (…, aren't you?) |
| `conjunctions-parallel` | Conjunctions and/but/or |
| `aux-have-present-perfect` | 'have' + present perfect (has/have + past participle) |
| `parallel-structure` | Parallel structure (same form in a list) |
| `modals-attitude` | Modals: obligation / prohibition / advice |
| `quantifiers-count-noncount` | Quantifiers with count/noncount nouns |
| `adjectives-use-placement` | Use and placement of adjectives |

> If a question tests a point **not** in this list, a new topic must first be added to
> `grammar-reference.json` (it auto-appears on the reference page); then questions can use its slug.

---

## 4. Full module skeleton

```json
{
  "schemaVersion": 1,
  "id": "engl114-grammar-unit1",
  "title": "Grammar — Unit 1",
  "description": "وصف مختصر للموديول بالعربية.",
  "shuffleQuestions": true,
  "shuffleOptions": true,
  "questions": [
    { "id": "g1", "prompt": "…", "options": ["…","…","…","…"], "answerIndex": 0,
      "topicSlug": "tag-questions",
      "hint": "…", "feedback": { "correct": "…", "incorrect": "…" } }
  ]
}
```

See [`modules/grammar/grammar-starter.json`](../modules/grammar/grammar-starter.json) for a complete
working module (one question per topic).

---

## 5. How to import the file (webmaster / build step)

GitHub Pages can't list a directory, so a file only appears once it's **registered in the manifest**.

1. **Save the JSON** into the **grammar directory**: `modules/grammar/<name>.json`
   (e.g. `modules/grammar/grammar-unit1.json`). Keep grammar files here — vocabulary files live in
   `modules/` and must not be mixed in.
2. **Register it** in [`modules/manifest.json`](../modules/manifest.json) by adding one entry to the
   `modules` array. For grammar, `category` is `"grammar"` and `file` includes the `grammar/`
   subfolder:
   ```json
   {
     "id": "engl114-grammar-unit1",
     "file": "grammar/grammar-unit1.json",
     "category": "grammar",
     "title": "Grammar — Unit 1",
     "description": "…",
     "count": 20
   }
   ```
   - The manifest `id` **must match** the `id` inside the module file, and be **unique** across all
     modules (it namespaces saved progress).
   - `file` is **relative to `modules/`**, so grammar files read `grammar/<name>.json`.
   - `count` is the number of questions (display only).
3. **Commit and push.** The Actions deploy publishes it, and the module appears under the **Grammar**
   tab.

> If you (the LLM) are asked to produce the manifest entry too, output it **separately** and clearly
> labelled — never paste it inside the module file.

---

## 6. Checklist before returning a grammar module

- [ ] Pure JSON — no fences, no comments, no trailing commas.
- [ ] Every question has a unique `id`, English `prompt`/`options` (≥ 2), **0-based** `answerIndex`.
- [ ] Every question has a **`topicSlug`** that exactly matches a slug in §3.
- [ ] `feedback.incorrect` present on every question; `hint`/`feedback` are **mainly Arabic**.
- [ ] File saved as `modules/grammar/<name>.json`; manifest entry has `"category": "grammar"` and
      `"file": "grammar/<name>.json"`.
