// Активная вкладка меню по имени файла
(function(){
  const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".menu a").forEach(a=>{
    const href = (a.getAttribute("href") || "").toLowerCase();
    a.classList.toggle("active", href === current);
  });
})();

// localStorage
const save = (k,v)=>localStorage.setItem(k, JSON.stringify(v));
const load = (k,f)=>{ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):f } catch { return f } };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));

// Embed-кнопки
(function(){
  document.querySelectorAll(".embedWrap").forEach(w=>w.style.display="none");
  document.querySelectorAll("[data-toggle-embed]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const box = document.getElementById(btn.dataset.toggleEmbed);
      if(!box) return;
      const show = (box.style.display==="none" || !box.style.display);
      box.style.display = show ? "block" : "none";
      btn.textContent = show ? "Скрыть" : "Показать на сайте";
    });
  });
})();

// Задания: фильтр + отметки
(function(){
  const filter = document.getElementById("levelFilter");
  const progress = document.getElementById("progressText");
  const reset = document.getElementById("resetTasks");
  const cbs = [...document.querySelectorAll("[data-task-id]")];
  if(!filter || !progress || !cbs.length) return;

  const s = load("tasks_done", {});
  cbs.forEach(cb=>{
    cb.checked = !!s[cb.dataset.taskId];
    cb.addEventListener("change", ()=>{
      const st = load("tasks_done", {});
      st[cb.dataset.taskId] = cb.checked;
      save("tasks_done", st);
      render();
    });
  });

  filter.addEventListener("change", ()=>{
    const lv = filter.value;
    document.querySelectorAll(".taskCard").forEach(card=>{
      card.style.display = (lv==="all" || card.dataset.level===lv) ? "block" : "none";
    });
  });

  reset?.addEventListener("click", ()=>{
    if(!confirm("Сбросить отметки выполнения?")) return;
    save("tasks_done", {});
    cbs.forEach(cb=>cb.checked=false);
    render();
  });

  function render(){
    const done = cbs.filter(x=>x.checked).length;
    progress.textContent = `Выполнено: ${done} из ${cbs.length}`;
  }
  render();
})();

// Диагностика: тест + история
(function(){
  const form = document.getElementById("quizForm");
  const result = document.getElementById("quizResult");
  const historyBox = document.getElementById("quizHistory");
  const clear = document.getElementById("clearHistory");
  const name = document.getElementById("studentName");
  const grade = document.getElementById("studentGrade");
  if(!form || !historyBox) return;

  const correct = { q1:"b", q2:"a", q3:"c", q4:"b", q5:"a" };

  function renderHistory(items){
    if(!items.length){
      historyBox.innerHTML = `<p class="small">История пока пустая.</p>`;
      return;
    }
    historyBox.innerHTML = `
      <table class="table">
        <thead><tr><th>Дата</th><th>Ученик</th><th>Класс</th><th>Результат</th></tr></thead>
        <tbody>
          ${items.slice(0,12).map(r=>{
            const d = new Date(r.ts);
            return `<tr>
              <td>${d.toLocaleString()}</td>
              <td>${esc(r.name)}</td>
              <td>${esc(r.grade)}</td>
              <td>${r.score}/${r.total} (${r.percent}%)</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>`;
  }

  let hist = load("quiz_history", []);
  renderHistory(hist);

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const data = new FormData(form);
    let score = 0;
    Object.keys(correct).forEach(k=>{ if(data.get(k)===correct[k]) score++; });
    const total = 5;
    const percent = Math.round(score/total*100);

    const rec = {
      ts: new Date().toISOString(),
      name: (name?.value || "Ученик").trim(),
      grade: grade?.value || "",
      score, total, percent
    };

    hist = load("quiz_history", []);
    hist.unshift(rec);
    save("quiz_history", hist);

    result.innerHTML = `
      <div class="notice">
        <b>Результат:</b> ${score}/${total} (${percent}%)<br>
        <span class="small">Сохранено на этом устройстве.</span>
      </div>`;
    renderHistory(hist);
    form.reset();
  });

  clear?.addEventListener("click", ()=>{
    if(!confirm("Очистить историю диагностики?")) return;
    save("quiz_history", []);
    hist = [];
    renderHistory(hist);
    result.innerHTML = "";
  });
})();
