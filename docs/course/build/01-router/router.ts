// Exercise 1 (Lesson 3): the router and per-conversation queue.
// Run the tests:  node --test build/01-router/router.test.ts   (Node 24 runs .ts directly)
// Make every test pass without changing router.test.ts.

export type Wake = {
  id: string; // dedupe key: provider event id, client message id, `${routineId}:${scheduledFor}`
  source: "owner" | "slack" | "github" | "webhook" | "schedule" | "heartbeat" | "background";
  conversationId: string;
  trusted: boolean; // the owner's own words vs. outside content
  payload: string;
};

// One turn of the agent loop (model -> tools -> repeat), saving each step as it goes.
// It should stop early when `signal` is aborted.
export type RunTurn = (conversationId: string, batch: Wake[], signal: AbortSignal) => Promise<void>;

export function createRouter(runTurn: RunTurn) {
  return {
    // Returns false if the wake was dropped as a duplicate.
    submit(wake: Wake): boolean {
      // Week-one behaviour: every wake immediately runs its own turn.
      void runTurn(wake.conversationId, [wake], new AbortController().signal).catch(() => {});
      return true;
    },
  };
}
