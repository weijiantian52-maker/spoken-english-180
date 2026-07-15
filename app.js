const dailyLessons = [
  { theme: "认识新朋友", lead: "今天只学会", focus: "介绍自己", video: 0, phrases: [
    { en: "Hi, my name is Tevin.", cn: "你好，我叫 Tevin。" }, { en: "Nice to meet you.", cn: "很高兴认识你。" },
    { en: "I am from China.", cn: "我来自中国。" }, { en: "I live in New York.", cn: "我住在纽约。" },
    { en: "I am learning English.", cn: "我正在学习英语。" }
  ]},
  { theme: "自然打招呼", lead: "今天学会", focus: "把寒暄接下去", video: 1, phrases: [
    { en: "Hi! How are you?", cn: "嗨！你好吗？" }, { en: "I'm good, thanks.", cn: "我很好，谢谢。" },
    { en: "How about you?", cn: "你呢？" }, { en: "It's good to see you.", cn: "很高兴见到你。" },
    { en: "Have a great day.", cn: "祝你今天愉快。" }
  ]},
  { theme: "说清楚地点", lead: "今天学会", focus: "说我在哪里", video: 2, phrases: [
    { en: "I'm here.", cn: "我在这里。" }, { en: "I'm at home now.", cn: "我现在在家。" },
    { en: "I'm on my way.", cn: "我正在路上。" }, { en: "It's near my office.", cn: "它在我办公室附近。" },
    { en: "Where are you now?", cn: "你现在在哪里？" }
  ]},
  { theme: "问清楚事物", lead: "今天学会", focus: "问这是什么", video: 3, phrases: [
    { en: "What is this?", cn: "这是什么？" }, { en: "It's my phone.", cn: "这是我的手机。" },
    { en: "Is this yours?", cn: "这是你的吗？" }, { en: "I don't know what it is.", cn: "我不知道这是什么。" },
    { en: "Can you show me?", cn: "你能给我看看吗？" }
  ]},
  { theme: "问路与位置", lead: "今天学会", focus: "问人在哪里", video: 4, phrases: [
    { en: "Where are you?", cn: "你在哪里？" }, { en: "I'm near the entrance.", cn: "我在入口附近。" },
    { en: "Go straight ahead.", cn: "一直往前走。" }, { en: "Turn left here.", cn: "在这里左转。" },
    { en: "I can meet you there.", cn: "我可以在那里见你。" }
  ]},
  { theme: "在陌生地方求助", lead: "今天学会", focus: "礼貌地问路", video: 5, phrases: [
    { en: "Excuse me, can you help me?", cn: "打扰一下，你能帮我吗？" }, { en: "Where is the gym?", cn: "健身房在哪里？" },
    { en: "Is it far from here?", cn: "离这里远吗？" }, { en: "Could you say that again?", cn: "你能再说一遍吗？" },
    { en: "Thank you for your help.", cn: "谢谢你的帮助。" }
  ]},
  { theme: "一周复习", lead: "今天不学新句子", focus: "把旧句说顺", video: 0, phrases: [
    { en: "Let me introduce myself.", cn: "让我介绍一下自己。" }, { en: "How about you?", cn: "你呢？" },
    { en: "I'm on my way.", cn: "我正在路上。" }, { en: "Can you show me?", cn: "你能给我看看吗？" },
    { en: "Could you say that again?", cn: "你能再说一遍吗？" }
  ]}
];

const months = [
  { phase: "生存表达", title: "先把自己说清楚", goal: "能自我介绍、回答基础问题，完成 2 分钟对话。", topics: ["发音与高频句型", "姓名、工作、家人", "求助与请求重复"] },
  { phase: "生活交流", title: "处理每天的事情", goal: "能在餐厅、商店、交通和电话场景中完成任务。", topics: ["点餐与购物", "时间、地点、数量", "描述简单问题"] },
  { phase: "连续表达", title: "从句子变成一段话", goal: "能描述一天、兴趣和计划，持续说 5 分钟。", topics: ["日记语言体系", "连接词与时间顺序", "听后复述"] },
  { phase: "真实互动", title: "让对话继续下去", goal: "能追问、确认、表达感受并应对意外情况。", topics: ["提出后续问题", "确认与澄清", "看医生与解决问题"] },
  { phase: "讲述观点", title: "讲经历，也讲想法", goal: "能讲完整经历、比较选择并解释自己的观点。", topics: ["过去经历", "理由与例子", "同意和不同意"] },
  { phase: "流利整合", title: "进入真实交流", goal: "在熟悉场景中持续交流 15 分钟以上。", topics: ["正常语速与不同口音", "高压情景复测", "薄弱表达修正"] }
];

const tasks = [
  { title: "看完今天的视频", detail: "第一遍听大意，第二遍暂停跟读" },
  { title: "跟读 5 个句子", detail: "每句话大声说至少 3 遍" },
  { title: "写下今天的双语日记", detail: "3—5 句真实想说的话，保存后循环听" },
  { title: "完成 1 轮情景对话", detail: "允许犯错，但不能只在心里回答" },
  { title: "复习到期的个人表达", detail: "第一天可以直接勾选" }
];

const scenarios = [
  { title: "第一次见面", meta: "第 1 月 · 自我介绍", level: "第 1 月 · A1", questions: ["Hi! Nice to meet you. What's your name?", "Where are you from?", "What do you do?", "What do you like to do in your free time?"] },
  { title: "在咖啡店点单", meta: "第 2 月 · 生活任务", level: "第 2 月 · A1-A2", questions: ["Hello! What would you like to drink?", "What size would you like?", "Would you like anything to eat?", "Is that for here or to go?"] },
  { title: "介绍自己的一天", meta: "第 3 月 · 连续表达", level: "第 3 月 · A2", questions: ["What time do you usually get up?", "What do you do in the morning?", "What is the busiest part of your day?", "What do you do before you go to bed?"] },
  { title: "遇到问题求助", meta: "第 4 月 · 解决问题", level: "第 4 月 · A2", questions: ["Hi, how can I help you today?", "When did the problem start?", "What have you tried so far?", "What would you like me to do?"] },
  { title: "表达一个观点", meta: "第 5—6 月 · 观点交流", level: "第 5—6 月 · A2-B1", questions: ["Do you think working from home is a good idea?", "Why do you think that?", "Can you give me an example?", "What might someone with a different opinion say?"] }
];

const videos = [
  { title: "VOA 初级英语：Welcome!", page: "https://learningenglish.voanews.com/a/let-s-learn-english---level-1---lesson-1-welcome-/5781394.html", src: "https://voa-video-ns.akamaized.net/pangeavideo/2021/02/5/5f/5f00c78a-0f84-41e6-949d-bd808bcadf50.mp4" },
  { title: "VOA 初级英语：Hello!", page: "https://learningenglish.voanews.com/a/lets-learn-english-lesson-2-hello/3113733.html", src: "https://voa-video-ns.akamaized.net/pangeavideo/2021/02/4/42/4298a2ba-d665-4b1c-aaa1-502bbcb9b88d_720p.mp4" },
  { title: "VOA 初级英语：I Am Here", page: "https://learningenglish.voanews.com/a/lets-learn-english-lesson-3-i-am-here/3126527.html", src: "https://voa-video-ns.akamaized.net/pangeavideo/2016/05/0/02/027f8fdd-e9b0-409c-8618-45be49fcefe8_hq.mp4" },
  { title: "VOA 初级英语：What Is It?", page: "https://learningenglish.voanews.com/a/lets-learn-english-lesson-4/3168920.html", src: "https://voa-video-ns.akamaized.net/pangeavideo/2016/05/c/c8/c829a13b-9764-4b89-ad70-1edbdc3d8013_hq.mp4" },
  { title: "VOA 初级英语：Where Are You?", page: "https://learningenglish.voanews.com/a/lets-learn-english-lesson-5-where-are-you/3168971.html", src: "https://voa-video-ns.akamaized.net/pangeavideo/2016/05/c/ce/ce630bdd-1ffd-4c63-aca7-4bdff50fc7ba_hq.mp4" },
  { title: "VOA 初级英语：Where Is the Gym?", page: "https://learningenglish.voanews.com/a/lets-learn-english-lesson-6-where-is-the-gym/3225958.html", src: "https://voa-video-ns.akamaized.net/pangeavideo/2016/05/1/17/17b61020-32a1-4021-9575-adbf9ee76979_hq.mp4" }
];

let state;
try {
  state = JSON.parse(localStorage.getItem("spokenEnglishState") || "{}");
} catch {
  state = {};
}
state.completedDays ||= [];
state.tasks ||= {};
state.journals ||= [];
state.movieLines ||= [];
state.completedDays = [...new Set(state.completedDays.map(Number).filter(day => day >= 1 && day <= 180))].sort((a, b) => a - b);
let currentDay = Math.min(state.completedDays.length + 1, 180);
let phrases = dailyLessons[(currentDay - 1) % dailyLessons.length].phrases;
let activePhrase = 0;
let journalSentences = [];
let currentJournalSentence = 0;
let journalIsPlaying = false;
let activeScenario = 0;
let activeQuestion = 0;
let conversationAnswers = [];
let activeMovieLine = 0;
let movieObjectUrl = "";
let movieStopHandler = null;
let subtitleMode = "bilingual";

function saveState() { localStorage.setItem("spokenEnglishState", JSON.stringify(state)); }
function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item, .view").forEach(el => el.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.view}`).classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

document.querySelector("#startButton").addEventListener("click", () => {
  document.querySelector("#lessonContent").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => document.querySelector("#lessonVideo").play().catch(() => {}), 500);
});

function renderTasks() {
  const taskState = state.tasks[currentDay] || [];
  document.querySelector("#taskList").innerHTML = tasks.map((task, index) => `
    <label class="task-item ${taskState[index] ? "checked" : ""}">
      <input type="checkbox" ${taskState[index] ? "checked" : ""} data-task="${index}">
      <span class="check" aria-hidden="true"></span>
      <span><strong>${task.title}</strong><span>${task.detail}</span></span>
    </label>`).join("");
  document.querySelectorAll("[data-task]").forEach(input => input.addEventListener("change", event => {
    state.tasks[currentDay] ||= [];
    state.tasks[currentDay][event.target.dataset.task] = event.target.checked;
    saveState();
    renderTasks();
  }));
}

function renderTodayLesson() {
  const lesson = dailyLessons[(currentDay - 1) % dailyLessons.length];
  phrases = lesson.phrases;
  activePhrase = 0;
  document.querySelector("#dayLabel").textContent = `第 ${currentDay} 天 / 180 天 · ${lesson.theme}`;
  document.querySelector("#todayLead").textContent = lesson.lead;
  document.querySelector("#todayFocus").textContent = lesson.focus;
  const todayVideo = videos[lesson.video];
  const video = document.querySelector("#lessonVideo");
  if (video.src !== todayVideo.src) video.src = todayVideo.src;
  document.querySelector("#videoTitle").textContent = todayVideo.title;
  document.querySelector("#sourceLink").href = todayVideo.page;
  renderTasks();
  renderPhrases();
  selectPhrase(0);
}

function speak(text) {
  if (!("speechSynthesis" in window)) return showToast("当前浏览器不支持语音播放");
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.78;
  speechSynthesis.speak(utterance);
}

function speakJournalSentence() {
  if (!journalSentences.length) return showToast("请先保存一篇英文日记");
  if (!("speechSynthesis" in window)) return showToast("当前浏览器不支持语音播放");
  speechSynthesis.cancel();
  journalIsPlaying = true;
  updateJournalPlayer();
  const utterance = new SpeechSynthesisUtterance(journalSentences[currentJournalSentence]);
  utterance.lang = "en-US";
  utterance.rate = Number(document.querySelector("#journalRate").value);
  utterance.onend = () => {
    if (!journalIsPlaying) return;
    const isLast = currentJournalSentence === journalSentences.length - 1;
    if (isLast && !document.querySelector("#journalLoop").checked) {
      journalIsPlaying = false;
      updateJournalPlayer();
      return;
    }
    currentJournalSentence = isLast ? 0 : currentJournalSentence + 1;
    updateJournalPlayer();
    setTimeout(speakJournalSentence, 450);
  };
  speechSynthesis.speak(utterance);
}

function stopJournal() {
  journalIsPlaying = false;
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  updateJournalPlayer();
}

function updateJournalPlayer() {
  const hasSentences = journalSentences.length > 0;
  document.querySelector("#sentenceCounter").textContent = hasSentences ? `第 ${currentJournalSentence + 1} 句 / 共 ${journalSentences.length} 句` : "还没有句子";
  document.querySelector("#currentJournalSentence").textContent = hasSentences ? journalSentences[currentJournalSentence] : "保存英文日记后，这里会逐句播放。";
  document.querySelector("#currentSentenceTranslation").textContent = hasSentences ? "先闭眼听，再看文字跟读。" : "先听，再看文字跟读。";
  document.querySelector("#tapeWindow").classList.toggle("playing", journalIsPlaying);
  const playButton = document.querySelector("#playJournal");
  playButton.lastChild.textContent = journalIsPlaying ? " 停止" : " 播放";
  playButton.querySelector("path").setAttribute("d", journalIsPlaying ? "M7 6h4v12H7zm6 0h4v12h-4z" : "M8 5v14l11-7z");
}

function splitEnglishSentences(text) {
  return (text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).map(sentence => sentence.trim()).filter(Boolean);
}

function formatJournalDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(date);
}

function loadJournalIntoPlayer(entry) {
  journalSentences = splitEnglishSentences(entry.english);
  currentJournalSentence = 0;
  stopJournal();
  updateJournalPlayer();
}

function renderJournalLibrary() {
  const list = document.querySelector("#libraryList");
  const empty = document.querySelector("#emptyLibrary");
  document.querySelector("#libraryCount").textContent = `已积累 ${state.journals.length} 篇`;
  empty.hidden = state.journals.length > 0;
  list.innerHTML = state.journals.map((entry, index) => `
    <article class="library-entry">
      <time datetime="${entry.date}">${formatJournalDate(entry.date)}</time>
      <p class="entry-cn">${escapeHtml(entry.chinese)}</p>
      <p class="entry-en" lang="en">${escapeHtml(entry.english)}</p>
      <footer>
        <button class="library-action" data-review-journal="${index}">播放复习</button>
        <button class="library-action delete" data-delete-journal="${index}">删除</button>
      </footer>
    </article>`).join("");
  document.querySelectorAll("[data-review-journal]").forEach(button => button.addEventListener("click", () => {
    loadJournalIntoPlayer(state.journals[Number(button.dataset.reviewJournal)]);
    document.querySelector("#journalPlayer")?.scrollIntoView({behavior:"smooth"});
    speakJournalSentence();
  }));
  document.querySelectorAll("[data-delete-journal]").forEach(button => button.addEventListener("click", () => {
    const deleted = state.journals.splice(Number(button.dataset.deleteJournal), 1)[0];
    saveState();
    renderJournalLibrary();
    if (deleted && journalSentences.join(" ") === splitEnglishSentences(deleted.english).join(" ")) {
      journalSentences = [];
      currentJournalSentence = 0;
      stopJournal();
    }
    showToast("这篇日记已删除");
  }));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[character]);
}

function initializeJournal() {
  const today = new Date();
  const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  document.querySelector("#journalDate").textContent = formatJournalDate(dateKey);
  const latest = state.journals.find(entry => entry.date === dateKey) || state.journals[0];
  if (latest) {
    loadJournalIntoPlayer(latest);
    if (latest.date === dateKey) {
      document.querySelector("#chineseJournal").value = latest.chinese;
      document.querySelector("#englishJournal").value = latest.english;
      document.querySelector("#chineseCount").textContent = `${latest.chinese.length} / 200 字`;
      document.querySelector("#englishCount").textContent = `${latest.english.length} / 500`;
    }
  }
  renderJournalLibrary();
  updateJournalPlayer();
}

document.querySelector("#chineseJournal").addEventListener("input", event => {
  document.querySelector("#chineseCount").textContent = `${event.target.value.length} / 200 字`;
});
document.querySelector("#englishJournal").addEventListener("input", event => {
  document.querySelector("#englishCount").textContent = `${event.target.value.length} / 500`;
});

document.querySelector("#copyTranslationPrompt").addEventListener("click", async () => {
  const chinese = document.querySelector("#chineseJournal").value.trim();
  if (!chinese) return showToast("请先写下中文日记");
  const prompt = `我是英语零基础。请把下面的中文日记翻译成自然、简单、日常口语化的英文。尽量使用 A1-A2 词汇，一句话只表达一个意思。请按“中文原句 / 英文 / 关键表达”的格式逐句回答，最后再给出一段完整英文。\n\n我的日记：\n${chinese}`;
  try {
    await navigator.clipboard.writeText(prompt);
    showToast("翻译请求已复制，可以直接发给 AI");
  } catch {
    showToast("复制失败，请手动复制中文内容");
  }
});

document.querySelector("#saveJournal").addEventListener("click", () => {
  const chinese = document.querySelector("#chineseJournal").value.trim();
  const english = document.querySelector("#englishJournal").value.trim();
  if (!chinese || !english) return showToast("请把中文和英文都填写完整");
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const existing = state.journals.findIndex(entry => entry.date === date);
  const entry = { date, chinese, english, savedAt: now.toISOString() };
  if (existing >= 0) state.journals[existing] = entry;
  else state.journals.unshift(entry);
  saveState();
  renderJournalLibrary();
  loadJournalIntoPlayer(entry);
  speakJournalSentence();
  showToast(existing >= 0 ? "今天的日记已更新" : "日记已保存，开始慢速播放");
});

document.querySelector("#clearJournal").addEventListener("click", () => {
  document.querySelector("#chineseJournal").value = "";
  document.querySelector("#englishJournal").value = "";
  document.querySelector("#chineseCount").textContent = "0 / 200 字";
  document.querySelector("#englishCount").textContent = "0 / 500";
});

document.querySelector("#playJournal").addEventListener("click", () => journalIsPlaying ? stopJournal() : speakJournalSentence());
document.querySelector("#previousSentence").addEventListener("click", () => {
  if (!journalSentences.length) return;
  stopJournal();
  currentJournalSentence = (currentJournalSentence - 1 + journalSentences.length) % journalSentences.length;
  updateJournalPlayer();
});
document.querySelector("#nextSentence").addEventListener("click", () => {
  if (!journalSentences.length) return;
  stopJournal();
  currentJournalSentence = (currentJournalSentence + 1) % journalSentences.length;
  updateJournalPlayer();
});

document.querySelector("#shadowSentence").addEventListener("click", () => {
  if (!journalSentences.length) return showToast("请先保存一篇英文日记");
  if (!SpeechRecognition) return showToast("请使用 Chrome 或 Edge 进行语音识别");
  stopJournal();
  const journalRecognitionEngine = new SpeechRecognition();
  journalRecognitionEngine.lang = "en-US";
  journalRecognitionEngine.interimResults = false;
  journalRecognitionEngine.onresult = event => {
    document.querySelector("#journalRecognition").textContent = `我听到：${event.results[0][0].transcript}`;
  };
  journalRecognitionEngine.onerror = () => {
    document.querySelector("#journalRecognition").textContent = "没有听清，请再说一次";
  };
  document.querySelector("#journalRecognition").textContent = "正在听，请说出上面的英文句子";
  journalRecognitionEngine.start();
});

function renderPhrases() {
  document.querySelector("#todayPhrases").innerHTML = phrases.map((phrase, index) => `
    <button class="phrase-card" data-speak="${index}">
      <small>播放 ${String(index + 1).padStart(2, "0")}</small>
      <strong>${phrase.en}</strong>
      <span>${phrase.cn}</span>
    </button>`).join("");
  document.querySelectorAll("[data-speak]").forEach(button => button.addEventListener("click", () => speak(phrases[button.dataset.speak].en)));

  document.querySelector("#phraseSelector").innerHTML = phrases.map((phrase, index) => `
    <button class="selector-button ${index === 0 ? "active" : ""}" data-select="${index}">
      <strong>${phrase.en}</strong><span>${phrase.cn}</span>
    </button>`).join("");
  document.querySelectorAll("[data-select]").forEach(button => button.addEventListener("click", () => selectPhrase(Number(button.dataset.select))));
}

function selectPhrase(index) {
  activePhrase = index;
  document.querySelectorAll(".selector-button").forEach((el, i) => el.classList.toggle("active", i === index));
  document.querySelector("#speakingIndex").textContent = `句子 ${index + 1} / ${phrases.length}`;
  document.querySelector("#speakingEnglish").textContent = phrases[index].en;
  document.querySelector("#speakingChinese").textContent = phrases[index].cn;
  document.querySelector("#recognitionResult").textContent = "准备好后，点击“开始跟读”";
}

document.querySelector("#listenButton").addEventListener("click", () => speak(phrases[activePhrase].en));

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.onstart = () => {
    document.querySelector("#recordButton").classList.add("recording");
    document.querySelector("#recordButton").lastChild.textContent = " 正在听…";
    document.querySelector("#recognitionResult").textContent = "请说出上面的英文句子";
  };
  recognition.onresult = event => {
    const result = event.results[0][0].transcript;
    document.querySelector("#recognitionResult").textContent = `我听到：${result}`;
  };
  recognition.onerror = event => {
    const message = event.error === "not-allowed" ? "需要允许麦克风权限后才能跟读" : "没有听清，请再说一次";
    document.querySelector("#recognitionResult").textContent = message;
  };
  recognition.onend = () => {
    const button = document.querySelector("#recordButton");
    button.classList.remove("recording");
    button.lastChild.textContent = " 开始跟读";
  };
}

document.querySelector("#recordButton").addEventListener("click", () => {
  if (!recognition) return showToast("请使用 Chrome 或 Edge 进行语音识别");
  try { recognition.start(); } catch { recognition.stop(); }
});

function renderMonths() {
  document.querySelector("#monthGrid").innerHTML = months.map((month, index) => `
    <article class="month-card" data-month="${String(index + 1).padStart(2, "0")}">
      <header><span class="phase">${month.phase}</span><span class="month-number">第 ${index + 1} 月</span></header>
      <h2>${month.title}</h2>
      <p>${month.goal}</p>
      <ul>${month.topics.map(topic => `<li>${topic}</li>`).join("")}</ul>
    </article>`).join("");
}

function renderScenarios() {
  document.querySelector("#scenarioList").innerHTML = scenarios.map((scenario, index) => `
    <button class="scenario-button ${index === activeScenario ? "active" : ""}" data-scenario="${index}">
      <strong>${scenario.title}</strong><span>${scenario.meta}</span>
    </button>`).join("");
  document.querySelectorAll("[data-scenario]").forEach(button => button.addEventListener("click", () => startScenario(Number(button.dataset.scenario))));
}

function startScenario(index) {
  activeScenario = index;
  activeQuestion = 0;
  conversationAnswers = [];
  document.querySelector("#sessionResult").hidden = true;
  renderScenarios();
  updateConversationStage();
}

function updateConversationStage() {
  const scenario = scenarios[activeScenario];
  document.querySelector("#scenarioLevel").textContent = scenario.level;
  document.querySelector("#conversationProgress").textContent = `问题 ${activeQuestion + 1} / ${scenario.questions.length}`;
  document.querySelector("#coachQuestion").textContent = scenario.questions[activeQuestion];
  const answer = conversationAnswers[activeQuestion] || "";
  document.querySelector("#conversationTranscript").textContent = answer || "点击麦克风后直接回答，或在下方输入英文";
  document.querySelector("#conversationTextInput").value = answer;
  document.querySelector("#nextQuestion").textContent = activeQuestion === scenario.questions.length - 1 ? "完成对话" : "下一问";
}

document.querySelector("#conversationTextInput").addEventListener("input", event => {
  const answer = event.target.value.trim();
  conversationAnswers[activeQuestion] = answer;
  document.querySelector("#conversationTranscript").textContent = answer || "请输入一句英文回答";
});

document.querySelector("#listenQuestion").addEventListener("click", () => speak(scenarios[activeScenario].questions[activeQuestion]));
document.querySelectorAll("[data-rescue]").forEach(button => button.addEventListener("click", () => speak(button.dataset.rescue)));

document.querySelector("#conversationRecord").addEventListener("click", () => {
  if (!SpeechRecognition) return showToast("请使用 Chrome 或 Edge 进行语音识别");
  const engine = new SpeechRecognition();
  engine.lang = "en-US";
  engine.interimResults = false;
  const button = document.querySelector("#conversationRecord");
  button.classList.add("recording");
  button.lastChild.textContent = " 正在听…";
  document.querySelector("#conversationTranscript").textContent = "请直接回答，不用担心语法错误";
  engine.onresult = event => {
    const transcript = event.results[0][0].transcript;
    conversationAnswers[activeQuestion] = transcript;
    document.querySelector("#conversationTranscript").textContent = transcript;
    document.querySelector("#conversationTextInput").value = transcript;
  };
  engine.onerror = () => { document.querySelector("#conversationTranscript").textContent = "没有听清，请再回答一次"; };
  engine.onend = () => {
    button.classList.remove("recording");
    button.lastChild.textContent = " 开始回答";
  };
  engine.start();
});

document.querySelector("#nextQuestion").addEventListener("click", () => {
  const scenario = scenarios[activeScenario];
  const currentAnswer = (conversationAnswers[activeQuestion] || "").trim();
  if (!currentAnswer) {
    document.querySelector("#conversationTextInput").focus();
    return showToast("先用英文回答这一问，再继续");
  }
  if (activeQuestion < scenario.questions.length - 1) {
    activeQuestion += 1;
    updateConversationStage();
    speak(scenario.questions[activeQuestion]);
    return;
  }
  const completedAnswers = conversationAnswers.filter(Boolean);
  const words = completedAnswers.join(" ").trim().split(/\s+/).filter(Boolean).length;
  document.querySelector("#sessionResultText").textContent = `你完成了 ${scenario.questions.length} 个问题，本轮共记录 ${words} 个英文词。下一次试着回答得更完整。`;
  document.querySelector("#sessionResult").hidden = false;
});
document.querySelector("#restartConversation").addEventListener("click", () => startScenario(activeScenario));

function renderMovieLines() {
  const lines = state.movieLines;
  document.querySelector("#movieLinesCount").textContent = `${lines.length} 句`;
  document.querySelector("#subtitleEmpty").hidden = lines.length > 0;
  document.querySelector("#subtitleLines").innerHTML = lines.map((line, index) => `
    <article class="subtitle-line ${index === activeMovieLine ? "active" : ""}">
      <span class="subtitle-time">${Number(line.start).toFixed(1)}—${Number(line.end).toFixed(1)}s</span>
      <span class="subtitle-copy"><strong>${escapeHtml(line.english)}</strong><span>${escapeHtml(line.chinese)}</span></span>
      <span class="subtitle-actions">
        <button data-select-movie-line="${index}">学习</button>
        <button data-delete-movie-line="${index}">删除</button>
      </span>
    </article>`).join("");
  document.querySelectorAll("[data-select-movie-line]").forEach(button => button.addEventListener("click", () => selectMovieLine(Number(button.dataset.selectMovieLine))));
  document.querySelectorAll("[data-delete-movie-line]").forEach(button => button.addEventListener("click", () => {
    state.movieLines.splice(Number(button.dataset.deleteMovieLine), 1);
    activeMovieLine = Math.max(0, Math.min(activeMovieLine, state.movieLines.length - 1));
    saveState();
    renderMovieLines();
    updateMovieStudyCard();
  }));
  updateMovieStudyCard();
}

function selectMovieLine(index) {
  activeMovieLine = index;
  renderMovieLines();
  const line = state.movieLines[index];
  const video = document.querySelector("#movieVideo");
  if (video.src) video.currentTime = Number(line.start);
}

function updateMovieStudyCard() {
  const lines = state.movieLines;
  const line = lines[activeMovieLine];
  document.querySelector("#movieLineCounter").textContent = line ? `${activeMovieLine + 1} / ${lines.length}` : "0 / 0";
  document.querySelector("#movieLineEnglish").textContent = line?.english || "添加第一句英文台词后，从这里开始学习。";
  document.querySelector("#movieLineChinese").textContent = line?.chinese || "一句只表达一个意思，英文要自然，不要逐字直译。";
  document.querySelector("#wordBreakdown").innerHTML = line ? line.english.match(/[A-Za-z']+/g)?.map(word => `<button class="word-chip" data-movie-word="${word}">${word}</button>`).join("") || "" : "";
  document.querySelectorAll("[data-movie-word]").forEach(button => button.addEventListener("click", () => speak(button.dataset.movieWord)));
  const subtitle = document.querySelector("#movieSubtitle");
  subtitle.hidden = !line || subtitleMode === "off";
  document.querySelector("#movieSubtitleEnglish").textContent = line?.english || "";
  document.querySelector("#movieSubtitleChinese").textContent = line?.chinese || "";
  document.querySelector("#movieSubtitleChinese").hidden = subtitleMode === "english";
}

function stopMovieAtLineEnd(video, end) {
  if (movieStopHandler) video.removeEventListener("timeupdate", movieStopHandler);
  movieStopHandler = () => {
    if (video.currentTime >= end) {
      video.pause();
      video.removeEventListener("timeupdate", movieStopHandler);
      movieStopHandler = null;
    }
  };
  video.addEventListener("timeupdate", movieStopHandler);
}

function playOriginalMovieLine() {
  const line = state.movieLines[activeMovieLine];
  const video = document.querySelector("#movieVideo");
  if (!line) return showToast("请先添加一句台词");
  if (!video.src) return showToast("请先选择本机视频");
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  video.currentTime = Number(line.start);
  video.muted = false;
  stopMovieAtLineEnd(video, Number(line.end));
  video.play().catch(() => showToast("请再次点击播放原声"));
  document.querySelector("#playOriginalLine").classList.add("active");
  document.querySelector("#previewDub").classList.remove("active");
}

function playDubbedMovieLine() {
  const line = state.movieLines[activeMovieLine];
  const video = document.querySelector("#movieVideo");
  if (!line) return showToast("请先添加一句台词");
  if (!video.src) return showToast("请先选择本机视频");
  if (!("speechSynthesis" in window)) return showToast("当前浏览器不支持英文配音");
  speechSynthesis.cancel();
  video.currentTime = Number(line.start);
  video.muted = true;
  stopMovieAtLineEnd(video, Number(line.end));
  video.play().catch(() => {});
  const utterance = new SpeechSynthesisUtterance(line.english);
  utterance.lang = "en-US";
  utterance.rate = .86;
  speechSynthesis.speak(utterance);
  document.querySelector("#previewDub").classList.add("active");
  document.querySelector("#playOriginalLine").classList.remove("active");
}

document.querySelector("#movieFile").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;
  if (movieObjectUrl) URL.revokeObjectURL(movieObjectUrl);
  movieObjectUrl = URL.createObjectURL(file);
  const video = document.querySelector("#movieVideo");
  video.src = movieObjectUrl;
  video.muted = false;
  document.querySelector("#movieScreen").classList.add("has-video");
  document.querySelector("#movieFileName").textContent = file.name;
});
document.querySelector("#captureStart").addEventListener("click", () => {
  document.querySelector("#lineStart").value = document.querySelector("#movieVideo").currentTime.toFixed(1);
});
document.querySelector("#captureEnd").addEventListener("click", () => {
  document.querySelector("#lineEnd").value = document.querySelector("#movieVideo").currentTime.toFixed(1);
});
document.querySelector("#addMovieLine").addEventListener("click", () => {
  const start = Number(document.querySelector("#lineStart").value);
  const end = Number(document.querySelector("#lineEnd").value);
  const chinese = document.querySelector("#lineChinese").value.trim();
  const english = document.querySelector("#lineEnglish").value.trim();
  if (!chinese || !english) return showToast("请填写中文原意和自然英文");
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0) return showToast("请填写有效的开始和结束时间");
  if (end <= start) return showToast("结束时间必须晚于开始时间");
  if (end - start > 60) return showToast("单句片段请控制在 60 秒以内");
  state.movieLines.push({start, end, chinese, english});
  state.movieLines.sort((a, b) => a.start - b.start);
  activeMovieLine = state.movieLines.findIndex(line => line.start === start && line.english === english);
  saveState();
  renderMovieLines();
  document.querySelector("#lineChinese").value = "";
  document.querySelector("#lineEnglish").value = "";
  showToast("台词已加入影视英语练习");
});
document.querySelector("#previewDub").addEventListener("click", playDubbedMovieLine);
document.querySelector("#playOriginalLine").addEventListener("click", playOriginalMovieLine);
document.querySelectorAll("[data-subtitle-mode]").forEach(button => button.addEventListener("click", () => {
  subtitleMode = button.dataset.subtitleMode;
  document.querySelectorAll("[data-subtitle-mode]").forEach(item => item.classList.toggle("active", item === button));
  updateMovieStudyCard();
}));
document.querySelector("#listenMovieLine").addEventListener("click", () => {
  const line = state.movieLines[activeMovieLine];
  if (!line) return showToast("请先添加一句台词");
  speak(line.english);
});
document.querySelector("#shadowMovieLine").addEventListener("click", () => {
  const line = state.movieLines[activeMovieLine];
  if (!line) return showToast("请先添加一句台词");
  if (!SpeechRecognition) return showToast("请使用 Chrome 或 Edge 进行语音识别");
  document.querySelector("#movieSubtitle").hidden = true;
  const engine = new SpeechRecognition();
  engine.lang = "en-US";
  document.querySelector("#movieRecognition").textContent = "正在听，请给角色配上这句英文";
  engine.onresult = event => { document.querySelector("#movieRecognition").textContent = `我听到：${event.results[0][0].transcript}`; };
  engine.onerror = () => { document.querySelector("#movieRecognition").textContent = "没有听清，请再说一次"; };
  engine.onend = () => { document.querySelector("#movieSubtitle").hidden = false; };
  engine.start();
});

function renderProgress() {
  const completed = state.completedDays.length;
  document.querySelector("#headerProgressText").textContent = `已完成 ${completed} 天`;
  document.querySelector("#headerProgressRing").style.setProperty("--progress", `${Math.min(completed / 180 * 360, 360)}deg`);
  const weekStart = Math.floor((currentDay - 1) / 7) * 7 + 1;
  const weekEnd = Math.min(weekStart + 6, 180);
  const weekCompleted = state.completedDays.filter(day => day >= weekStart && day <= weekEnd).length;
  document.querySelector("#weekFraction").textContent = `${weekCompleted} / ${weekEnd - weekStart + 1}`;
  const labels = ["一", "二", "三", "四", "五", "六", "日"];
  document.querySelector("#weekDays").innerHTML = labels.map((label, index) => `
    <div class="week-day ${state.completedDays.includes(weekStart + index) ? "done" : ""} ${weekStart + index === currentDay && completed < 180 ? "today" : ""}">
      ${label}<span>${weekStart + index <= 180 ? weekStart + index : "—"}</span>
    </div>`).join("");
  const button = document.querySelector("#completeDay");
  const allDone = completed >= 180;
  button.textContent = allDone ? "180 天计划已完成" : `完成第 ${currentDay} 天`;
  button.classList.toggle("done", allDone);
  button.disabled = allDone;
}

document.querySelector("#completeDay").addEventListener("click", () => {
  const taskState = state.tasks[currentDay] || [];
  if (!tasks.every((_, index) => taskState[index])) return showToast("完成并勾选 5 项任务后才能进入下一天");
  if (state.completedDays.includes(currentDay)) return showToast("这一天已经完成");
  const finishedDay = currentDay;
  state.completedDays.push(finishedDay);
  state.completedDays.sort((a, b) => a - b);
  currentDay = Math.min(state.completedDays.length + 1, 180);
  saveState();
  renderTodayLesson();
  renderProgress();
  showToast(finishedDay === 180 ? "180 天计划完成了！" : `第 ${finishedDay} 天完成，已进入第 ${currentDay} 天`);
});

renderTodayLesson();
renderMonths();
renderScenarios();
updateConversationStage();
renderMovieLines();
renderProgress();
initializeJournal();
