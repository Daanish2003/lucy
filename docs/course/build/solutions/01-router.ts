// Reference solution for Exercise 1. Try the exercise before reading this.
import type { RunTurn, Wake } from "../01-router/router.ts";

const isOwner = (w: Wake) => w.source === "owner" && w.trusted;

export function createRouter(runTurn: RunTurn) {
  // In production this is a unique constraint in the database, not memory.
  const seen = new Set<string>();
  const conversations = new Map<string, { pending: Wake[]; running: AbortController | null; draining: boolean }>();

  async function drain(conversationId: string) {
    const conv = conversations.get(conversationId)!;
    conv.draining = true;
    while (conv.pending.length) {
      const batch = conv.pending.splice(0); // everything that arrived so far becomes one turn
      conv.running = new AbortController();
      try {
        await runTurn(conversationId, batch, conv.running.signal);
      } catch {
        // Aborted or failed. Each step was saved as it ran, so there is nothing to undo here.
      }
      conv.running = null;
    }
    conv.draining = false;
  }

  return {
    submit(wake: Wake): boolean {
      if (seen.has(wake.id)) return false;
      seen.add(wake.id);

      let conv = conversations.get(wake.conversationId);
      if (!conv) conversations.set(wake.conversationId, (conv = { pending: [], running: null, draining: false }));

      if (isOwner(wake)) {
        // Skip the line: after earlier owner messages, before everyone else.
        conv.pending.splice(conv.pending.findLastIndex(isOwner) + 1, 0, wake);
        conv.running?.abort();
      } else {
        conv.pending.push(wake);
      }

      if (!conv.draining) void drain(wake.conversationId);
      return true;
    },
  };
}
