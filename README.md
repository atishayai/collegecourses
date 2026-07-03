# Cornell Course Optimizer — hosted version

Static app + one serverless function (`api/chat.js`) that proxies the AI advisor
to the Anthropic API. Your API key lives only in the server environment — never
in the browser.

## Deploy in ~5 minutes (Vercel)

1. **Get an Anthropic API key** — console.anthropic.com → API Keys → Create Key.
   Set a monthly spend limit while you're there (Settings → Limits) — $5 goes far
   on Haiku.

2. **Deploy this folder**
   - Easiest: push the `webapp/` folder to a GitHub repo, then vercel.com →
     Add New → Project → import the repo. Framework preset: **Other**. Deploy.
   - Or CLI: `cd webapp && npx vercel` and follow the prompts.

3. **Add the key** — Vercel dashboard → your project → Settings →
   Environment Variables:
   - `ANTHROPIC_API_KEY` = your key
   - `CHAT_MODEL` = `claude-haiku-4-5` (default; use `claude-sonnet-4-5` for
     smarter, pricier answers)
   Redeploy after saving.

4. **Open your URL** (`something.vercel.app`). The 🎓 Ask the AI advisor button
   now works, and you can drag PDFs straight onto the import box.

## Notes

- Everything except the chat works fully offline / as a local file too.
- User data (plan, credits, settings) lives in each visitor's browser
  (localStorage) — no database, no accounts, nothing stored server-side.
- Roster data is baked in (FA26, fetched July 2026). To refresh it, re-run the
  data pipeline and rebuild: `python3 build_app.py && python3 build_web.py`.
- Rate-limiting is NOT included. If you share the link widely, add Vercel's
  free WAF rules or a simple per-IP limiter in `api/chat.js` before it trends
  on Sidechat.
