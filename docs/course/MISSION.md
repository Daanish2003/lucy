# Mission: Always-on AI agents

## Why
Build and sell a startup product built on always-on agents: agents that run in the background, react to events or schedules, and act without being prompted (like xAI's Grok Bot or OpenAI's dots). The user wants to cover all three product shapes (social reply bot, personal assistant, business/ops agent), so the course teaches the shared engine first and narrows to one product wedge later.

## Success looks like
- Explain the core architecture of an always-on agent (triggers, event loop, state and memory, actions, human-in-the-loop) and how @grok-style bots and proactive assistants differ.
- Build a working always-on agent in TypeScript that wakes on events and schedules, keeps state across runs, and survives restarts.
- Reason about the hard production problems: cost per wake-up, safety and permissions, spam and loops, reliability, and observability.
- Choose one product wedge with a clear user and a paid use case, and ship an MVP of it.

## Constraints
- Has built agents before (tool-calling loops / agent SDKs); skip the basics of LLM APIs.
- TypeScript for hands-on work; `pnpm` only.
- Starting material: the lecture https://youtu.be/L1OBRtfPS34 and its slide screenshots.

## Out of scope
- Training or fine-tuning models.
- Basic prompt engineering and single-turn chatbots.
