// Vercel serverless function — proxies chat to the Anthropic API.
// The API key lives ONLY here (env var), never in the browser.
const SYSTEM = `You are the AI advisor inside Cornell Course Optimizer, a degree-planning app.
You receive the student's live app state as STUDENT CONTEXT: their interests, schedule rules,
banked credits, tracked majors/minors with requirement slots, current semester plan, and a list
of candidate Fall 2026 courses (each with: code, title, credits, how many of their interests it
counts toward, student rating /5, difficulty /5, meeting days/times).

Your job: recommend optimal courses and pathways for whatever the student asks — maximize
requirements filled per course, respect their schedule rules, prefer well-rated courses.

Rules:
- Be concise and concrete. Talk like a sharp, friendly peer advisor, not a brochure.
- Only recommend courses that appear in the candidate list or catalog excerpts given to you.
- Always explain WHY each pick is efficient (what it double-counts, rating, fit).
- Remind them to verify distribution tags on the official roster and confirm with their advisor
  for anything high-stakes. You are a planning aid, not the registrar.
- When you recommend specific courses, end your reply with a single line in exactly this format
  so the app can render add-buttons:
COURSES: CODE1 | CODE2 | CODE3
  (use the exact course codes from the context, max 6, omit the line if recommending nothing)`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set in Vercel env' });

  try {
    const { messages = [], context = {} } = req.body || {};
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.CHAT_MODEL || 'claude-haiku-4-5',
        max_tokens: 1000,
        system: SYSTEM + '\n\nSTUDENT CONTEXT:\n' + JSON.stringify(context).slice(0, 40000),
        messages: messages.slice(-12).map(m => ({ role: m.role, content: String(m.content).slice(0, 4000) })),
      }),
    });
    const j = await r.json();
    if (j.error) return res.status(502).json({ error: j.error.message });
    res.status(200).json({ text: j.content?.[0]?.text || '(no response)' });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}

