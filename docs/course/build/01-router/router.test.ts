import { test } from "node:test";
import assert from "node:assert/strict";
import { createRouter } from "./router.ts";
import type { Wake } from "./router.ts";

const wake = (id: string, over: Partial<Wake> = {}): Wake => ({
  id, source: "slack", conversationId: "c1", trusted: false, payload: id, ...over,
});
const owner = (id: string, conversationId = "c1"): Wake =>
  wake(id, { source: "owner", trusted: true, conversationId });

// A fake turn you can finish by hand. Rejects when aborted, like a real turn would.
function fakeTurns() {
  const calls: { conversationId: string; ids: string[]; signal: AbortSignal; finish: () => void }[] = [];
  const runTurn = (conversationId: string, batch: Wake[], signal: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
      signal.addEventListener("abort", () => reject(new Error("aborted")));
      calls.push({ conversationId, ids: batch.map((w) => w.id), signal, finish: resolve });
    });
  return { calls, runTurn };
}
const flush = async () => { for (let i = 0; i < 10; i++) await new Promise((r) => setImmediate(r)); };

test("drops a wake whose id it has already seen (retries are safe)", async () => {
  const { calls, runTurn } = fakeTurns();
  const router = createRouter(runTurn);
  assert.equal(router.submit(wake("evt-1")), true);
  await flush();
  calls[0].finish();
  await flush();
  assert.equal(router.submit(wake("evt-1")), false);
  await flush();
  assert.equal(calls.length, 1);
});

test("runs one turn at a time per conversation", async () => {
  const { calls, runTurn } = fakeTurns();
  const router = createRouter(runTurn);
  router.submit(wake("a"));
  router.submit(wake("b"));
  await flush();
  assert.equal(calls.length, 1, "a second turn started while the first was still running");
});

test("batches everything that arrived during a turn into the next single turn", async () => {
  const { calls, runTurn } = fakeTurns();
  const router = createRouter(runTurn);
  router.submit(wake("a"));
  await flush();
  router.submit(wake("b"));
  router.submit(wake("c"));
  await flush();
  calls[0].finish();
  await flush();
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1].ids, ["b", "c"]);
});

test("runs different conversations in parallel", async () => {
  const { calls, runTurn } = fakeTurns();
  const router = createRouter(runTurn);
  router.submit(wake("a", { conversationId: "c1" }));
  router.submit(wake("x", { conversationId: "c2" }));
  await flush();
  assert.deepEqual(calls.map((c) => c.conversationId).sort(), ["c1", "c2"]);
});

test("other senders never abort a running turn", async () => {
  const { calls, runTurn } = fakeTurns();
  const router = createRouter(runTurn);
  router.submit(wake("a"));
  await flush();
  router.submit(wake("b", { source: "schedule" }));
  await flush();
  assert.equal(calls[0].signal.aborted, false);
});

test("an owner message skips the line: aborts the running turn and goes first", async () => {
  const { calls, runTurn } = fakeTurns();
  const router = createRouter(runTurn);
  router.submit(wake("a"));
  await flush();
  router.submit(wake("b"));
  router.submit(owner("o1"));
  router.submit(owner("o2"));
  await flush();
  assert.equal(calls[0].signal.aborted, true, "running turn was not aborted");
  assert.equal(calls.length, 2, "expected exactly one new turn after the abort");
  assert.deepEqual(calls[1].ids, ["o1", "o2", "b"], "owner messages first, in order, then everyone else");
});

test("an aborted turn must settle before the next one starts", async () => {
  const { calls, runTurn } = fakeTurns();
  // A turn that takes a moment to notice the abort (it's mid tool call, saving a step).
  const slow = (id: string, batch: Wake[], signal: AbortSignal) =>
    new Promise<void>((resolve) => {
      signal.addEventListener("abort", () => setTimeout(resolve, 20));
      calls.push({ conversationId: id, ids: batch.map((w) => w.id), signal, finish: resolve });
    });
  const router = createRouter((c, b, s) => (calls.length === 0 ? slow(c, b, s) : runTurn(c, b, s)));
  router.submit(wake("a"));
  await flush();
  router.submit(owner("o1"));
  await flush();
  assert.equal(calls.length, 1, "started a new turn while the aborted one was still saving");
  await new Promise((r) => setTimeout(r, 40));
  assert.equal(calls.length, 2);
});
