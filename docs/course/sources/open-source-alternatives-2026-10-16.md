# Open-source alternatives to "dots" and "Grok Bot" (always-on agents)

Researched 2026-10-16. Repo facts (license, stars, last push, primary language) came from `gh api repos/OWNER/REPO` on that date. Feature claims come from each repo's own README or docs, read via `gh api .../readme` or `.../contents/...`, unless marked "(secondary)". Star counts move fast, so treat them as a snapshot.

"Always-on agent" here means: it runs on a server or cloud machine, wakes on events, schedules or heartbeats, keeps memory and skills between runs, and messages the user over chat channels.

**TS** = TypeScript, the learner's build language.

---

## 1. Comparison table

| Project | Lang | License | Stars | Last push | Wake model | Runs where | Memory | Channels | Safety / approvals |
|---|---|---|---|---|---|---|---|---|---|
| [OpenClaw](https://github.com/openclaw/openclaw) | **TS** | MIT | 392,104 | 2026-10-15 | chat, cron ("automations"), heartbeat, webhooks, Gmail Pub/Sub, exec-exit events | self-hosted laptop/server/VPS (Fly/Render configs in repo) | Markdown files in workspace (`USER.md`, `MEMORY.md`, `memory/YYYY-MM-DD.md`) + search plugins; sessions in per-agent SQLite | very broad (WhatsApp, Telegram, Slack, Discord, Signal, iMessage, Teams, Matrix, …) | DM pairing/allowlists, exec approvals (deny/allowlist/ask/auto/full), optional Docker/Podman/SSH sandbox, `security audit` |
| [NanoClaw](https://github.com/nanocoai/nanoclaw) | **TS** | MIT (but runs on Claude Agent SDK, see §5) | 30,954 | 2026-10-15 | chat, scheduled tasks with "script gates", webhooks | self-hosted server; each agent in its own Linux container | per-agent-group folder with `CLAUDE.md` + memory; SQLite per session | WhatsApp, Telegram, Discord, Slack, Teams, iMessage, Matrix, Google Chat, Webex, Linear, GitHub, WeChat, email (installed via `/add-*` skills) | OS-level container isolation, credential gateway (agent never holds raw keys), gateway approval coordinator |
| [Letta Code](https://github.com/letta-ai/letta-code) | **TS** | Apache-2.0 | 3,624 | 2026-10-15 | chat, crons, heartbeats, agent self-managed schedules | laptop, remote computer, GitHub Actions, Letta Cloud sandbox | MemGPT-lineage memory blocks; "MemFS" (context tracked in git); "dreaming"/sleeptime | Telegram, Slack, Discord, web, custom channels | permission modes (auto-approve/deny rules), hooks, secrets obfuscation |
| [Open-Inspect / background-agents](https://github.com/ColeMurray/background-agents) | **TS** | MIT | 3,363 | 2026-10-15 | chat (Slack/web), GitHub/Linear/Sentry events, webhooks, cron automations | cloud: Cloudflare Workers + Durable Objects control plane; per-session sandboxes on Modal/E2B/Daytona/Vercel | per-session state in Durable Objects | web, Slack, GitHub PRs, Linear | sandbox per session, GitHub App scoping (coding focus) |
| [Cloudflare Agents SDK](https://github.com/cloudflare/agents) | **TS** | MIT | 5,836 | 2026-10-15 | requests, WebSockets, email, one-time/recurring/cron schedules | Cloudflare (each agent is a Durable Object) | per-agent SQLite + state in the Durable Object | SDK-level ("Channels", email, voice); you build the bot | Workflows with human-in-the-loop approval; sandboxed code execution in isolated Workers |
| [Agent Inbox](https://github.com/langchain-ai/agent-inbox) + [agents-from-scratch](https://github.com/langchain-ai/agents-from-scratch) | **TS** (inbox) / Jupyter+Python | MIT / MIT | 1,094 / 2,390 | 2026-09-18 / 2026-08-11 | events (Gmail) via LangGraph; inbox for interrupts | LangGraph deployment | LangGraph store; learns from user feedback | email (Gmail); Inbox web UI | `accept / edit / respond / ignore` interrupt schema for HITL |
| [elizaOS](https://github.com/elizaOS/eliza) | **TS** | MIT | 19,607 | 2026-10-15 | chat, scheduled workflows | self-hosted | memory/knowledge primitives, plugins | many via plugins | approval boundaries on wallet ops |
| [Leon](https://github.com/leon-ai/leon) | **TS** | MIT | 17,578 | 2026-10-12 | chat/voice | self-hosted | layered memory (durable prefs, daily, recent) | own UI/voice | not prominent; README says the core is being rebuilt |
| [TinyAGI (fka TinyClaw)](https://github.com/TinyAGI/tinyagi) | **TS** | MIT | 3,621 | **2026-03-30** (stale) | chat, heartbeat, queue | background process / Docker | not documented in README | Discord, WhatsApp, Telegram | pairing codes for unknown senders |
| [Hermes Agent](https://github.com/NousResearch/hermes-agent) | Python | MIT | 254,067 | 2026-10-15 | chat, built-in cron with delivery to any platform | $5 VPS, GPU box, or serverless backends (Modal/Daytona hibernate when idle) | agent-curated memory + periodic nudges, auto-created skills, FTS5 session search, Honcho user model | Telegram, Discord, Slack, WhatsApp, Signal, Email, Home Assistant | command approval, DM pairing, container isolation (7 terminal backends) |
| [nanobot (HKUDS)](https://github.com/HKUDS/nanobot) | Python | MIT | 49,062 | 2026-10-15 | chat, scheduled automations, long-horizon "goals" | self-hosted gateway | session history + "Dream" consolidation into `USER.md`/memory | Telegram, Discord, WeChat, Slack, Email, Mattermost, Linear, Feishu, Teams | allowlisting users per channel |
| [ZeroClaw](https://github.com/zeroclaw-labs/zeroclaw) | Rust | Apache-2.0 | 32,985 | 2026-10-15 | chat, cron, event-triggered SOPs (MQTT/webhook/cron/peripheral) | single binary, any OS | pluggable memory | 30+ (Discord, Telegram, Matrix, email, voice, webhooks) | default `supervised` autonomy (medium-risk needs approval, high-risk blocked), Landlock/Bubblewrap/Seatbelt/Docker, signed tool receipts |
| [PicoClaw](https://github.com/sipeed/picoclaw) | Go | MIT | 30,056 | 2026-10-15 | chat, cron | $10 hardware, <10 MB RAM | JSONL memory store | Telegram, Slack, Matrix, IRC, WeCom, Discord, … | cron security gating |
| [IronClaw](https://github.com/nearai/ironclaw) | Rust | Apache-2.0 | 12,657 | 2026-10-13 | routines (cron, event triggers, webhooks), heartbeat | self-hosted | persistent memory | REPL, HTTP webhooks, WASM channels (Telegram, Slack), web gateway | WASM sandbox with capabilities, endpoint allowlist, secrets injected at host boundary, Docker sandbox |
| [NullClaw](https://github.com/nullclaw/nullclaw) | Zig | MIT | 8,127 | 2026-10-08 | gateway + heartbeat + scheduler | ~1 MB RAM; edge WASM option | 10 memory engines | 19 channels | pairing, landlock/firejail/bubblewrap/docker sandboxes, encrypted secrets |
| [Moltis](https://github.com/moltis-org/moltis) | Rust | MIT | 2,889 | 2026-09-22 | chat, cron, CalDAV | single binary, your hardware | SQLite + FTS + vector memory | Telegram, WhatsApp, Signal, Discord, Teams, Matrix, Slack, Nostr | every command in a sandboxed container (Docker/Podman/Apple Container) + WASM tools |
| [Letta server](https://github.com/letta-ai/letta) | Python | Apache-2.0 | 25,156 | 2026-09-10 | API (server for stateful agents) | self-hosted or Letta Cloud | MemGPT memory blocks | via Letta Code channels | n/a |
| [Temporal Agent Harness](https://github.com/temporal-community/temporal-agent-harness) | Python | MIT | 98 | 2026-10-15 | Temporal workflows (durable, resumable) | wherever Temporal workers run | durable workflow history | none (harness) | tool-call approval policies (secondary, see §3) |
| [Khoj](https://github.com/khoj-ai/khoj) | Python | **AGPL-3.0** | 37,689 | 2026-08-02 | chat, scheduled automations | self-hosted or cloud | docs/notes "second brain" | web, desktop, others | n/a |

Not included: `letta-ai/lettabot` (archived; README says Letta Code channels/schedules replaced it). `joelhooks/joelclaw` (TS personal agent OS) has **no license file** per `gh api`, so it is all rights reserved. Read it for ideas only, don't copy code. `obot-platform/nanobot` is a different, archived project. Don't confuse it with HKUDS/nanobot.

---

## 2. Per-project notes

### OpenClaw (TS, MIT): the reference implementation
- Formerly Clawdbot/Moltbot. It's the biggest project by stars (392k) and the most feature-complete. NanoClaw's README describes it as "nearly half a million lines of code, 53 config files, and 70+ dependencies". The recursive git tree lists 58,296 paths. https://github.com/nanocoai/nanoclaw
- Architecture: one long-lived **Gateway** daemon owns every messaging surface. Clients and device "nodes" talk to it over a typed WebSocket protocol on `127.0.0.1:18789`. Side-effecting methods need idempotency keys. `docs/concepts/architecture.md`
- Wake: **Automations** (alias `cron`) "persist jobs, wake the agent at the right time, and can deliver output to a chat channel, a webhook, or nowhere" (`docs/automation/cron-jobs.md`). **Heartbeat** is "a scheduled main-session turn". The scheduler owns it as a system job per agent. Event wakes are rate-limited (30 s minimum between turns, plus a flood guard of 5 starts per 60 s) (`docs/gateway/heartbeat.md`). Gmail Pub/Sub and IMAP triggers are also available (`docs/automation/`, `src/hooks/gmail-watcher.ts`).
- Queue: a lane-aware FIFO. Each session key gets its own lane (`session:<key>`), so one session never runs two turns at once. A global `main` lane caps total concurrency. Foreground and background work have bounded priority head starts. `docs/concepts/queue.md`
- Memory: "The model only remembers what gets saved to disk; there is no hidden state." `USER.md`, `MEMORY.md` and dated daily notes live in the workspace. "Dreaming" consolidation writes `DREAMS.md`. `docs/concepts/memory.md`
- Sessions: rows and transcripts live in `~/.openclaw/agents/<agentId>/agent/openclaw-agent.sqlite`. `docs/concepts/session.md`
- Safety: sandboxing is **off by default**. The Gateway always stays on the host, and only tool execution moves into Docker/Podman/SSH/OpenShell (`docs/gateway/sandboxing.md`). Exec approvals add policy, allowlist and optional user approval on top of tool policy (`docs/tools/exec-approvals.md`).
- Best for learning: the **whole shape** of an always-on agent: gateway, channel plugins, scheduler, heartbeat, queue lanes, memory files, approvals. It's too big to read end to end, so use the code map in §3.

### NanoClaw (TS, MIT): the readable one
- It was built in reaction to OpenClaw's size: "one process and a handful of files. Agents run in their own Linux containers with filesystem isolation, not merely behind permission checks." https://github.com/nanocoai/nanoclaw
- It runs Claude Code through Anthropic's **Claude Agent SDK**. Codex, OpenCode and Ollama are drop-in options.
- Scheduled tasks can have "script gates" that skip waking the agent when there's no work (`docs/scheduled-tasks.md`). That's a cost-saving pattern worth copying.
- Credential gateway: "agents never hold raw API keys". Credentials are injected at request time with per-agent policies and rate limits.
- Code to read: `src/router.ts`, `src/session-manager.ts`, `src/container-runner.ts`, `src/request-wake.ts`, `src/gateway-approval-coordinator.ts`, `src/delivery.ts`, `src/state-sqlite.ts`.
- Best for learning: a **minimal, auditable TS architecture**, plus container-per-agent isolation and credential brokering.

### Letta Code (TS, Apache-2.0): memory-first
- Built by the MemGPT and sleep-time-compute authors. Agents "rewrite their own memory, skills, prompts". MemFS tracks all context in git. Crons, heartbeats and self-managed schedules are built in. Channels are Telegram, Slack and Discord. https://github.com/letta-ai/letta-code
- Code: `src/cron/` (`scheduler.ts`, `runner.ts`, `cron-file.ts`), `src/channels*`, `src/queue`, `src/permissions`, `src/memory-*.ts`.
- Some features (remote computers, secrets) need a Letta sign-in. Letta Cloud is the default backend, and local is an option.
- Best for learning: **long-term memory design** (memory blocks, reflection/"dreaming", git-versioned context).

### Open-Inspect / background-agents (TS, MIT): cloud-native multi-tenant shape
- An "open-source background agents coding system" inspired by Ramp's Inspect. The control plane runs on Cloudflare Workers with a Durable Object per session. The data plane is per-session sandboxes on Modal, E2B, Daytona, Vercel or OpenComputer. Packages include `slack-bot`, `github-bot`, `linear-bot`. It supports scheduled cron automations and event-driven automations from GitHub and Sentry. https://github.com/ColeMurray/background-agents
- It's coding-specific, not a personal assistant.
- Best for learning: the **cloud architecture closest to dots/Grok Bot**: a stateless event router, durable per-session state, and an ephemeral sandbox per run.

### Cloudflare Agents SDK (TS, MIT)
- Each agent is a Durable Object with its own SQLite, scheduling (one-time, recurring, cron), Workflows with human-in-the-loop approval, and sandboxed code execution. https://github.com/cloudflare/agents
- Best for learning: **"sleep until an event, then wake with state"** as a platform primitive. It ties you to Cloudflare.

### LangChain agents-from-scratch + Agent Inbox (MIT)
- agents-from-scratch builds an **"ambient" email agent** step by step: a Gmail-triggered router, human-in-the-loop, then memory that learns from feedback. The notebooks are Python. https://github.com/langchain-ai/agents-from-scratch
- Agent Inbox is a TS/Next.js UI for LangGraph interrupts, with `accept / edit / respond / ignore` actions. https://github.com/langchain-ai/agent-inbox
- `langchain-ai/executive-ai-assistant` is now **archived**.
- Best for learning: **approval UX** and the ambient-agent idea, in small pieces.

### Hermes Agent (Python, MIT): the main OpenClaw rival
- 254k stars. It has a "closed learning loop": autonomous skill creation, agent-curated memory with nudges, FTS5 session search, and Honcho user modelling. There's a built-in cron with delivery to any platform and seven terminal backends. Modal and Daytona backends "hibernate when idle and wake on demand". https://github.com/NousResearch/hermes-agent
- OpenClaw ships a `migrate-hermes` extension, which shows the two are direct competitors.
- Best for learning: **self-improving skills/memory** and **serverless hibernation**. It's Python, so you'd study the ideas rather than reuse the code.

### Rust/Go/Zig "claw" family (ZeroClaw, IronClaw, Moltis, PicoClaw, NullClaw)
- All are single-binary OpenClaw-style runtimes with gateway, channels, cron/heartbeat and memory. Their focus is security or footprint.
- **ZeroClaw:** supervised autonomy, signed tool receipts, and an event-triggered SOP engine with approval gates and resumable runs.
- **IronClaw:** a WASM sandbox for tools, with secrets injected at the host boundary.
- **Moltis:** runs every command in a container.
- **PicoClaw and NullClaw:** tiny footprints.
- Best for learning: **security patterns** (capability sandboxing, credential injection, tool receipts), not TS code.

### Others
- **elizaOS (TS, MIT):** an "agentic operating system" with memory, plugins and scheduled workflows. It has a crypto and wallet focus. https://github.com/elizaOS/eliza
- **Leon (TS, MIT):** a long-running personal assistant project. Its README says the core is being rebuilt around tools, memory and agentic execution. https://github.com/leon-ai/leon
- **TinyAGI (TS, MIT):** multi-agent "teams" with heartbeat and pairing. No pushes since 2026-03-30.
- **Temporal Agent Harness (Python, MIT):** durable execution around existing agent SDKs. A Temporal blog post calls it earlier than public preview (secondary: https://daily.dev/posts/temporal-agent-harness-an-early-look-at-durable-agent-infrastructure-bqrctxdka). For TS, Temporal documents a pre-release OpenAI Agents SDK integration: https://docs.temporal.io/develop/typescript/integrations/openai-agents.md
- **Khoj (AGPL-3.0):** has scheduled automations, but read §5 before building on it.

---

## 3. OpenClaw code map (TS developer's reading order)

Every path below was checked with `gh api repos/openclaw/openclaw/contents/...` or against the recursive git tree on 2026-10-16. Start with the doc, then the code.

**0. Orientation**
- `docs/concepts/architecture.md`: gateway, clients, nodes, wire protocol.
- `docs/concepts/agent-loop.md`: how one agent turn works.
- `src/entry.ts`, `src/index.ts`: entry points.
- `VISION.md`, `AGENTS.md` (root, and the per-directory `src/gateway/AGENTS.md`, `src/channels/AGENTS.md`).

**1. Gateway and channel intake**
- `src/gateway/server.ts`: the gateway server. `server-*.ts` siblings split out concerns, e.g. `server-channels.ts` and `server-channel-startup.ts`.
- `src/channels/plugins/types.ts`, `src/channels/plugins/types.plugin.ts`: the channel plugin contract.
- `src/channels/registry.ts`: channel registry.
- `src/channels/inbound-event/`: normalising inbound messages (`envelope.ts`, `classification.ts`, `context.ts`).
- `src/channels/allow-from.ts`, `mention-gating.ts`, `command-gating.ts`, `direct-dm.ts`: who may talk to the agent.
- `src/routing/resolve-route.ts`, `src/routing/session-key.ts`: map an inbound message to an agent and a session key.
- Concrete channel example: `extensions/telegram/src/bot-core.ts`, plus `bot-handlers.*.ts` (grammY). Every channel is an extension under `extensions/<name>/`.
- `src/pairing/`, `docs/gateway/pairing.md`: device and DM pairing.

**2. Automation scheduler (cron) and heartbeat**
- Docs: `docs/automation/index.md`, `docs/automation/cron-jobs.md` (+ `cron-jobs/` subpages), `docs/gateway/heartbeat.md`, `docs/automation/standing-orders.md`.
- `src/cron/service.ts` and `src/cron/service/`, e.g. `jobs-scheduling.ts`, `jobs-mutation.ts`, `agent-watchdog.ts`: the scheduler service.
- `src/cron/schedule.ts`, `src/cron/parse.ts`, `src/cron/store.ts`: schedule parsing and persistence.
- `src/cron/isolated-agent.ts`: runs a job in an isolated agent turn.
- `src/cron/delivery.ts`, `delivery-plan.ts`: send results to a channel.
- `src/gateway/server-cron.ts` and `server-cron-*.ts`: gateway wiring.
- Heartbeat: `src/infra/heartbeat-runner.ts`, `src/infra/heartbeat-wake.ts`, `src/infra/heartbeat-*.ts` (active hours, cooldown, dispatch); `src/cron/heartbeat-task.ts`, `src/cron/heartbeat-monitor.ts`; reply filtering in `src/auto-reply/heartbeat.ts`, `heartbeat-filter.ts`.
- Event triggers: `src/hooks/gmail-watcher.ts`, `src/hooks/hooks.ts`; docs `docs/automation/hooks.md`, `imap.md`, `mcp-events.md`.

**3. Session and queue handling**
- Docs: `docs/concepts/queue.md`, `docs/concepts/queue-steering.md`, `docs/concepts/session.md`.
- `src/process/command-queue.ts`, `src/process/lanes.ts`: the lane-aware FIFO.
- `src/process/gateway-work-admission.ts`: admission control.
- `src/auto-reply/dispatch.ts`, `src/auto-reply/inbound-debounce.ts`: inbound message to agent run, with debounce.
- `src/sessions/`, e.g. `session-lifecycle-*.ts`, `session-id.ts`, `send-policy.ts`: session lifecycle and policy.
- `src/gateway/active-sessions-shutdown-drain.ts`, `docs/gateway/restart-recovery.md`: drain and recovery on restart.

**4. Memory**
- Docs: `docs/concepts/memory.md`, `memory-builtin.md`, `memory-search.md`, `active-memory.md`, `dreaming.md`, `compaction.md`, `user-model.md`.
- `src/memory/root-memory-files.ts`: `USER.md`/`MEMORY.md` handling.
- `src/memory-host-sdk/`: the host-side SDK for memory plugins.
- `extensions/memory-core/`: the default memory plugin (`index.ts`, `src/memory-search-operation.ts`). Alternatives: `extensions/memory-lancedb/`, `extensions/memory-wiki/`, `extensions/active-memory/`.
- `src/agents/memory-search.ts`: the agent-side search tool.
- `src/context-engine/`: context assembly.

**5. Approvals and sandboxing**
- Docs: `docs/gateway/sandboxing.md` (+ `sandboxing/` subpages), `docs/gateway/sandbox-vs-tool-policy-vs-elevated.md`, `docs/tools/exec-approvals.md`, `docs/gateway/permission-modes.md`, `docs/security/THREAT-MODEL-ATLAS.md`.
- `src/agents/sandbox.ts`, `src/agents/sandbox/` (`backend.ts`, …), `src/agents/sandbox-tool-policy.ts`: sandbox backends and tool policy.
- `src/infra/exec-approvals.ts`, `src/agents/bash-tools.exec-approval-request.ts`: approval policy and request.
- `src/gateway/approval-channel-custody.ts`, `src/gateway/approval-web-push.ts`: routing approvals to the user.
- Per-channel approval UX: `extensions/telegram/src/exec-approvals.ts`, `extensions/slack/src/exec-approvals.ts`, `extensions/discord/src/exec-approvals.ts`.
- Protocol schema: `packages/gateway-protocol/src/schema/exec-approvals.ts`.
- `src/security/audit.ts`, `src/security/dangerous-tools.ts`, `src/security/external-content.ts`: auditing and prompt-injection handling of external content.

---

## 4. Recommendation: 2–3 repos to study for a commercial always-on agent in TS

1. **OpenClaw (MIT, TS).** Study it as the reference model of the whole problem. Every subsystem an always-on product needs exists here and is documented: gateway, channel plugins, persistent scheduler, heartbeat with flood guards, per-session queue lanes, file-based memory, exec approvals, sandboxing, and a threat model. Read it selectively with §3. It's a single-user, self-hosted design ("one Gateway per host"), so it shows the *pieces* but not a multi-tenant cloud product.
2. **NanoClaw (MIT, TS).** Study it for a minimal, readable core and for security by isolation. It does the same job in a handful of files, with container-per-agent isolation, a credential gateway, and script-gated scheduled tasks that avoid needless wakes. It's the easiest codebase to understand fully and then re-implement.
3. **Open-Inspect / background-agents (MIT, TS).** Study it for the cloud and multi-tenant architecture. Its control plane is serverless (Workers + a Durable Object per session), sandboxes are ephemeral per session on Modal/E2B/Daytona, and it has Slack/GitHub/Linear bots plus cron and event automations. That's the closest open shape to dots/Grok Bot's "agent on its own cloud computer, asleep until an event".

Honourable mention: **Letta Code** (Apache-2.0, TS) if memory and self-improvement are your differentiator. For approval UX, **Agent Inbox**'s interrupt schema is small and worth copying as a design.

---

## 5. Licence implications for a commercial product

These are facts about the licences only. **This is not legal advice.** Get a lawyer to review any dependency before you ship a commercial product.

- **MIT** (OpenClaw, NanoClaw, background-agents, Cloudflare Agents, elizaOS, Leon, Hermes, nanobot, PicoClaw, NullClaw, Moltis, TinyAGI, Agent Inbox, agents-from-scratch, Temporal Agent Harness): permissive. You may use, modify and sell, closed-source included. You must keep the copyright and licence notice. There is no patent grant clause.
- **Apache-2.0** (Letta Code, Letta server, ZeroClaw, IronClaw, mem0): permissive, plus an explicit patent licence. You must keep the NOTICE file, state changes to modified files, and include the licence. Patent rights end if you sue over patents in the work.
- **Dependencies matter as much as the top-level licence:**
  - NanoClaw is MIT, but it runs on Anthropic's Claude Agent SDK. That SDK's repo has no OSS licence: "© Anthropic PBC. All rights reserved. Use is subject to Anthropic's Commercial Terms of Service." (`anthropics/claude-agent-sdk-typescript/LICENSE.md`)
  - OpenClaw's repo includes `THIRD_PARTY_NOTICES.md`. Check it.
  - WhatsApp support in OpenClaw uses Baileys, an unofficial client (`docs/concepts/architecture.md`). That raises platform terms-of-service risk for a commercial product. This is a ToS issue, not a copyright one.
- **Mastra** (TS framework, not in the table): `gh` reports `NOASSERTION`. Its LICENSE.md says code outside `ee/` directories is Apache-2.0, and `ee/` is under the proprietary "Mastra Enterprise Edition License".
- **AGPL-3.0** (Khoj): if you modify it and let users interact with it over a network, you must offer those users the corresponding source of your modified version. For a closed-source SaaS, that is usually treated as a blocker. Use it for ideas only, unless you're happy to open-source.
- **No licence** (`joelhooks/joelclaw`): default copyright, all rights reserved. You may read it but not reuse the code.
- **Platform lock-in, not a licence issue:** Cloudflare Agents and background-agents' control plane are MIT, but they assume Cloudflare Workers/Durable Objects and paid sandbox vendors.
- Trademarks ("OpenClaw", "Hermes", "Letta") are not granted by MIT or Apache-2.0. Apache-2.0 §6 says so explicitly. Don't brand a product with them.

---

## Sources
- GitHub API metadata and contents for every repo linked above, fetched 2026-10-16 via `gh api`.
- OpenClaw docs, read from the repo: `docs/concepts/architecture.md`, `docs/gateway/heartbeat.md`, `docs/automation/cron-jobs.md`, `docs/concepts/queue.md`, `docs/concepts/memory.md`, `docs/concepts/session.md`, `docs/gateway/sandboxing.md`, `docs/tools/exec-approvals.md`.
- Discovery (secondary listicles, used only to find candidates, and each one checked via `gh`): https://composio.dev/content/openclaw-alternatives, https://blog.clawsouls.ai/posts/ironclaw-vs-openclaw/, https://sonusahani.com/blogs/openclaw-vs-picoclaw-vs-nullclaw-vs-zeroclaw-vs-nanobot-tinyclaw, https://awesome.ecosyste.ms/projects/github.com%2FColeMurray%2Fbackground-agents
- Temporal: https://docs.temporal.io/develop/typescript/integrations/openai-agents.md, https://daily.dev/posts/temporal-agent-harness-an-early-look-at-durable-agent-infrastructure-bqrctxdka (secondary)
