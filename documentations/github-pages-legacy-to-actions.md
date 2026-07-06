# Runbook: Migrating GitHub Pages from the legacy builder to a GitHub Actions deploy

**What this is:** a field report from making this repo's GitHub Pages deploys reliable. It records
the exact symptoms we hit, the two root causes, the fix that worked, and copy-paste commands so
other projects can skip the trial-and-error.

**TL;DR:** The classic Pages "Deploy from a branch" setup uses a **legacy** build pipeline that
serializes builds and can silently get stuck. Switching to a **GitHub Actions** deploy fixed the
stuck-build problem — but you must set `concurrency.cancel-in-progress: false`, or rapid pushes
cancel each other's in-flight deployments and you get *"Deployment failed, try again later."*

---

## Symptoms we saw

1. **Live site never updated** after a successful `git push`. Files were on `main`, but the
   deployed site kept serving old content and a newly added asset returned **404**.
2. **A build frozen in `building`** (duration 0) on an *older* commit, while the newest commit was
   **never enqueued** behind it — the legacy builder processes one build at a time, so a hung job
   blocks everything after it.
3. Occasional outright **`errored` / "Page build failed"** on the legacy builder, then the next
   build of the *same commit* would succeed. Classic flaky-infra signature.
4. After migrating to Actions: **`Deployment failed, try again later.`** on `actions/deploy-pages`,
   even though the artifact uploaded and the deployment was *created*. The Pages deployment status
   API showed `state: failure` with an **empty description** (no useful reason surfaced).

These were **not** content problems. The repo was ~300 KB, JSON validated, and the identical files
worked when served locally (`python -m http.server`). Two tells that the problem is deploy-side,
not code-side:
- The same files render fine from a local static server.
- `githubstatus.com` Pages component was `operational` with no incidents, yet deploys still failed.

---

## Root cause 1 — the legacy build pipeline

Enabling Pages via the REST API with a branch source creates a **legacy** (Jekyll-era) builder:

```bash
# This is what produced build_type: "legacy"
gh api -X POST repos/OWNER/REPO/pages -f "source[branch]=main" -f "source[path]=/"
```

The legacy builder:
- Runs **one build at a time** and can hang in `building` indefinitely.
- Gives **no logs** — you can't see why a build failed.
- Coalesces rapid pushes, so a single stuck job strands every commit behind it.

`.nojekyll` disables Jekyll *processing*, but you're still on the flaky legacy *pipeline*.

## Root cause 2 — `cancel-in-progress: true` (self-inflicted)

After moving to Actions, we set:

```yaml
concurrency:
  group: pages
  cancel-in-progress: true   # ← WRONG for Pages
```

We then triggered several runs within a couple of minutes (a push, a manual `workflow_dispatch`,
and an empty commit while debugging). With `cancel-in-progress: true`, each new run **cancelled the
previous run's in-flight Pages deployment**, leaving failed deployments and the generic
*"Deployment failed, try again later."* GitHub's own Pages starter workflow uses **`false`** for
exactly this reason: let an in-progress deploy finish; don't kill it.

---

## The fix that worked

### 1. Add an Actions deploy workflow — `.github/workflows/deploy.yml`

```yaml
name: Deploy static site to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:            # lets you re-deploy manually without a new commit

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false     # ← let in-flight deploys finish

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '.'             # site lives at repo root; use e.g. './dist' otherwise
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 2. Point the repo's Pages source at Actions (one-time)

```bash
gh api -X PUT repos/OWNER/REPO/pages -f build_type=workflow
# verify:
gh api repos/OWNER/REPO/pages --jq '.build_type'   # -> "workflow"
```

### 3. Deploy once and let it finish — do not pile on triggers

```bash
git add -A && git commit -m "Deploy via GitHub Actions" && git push
# grab the run and watch it to completion:
RID=$(gh run list --workflow=deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch "$RID" --exit-status
```

After switching to `cancel-in-progress: false`, the next single run deployed cleanly on the first
try — the same content that had "failed" repeatedly under the racing-runs setup.

---

## Debugging commands that actually helped

```bash
# Is my commit even on the remote?
git ls-remote origin -h refs/heads/main

# What is Pages building, and did it error? (works for legacy build_type)
gh api repos/OWNER/REPO/pages/builds/latest --jq '{status, commit: .commit[0:7], error: .error.message}'
gh api repos/OWNER/REPO/pages/builds        --jq '.[0:4][] | {status, commit: .commit[0:7], error: .error.message}'

# Force a fresh legacy build to clear a stuck one
gh api -X POST repos/OWNER/REPO/pages/builds

# Actions runs + real logs (the whole reason to migrate)
gh run list --workflow=deploy.yml --limit 5
gh run view <run-id> --log-failed

# The real deployment status/description behind deploy-pages
DID=$(gh api "repos/OWNER/REPO/deployments?environment=github-pages&per_page=1" --jq '.[0].id')
gh api "repos/OWNER/REPO/deployments/$DID/statuses?per_page=3" --jq '.[] | {state, description, created_at}'

# Rule out size / content quickly
du -sh --exclude=.git .
curl -s https://www.githubstatus.com/api/v2/summary.json \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);j.components.filter(c=>/pages/i.test(c.name)).forEach(c=>console.log(c.name,c.status))})"

# Verify the live site with a cache-buster (avoid your own browser cache lying to you)
curl -s -o /dev/null -w '%{http_code}\n' "https://OWNER.github.io/REPO/some-asset?cb=$RANDOM"
```

---

## Lessons for other projects

1. **Prefer the Actions deploy from day one.** `build_type: workflow` gives logs, handles rapid
   pushes, and doesn't silently strand commits behind a stuck job.
2. **Use `cancel-in-progress: false` for the Pages concurrency group.** Cancelling an in-flight
   Pages deployment is what produces *"Deployment failed, try again later."* Don't cancel deploys.
3. **Don't spam triggers while debugging.** Push/​dispatch once, then *watch that one run*. Racing
   runs cause the very failures you're trying to fix.
4. **Localize the fault fast.** If the files work from a local static server, the bug is in
   deployment, not code — stop editing code and look at the pipeline.
5. **A green `git push` is not a deploy.** Always confirm on the live URL with a cache-buster;
   check the Actions run, not just that the push succeeded.
6. **Browser/CDN cache hides successful deploys.** GitHub Pages serves assets with
   `cache-control: max-age=600` (10 min). After a deploy, hard-refresh (Ctrl/Cmd+F5) before
   concluding "it didn't work." For frequently-updated JS/CSS, consider cache-busting query strings
   (`app.js?v=2`) so returning users don't run stale code.
7. **Re-running the *same commit* can collide** with a prior failed deployment keyed to that SHA;
   an empty commit (`git commit --allow-empty`) gives a fresh deployment id when needed.

---

## Quick migration checklist

- [ ] Add `.github/workflows/deploy.yml` (template above) with `cancel-in-progress: false`.
- [ ] `gh api -X PUT repos/OWNER/REPO/pages -f build_type=workflow`.
- [ ] Set `upload-pages-artifact` `path` to your publish dir (`.` for repo root).
- [ ] Commit, push **once**, and `gh run watch` the single run.
- [ ] Verify the live URL with a `?cb=$RANDOM` cache-buster.
- [ ] If it fails: read `gh run view <id> --log-failed` and the deployment `statuses` — don't guess.
