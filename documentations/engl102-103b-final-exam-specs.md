# ENGL 102 / 103B — Final Exam Specs and Build Notes

Source: *Final Exam Specs* PDF ("الاختبار النهائي المحوسب 40% — ENG 101 (Humanities)", S2 2024–2025, 7 pages).
The PDF header says ENG 101, but the site uses it for **ENGL 102/103B**, as the course coordinator instructed.
This file covers the separate **ENGL 102/103B Final Practice** course (`courses/engl102-final/`). The midterm course
(`courses/engl102/`) and its notes in [engl102-103b-grammar-points.md](engl102-103b-grammar-points.md) are separate and unchanged.

## 1. Exam format

- Computer Based Test (CBT), **50 MCQs** with four options each, **75 minutes**. Worth 40% of the course grade.
- Sources: **Q Skills 1 R/W units 1–6** and **Q Skills 1 L/S units 1–6**, plus the grammar and vocabulary lists in the specs.

| Part | Questions |
|---|---|
| Grammar & Vocabulary | 20 (10 + 10) |
| Reading (1 passage) | 10 |
| Listening (1 dialogue + 1 monologue, played twice) | 20 (10 + 10) |

The site covers **Grammar and Vocabulary only**. Reading and Listening are not built.

## 2. Grammar points → reference topics

The 14 listed points are grouped into 11 topics in
[`courses/engl102-final/grammar/reference.json`](../courses/engl102-final/grammar/reference.json):

| # | Grammar point (as written in the spec) | Topic slug |
|---|---|---|
| 1 | Simple present statements with regular verbs (affirmative & negative) | `simple-present-verbs` |
| 2 | Simple present statements with *have* (affirmative & negative) | `simple-present-have` |
| 3 | Verbs + infinitives (*like, want, need*) | `verbs-with-infinitives` |
| 4 | Noun phrases and infinitives | `verbs-with-infinitives` |
| 5 | Simple past in negative statements | `simple-past-negative` |
| 6 | *Should* and *shouldn't* | `should-shouldnt` |
| 7 | *It's* + adjective + infinitive | `its-adjective-infinitive` |
| 8 | Simple past with regular and irregular verbs | `simple-past` |
| 9 | Sentences with *because* | `because-when` |
| 10 | Sentences with *when* | `because-when` |
| 11 | Sentences with *but* and *so* | `but-so` |
| 12 | Parts of speech: noun, verb, adjective, adverb | `parts-of-speech` |
| 13 | *Be going to* | `be-going-to` |
| 14 | Simple present for informal narratives | `simple-present-verbs` |

## 3. Sample questions in the spec (page 4 grammar, page 7 vocabulary)

**Grammar.** The answer key is not printed; these are the intended answers.
1. She usually ___ coffee before breakfast. → **drinks**
2. Where does he ___? → **live**
3. A: ___ students? B: Yes, they are. → **Are they**
4. A: When ___ the homework? B: Today. → **are you going to submit**
5. It ___ in class on time. → **is important to be**
6. You ___ too much junk food. → **shouldn't eat**
7. He ___ travel to Dubai in the vacation. → **is going to**
8. Please ___! I'm trying to sleep. → **don't shout**
9. My friend ___ me lunch today. → **bought**
10. I ___ he was rude. → **didn't know**

**Vocabulary.** The samples mix two question types:
- **gap-fill:** "I don't think I'm ___ enough to climb that mountain." → *fit*
- **definition:** "Someone who is in charge of a business or department" → *a manager*

## 4. Practice modules (build specification)

All four modules follow the midterm schema and the rules in
[module-authoring-guide.md](module-authoring-guide.md), [grammar-module-authoring-guide.md](grammar-module-authoring-guide.md)
and [hint-writing-guidelines.md](hint-writing-guidelines.md). Every module has 100 questions with 4 options each, and the
correct `answerIndex` is spread 25 / 25 / 25 / 25 across positions 0–3.

### Vocabulary Bank 1 and 2

- About 75 gap-fill prompts and about 25 definition prompts per bank.
- Distractors are other words from the final list with the **same part of speech**.
- Feedback uses the midterm templates.

**Bank 1** (`engl102-final-vocab-bank-1`) has 1 question for each of these 100 words:
advertising, afraid, assistant, athlete, attention, attitude, average, avoid, bargain, basic, calm, career, certain, coach,
communicate, compete, complex, confused, connect, consumer, control, creative, crowd, data, debate, degree, describe, destroy,
die, difficulty, embarrassed, emotion, employee, escape, exciting, local, match, mistake, move, natural, nervous, on purpose,
optimistic, organized, plan, pollution, practice, prepare, pretend, pretty, prevent, product, professional, promote, provide,
rate, reach, reduce, repeat, require, requirement, research, responsibility, rest, routine, serious, several, shake, similar,
simple, social, expert, facial expression, focus, forget, form, however, human, improve, increase, insect, interrupt,
is/are likely to, lead, level, lie, solve, some kind of, store, success, survey, talented, technology, tough, training,
treatment, upset, variety, volunteer, wrong

**Bank 2** (`engl102-final-vocab-bank-2`) has 1 question for each of the other 64 words:
a little bit, ability, according to, active, activity, among, ancient, application, area, behavior, benefit, choice,
combination, company, customer, dangerous, decision, discover, effect, effort, enjoyable, event, except for, major, manager,
observe, opinion, patient, physical, population, positive, probably, produce, protect, purpose, reaction, recommend,
relationship, repair, respect, result, résumé, score, section, skill, expect, flexible, goal, graduate, history, imagine,
in order to, interview, investigate a crime, solution, task, team, tourist, traditional, trend, trust, understand, weight, whole

Bank 2 also has **36 review questions** on Bank 1 words, each with a new sentence. These start with the 15 words that have
more than one meaning or are phrases: average, research, rate, lead, lie, form, store, rest, match, plan, practice, focus,
level, on purpose, is/are likely to. The other 21 are chosen from the rest of the Bank 1 list.

The split was made with a fixed-seed shuffle. The 15 review words were then moved into Bank 1.

### Grammar Practice 1 and 2

Each topic gets the same number of questions in both banks (100 per bank):

| topic | q | topic | q |
|---|---|---|---|
| simple-present-verbs | 10 | its-adjective-infinitive | 9 |
| simple-present-have | 9 | because-when | 9 |
| verbs-with-infinitives | 9 | but-so | 9 |
| simple-past | 10 | parts-of-speech | 9 |
| simple-past-negative | 9 | be-going-to | 8 |
| should-shouldnt | 9 | | |

The prompt mix in each bank is about 70 gap-fills, about 20 "Choose the correct sentence." items, about 5 A:/B: dialogues
and about 5 other items (for example "Which word is an adverb?"). Bank 2 uses all new sentences.

### Review

After authoring, an independent reviewer checks all four banks for the defects found in the midterm review (commit 3480b35):
- an ungrammatical answer key
- a second answer that could also be defended
- an unnatural sentence
- a wrong Arabic gloss
- a hint that gives away the answer
- a wrong rule in the Arabic feedback

Question ids never change after publishing.
