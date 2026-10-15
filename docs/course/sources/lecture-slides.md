# How always-on agents work — slide transcription

Source: 44 screenshots of the lecture video (https://youtu.be/L1OBRtfPS34). Every slide shows a small speaker video inset in the bottom-right corner, which sometimes covers slide content; covered text is marked [obscured by speaker inset]. Most slides carry a small white/black stylised logo mark in the bottom-left corner (no text). YouTube auto-captions visible in a screenshot are not slide text and are noted separately only where present.

---

### Screenshot 2026-10-15 175803.png

**Title slide** (dark background with a light arc)

- How always-on agents work
- Lee Robinson · Stanford CS146S · October 8, 2026

Other visible: partial wordmark "SPAC" (cut off by speaker inset) in bottom right. Caption (video subtitle, not slide): "So, as mentioned, I'm Lee. We're"

### Screenshot 2026-10-15 175932.png

**You built this in week one**

Code block:

```python
messages = [system_prompt, user_message]

while True:
    reply = llm(messages, tools=TOOLS)
    messages.append(reply)
    if not reply.tool_calls:
        print(reply.text)
        break
    for call in reply.tool_calls:
        messages.append(run_tool(call))
```

Right side:
- **This agent stops when you close the terminal.**
- Today: how to build one that keeps running, and why that makes it a different kind of product.

Figure: the basic agent loop — call the LLM with messages and tools, append the reply; if no tool calls, print and stop; otherwise run each tool and append results, then loop.

### Screenshot 2026-10-15 180056.png

**Your agent vs. an always-on agent**

Two-column comparison table:

| Your week-one agent | An always-on agent |
|---|---|
| Runs in your terminal | Runs on a server, so it survives crashes, deploys, and a closed laptop |
| Uses your laptop | Has its own cloud computer: a small virtual machine with a desktop, browser, and files |
| Remembers only the messages list | Saves its state, memory, and skills, and summarizes old messages |
| Prints every model reply | Only messages you when it calls a send tool, so it can stay quiet |
| Starts when you type | Starts on events: your messages, schedules, Slack, phone calls, finished work |
| Does one task, then exits | Works for months with the same memory, across many conversations |

Decoration: colourful blob-shaped mascot characters (pink, green, orange, purple) with eyes.

### Screenshot 2026-10-15 180231.png

**Agenda**

- 01 How we got here
- 02 What changed in the models
- 03 Inside an always-on agent
- 04 The harness
- 05 Context engineering
- 06 Where this is going
- 07 Q&A

### Screenshot 2026-10-15 180258.png

**Part 1 — How we got here** (section divider, purple background)

### Screenshot 2026-10-15 180315.png

**How developers work with AI**

Staircase diagram of four ascending cards; vertical arrow on the right labelled "How much the AI does" (increasing upward).

1. **2022–23 — Copy and paste:** Chat in a browser tab. You paste code in and copy answers back by hand.
2. **2024–25 — Agents in the terminal:** The agent edits files and runs commands in a loop. You approve each step.
3. **2025–26 — Apps built for agents:** Many agents run in parallel, in the background or the cloud. You review the finished changes.
4. **Now — Always-on agents** (highlighted with purple border): You text an agent that has its own computer, tools, and memory. It keeps working after you leave.

### Screenshot 2026-10-15 180453.png

**From approving every step to steering**

Legend: You (light grey box) · Agent (light purple box) · Auto-review (black box)

**Before: the agent waits for you**
Linear flow: Prompt → Agent works → Approve? → Agent works → Approve? → Agent works → Review

**Now: the agent keeps working, and you redirect it**
Three user messages feed down (arrows) into one long purple bar:
- "Also check the Slack thread"
- "Actually, make it Thursday"
- "Send the invite when it's ready"

Purple bar: **Agent works for hours and hands tasks to helper agents**

Outputs below the bar:
- Agent reply: "On it"
- Black auto-review box: ✓ Auto-approved: send the calendar invite — caption: "A safety check approved it, so it didn't wait for you"

Figure: contrasts a strictly turn-taking approval chain with a continuously running agent that accepts mid-task steering messages and uses an automatic safety check instead of human approval for an action.

### Screenshot 2026-10-15 180806.png

**As models get more capable, the interface gets simpler.**

Our implementation of this always-on agent is called a Bot.

Right side: screenshot of a desktop chat app (macOS-style window, search and "+" buttons). Left sidebar list of Bots, each with a coloured blob avatar and last-message preview:
- Sales Outbound — "Need your yes on the..."
- Chief of Staff — "Drafted 8 outreaches t..."
- Inbox Manager — "Inbox triaged. 3 unread."
- Website launch — "John: checkout's clean..." (group avatar with a person)
- Debug — "Caught 3 bugs in chec..."
- Keith — "Acme's wobbling. Draf..."
- Tyler — "14 receipts in. Still mis..."

Main pane (conversation with "Sales Outbound"):
- Bot: "Hey, good to meet you. What can I help with?"
- User (dark bubble, cut off on the right): "Overnight pipeline generation and outbo[und]... Pick eligible prospects from Google She[ets], research them on the web, grab context... contacts and accounts from Hex and Salesforce."
- Status line: "Created Sales Outbound routine"
- Bot: "Salesforce isn't connected right now."
- Card "Computer" with status "Working": "Sign in to Salesforce so I can see the accounts you own." — preview image of the Bot's computer; buttons "Copy link", "View details" (partly [obscured by speaker inset]).

### Screenshot 2026-10-15 180828.png

**Part 2 — What changed in the models** (section divider, green background)

### Screenshot 2026-10-15 180838.png

**Six new model capabilities**

1. **Work for hours** — Models can now work for hours and follow complex instructions the entire time.
2. **Hand off to helpers** — A main agent gives tasks to helper agents, each with a fresh context, so the total work isn't limited by one context window.
3. **Use real tools** — A shell, files, a browser, and app APIs through MCP: the same tools you use on your computer.
4. **Use a computer** — They can look at a screen and click, so they can use apps that have no API.
5. **Keep knowledge in files** — Skills and memories are stored as plain files that the agent reads and updates itself.
6. **Learn by watching** — Show it how you do a t[ask on] its computer, and it sav[es the] steps as a skill it can re[use] (end of each line [obscured by speaker inset]).

Decoration: purple blob mascot, a cursor arrow and a small grey blob.

### Screenshot 2026-10-15 181045.png

**What the agent knows lives in files**

Code block (directory tree with annotations), labelled "Simplified example":

```
memory/
  profile.md             always in the prompt
  log/2026-10.md         dated facts, one per line
skills/
  linkedin-sourcing/
    SKILL.md             "Use this when…"
  weekly-metrics/
    SKILL.md
routines/
  morning-brief          prompt + weekdays 8:00
```

Bullets:
- Models are extremely good at using Linux and running shell commands
- Plain text, so you and the agent can both read, search, and edit it
- The agent keeps it up to date. Tell it a preference once and it saves it to memory
- Skills load only when needed, so having many of them is cheap

Quote: "Everything is computer"

### Screenshot 2026-10-15 181218.png

**Part 3 — Inside an always-on agent** (section divider, red background)

### Screenshot 2026-10-15 181227.png

**How does it stay always on?**

Swim-lane diagram, four rows (label + sub-label on the left):

- **Triggers** — wake it up: boxes "Your message" and (later on the timeline) "Routine at 8:00", each with an arrow down to the Agent process row.
- **Agent process** — runs a turn, then stops: purple box "Loads state, works, saves each step" (under "Your message"), then a dashed line labelled "stops after 2 idle minutes", then purple box "Routine runs" (under "Routine at 8:00").
- **Agent's computer** — sleeps when idle: "Asleep: saved to disk" → (dashed arrow down from the first agent-process box) "Restored when a tool needs it" (highlighted) → "Stays asleep: this routine didn't need it".
- **Saved state** — always on the server: black bar "Database and storage: conversations, memory, routines, skills" spanning the whole timeline.

Footer: When nothing is happening, nothing runs. Everything that matters is saved, so any trigger can bring it back.

Figure: a timeline showing that the agent process only exists during a turn; the VM is restored lazily only when a tool call needs it; persistent state lives permanently in the server database.

### Screenshot 2026-10-15 181327.png

**What wakes the agent**

Flow diagram. Seven trigger sources on the left, all with lines converging on one router box:
- You, on any app
- A routine: schedule or webhook
- A Slack mention, DM, or thread
- A phone call or meeting
- Another agent
- Background work finishing
- A scheduled check-in

→ **Router: drops duplicates, picks the conversation** → **Conversation queue: one turn at a time** → decision diamond **"Anything worth saying?"**
- yes → **Send a message to the right place** (purple)
- no → **Stay quiet**

Footer: Every wake-up records where it came from, so the agent can tell whether you asked, a routine ran, or an outside service sen[t it] (end [obscured by speaker inset]).

### Screenshot 2026-10-15 181433.png

**The agent's computer**

Left (nested boxes):
- Outer: **A Firecracker virtual machine · one per user · saved to disk when idle**
  - Inner: **A Linux (Debian) container, kept running by a supervisor**, containing:
    - **File server** — Files, app connections, live desktop view
    - **Command runner** — Shell commands, files, screenshots, clicks
    - **Screen 1** — A virtual display with its own Chrome
    - **Screen 2, 3, …** — One more screen per active agent
  - Black bar: Files, installed tools, and browser logins all stay between sessions

Right (two boxes joined by a down arrow):
- **Going to sleep** — A few minutes after the last activity, never mid-turn
  1. Files sync to cloud storage
  2. Memory and disk are saved as a snapshot
  3. The machine stops
- **Waking up** — On the next tool call
  1. The snapshot is restored in place
  2. Logins and installed tools are still [obscured by speaker inset]
  3. Conversation state comes from t[obscured by speaker inset]

### Screenshot 2026-10-15 181528.png

**Three parts of the system**

Three-column architecture diagram:

- **Apps and channels** (left column): Desktop app · Mobile and web · Slack · Email, webhooks, schedules · Phone calls and meetings. An arrow labelled "send" goes from the channels into the server; a dashed arrow labelled "live updates" goes back from saved state to the channels.
- **Server: runs the agent** (middle): Entry point: checks and routes input → Queue: one per conversation → **Agent loop and tools** (purple), which exchanges with **Model** (two-way arrow) and with **Saved state: database and storage** (two-way arrow labelled "load and save").
- **Agent's computer: runs tools** (right): File and connector server; Command runner: shell, files, screenshots (receives "tool calls" arrow from the agent loop); connected to "A desktop and Ch[rome for] each age[nt]" ([obscured by speaker inset]).

Footer: The agent runs on the server, uses tools on its own computer, and every app shows the same conversation.

### Screenshot 2026-10-15 181620.png

**Why the agent runs on the server**

Left: grid of twelve colourful blob mascots around one large purple blob.

Bullets:
- Thin client, thick server
- Close your laptop and the work keeps going
- Easily move between your computer and phone
- Ship code without App Store review cycles
- Offload heavy work to the server
- Agent loop is entirely decoupled from app code
- Easier to scale with hyper growth
- Agents that work for months can't be on device

### Screenshot 2026-10-15 181721.png

**Save everything on the server.**

The virtual machine can then always be rebuilt.

### Screenshot 2026-10-15 181740.png

**What happens when you hit send**

Subtitle: Notifications only say "something changed." The database always has the real data.

Four numbered columns, left to right with arrows between them; each has three stacked steps and a caption:

1. **Sending** — Your app shows the message right away → It saves the message locally with a unique ID → The server drops any ID it has already seen. *Caption: Unique IDs make retries safe*
2. **The turn** — The message joins the conversation's queue → **The agent runs one turn: model, tools, repeat** (purple) → **Every step is saved to the database** (black). *Caption: One turn at a time per conversation*
3. **Watching** — The server sends a tiny "something changed" signal → Every open app gets the signal → Each app fetches the new messages. *Caption: The signal carries no data, so losing one is harmless*
4. **Ordering** — Every update has a sequence number → Apps apply updates in order: 41, 42, 43 → If one is missing, reload from the database. *Caption: Every app ends up [with the] same thi[ng]* ([obscured by speaker inset])

### Screenshot 2026-10-15 181944.png

**Rules for handling new messages**

Diagram with two input lanes feeding a "Running turn" box:

- **You** (in a 1:1 chat): "Actually, make it Thursday" and a black **■ Stop** button → purple line labelled **Skips the line** → arrow into Running turn, annotated "interrupts or stops the turn".
- **Everyone else** (group chats, Slack threads, routines, helpers) → a queue, from "Back of the line" to "Front of the line →": Helper finished · Slack reply · [dashed group: "Add Maya?" · "And Jordan" · "Thanks!" — labelled **3 quick messages → 1 turn**] · Routine: weekly report → arrow into Running turn.
- **Running turn** (purple): The agent works on one batch of messages at a time.

Figure: the owner's 1:1 messages and Stop preempt the running turn; all other inputs wait in a FIFO queue, and rapid consecutive messages are batched into a single turn.

### Screenshot 2026-10-15 182113.png

**Part 4 — The harness** (section divider, orange background)

### Screenshot 2026-10-15 182124.png

**One tool for talking to you**

Diagram: grid labelled "Tools for doing work" → arrow → **SendToUser** (purple) → arrow → grid labelled "Where your messages show up".
- Tools for doing work: Shell · Files · Browser · Desktop · Memory · Skills · Helper agents · Cloud agents · App connectors · Web search · Image generation · Screen recording
- Where your messages show up: Desktop · Web · Mobile · Slack · Email · Voice

Four cards below:
- **Thinking stays private** — The model's regular text is never shown to you
- **Quiet is allowed** — If there's nothing new, it doesn't message you
- **Rich messages** — Text, files, multiple choice, and secure password entry
- **One less step** — The last message [can end] the turn without a[nother] model call ([partly obscured by speaker inset])

### Screenshot 2026-10-15 182219.png

**Pairing tools with the right UI**

Subtitle: The harness has dozens of tools. When you need to see or approve something, the tool shows a purpose-built control.

Four panels, each with a UI mock-up and description:
- **Sign-in forms** — Fills your login only on the site that's open. The password never reaches the model. Mock-up: "1Password — Share a vault with Grok Bot"; "Autofill password — Fill your login with 1Password" (green check).
- **Payment approvals** — Purchases wait until you tap Allow or Deny. Mock-up: "Stripe Link — Get secure, one-time-use payment… [Add]"; card "Shopper wants to pay $80.00 — Approval needed. Pay Starlink (starlink.com) for the Roam Unlimited – 300GB service plan. › Show the breakdown. [Allow] [Deny]".
- **Email drafts** — You see the whole email and choose Send or Discard. Mock-up (small text): "Here's the draft — review it and send when you're ready." New email · Ready to send · From: peng@grokbot.app · To: sarah@acme.com · Subject: Moving Friday's design review to 2 PM · "Hi Sarah, Could we move Friday's design review from 11 AM to 2 PM? A client call came up and I don't want to rush our discussion. Thanks, Peng" · [Send email] [Discard].
- **Reactions** — Sometimes an emoji is the right reply. Mock-up: message bubble "That's good, thank you so much!" with a red heart reaction.

### Screenshot 2026-10-15 182304.png

**Load tool details only when needed**

Legend: System prompt (black) · Tool details (purple) · Tool names (light purple) · Conversation (grey) · Free space (white). Label: "Illustrative".

Two waffle charts of the context window (rows of 25 squares):
- **Every tool loaded up front:** ~6 system-prompt squares, then ~62 tool-detail squares filling most of three rows, ~24 conversation squares, only ~8 free squares left.
- **Names first, details on demand:** 6 system-prompt squares, ~6 tool-detail squares, 2 tool-name squares, ~24 conversation squares, the remaining ~2 rows+ free (partly [obscured by speaker inset]).

Figure: deferring full tool schemas (load only names up front) leaves most of the context window free.

### Screenshot 2026-10-15 182436.png

**Try the cheapest option first**

Subtitle: If a connector is broken, the agent shouldn't work around it with the browser. It should tell you and ask.

Ascending staircase of six cards along an arrow labelled "Slower, more expensive, and riskier":
1. What it already knows
2. An app's API (connector)
3. Web search
4. Its own signed-in browser
5. The full desktop
6. Ask you (highlighted purple, with a purple mascot)

### Screenshot 2026-10-15 182541.png

**Three ways to use a computer**

Subtitle: A separate helper agent does the clicking, so screenshots don't fill up the main agent's context.

- **Read the page structure** — It reads the page's list of buttons, links, and fields, and clicks them directly. Faster and more reliable than screenshots.
- **Click on pixels** — Mouse and keyboard on a 1280×800 screen, for desktop apps, system dialogs, and anything else.
- **Ask a person** — At logins, verification codes, captchas, or payments, it stops, explains where it is, and [hands] you the screen ([partly obscured by speaker inset]).

### Screenshot 2026-10-15 182636.png

**One main agent, many helpers**

Diagram: **You** ↔ (two-way arrow) **Main agent** — "Answers quick questions itself. Hands bigger tasks to a helper, so it can keep talking to you." Four arrows fan out from the main agent, labelled "Hands off a complete task description", to:
- **General helper** — Shell, web, app connectors, cloud agents
- **Computer-use helper** — Browser and desktop, one task at a time
- **Video helper** — Watches and reviews video files
- **Cloud coding agent** — Code changes in its own virtual machi[ne] ([obscured by speaker inset])

A dashed arrow returns from the helpers to the main agent: "Gets back a short report".

Row of four boxes at the bottom: A to-do list tracks every request · Check on a helper · Send a helper a message · Stop all help[ers] ([obscured by speaker inset]).

### Screenshot 2026-10-15 182937.png

**Tips for designing agent tools**

- Don't add or remove tools between turns. If a tool can't be used right now, have it return a clear error
- Keep each tool's description and schema under 4,000 characters
- Use a dedicated tool for saving state instead of shell commands, so reviewers can see what's changing
- Write errors that say what to do next: "The computer is asleep. Use Shell or Read to wake it, then try again."

### Screenshot 2026-10-15 183022.png

**How we keep it safe**

Four cards:
- **Automatic review** — A separate model checks risky actions before they run. If it blocks one, you get an approval request. No answer in 15 seconds means blocked.
- **Track the source** — Text from emails and webhooks is labeled untrusted. Memories are treated as information, not instructions.
- **Asks first** — It won't email or message people unless you asked it to. New routines need your OK.
- **Keep secrets hidden** — Passwords go into environment variables, never to the model. Actions on your own laptop need your approval.

### Screenshot 2026-10-15 183118.png

**Part 5 — Context engineering** (section divider, pink background)

### Screenshot 2026-10-15 183140.png

**Keep the start of the prompt the same**

Stacked diagram of the prompt, top to bottom, each block with an arrow pointing to an annotation on the right:
1. **Stays the same until the next summary** (purple): Tool definitions · System prompt, including a snapshot of memory and routines · First message: environment details and a list of tool names → "Identical on every call, so the provider can reuse its cached work"
2. **Conversation history**: New messages are only ever added at the end → "Becomes part of the reusable start of the next call"
3. **Newest message** (orange): The time, short notes on anything that changed, then your message → "The only part that's new on e[very call]" ([obscured by speaker inset])

Footer: Providers charge less and respond faster when the start of a prompt matches a recent one. So stable content goes first and [obscured by speaker inset] goes last.

### Screenshot 2026-10-15 183240.png

**Keep the main context small**

Hub-and-spoke diagram: centre box **Main agent's context** — "Stays small, so every call is fast and cheap", with arrows out to six boxes:
- **Long outputs go to files** — The context keeps only the file path
- **Screenshots go to a helper** — The context gets what it found
- **Tool-heavy work goes to helpers** — The context gets a short report
- **Old messages get summarized** — The context keeps a short summary
- **Old memories stay searchable** — Only the most important facts are in the prompt
- **Instructions become skills** — The prompt keeps a one-line poi[nter] ([obscured by speaker inset])

Footer: Heavy things live outside the main conversation. Only a pointer or a summary comes back.

### Screenshot 2026-10-15 183345.png

**Treat a cache miss like a bug**

- Until the next summary, the tools, system prompt, and first message must stay exactly the same
- If a deploy changes a tool description, running conversations get a note instead of the new text
- Everything is built in a fixed order and sorted, so nothing moves around between calls
- Tools are never added or removed for a single turn. Unavailable tools return an error instead
- Each section is hashed separately, so we can see exactly which part changed
- When you open the chat or start typing, the server prepares the prompt early to warm the cache

### Screenshot 2026-10-15 183526.png

**Summarize while you're away**

Timeline with four points (left to right):
1. **A big turn ends** — The prompt was over 100,000 tokens
2. **About 10 minutes pass** — The provider's cache is still warm
3. **Write a summary** — Uses the same start of the prompt, so it reuses the cache
4. **Your next message** — Starts from the short summary

Three notes below:
- Skipped if background work is about to wake the agent anyway
- The agent's last few messages to you are kept word for word
- If a turn gets too long, it can summarize in the middle

### Screenshot 2026-10-15 183643.png

**How the agent remembers**

Four stacked memory tiers:
- **Profile** (purple) — Core facts about you. Always in the prompt: up to 100 facts in 4,000 characters.
- **Log** (light purple) — Dated events. The 30 most relevant recent ones go in the prompt.
- **Notes** (grey) — Short-term details that fade quickly.
- **Everything else** (dashed outline) — Found with a memory search tool when needed.

Bullets:
- Important facts rank higher, and older facts slowly rank lower
- After each turn, a pass adds new facts and replaces old ones. It can only remove facts it was shown
- Facts about you are shared by all your agents. Each agent writes to its own file
- The model is told that memories are information, not instructions

### Screenshot 2026-10-15 183820.png

**Part 6 — Where this is going** (section divider, light-blue background)


### Screenshot 2026-10-15 183836.png

**Training the model for the product**

Three cards in a left-to-right pipeline (arrows between):
1. **Pre-training** (book icon) — Learns language, code, and general knowledge from a huge amount of text.
2. **Supervised fine-tuning** (graduation-cap icon) — Learns the harness from examples: • the tools and their formats • when to send a quick reply • what an ideal response looks like
3. **Reinforcement learning** (trophy icon, highlighted purple) — Practices real agent tasks and is rewarded for doing them well: • following long instructions • using skills and memories • clicking the right spot (grounding) • working with other bots

Two cards below:
- **Main agent: fast replies** (chat icon) — Inference and harness are tuned so it answers in seconds.
- **Helpers: long tasks** (stopwatch icon) — Tuned to finish hours of work reliably and contr[ol the] computer quickly ([partly obscured by speaker inset]).

### Screenshot 2026-10-15 184000.png

**Product and model improve together**

Two feedback loops:
- **Inner loop: every day** — climb the evals: A bot gets something wrong → Turn it into an eval → Fix the harness, prompt, or inference → Check the evals → Ship the fix → (arrow back to start).
- **Outer loop: every few months** — new models and products: Train the next model on the harness and evals → Swap it into the product → People use it in new ways, like group chats full of bots → New behaviors to evaluate and train for → (arrow back to start).
- A dashed purple arrow labelled **Evals guide training** runs from "Turn it into an eval" (inner loop) down to "Train the next model on the harness and evals" (outer loop).

Footer: Every bot that doesn't work well becomes an eval. Evals improve the product today and the next model tomorrow.

### Screenshot 2026-10-15 184157.png

**Delete the product.**

Assume models will get much better. Build as little as you can around them, and remove what they no longer need.

### Screenshot 2026-10-15 184249.png

**What I expect in 6 to 12 months**

- **Longer projects** — Agents that work on one project for months, not just one task for a few minutes.
- **Better memory** — They remember how you and your team work, and keep improving at it.
- **More powerful tools** — Anything you can do on a computer, done faster and more reliably.
- **Simpler interfaces** — Texting today, maybe voice only next. Whatever is easiest for each person.
- **Skills they weren't trained for** — Bots can learn on the job, combining better memory, skill and instruction following, and raw intelligence..
- **Knowledge written dow[n]** — People and companies write down what they k[now so] agents can use it ([partly obscured by speaker inset]).

Decoration: large red blob mascot, cursor arrow and small grey blob.

### Screenshot 2026-10-15 184433.png

**Open problems you could work on**

- **Testing long-running agents** — How do you grade an agent that works for weeks? Current methods struggle.
- **Correct memory** — Replacing outdated facts, forgetting when asked, and never making things up.
- **Prompt injection** — An agent that reads email and the web will see text written to trick it. Defenses are still early.
- **When to speak** — Too many messages is noise. Too few and you can't tell what it's doing.
- **Coordination** — Many agents sharing one computer and one memory run into classic distributed-systems problems.
- **Cost** — Always-on only works if idle agents are nearly free and active ones are cheap.

Decoration: large green blob mascot, cursor arrow and small grey blob.

### Screenshot 2026-10-15 184617.png

**The new building blocks**

Two boxes joined by an arrow:
- **Every web app had:** A server · A database · A cache · A CRUD interface
- → **Every agent product will have:** Durable workflows · Can use a computer · Memory and skills · Triggers and scheduled jobs · Connectors and auth · Text and voice channels · Payments and identity · Evals and observability

Footer: Many products will look alike but build these pieces very differently. Expect a long tail of specialized, best-in-class versions of each.

### Screenshot 2026-10-15 184735.png

**What to take away**

Subtitle: As code gets easier to write, knowing how the pieces fit together matters more.

- **Architecture compounds** — When code is cheap to write, the right architecture is what keeps you moving faster than everyone else.
- **Build your own** — Start from your week-one agent and add a server, a computer, and memory. Open-source always-on agents are great to learn from.
- **Learn the fundamentals** — Knowing how LLMs work helps you judge what's possible, the same way knowing databases helps when you build a website.

### Screenshot 2026-10-15 185005.png

**Thank you**

Questions? · Lee Robinson · @leerob

Other visible: partial wordmark "SPAC" (cut off by speaker inset) in bottom right.

(Note: agenda item 07 "Q&A" has no separate slide in the screenshots; this closing slide carries "Questions?".)

---

## Lecture outline

- Title: How always-on agents work — Lee Robinson, Stanford CS146S, October 8, 2026
- Framing
  - The week-one agent loop (LLM + tools in a `while True` loop) stops when you close the terminal
  - Today: how to build one that keeps running, and why that makes it a different kind of product
  - Week-one agent vs. always-on agent (server, own cloud computer, persisted state/memory/skills, send-tool-only messaging, event triggers, months-long operation)
  - Agenda (7 parts)
- Part 1 — How we got here
  - Evolution of developer–AI work: copy and paste (2022–23) → agents in the terminal (2024–25) → apps built for agents (2025–26) → always-on agents (now)
  - From approving every step to steering (mid-task redirects, helper agents, auto-review)
  - As models get more capable, the interface gets simpler; the implementation is called a "Bot" (multi-Bot chat app demo)
- Part 2 — What changed in the models
  - Six new capabilities: work for hours; hand off to helpers; use real tools (MCP); use a computer; keep knowledge in files; learn by watching
  - What the agent knows lives in files (memory/, skills/, routines/; "Everything is computer")
- Part 3 — Inside an always-on agent
  - How it stays always on: triggers → short-lived agent process → lazily restored computer → always-on saved state
  - What wakes the agent: seven trigger sources → router → per-conversation queue → "anything worth saying?"
  - The agent's computer: Firecracker VM per user, Debian container, file server, command runner, screens; sleep/wake via snapshots
  - Three parts of the system: apps and channels / server / agent's computer
  - Why the agent runs on the server (thin client, thick server)
  - Save everything on the server; the VM can always be rebuilt
  - What happens when you hit send: sending, the turn, watching, ordering
  - Rules for handling new messages: owner's 1:1 messages and Stop skip the line; everyone else queues; quick messages batched
- Part 4 — The harness
  - One tool for talking to you (SendToUser)
  - Pairing tools with the right UI (sign-in, payments, email drafts, reactions)
  - Load tool details only when needed
  - Try the cheapest option first (knowledge → connector → web search → browser → desktop → ask you)
  - Three ways to use a computer (page structure, pixels, ask a person)
  - One main agent, many helpers
  - Tips for designing agent tools
  - How we keep it safe (automatic review, source tracking, asks first, secrets hidden)
- Part 5 — Context engineering
  - Keep the start of the prompt the same (prompt-cache-friendly layout)
  - Keep the main context small (offload to files, helpers, summaries, search, skills)
  - Treat a cache miss like a bug
  - Summarize while you're away
  - How the agent remembers (profile, log, notes, everything else)
- Part 6 — Where this is going
  - Training the model for the product (pre-training → SFT → RL; fast main agent vs. long-task helpers)
  - Product and model improve together (inner daily eval loop, outer multi-month training loop)
  - Delete the product (build as little as possible around the model)
  - What I expect in 6 to 12 months
  - Open problems you could work on
  - The new building blocks (web-app stack → agent-product stack)
  - What to take away
- Part 7 — Q&A ("Thank you / Questions?")

## Key terms

- **Lee Robinson (@leerob)** — the speaker, named on the title and closing slides.
- **Stanford CS146S** — the course in which the lecture was given (October 8, 2026).
- **Week-one agent** — the basic agent loop students built earlier in the course: `llm(messages, tools=TOOLS)` in a `while True` loop that stops when the terminal closes.
- **Always-on agent** — an agent that runs on a server with its own cloud computer, persistent memory/skills, event-driven wake-ups, and a months-long lifetime; the lecture's subject.
- **Bot** — the speaker's team's name for their implementation of an always-on agent (each Bot is a named chat, e.g. Sales Outbound, Chief of Staff, Inbox Manager, Debug).
- **Grok Bot** — name visible in the 1Password mock-up ("Share a vault with Grok Bot"); the email mock-up's sender is peng@grokbot.app. (No other slide names the product.)
- **Agent loop** — call model, run tool calls, append results, repeat; on the server it is "Agent loop and tools", decoupled from app code.
- **Steering** — redirecting a continuously working agent mid-task instead of approving every step.
- **Auto-review / Automatic review** — a separate model (safety check) that approves or blocks risky actions; a blocked action becomes an approval request, treated as blocked after 15 seconds without an answer.
- **Helper agents** — sub-agents given a complete task description and a fresh context, returning a short report (general helper, computer-use helper, video helper, cloud coding agent).
- **Cloud agents / Cloud coding agent** — a helper/tool that makes code changes in its own virtual machine.
- **Context window** — the model's working context; helpers and offloading keep the main one small.
- **MCP** — how app APIs are exposed as tools ("app APIs through MCP").
- **Computer use** — models looking at a screen and clicking, to use apps with no API.
- **Skills / SKILL.md** — plain-file instructions ("Use this when…") loaded only when needed; can be learned by watching; the prompt keeps a one-line pointer.
- **Memory** — plain files the agent reads and updates itself: profile.md (always in the prompt), dated log, notes, plus a memory search tool.
- **Profile** — core facts about the user, always in the prompt (up to 100 facts in 4,000 characters), shared by all the user's agents.
- **Log** — dated events/facts, one per line; the 30 most relevant recent ones go in the prompt.
- **Notes** — short-term details that fade quickly.
- **Routines** — a prompt plus a schedule (e.g. morning-brief, weekdays 8:00) or webhook trigger; new routines need the user's OK.
- **Triggers** — events that wake the agent: user messages, routines (schedule/webhook), Slack, phone calls/meetings, other agents, finished background work, scheduled check-ins.
- **Router** — drops duplicate wake-ups and picks the conversation.
- **Conversation queue** — one per conversation; one turn at a time.
- **Turn** — one run of the agent ("model, tools, repeat"), with every step saved to the database.
- **Linux / shell commands** — models are "extremely good" at them, which motivates file-based knowledge ("Everything is computer").
- **Firecracker virtual machine** — the agent's computer: one per user, saved to disk when idle.
- **Debian container / supervisor** — the Linux container inside the VM, kept running by a supervisor.
- **File server / Command runner / Screens** — services in the agent's computer (files, app connections, live desktop view; shell commands, files, screenshots, clicks; virtual displays each with its own Chrome, one more per active agent).
- **Chrome** — the browser on each virtual display.
- **Snapshot** — saved memory and disk of the VM, restored in place on the next tool call.
- **Thin client, thick server** — the rationale for running the agent server-side.
- **App Store review cycles** — avoided by shipping logic on the server.
- **Unique IDs / sequence numbers** — make retries safe and let apps apply updates in order, reloading from the database on gaps.
- **"Something changed" signal** — a data-less notification; apps then fetch from the database.
- **Stop** — user control that skips the line and interrupts or stops the running turn.
- **Harness** — the tools, UI controls and runtime around the model (Part 4); the model is later fine-tuned on it.
- **SendToUser** — the single tool the agent uses to message the user (Desktop, Web, Mobile, Slack, Email, Voice); all other model text stays private.
- **Slack** — both a trigger source and a message destination.
- **1Password** — used for sign-in forms; fills the login only on the open site, and the password never reaches the model.
- **Stripe Link** — payment mock-up for purchase approvals (Allow/Deny).
- **Starlink (Roam Unlimited – 300GB)** — example purchase in the payment-approval mock-up.
- **Google Sheets, Hex, Salesforce** — data sources named in the Sales Outbound demo request; Salesforce sign-in is shown as a task on the agent's computer.
- **Connector** — an app's API integration; second-cheapest option after existing knowledge; if broken, the agent should tell you and ask rather than work around it with the browser.
- **Names first, details on demand** — deferred loading of tool schemas to save context.
- **Page structure vs. click on pixels** — two computer-use modes (reading the page's buttons/links/fields vs. mouse and keyboard on a 1280×800 screen), plus "ask a person".
- **Tool design tips** — stable tool set, each description+schema under 4,000 characters, a dedicated state-saving tool, errors that say what to do next.
- **Untrusted labelling** — text from emails and webhooks is labelled untrusted; memories are information, not instructions.
- **Environment variables** — where passwords go, never to the model.
- **Context engineering** — Part 5: arranging and minimising what goes into the prompt.
- **Provider cache (prompt caching)** — providers charge less and respond faster when the start of a prompt matches a recent one; motivates a stable prefix and "treat a cache miss like a bug".
- **Cache warming** — preparing the prompt early when the user opens the chat or starts typing.
- **Section hashing** — each prompt section hashed separately to see exactly which part changed.
- **Summary / summarization** — old messages replaced by a short summary; done about 10 minutes after a turn whose prompt exceeded 100,000 tokens, while the cache is warm, or mid-turn if a turn gets too long.
- **Pre-training / Supervised fine-tuning / Reinforcement learning** — the three training stages for the product model; SFT teaches the harness, RL rewards real agent tasks.
- **Grounding** — "clicking the right spot", one RL target.
- **Inference** — tuned (with the harness) so the main agent answers in seconds; one of the things fixed in the inner loop.
- **Evals** — tests made from every bot failure; climbed daily and used to guide training of the next model.
- **"Delete the product"** — principle: assume models will get much better, build as little as you can around them, remove what they no longer need.
- **Prompt injection** — open problem: email/web text written to trick the agent; defenses are still early.
- **Distributed-systems problems** — what many agents sharing one computer and one memory run into.
- **Durable workflows, connectors and auth, payments and identity, evals and observability, triggers and scheduled jobs, text and voice channels, memory and skills, can use a computer** — the "new building blocks" every agent product will have, contrasted with server / database / cache / CRUD interface for web apps.
- **Open-source always-on agents** — recommended as learning material (none named).
- **LLMs** — knowing how they work is the recommended fundamental, likened to knowing databases when building a website.

## Architecture patterns

- **Event-driven, scale-to-zero agent process.** "When nothing is happening, nothing runs." A trigger wakes the server-side agent process, which loads state, works, saves each step, and stops after 2 idle minutes. Durable state (conversations, memory, routines, skills) is always in the server database/storage, so any trigger can bring it back.
- **Trigger fan-in → router → per-conversation queue → speak-or-stay-quiet.** Seven kinds of wake-up source feed a router that drops duplicates and picks the conversation. A queue per conversation runs one turn at a time. A final "anything worth saying?" check either sends a message to the right place or stays quiet. Every wake-up records where it came from.
- **Single output tool (SendToUser).** The agent works with many tools but talks to the user only through SendToUser, which routes to desktop, web, mobile, Slack, email or voice. Regular model text stays private, silence is allowed, messages can be rich (files, multiple choice, secure password entry), and the last message can end the turn without another model call.
- **Three-tier system.** (1) Apps and channels send input and receive live updates. (2) The server runs the entry point (checks and routes input), a queue per conversation, and the agent loop, which talks to the model and loads and saves state in the database. (3) The agent's computer runs tools (file and connector server, command runner, a desktop and Chrome per agent). Every app shows the same conversation.
- **Per-user sleeping VM.** A Firecracker VM per user runs a Debian container kept alive by a supervisor (file server, command runner, a virtual screen with Chrome per active agent). Files, tools and browser logins persist. The VM sleeps a few minutes after the last activity, never mid-turn: files sync to cloud storage, memory and disk are snapshotted, and the machine stops. It wakes on the next tool call by restoring the snapshot in place. Routines that need no tools never wake it. Because everything is saved on the server, the VM can always be rebuilt.
- **Thin client, thick server.** The agent loop is decoupled from app code: work continues with the laptop closed, users switch devices, fixes ship without App Store review, heavy work is offloaded, and the system scales. Months-long agents can't live on a device.
- **Reliable message sync.** The client shows the message optimistically and saves it locally with a unique ID; the server drops seen IDs, so retries are safe. The message is queued and the turn runs with every step saved. The server broadcasts a data-less "something changed" signal, so losing one is harmless, and every open app fetches new messages. Updates carry sequence numbers and are applied in order; on a gap the app reloads from the database. The database always has the real data.
- **Preemption and batching.** The owner's 1:1 messages and the Stop button skip the line and interrupt or stop the running turn. Everything else (group chats, Slack threads, routines, helper completions) waits in a FIFO queue. Several quick messages collapse into one turn, and the agent works on one batch at a time.
- **Main agent + helpers (orchestrator/worker).** The main agent answers quick questions and hands bigger tasks, with a complete task description, to helpers (general, computer-use, video, cloud coding). Each helper has a fresh context and returns a short report. A to-do list tracks requests, with check-on, message and stop-all controls. This keeps the main agent responsive and its context small.
- **Escalation ladder for getting things done.** What it already knows → an app's API (connector) → web search → its own signed-in browser → the full desktop → ask you. Each step is slower, more expensive and riskier. Computer use, done by a separate helper, prefers reading page structure over clicking pixels on a 1280×800 screen, and hands the screen to a person at logins, codes, captchas and payments.
- **Purpose-built approval UIs per tool.** Password autofill that never reaches the model, payment Allow/Deny cards, full email drafts with Send/Discard, and emoji reactions.
- **Layered safety.** A separate model reviews risky actions, and an unanswered approval request is blocked after 15 seconds. Untrusted-source labels go on email and webhook text, and memories count as information, not instructions. The agent asks before messaging people or creating routines. Secrets go in environment variables, and actions on the user's own laptop need approval.
- **Cache-stable prompt layout.** First comes a fixed prefix (tool definitions; system prompt with a memory and routines snapshot; first message with environment details and tool names), unchanged until the next summary. Then the append-only conversation history, then the newest message (time, notes on what changed, user message). Supporting rules: no tool additions or removals per turn (unavailable tools return errors), deploy-time tool-description changes arrive as notes, a fixed sorted build order, per-section hashing, and cache warming on chat open or typing.
- **Deferred tool schemas.** Only tool names go up front and details load on demand, leaving most of the context free.
- **Small main context through offloading.** Long outputs go to files (the path stays in context). Screenshots and tool-heavy work go to helpers (the findings or a report stay). Old messages are summarized, old memories stay searchable, and instructions become skills (a one-line pointer stays). Heavy things live outside, and only a pointer or summary comes back.
- **Idle-time compaction.** About 10 minutes after a big turn (prompt over 100,000 tokens), while the provider cache is still warm, the agent writes a summary on the same prefix, and the next message starts from it. This is skipped if background work will wake the agent anyway. The last few messages to the user are kept word for word, and an overly long turn can summarize mid-turn.
- **Tiered memory in plain files.** Profile (always in the prompt, ≤100 facts / 4,000 chars) → Log (dated; top 30 relevant recent ones in the prompt) → Notes (fade quickly) → everything else via a memory search tool. After each turn, a pass adds new facts and replaces old ones, removing only facts it was shown. Important facts rank higher and older ones slowly lower. User facts are shared across all the user's agents, and each agent writes its own file. On disk: memory/profile.md, memory/log/2026-10.md, skills/<name>/SKILL.md, routines/<name> (prompt + schedule).
- **Product–model co-evolution loops.** Inner loop, daily: a bot gets something wrong → turn it into an eval → fix the harness, prompt or inference → check evals → ship. Outer loop, every few months: train the next model on the harness and evals → swap it in → people use it in new ways (e.g. group chats full of bots) → new behaviours to evaluate and train for. Evals guide training, which runs pre-training → SFT (learns the harness) → RL (real agent tasks). The main agent is tuned for fast replies and helpers for long tasks.
