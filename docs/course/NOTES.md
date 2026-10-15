# Notes

- 2026-10-16: User wants "all of" the product shapes (social bot, personal assistant, business/ops). Course plan: teach the shared engine first, then a lesson that forces a choice of one wedge. A startup that builds all three at once is a risk worth raising.
- Experienced: has built agents before. Teach architecture and production concerns, not tool-calling basics.
- Language: TypeScript. Package manager: pnpm only (repo rule).
- Goal: startup / paid product, so tie lessons to cost, distribution and defensibility, not only to the tech.
- Lecture slide transcription: sources/lecture-slides.md. Research notes: sources/research-2026-10-16.md.
- "grok bot" = xAI's Grok Bot (launched 2026-08-11, the lecture's case study), not X's @grok reply bot (reactive, the opposite of always-on). "OpenAI dots" = OpenAI's dots (DevDay 2026-09-29).
- 2026-10-16: User moves straight on ("ok next lesson") without sharing quiz or recall answers. Keep spaced warm-up quizzes at the top of each lesson. Don't record anything as learned until there's evidence (exercise code, answers).
- Hands-on exercises live in `build/NN-name/` (Node 24 runs .ts with `node --test`, no deps). Solutions are in `build/solutions/`.
- Lesson ideas queued: heartbeat (OpenClaw) vs event triggers vs cron; durable turns (crash mid-turn); SendToUser and when to speak; cache-stable prompt layout and idle cost; memory tiers; safety (lethal trifecta, auto review); pick-a-wedge lesson; build-along milestones in TS.
