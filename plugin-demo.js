const transcript = [
  { time: "00:00", en: "Why can't you be honest with me?", cn: "你为什么不能对我坦诚一点？", progress: 22 },
  { time: "00:03", en: "I have always been honest with you.", cn: "我一直都对你很坦诚。", progress: 42 },
  { time: "00:07", en: "Then tell me what really happened.", cn: "那就告诉我到底发生了什么。", progress: 67 },
  { time: "00:10", en: "Give me a moment. I'll explain everything.", cn: "给我一点时间，我会解释清楚。", progress: 88 }
];

const dictionary = {
  honest: { phonetic: "/ˈɑːnɪst/ · 形容词", meaning: "诚实的；坦诚的", context: "坦诚地告诉对方真实情况，不隐瞒。" },
  always: { phonetic: "/ˈɔːlweɪz/ · 副词", meaning: "总是；一直", context: "强调过去到现在一直保持同样的状态。" },
  really: { phonetic: "/ˈriːəli/ · 副词", meaning: "真正地；到底", context: "在追问中强调想知道真实情况。" },
  happened: { phonetic: "/ˈhæpənd/ · 动词", meaning: "发生了", context: "询问已经发生的事情。" },
  moment: { phonetic: "/ˈmoʊmənt/ · 名词", meaning: "片刻；一会儿", context: "请求对方给自己一点思考或准备的时间。" },
  explain: { phonetic: "/ɪkˈspleɪn/ · 动词", meaning: "解释；说明", context: "把事情的原因和经过说清楚。" },
  everything: { phonetic: "/ˈevriθɪŋ/ · 代词", meaning: "所有事情；一切", context: "表示会把相关情况全部说明。" }
};

let activeLine = 0;
let selectedWord = "honest";
let captionMode = "bilingual";
let toastTimer;

function showToast(message) {
  const toast = document.querySelector("#demoToast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1900);
}

function wordsForLine(text) {
  return text.match(/[A-Za-z']+/g) || [];
}

function renderTranscript() {
  document.querySelector("#transcriptList").innerHTML = transcript.map((line, index) => `
    <button class="transcript-line ${index === activeLine ? "active" : ""}" data-line="${index}">
      <span class="line-time">${line.time}</span>
      <span class="line-copy"><strong>${line.en}</strong><span>${line.cn}</span></span>
      <span class="line-words">${wordsForLine(line.en).map(word => `<span data-word="${word.toLowerCase().replace(/[^a-z']/g, "")}">${word}</span>`).join("")}</span>
    </button>`).join("");

  document.querySelectorAll("[data-line]").forEach(button => button.addEventListener("click", event => {
    const word = event.target.closest("[data-word]");
    if (word) {
      event.stopPropagation();
      selectWord(word.dataset.word);
      return;
    }
    activeLine = Number(button.dataset.line);
    updateActiveLine();
  }));
}

function updateActiveLine() {
  const line = transcript[activeLine];
  document.querySelector("#captionEnglish").textContent = line.en;
  document.querySelector("#captionChinese").textContent = line.cn;
  document.querySelector("#videoProgress").style.width = `${line.progress}%`;
  renderTranscript();
}

function selectWord(word) {
  selectedWord = word;
  const entry = dictionary[word] || {
    phonetic: "当前演示未收录音标",
    meaning: "点击正式插件后会显示中文解释",
    context: "正式版本会结合当前句子和视频场景解释这个单词。"
  };
  document.querySelector("#wordTitle").textContent = word;
  document.querySelector("#wordPhonetic").textContent = entry.phonetic;
  document.querySelector("#wordMeaning").textContent = entry.meaning;
  document.querySelector("#wordContext").textContent = entry.context;
  document.querySelector("#wordCard").animate([{ transform: "translateY(6px)", opacity: .72 }, { transform: "translateY(0)", opacity: 1 }], { duration: 320, easing: "ease-out" });
}

function speak(text, rate = .9) {
  if (!("speechSynthesis" in window)) return showToast("当前浏览器不支持语音播放");
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  speechSynthesis.speak(utterance);
}

document.querySelectorAll("[data-audio-mode]").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll("[data-audio-mode]").forEach(item => item.classList.toggle("active", item === button));
  const english = button.dataset.audioMode === "english";
  document.querySelector("#captureStatus").lastChild.textContent = english ? "英文配音已开启" : " 已恢复中文原声";
  document.querySelector("#watchNote").textContent = english ? "人物中文声音已替换为英文配音；点击右侧台词或单词试试看。" : "当前正在播放中文原声，可随时切回英文配音。";
  showToast(english ? "已切换到英文配音" : "已恢复中文原声");
}));

document.querySelectorAll("[data-caption-mode]").forEach(button => button.addEventListener("click", () => {
  captionMode = button.dataset.captionMode;
  document.querySelectorAll("[data-caption-mode]").forEach(item => item.classList.toggle("active", item === button));
  const overlay = document.querySelector("#captionOverlay");
  overlay.classList.toggle("english-only", captionMode === "english");
  overlay.classList.toggle("off", captionMode === "off");
}));

document.querySelector("#replayLine").addEventListener("click", () => speak(transcript[activeLine].en));
document.querySelector("#toggleLoop").addEventListener("click", event => {
  event.currentTarget.classList.toggle("active");
  showToast(event.currentTarget.classList.contains("active") ? "当前台词已开启循环" : "已关闭单句循环");
});
document.querySelector("#shadowLine").addEventListener("click", () => showToast("跟读录音将在这里开始，并显示识别结果"));
document.querySelector("#speakWord").addEventListener("click", () => speak(selectedWord));
document.querySelector("#speakWordSlow").addEventListener("click", () => speak(selectedWord, .55));
document.querySelector("#saveWord").addEventListener("click", event => {
  event.currentTarget.textContent = "已收藏";
  document.querySelector("#learnedCount").textContent = "2 个表达";
  showToast(`${selectedWord} 已加入个人词库`);
});
document.querySelector("#saveSentence").addEventListener("click", event => {
  event.currentTarget.textContent = "当前台词已收藏";
  showToast("已加入个人语料库和明日复习");
});

document.querySelector("#nextDemo").addEventListener("click", () => {
  const processing = document.querySelector("#processingCard");
  const status = document.querySelector("#captureStatus");
  processing.hidden = false;
  status.classList.add("processing");
  status.lastChild.textContent = " 正在生成英文版";
  document.querySelector("#processingStep").textContent = "识别人声和背景音乐";
  setTimeout(() => { document.querySelector("#processingStep").textContent = "翻译台词并生成英文声音"; }, 550);
  setTimeout(() => {
    processing.hidden = true;
    status.classList.remove("processing");
    status.lastChild.textContent = " 英文配音已开启";
    activeLine = 0;
    updateActiveLine();
    showToast("下一条英文版已准备好");
  }, 1350);
});

renderTranscript();
