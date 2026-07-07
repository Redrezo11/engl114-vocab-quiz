# Grammar Module Authoring Guide

**Audience:** an LLM (or human) generating a **grammar** quiz module for the ENGL114 modules page
([modules.html](../modules.html), **Grammar** tab).

Grammar modules use the **exact same JSON schema and engine as vocabulary modules** — read
[module-authoring-guide.md](module-authoring-guide.md) first; everything there applies. This file
documents the **two differences** for grammar:

1. The manifest entry sets **`"category": "grammar"`** (so the module appears under the Grammar tab).
2. Each question adds one field — **`topicSlug`** — linking it to the matching topic in the
   [grammar reference](../grammar-reference.html). When the learner presses **Hint**, the app shows
   the hint text (if any) **plus a link** "📖 Study this grammar topic →" that opens
   `grammar-reference.html#<topicSlug>` in a new tab, jumping straight to that topic's explanation.

Everything else is identical: `prompt` and `options` are **English**; `answerIndex` is **0-based**;
`hint` and `feedback.correct`/`feedback.incorrect` are **mainly Arabic** (English only for the target
words / grammar labels). Options can be words, forms, or **whole sentences** ("choose the correct
sentence").

---

## The `topicSlug` field

- Type: string. **Optional** but strongly recommended for grammar — it powers the Hint→topic link.
- Its value **must be one of the reference slugs below** (from
  [`grammar-reference.json`](../grammar-reference.json)). An unknown slug still links, but the
  reference page won't auto-open a topic — so use an exact match.
- The Hint button appears if a question has a `hint`, a `topicSlug`, or both. With only a
  `topicSlug` (no hint text), pressing Hint just shows the study link.

### Valid `topicSlug` values (the 13 midterm topics)

| slug | topic |
|---|---|
| `aux-do-present-past` | Auxiliary 'do' (do/does/did) for simple present & past |
| `aux-be-present-continuous` | 'be' with the present continuous (am/is/are + -ing) |
| `compound-sentences` | Compound sentences (comma + and/but/or/so) |
| `present-real-conditional` | Present real conditional (If + present, present) |
| `future-real-conditional` | Future real conditional (If + present, will + base) |
| `aux-be-past-continuous` | 'be' with the past continuous (was/were + -ing) |
| `tag-questions` | Tag questions (…, aren't you?) |
| `conjunctions-parallel` | Conjunctions and/but/or |
| `aux-have-present-perfect` | 'have' with the present perfect (has/have + past participle) |
| `parallel-structure` | Parallel structure (same form in a list) |
| `modals-attitude` | Modals of obligation/prohibition/advice (must, should, …) |
| `quantifiers-count-noncount` | Quantifiers with count/noncount nouns (many/much/…) |
| `adjectives-use-placement` | Use and placement of adjectives |

---

## Example grammar question

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

Pressing **Hint** on this question shows the Arabic hint and a link that opens
`grammar-reference.html#aux-have-present-perfect`.

## Manifest entry (note the category)

```json
{
  "id": "engl114-grammar-unit1",
  "file": "grammar-unit1.json",
  "category": "grammar",
  "title": "Grammar — Unit 1",
  "description": "…",
  "count": 20
}
```

See [`modules/grammar-starter.json`](../modules/grammar-starter.json) for a complete working module
(one question per topic, each with its `topicSlug`).

---

## Checklist (in addition to the base guide's checklist)

- [ ] Manifest entry has `"category": "grammar"`.
- [ ] Every grammar question has a `topicSlug` from the list above (exact match).
- [ ] `prompt`/`options` English; `hint` + `feedback` mainly Arabic; `answerIndex` 0-based.
- [ ] Options with whole sentences don't rely on order → keep `shuffleOptions` default `true` unless
      an item says "all/none of the above".
