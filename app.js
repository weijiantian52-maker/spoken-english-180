const curriculum = window.SPOKEN_ENGLISH_CURRICULUM;
const videos = window.SPOKEN_ENGLISH_VIDEOS;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const STORAGE_KEY = "spokenEnglishV2";

const emptyState = () => ({
  version: 2,
  onboarded: false,
  timeMode: 30,
  completedDays: [],
  days: {},
  expressions: [],
  conversationCount: 0,
  longestAnswerWords: 0,
  selectedVideo: 0
});

function readState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved?.version === 2) return { ...emptyState(), ...saved };
  } catch {}

  const next = emptyState();
  try {
    const previous = JSON.parse(localStorage.getItem("spokenEnglishState") || "null");
    if (previous) {
      next.completedDays = [...new Set((previous.completedDays || []).map(Number).filter(day => day >= 1 && day <= 30))].sort((a, b) => a - b);
      (previous.journals || []).forEach((entry, index) => {
        if (!entry.english) return;
        next.expressions.push({
          id: `migrated-${Date.now()}-${index}`,
          cn: entry.chinese || "来自以前的小日记",
          en: entry.english,
          createdDay: 1,
          repetitions: 0,
          dueDay: 1,
          createdAt: entry.date || new Date().toISOString()
        });
      });
    }
  } catch {}
  return next;
}

let state = readState();
let currentDay = Math.min(state.completedDays.length + 1, 30);
let activeExpressionFilter = "all";
let localVideoUrl = "";

function dayState(day = currentDay) {
  state.days[day] ||= { listened: false, mastered: [], personalSaved: false, answer: "", reviewDone: false };
  return state.days[day];
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value = "") {
  return value.replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2300);
}

function speak(text, rate = .86, onEnd) {
  if (!("speechSynthesis" in window)) return showToast("当前浏览器不支持语音播放");
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  if (onEnd) utterance.onend = onEnd;
  speechSynthesis.speak(utterance);
}

function speakSequence(lines, index = 0) {
  if (index >= lines.length) {
    dayState().listened = true;
    saveState();
    renderTodayStatus();
    showToast("今天的5句已经听完");
    return;
  }
  speak(lines[index], .82, () => speakSequence(lines, index + 1));
}

function dueExpressions() {
  return state.expressions.filter(expression => Number(expression.dueDay || 1) <= currentDay);
}

function requirements() {
  const daily = dayState();
  const answerWords = daily.answer.trim().split(/\s+/).filter(Boolean).length;
  const due = dueExpressions().length;
  const phraseTarget = state.timeMode === 15 ? 2 : 5;
  const answerTarget = state.timeMode === 60 ? 15 : state.timeMode === 30 ? 8 : 1;
  const items = [
    { label: "连续听完今天的5句", done: daily.listened },
    { label: `会说至少 ${phraseTarget} 句`, done: daily.mastered.length >= phraseTarget },
    { label: "保存1条自己的表达", done: daily.personalSaved },
    { label: answerTarget === 1 ? "完成1次英文回答" : `回答达到 ${answerTarget} 个英文词`, done: answerWords >= answerTarget }
  ];
  if (state.timeMode >= 30) items.push({ label: due ? `完成 ${due} 条到期复习` : "今天没有到期复习", done: due === 0 || daily.reviewDone });
  return items;
}

function setView(viewId) {
  document.querySelectorAll(".nav-item, .view").forEach(element => element.classList.remove("active"));
  document.querySelector(`.nav-item[data-view="${viewId}"]`)?.classList.add("active");
  document.querySelector(`#${viewId}`)?.classList.add("active");
  if (viewId === "expressions") renderExpressions();
  if (viewId === "progress") renderProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".nav-item").forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));

function renderToday() {
  const lesson = curriculum[currentDay - 1];
  const daily = dayState();
  document.querySelector("#heroDayNumber").textContent = String(currentDay).padStart(2, "0");
  document.querySelector("#dayLabel").textContent = `第 ${currentDay} 天 / 30 天${lesson.assessment ? " · 阶段复测" : ""}`;
  document.querySelector("#todayTitle").textContent = lesson.theme;
  document.querySelector("#todayFocus").textContent = `今天只做好一件事：${lesson.focus}。`;
  document.querySelector("#todayOutcome").textContent = lesson.outcome;
  document.querySelector("#coachQuestion").textContent = lesson.question;
  document.querySelector("#conversationQuestion").textContent = lesson.question;
  document.querySelector("#conversationAnswer").value = daily.answer || "";

  document.querySelector("#todayPhrases").innerHTML = lesson.phrases.map(([english, chinese], index) => `
    <div class="phrase-row">
      <button data-speak-phrase="${index}" aria-label="播放第${index + 1}句">${String(index + 1).padStart(2, "0")}</button>
      <div class="phrase-copy"><strong>${escapeHtml(english)}</strong><span>${escapeHtml(chinese)}</span></div>
      <button class="master-button ${daily.mastered.includes(index) ? "active" : ""}" data-master-phrase="${index}">${daily.mastered.includes(index) ? "已经会说" : "我会说了"}</button>
    </div>`).join("");

  document.querySelector("#phraseTemplates").innerHTML = lesson.phrases.map(([english, chinese], index) => `
    <button data-template-index="${index}">从第${index + 1}句开始改</button>`).join("");

  document.querySelectorAll("[data-speak-phrase]").forEach(button => button.addEventListener("click", () => speak(lesson.phrases[Number(button.dataset.speakPhrase)][0])));
  document.querySelectorAll("[data-master-phrase]").forEach(button => button.addEventListener("click", () => {
    const index = Number(button.dataset.masterPhrase);
    const mastered = dayState().mastered;
    const position = mastered.indexOf(index);
    if (position >= 0) mastered.splice(position, 1); else mastered.push(index);
    saveState();
    renderToday();
  }));
  document.querySelectorAll("[data-template-index]").forEach(button => button.addEventListener("click", () => {
    const [english, chinese] = lesson.phrases[Number(button.dataset.templateIndex)];
    document.querySelector("#personalChinese").value = chinese;
    document.querySelector("#personalEnglish").value = english;
    document.querySelector("#personalEnglish").focus();
  }));

  renderTimeMode();
  renderDueReview();
  renderTodayStatus();
}

function renderTimeMode() {
  document.querySelectorAll("[data-minutes]").forEach(button => button.classList.toggle("active", Number(button.dataset.minutes) === state.timeMode));
  const descriptions = {
    15: "完成2句跟读、1条个人表达和1次简短回答。",
    30: "完成5句跟读、1条个人表达、1轮对话和到期复习。",
    60: "完成全部训练，并把对话回答扩展到15个英文词。"
  };
  document.querySelector("#timePlanDescription").textContent = descriptions[state.timeMode];
}

document.querySelectorAll("[data-minutes]").forEach(button => button.addEventListener("click", () => {
  state.timeMode = Number(button.dataset.minutes);
  saveState();
  renderTimeMode();
  renderTodayStatus();
}));

document.querySelector("#listenQuestion").addEventListener("click", () => speak(curriculum[currentDay - 1].question, .8));
document.querySelector("#listenAll").addEventListener("click", () => {
  dayState().listened = true;
  saveState();
  renderTodayStatus();
  speakSequence(curriculum[currentDay - 1].phrases.map(phrase => phrase[0]));
});

document.querySelector("#saveExpression").addEventListener("click", () => {
  const cn = document.querySelector("#personalChinese").value.trim();
  const en = document.querySelector("#personalEnglish").value.trim();
  if (!cn || !en) return showToast("请先填写中文和英文");
  state.expressions.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    cn,
    en,
    createdDay: currentDay,
    repetitions: 0,
    dueDay: currentDay + 1,
    createdAt: new Date().toISOString()
  });
  dayState().personalSaved = true;
  document.querySelector("#personalChinese").value = "";
  document.querySelector("#personalEnglish").value = "";
  saveState();
  renderTodayStatus();
  showToast("已保存，明天会安排第一次复习");
});

document.querySelector("#listenPersonal").addEventListener("click", () => {
  const english = document.querySelector("#personalEnglish").value.trim();
  if (!english) return showToast("请先填写英文");
  speak(english);
});

document.querySelector("#saveAnswer").addEventListener("click", () => {
  const answer = document.querySelector("#conversationAnswer").value.trim();
  if (!answer) return showToast("先用英文回答这一问");
  const words = answer.split(/\s+/).filter(Boolean).length;
  const previousAnswer = dayState().answer;
  dayState().answer = answer;
  if (!previousAnswer) state.conversationCount += 1;
  state.longestAnswerWords = Math.max(state.longestAnswerWords, words);
  saveState();
  document.querySelector("#answerFeedback").textContent = words < 8
    ? `这次说了 ${words} 个英文词。意思已经表达出来，下一次再补充一个细节。`
    : `这次连续说了 ${words} 个英文词。已经形成完整回答，可以再听一遍后重说。`;
  renderTodayStatus();
  showToast("这次回答已经记录");
});

document.querySelector("#recordAnswer").addEventListener("click", () => {
  if (!SpeechRecognition) return showToast("请使用 Chrome 或 Edge，并允许麦克风权限");
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  const button = document.querySelector("#recordAnswer");
  button.textContent = "正在听…";
  button.disabled = true;
  recognition.onresult = event => { document.querySelector("#conversationAnswer").value = event.results[0][0].transcript; };
  recognition.onerror = () => showToast("没有听清，请再说一次");
  recognition.onend = () => { button.textContent = "开始说"; button.disabled = false; };
  recognition.start();
});

function reviewExpression(id, remembered) {
  const expression = state.expressions.find(item => item.id === id);
  if (!expression) return;
  if (remembered) expression.repetitions = Number(expression.repetitions || 0) + 1;
  const intervals = [1, 2, 4, 7, 14];
  expression.dueDay = currentDay + (remembered ? intervals[Math.min(expression.repetitions, intervals.length - 1)] : 1);
  expression.lastReviewedDay = currentDay;
  if (!dueExpressions().length) dayState().reviewDone = true;
  saveState();
  renderDueReview();
  renderTodayStatus();
}

function renderDueReview() {
  const due = dueExpressions();
  const container = document.querySelector("#dueReview");
  if (!due.length) {
    dayState().reviewDone = true;
    container.innerHTML = `<div class="review-empty">今天没有到期表达。保存的新表达会从明天开始复习。</div>`;
    return;
  }
  dayState().reviewDone = false;
  container.innerHTML = due.map(expression => `
    <article class="review-card">
      <div><strong>${escapeHtml(expression.en)}</strong><span>${escapeHtml(expression.cn)}</span></div>
      <div class="review-actions">
        <button data-review-listen="${expression.id}">听</button>
        <button data-review-again="${expression.id}">还不熟</button>
        <button data-review-remember="${expression.id}">记住了</button>
      </div>
    </article>`).join("");
  document.querySelectorAll("[data-review-listen]").forEach(button => button.addEventListener("click", () => speak(state.expressions.find(item => item.id === button.dataset.reviewListen)?.en || "")));
  document.querySelectorAll("[data-review-again]").forEach(button => button.addEventListener("click", () => reviewExpression(button.dataset.reviewAgain, false)));
  document.querySelectorAll("[data-review-remember]").forEach(button => button.addEventListener("click", () => reviewExpression(button.dataset.reviewRemember, true)));
}

function renderTodayStatus() {
  const daily = dayState();
  const due = dueExpressions();
  const answerWords = daily.answer.trim().split(/\s+/).filter(Boolean).length;
  document.querySelector("#listenStatus").textContent = daily.listened ? "已完成" : "未开始";
  document.querySelector("#phraseStatus").textContent = `${daily.mastered.length} / 5`;
  document.querySelector("#personalStatus").textContent = daily.personalSaved ? "已保存" : "未保存";
  document.querySelector("#conversationStatus").textContent = answerWords ? `${answerWords} 个词` : "未回答";
  document.querySelector("#reviewStatus").textContent = due.length ? `${due.length} 条到期` : "无需复习";
  document.querySelector('[data-step="listen"]').classList.toggle("completed", daily.listened);
  document.querySelector('[data-step="phrases"]').classList.toggle("completed", daily.mastered.length >= (state.timeMode === 15 ? 2 : 5));
  document.querySelector('[data-step="personal"]').classList.toggle("completed", daily.personalSaved);
  document.querySelector('[data-step="conversation"]').classList.toggle("completed", Boolean(daily.answer));
  document.querySelector('[data-step="review"]').classList.toggle("completed", due.length === 0 || daily.reviewDone);

  const items = requirements();
  const done = items.filter(item => item.done).length;
  const percent = Math.round(done / items.length * 100);
  document.querySelector("#completionPercent").textContent = `${percent}%`;
  document.querySelector("#completionText").textContent = percent === 100 ? "今天可以完成" : done ? `已完成 ${done} / ${items.length} 项` : "还没有开始";
  document.querySelector("#requirementList").innerHTML = items.map(item => `<div class="requirement-item ${item.done ? "done" : ""}">${item.label}</div>`).join("");
  const completeButton = document.querySelector("#completeDay");
  completeButton.disabled = percent < 100 || state.completedDays.includes(currentDay);
  completeButton.textContent = state.completedDays.includes(currentDay) ? "今天已完成" : currentDay === 30 ? "完成30天阶段" : "完成今天";
  renderHeaderProgress();
}

document.querySelector("#completeDay").addEventListener("click", () => {
  if (!requirements().every(item => item.done)) return showToast("还有学习步骤没有完成");
  if (!state.completedDays.includes(currentDay)) state.completedDays.push(currentDay);
  state.completedDays.sort((a, b) => a - b);
  saveState();
  if (currentDay === 30) {
    renderTodayStatus();
    showToast("30天第一阶段完成了！");
    setView("progress");
    return;
  }
  currentDay = Math.min(state.completedDays.length + 1, 30);
  renderToday();
  renderProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
  showToast(`已经进入第 ${currentDay} 天`);
});

function renderHeaderProgress() {
  const completed = state.completedDays.length;
  document.querySelector("#headerProgressText").textContent = completed >= 30 ? "第一阶段完成" : `第 ${currentDay} 天`;
  document.querySelector("#headerProgressRing").style.setProperty("--progress", `${Math.min(completed / 30 * 360, 360)}deg`);
}

function expressionDateLabel(expression) {
  if (Number(expression.dueDay || 1) <= currentDay) return "今天需要复习";
  return `第 ${expression.dueDay} 天复习`;
}

function renderExpressions() {
  const due = dueExpressions();
  const mastered = state.expressions.filter(expression => Number(expression.repetitions || 0) >= 3);
  document.querySelector("#expressionTotal").textContent = state.expressions.length;
  document.querySelector("#expressionDue").textContent = due.length;
  document.querySelector("#expressionMastered").textContent = mastered.length;
  const visible = state.expressions.filter(expression => {
    if (activeExpressionFilter === "due") return Number(expression.dueDay || 1) <= currentDay;
    if (activeExpressionFilter === "mastered") return Number(expression.repetitions || 0) >= 3;
    return true;
  });
  const library = document.querySelector("#expressionLibrary");
  if (!visible.length) {
    library.innerHTML = `<div class="empty-state">${state.expressions.length ? "这个分类里还没有表达。" : "完成今天的第03步后，你的第一条个人表达会出现在这里。"}</div>`;
    return;
  }
  library.innerHTML = visible.map(expression => `
    <article class="expression-card">
      <span class="review-count">${String(Number(expression.repetitions || 0)).padStart(2, "0")}</span>
      <div class="expression-copy">
        <strong>${escapeHtml(expression.en)}</strong><span>${escapeHtml(expression.cn)}</span>
        <div class="expression-meta">${expressionDateLabel(expression)} · 已复习 ${Number(expression.repetitions || 0)} 次</div>
      </div>
      <div class="expression-actions">
        <button data-library-listen="${expression.id}">听发音</button>
        <button class="primary" data-library-review="${expression.id}">记住了</button>
        <button data-library-delete="${expression.id}">删除</button>
      </div>
    </article>`).join("");
  document.querySelectorAll("[data-library-listen]").forEach(button => button.addEventListener("click", () => speak(state.expressions.find(item => item.id === button.dataset.libraryListen)?.en || "")));
  document.querySelectorAll("[data-library-review]").forEach(button => button.addEventListener("click", () => { reviewExpression(button.dataset.libraryReview, true); renderExpressions(); }));
  document.querySelectorAll("[data-library-delete]").forEach(button => button.addEventListener("click", () => {
    state.expressions = state.expressions.filter(item => item.id !== button.dataset.libraryDelete);
    saveState();
    renderExpressions();
  }));
}

document.querySelectorAll("[data-expression-filter]").forEach(button => button.addEventListener("click", () => {
  activeExpressionFilter = button.dataset.expressionFilter;
  document.querySelectorAll("[data-expression-filter]").forEach(item => item.classList.toggle("active", item === button));
  renderExpressions();
}));

function selectVideo(index) {
  state.selectedVideo = index;
  saveState();
  const video = videos[index];
  const player = document.querySelector("#immersionVideo");
  if (localVideoUrl) { URL.revokeObjectURL(localVideoUrl); localVideoUrl = ""; }
  player.src = video.src;
  document.querySelector("#videoTitle").textContent = video.title;
  document.querySelector("#videoNote").textContent = video.note;
  document.querySelector("#videoSource").href = video.page;
  document.querySelectorAll(".video-option").forEach((button, position) => button.classList.toggle("active", position === index));
}

function renderVideos() {
  document.querySelector("#videoList").innerHTML = videos.map((video, index) => `
    <button class="video-option ${index === state.selectedVideo ? "active" : ""}" data-video-index="${index}">
      <span>${String(index + 1).padStart(2, "0")}</span><span><strong>${video.title}</strong><small>${video.note}</small></span>
    </button>`).join("");
  document.querySelectorAll("[data-video-index]").forEach(button => button.addEventListener("click", () => selectVideo(Number(button.dataset.videoIndex))));
  selectVideo(Math.min(Number(state.selectedVideo || 0), videos.length - 1));
}

document.querySelector("#localVideo").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;
  if (localVideoUrl) URL.revokeObjectURL(localVideoUrl);
  localVideoUrl = URL.createObjectURL(file);
  document.querySelector("#immersionVideo").src = localVideoUrl;
  document.querySelector("#videoTitle").textContent = file.name;
  document.querySelector("#videoNote").textContent = "本机视频 · 不会上传";
  document.querySelector("#videoSource").removeAttribute("href");
  document.querySelector("#videoSource").textContent = "本机视频";
  document.querySelectorAll(".video-option").forEach(button => button.classList.remove("active"));
});

function renderProgress() {
  document.querySelector("#metricDays").textContent = `${state.completedDays.length} 天`;
  document.querySelector("#metricExpressions").textContent = `${state.expressions.length} 句`;
  document.querySelector("#metricLongest").textContent = `${state.longestAnswerWords} 词`;
  document.querySelector("#metricConversations").textContent = `${state.conversationCount} 次`;
  const assessmentDays = [7, 14, 21, 28, 30];
  document.querySelector("#assessmentGrid").innerHTML = assessmentDays.map(day => {
    const lesson = curriculum[day - 1];
    const done = state.completedDays.includes(day);
    return `<article class="assessment-card ${done ? "done" : ""}"><span>第 ${day} 天</span><strong>${lesson.theme}</strong><small>${done ? "已完成" : lesson.outcome}</small></article>`;
  }).join("");
  document.querySelector("#dayMap").innerHTML = curriculum.map((lesson, index) => {
    const day = index + 1;
    const done = state.completedDays.includes(day);
    const current = day === currentDay && !done;
    return `<button class="map-day ${done ? "done" : ""} ${current ? "current" : ""}" title="第${day}天：${escapeHtml(lesson.theme)}" ${day > currentDay || done ? "disabled" : ""}>${day}</button>`;
  }).join("");
}

function initializeOnboarding() {
  const modal = document.querySelector("#onboarding");
  modal.hidden = state.onboarded;
  let selected = state.timeMode;
  document.querySelectorAll("[data-onboard-minutes]").forEach(button => {
    button.classList.toggle("active", Number(button.dataset.onboardMinutes) === selected);
    button.addEventListener("click", () => {
      selected = Number(button.dataset.onboardMinutes);
      document.querySelectorAll("[data-onboard-minutes]").forEach(item => item.classList.toggle("active", item === button));
    });
  });
  document.querySelector("#finishOnboarding").addEventListener("click", () => {
    state.timeMode = selected;
    state.onboarded = true;
    saveState();
    modal.hidden = true;
    renderToday();
  });
}

renderToday();
renderExpressions();
renderVideos();
renderProgress();
initializeOnboarding();
