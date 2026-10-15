// Wake-cost calculator. Markup: <div class="wake-cost"></div>
// Estimates monthly model input cost of periodic wake-ups (heartbeats or schedules).
// Price is an input on purpose: look it up on your provider's pricing page.
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".wake-cost").forEach((el) => {
    const fields = [
      ["users", "Users", 1000],
      ["interval", "Minutes between wake-ups", 30],
      ["hours", "Active hours per day", 16],
      ["tokens", "Input tokens per wake-up", 20000],
      ["price", "$ per million input tokens (your model)", 3],
      ["cached", "% of input served from prompt cache", 0],
      ["cacheDiscount", "Cache read price, % of normal", 10],
    ];
    el.innerHTML =
      `<div class="wc-grid">${fields.map(([k, label, v]) =>
        `<label>${label}<input type="number" min="0" step="any" data-k="${k}" value="${v}"></label>`).join("")}</div>
       <p class="wc-out"></p>`;
    const out = el.querySelector(".wc-out");
    const calc = () => {
      const v = {};
      el.querySelectorAll("input").forEach((i) => (v[i.dataset.k] = Number(i.value) || 0));
      const wakesPerDay = v.interval > 0 ? (v.hours * 60) / v.interval : 0;
      const effective = v.tokens * ((1 - v.cached / 100) + (v.cached / 100) * (v.cacheDiscount / 100));
      const perUserMonth = (wakesPerDay * 30 * effective * v.price) / 1e6;
      const total = perUserMonth * v.users;
      const fmt = (n) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });
      out.innerHTML = `<strong>${fmt(wakesPerDay)}</strong> wake-ups per user per day → <strong>$${fmt(perUserMonth)}</strong> per user per month → <strong>$${fmt(total)}</strong> per month for all users, <em>before anything useful happens</em>.`;
    };
    el.addEventListener("input", calc);
    calc();
  });
});
