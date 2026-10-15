# Always-on AI Agents Resources

Raw notes behind this list: `sources/lecture-slides.md` (all 44 slides transcribed) and `sources/research-2026-10-16.md` (landscape, concepts, citations).

## Knowledge

### Start here
- [Video: "Stanford CS146S: How always-on agents work" by Lee Robinson (Oct 2026)](https://youtu.be/L1OBRtfPS34)
  The course's spine: system-level tour of an always-on agent (wake/sleep, router, harness, context engineering) built around xAI's Grok Bot. Chapters: 2:35 How we got here · 6:13 Models · 10:06 Inside · 18:07 Harness · 27:26 Context engineering · 34:26 Where this is going. Use for: architecture, the "why" behind each design choice.
- [Article: "Introducing ambient agents" by Harrison Chase (LangChain, Jan 2025)](https://www.langchain.com/blog/introducing-ambient-agents)
  Best short written primer. Defines event-stream agents and the notify / question / review human-in-the-loop moves. Use for: vocabulary and the inbox mental model.
- [Repo: langchain-ai/agents-from-scratch](https://github.com/langchain-ai/agents-from-scratch)
  Runnable ambient email agent with HITL and memory (Python). Use for: seeing a full event-driven agent end to end.

### Engineering
- [Anthropic: "Effective harnesses for long-running agents"](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
  Progress logs, feature lists and git as memory across context windows. Use for: keeping long work coherent.
- [Anthropic: "Managed Agents" engineering post](https://www.anthropic.com/engineering/managed-agents)
  Session (event log) / harness / sandbox split, `wake(sessionId)` crash recovery, credentials kept out of the sandbox, lazy sandboxes. Use for: production architecture.
- [Temporal: AI docs](https://docs.temporal.io/ai) and [cookbook](https://docs.temporal.io/ai/cookbook)
  Durable execution: loop as Workflow, LLM/tool calls as Activities. Use for: crash-safe loops, long waits, approvals. (Has a TypeScript SDK.)
- [LangGraph: interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts)
  Pause, checkpoint, resume-on-approval. Use for: implementing human approval that can wait days.
- [Claude Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview) and [permissions](https://docs.claude.com/en/docs/agent-sdk/permissions)
  TypeScript agent SDK with hooks, `canUseTool`, permission modes. Use for: the agent loop inside our build.
- [Claude Code Routines docs](https://code.claude.com/docs/en/routines)
  Schedule / HTTP / GitHub triggers with real limits (≥1 h, runs/day caps, start jitter). Use for: how a shipping product scopes triggers.
- [OpenClaw repo](https://github.com/openclaw/openclaw), [heartbeat docs](https://docs.openclaw.ai/gateway/heartbeat), [token-use docs](https://docs.openclaw.ai/reference/token-use.md)
  The biggest open-source always-on agent (MIT). Heartbeat + cron + channel gateway; cost tuning against cache TTL. Use for: reading real code; the heartbeat-vs-event-trigger contrast.

### Open-source codebases to study (open alternatives to dots / Grok Bot)
Full survey of 19 projects, with licences, an OpenClaw code map and notes on commercial use: `sources/open-source-alternatives-2026-10-16.md`. Repo facts verified via `gh api` on 2026-10-16.
- [OpenClaw](https://github.com/openclaw/openclaw) (TypeScript, MIT, ~392k stars)
  The reference implementation: Gateway for all channels, persistent scheduler, heartbeat, per-session queues, Markdown memory, approvals. Single-user and self-hosted, with sandboxing off by default. Use for: seeing every subsystem in one place (follow the code map in the survey).
- [NanoClaw](https://github.com/nanocoai/nanoclaw) (TypeScript, MIT, ~31k stars)
  Small enough to read fully. Container per agent, a credential gateway (agents never see raw keys), scheduled tasks that skip waking the agent when there's no work. Built on Anthropic's Agent SDK, which comes under Anthropic's Commercial Terms. Use for: a minimal core you can understand end to end.
- [background-agents / Open-Inspect](https://github.com/ColeMurray/background-agents) (TypeScript, MIT)
  Cloud design closest to dots/Grok Bot: an agent asleep until an event, durable state, a short-lived sandbox per run, on Cloudflare. Use for: multi-tenant cloud architecture.
- [Letta Code](https://github.com/letta-ai/letta-code) (TypeScript, Apache-2.0)
  Memory-first agent with crons and heartbeats. Use for: if memory becomes your product's edge.
- [Hermes Agent](https://github.com/NousResearch/hermes-agent) (Python, MIT)
  Self-improving skills and memory, sleeps when idle on serverless backends. Use for: the skills-learning angle.
- Licence caution: most are MIT/Apache-2.0 (commercial use OK). Khoj is AGPL, which is a blocker for closed SaaS. OpenClaw's WhatsApp channel uses an unofficial client, which is a terms-of-service risk. This isn't legal advice.

### Products (how others ship it)
- [xAI: Grok Bot docs: security](https://docs.x.ai/grok-bot/security) and [skills, routines and automations](https://docs.x.ai/grok-bot/skills-routines-and-automations)
  The lecture's case study. Allow once / Always allow / Deny, Auto Review, Firecracker VMs, routines ≥5 min apart. Use for: product-level safety and trigger design.
- [OpenAI: "Introducing dots" (DevDay, Sep 29 2026)](https://openai.com/index/introducing-dots/) and [TechCrunch coverage](https://techcrunch.com/2026/09/29/openai-launches-dots-its-bubbly-agentic-avatar/)
  OpenAI's always-on agents: cloud computer, 4,000+ app plugins, read-only proactive research, safety monitor. Use for: competitive landscape. (Official page couldn't be fetched; details are from search extracts and press.)
- [Google: Gemini Spark](https://gemini.google/overview/agent/spark/)
  24/7 cloud agent with Tasks / Skills / Schedules; asks before money or email. Use for: landscape.

### Safety
- [Simon Willison: "The lethal trifecta"](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/)
  Private data + untrusted content + external communication = exfiltration risk. Always-on agents usually have all three. Use for: threat model.
- [OWASP Top 10 for Agentic Applications (Dec 2025)](https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/)
  Use for: security checklist (memory poisoning, cascading failures, rogue agents).

### Research
- [Paper: Always-On Agents survey (arXiv 2606.30306, Jun 2026)](https://arxiv.org/abs/2606.30306)
  Treats always-on agents as persistent-state systems. Six axes for governing state. Use for: memory and state governance, evaluation.
- [Paper: Proactive Agent / ProactiveBench (ICLR 2025)](https://arxiv.org/abs/2410.12361)
  Modelling *when* to step in. Use for: the "when to speak" problem.
- [LangChain: "UX for agents, part 2: ambient"](https://blog.langchain.com/ux-for-agents-part-2-ambient/)
  Use for: background-agent UX patterns.

## Wisdom (Communities)

- [OpenClaw Discord](https://discord.gg/clawd) (invite verified from the repo README)
  Largest community of self-hosted always-on agent builders. Use for: heartbeat/cron/channel questions, cost war stories.
- [Latent Space Discord](https://latent.space/community)
  Practitioner-heavy AI engineering community, higher signal. Use for: architecture critique, startup-side conversations.
- [LangChain Forum](https://forum.langchain.com/)
  Use for: ambient-agent, interrupt and HITL implementation questions.
- [r/AI_Agents](https://www.reddit.com/r/AI_Agents/)
  Huge, mixed quality. Use for: market signal (what people want automated), not technical truth.

## Gaps

- No transcript of the lecture. The slides are transcribed, but the spoken detail isn't. YouTube's "Show transcript" panel may work.
- OpenAI dots: trigger model and approval UI aren't confirmed from primary sources.
- No rigorous public cost-per-agent-day numbers. We'll have to measure our own.
- No good method yet to evaluate agents that run for weeks (the lecture's open problem).
