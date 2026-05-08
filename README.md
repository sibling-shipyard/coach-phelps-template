# Coach Phelps

An AI coaching system powered by Claude. Clone this repo, connect your Strava, open a Claude session — Coach Phelps runs your intake and gets started.

Coach Phelps is Michael Phelps as a coaching persona: process-obsessed, emotionally honest, no platitudes. He tracks your training via Strava, manages a quest/streak system, and builds a living memory of your progress across sessions.

---

## Setup

### 1. Use this template

Click **"Use this template"** on GitHub to create your own repo, then clone it locally.

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### 2. Install dependencies

```bash
pip3 install requests
```

### 3. Connect Strava

**Create a Strava API app:**
1. Go to [strava.com/settings/api](https://www.strava.com/settings/api)
2. Create an app — set the callback URL to `http://localhost`
3. Note your **Client ID** and **Client Secret**

**Set up credentials:**
```bash
cp .env.example .env
# Open .env and fill in STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET
```

**Authorize:**
```bash
python strava/oauth_reauth.py
```
A browser window opens. Authorize the app. Tokens are saved automatically to `strava/strava_tokens.json` (git-ignored — stays local).

**Test the connection:**
```bash
python strava/fetch_strava.py --last 3
```
You should see your last 3 Strava activities.

### 4. Customize HR zones

Open `strava/fetch_strava.py` and `strava/query_history.py`. Find the `HR_ZONES` block marked `# CUSTOMIZE` and update the BPM values to match your personal zones.

Simple estimate: Zone 2 upper ≈ 70% of max HR (max HR ≈ 220 − age).

### 5. Sync your training history

Pull the last 3 months so Coach Phelps can assess your current fitness before the first conversation:

```bash
python strava/fetch_strava.py --sync --since YYYY-MM-DD
```

Replace `YYYY-MM-DD` with a date ~3 months back. Activities are saved to `training/history/` (git-ignored — stays local).

> **No Strava yet?** Skip this step. The coach will rely on self-report during intake instead.

### 6. Start your first session

**Claude Code (recommended):**
```bash
claude
```

**Claude.ai:**
Upload `SOUL.md` and `training/state.md` as attachments to a new conversation.

Coach Phelps detects the blank `training/state.md` and runs your intake automatically — no prompting needed.

During the first session, the coach will:
- Review your Strava history silently before saying hello (if synced)
- Ask 7–8 intake questions conversationally
- Confirm your profile and goals
- Write your `training/state.md` and `training/challenge_v2.json`
- Commit both files

### 7. Generate your quest log

After the first session:
```bash
python scripts/generate_quest_log.py
```

This produces `training/quest_log.md` — your live progress dashboard. The coach reads it at every boot.

### 8. Set up your dashboard

Your repo includes a web dashboard in `ui/` that deploys via Netlify. Takes about 10 minutes.

**Step 1 — Create a GitHub Personal Access Token**

The sync workflow needs permission to push back to your repo.

1. Go to **GitHub → Settings → Developer Settings → Personal access tokens → Fine-grained tokens**
2. Click **Generate new token**
3. Set **Repository access** to your fork only
4. Under **Repository permissions**, enable **Contents** → Read and write, and **Workflows** → Read and write
5. Click **Generate token** and copy it — you won't see it again

**Step 2 — Add the token to your repo**

1. Go to your fork → **Settings → Secrets and variables → Actions**
2. Click **New repository secret** — name: `PAT_TOKEN`, value: the token you just copied

**Step 3 — Connect to Netlify**

1. Go to [netlify.com](https://netlify.com), log in, click **Add new site → Import an existing project**
2. Choose **GitHub** and select your fork
3. Netlify auto-detects settings from `ui/netlify.toml` — confirm:
   - **Base directory:** `ui`
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `dist`
4. Click **Deploy site**

**Step 4 — Add environment variables in Netlify**

Go to **Site configuration → Environment variables** and add:

| Key | Value |
|---|---|
| `GITHUB_REPO` | `your-github-username/your-repo-name` |
| `GITHUB_WORKFLOW` | `sync.yml` |

Then **Deploys → Trigger deploy → Deploy site** to pick them up.

**Step 5 — Confirm**

Open your Netlify URL. The dashboard loads (panels will be empty until you sync Strava data — that's expected). To pull in your history, hit **Sync** in the dashboard or run the workflow manually from GitHub Actions.

---

## How it works

Every session, the coach:
1. Reads `SOUL.md` (identity, rules, workflows)
2. Reads `training/quest_log.md` (pre-computed streaks and progress)
3. Reads `training/state.md` (your profile, injuries, week plan)
4. Opens with context — not a status report

At the end of every session, the coach commits updates to `training/state.md`, `training/challenge_v2.json`, and `training/coach_notes.md`.

---

## What lives in your repo

| File | Written by | Purpose |
|------|-----------|---------|
| `SOUL.md` | You (template) | Coach identity, rules, workflows |
| `training/state.md` | Coach | Your profile, injuries, week plan |
| `training/challenge_v2.json` | Coach | Quest and streak data |
| `training/coach_notes.md` | Coach | Session insights (append-only) |
| `training/quest_log.md` | Script (auto) | Live progress dashboard |
| `training/history/*.json` | Sync script | Strava activity data (git-ignored) |
| `strava/strava_tokens.json` | OAuth script | API tokens (git-ignored) |

---

## Scripts

| Script | Purpose |
|--------|---------|
| `strava/oauth_reauth.py` | First-time auth and token refresh |
| `strava/fetch_strava.py` | Fetch and sync activities from Strava |
| `strava/query_history.py` | Search and filter local activity history |
| `scripts/generate_quest_log.py` | Regenerate `training/quest_log.md` |
