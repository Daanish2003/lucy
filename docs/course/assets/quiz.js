// Reusable quiz + free-recall widgets. Markup:
//   <div class="quiz">
//     <div class="q" data-answer="1">          (0-based index of the right option)
//       <p class="prompt">Question?</p>
//       <button class="opt">A</button> <button class="opt">B</button> ...
//       <div class="why">Explanation shown after answering.</div>
//     </div>
//     <p class="quiz-score"></p>
//   </div>
//   <div class="recall"><textarea></textarea><button class="reveal">Reveal</button><div class="answer">...</div></div>
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".quiz").forEach((quiz) => {
    const qs = [...quiz.querySelectorAll(".q")];
    const score = quiz.querySelector(".quiz-score");
    let right = 0, answered = 0;
    const update = () => { if (score) score.textContent = `${right} / ${answered} correct (${qs.length} total)`; };
    qs.forEach((q) => {
      const answer = Number(q.dataset.answer);
      const opts = [...q.querySelectorAll("button.opt")];
      opts.forEach((btn, i) => btn.addEventListener("click", () => {
        opts.forEach((b) => (b.disabled = true));
        opts[answer].classList.add("right");
        if (i !== answer) btn.classList.add("wrong"); else right++;
        answered++;
        q.classList.add("done");
        update();
      }));
    });
    update();
  });
  document.querySelectorAll(".recall").forEach((r) => {
    r.querySelector("button.reveal")?.addEventListener("click", () => r.classList.add("shown"));
  });
});
