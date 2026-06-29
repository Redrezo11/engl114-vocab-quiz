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

## Storage keys (important if you host more than one of these quizzes)
`localStorage` is shared across all pages on the same domain. This app uses keys prefixed
`engl114_`, while the medical quiz uses `mvq_`, so the two keep **separate** review piles
even when hosted under the same GitHub account. If you clone this for another deck, change
the `K_MISS` / `K_STAT` prefixes in `app.js` to keep its progress separate too.

## Notes
- Progress is per-browser and per-device (no cross-device sync); clearing browser data resets it.
- Fonts load from Google Fonts with system fallbacks. No tracking; nothing leaves the browser.
