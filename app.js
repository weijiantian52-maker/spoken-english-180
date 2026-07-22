const legacyCurriculum = Array.isArray(window.SPOKEN_ENGLISH_CURRICULUM) ? window.SPOKEN_ENGLISH_CURRICULUM : [];
const curriculum = Array.isArray(window.SPOKEN_ENGLISH_CURRICULUM_180) && window.SPOKEN_ENGLISH_CURRICULUM_180.length
  ? window.SPOKEN_ENGLISH_CURRICULUM_180
  : legacyCurriculum;
const videos = Array.isArray(window.SPOKEN_ENGLISH_VIDEOS) ? window.SPOKEN_ENGLISH_VIDEOS : [];
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const core = window.SPOKEN_ENGLISH_CORE;
const TOTAL_DAYS = curriculum.length;
const STORAGE_KEY = 'spokenEnglishV3';
const REVIEW_OFFSETS = [1, 3, 7, 14, 30];
const STAGE_DAYS = [30, 60, 90, 120, 150, 180];

const defaultPhases = [
  { number: 1, name: '开口启动', start: 1, end: 30, goal: '建立声音与意思的连接，用自己的话完成2分钟自我介绍。', gate: '2分钟自述 · 300词阅读 · 清晰新音频60%' },
  { number: 2, name: '场景生存', start: 31, end: 60, goal: '完成点餐、购物、交通、预约和求助等真实生活任务。', gate: '10分钟场景对话 · 500—700词阅读80%' },
  { number: 3, name: '连贯表达', start: 61, end: 90, goal: '讲清过去、计划、感受、理由和有起承转合的故事。', gate: '3分钟无稿故事 · 15分钟对话' },
  { number: 4, name: '真实语速', start: 91, end: 120, goal: '解决弱读、连读和省音，逐步从英文台词过渡到无字幕。', gate: '生活类新音频首遍60% · 15—20分钟对话' },
  { number: 5, name: '阅读转观点', start: 121, end: 150, goal: '读完真实文章后能总结、表达立场并给出理由和例子。', gate: '1500词阅读 · 3分钟口头总结' },
  { number: 6, name: '综合实战', start: 151, end: 180, goal: '面对陌生追问、不同说法和真实材料仍能继续交流。', gate: '30分钟交流 · 熟悉题材无字幕65%—75%' }
];

const suppliedPhases = Array.isArray(window.SPOKEN_ENGLISH_PHASES) ? window.SPOKEN_ENGLISH_PHASES : [];
const phases = defaultPhases.map(function (fallback, index) {
  const supplied = suppliedPhases[index] || {};
  return {
    number: Number(supplied.number || supplied.phase || supplied.id || fallback.number),
    name: supplied.name || supplied.title || fallback.name,
    start: Number(supplied.start || supplied.startDay || fallback.start),
    end: Number(supplied.end || supplied.endDay || fallback.end),
    goal: supplied.goal || supplied.outcome || supplied.description || fallback.goal,
    gate: supplied.gate || supplied.assessment || supplied.benchmark || fallback.gate
  };
});

const modeSettings = {
  35: { phraseTarget: 2, label: '保底模式', description: '5分钟复习＋5分钟日记＋10分钟听力＋5分钟阅读＋10分钟口语。每周最多两次。' },
  90: { phraseTarget: 4, label: '忙碌模式', description: '10分钟复习＋15分钟日记＋25分钟听力＋20分钟阅读＋20分钟口语。' },
  180: { phraseTarget: 5, label: '目标模式', description: '15分钟复习＋25分钟日记＋50分钟听力＋40分钟阅读＋50分钟口语。' }
};

function q(selector) {
  return document.querySelector(selector);
}

function qa(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>'"]/g, function (character) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character];
  });
}

function wordCount(value) {
  return String(value || '').trim().split(/\s+/).filter(Boolean).length;
}

function normalizeCompletedDays(value) {
  return core.normalizeCompletedDays(value, TOTAL_DAYS);
}

function emptyState() {
  return {
    version: 3,
    onboarded: false,
    timeMode: 180,
    completedDays: [],
    days: {},
    expressions: [],
    assessments: {},
    conversationCount: 0,
    longestAnswerWords: 0,
    selectedVideo: 0,
    totalPlannedMinutes: 0,
    migratedFrom: null
  };
}

function normalizeTimeMode(value) {
  return core.normalizeTimeMode(value);
}

function readState() {
  const fresh = emptyState();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && saved.version === 3) {
      const merged = Object.assign(fresh, saved);
      merged.completedDays = normalizeCompletedDays(saved.completedDays);
      merged.days = saved.days && typeof saved.days === 'object' ? saved.days : {};
      merged.expressions = Array.isArray(saved.expressions) ? saved.expressions : [];
      merged.assessments = saved.assessments && typeof saved.assessments === 'object' ? saved.assessments : {};
      merged.timeMode = normalizeTimeMode(saved.timeMode);
      return merged;
    }
  } catch (error) {
    console.warn('V3 learning state could not be read.', error);
  }

  try {
    const previous = JSON.parse(localStorage.getItem('spokenEnglishV2') || 'null');
    if (previous && previous.version === 2) {
      Object.assign(fresh, core.migrateV2(previous, TOTAL_DAYS));
      fresh.migratedFrom = 'V2';
      return fresh;
    }
  } catch (error) {
    console.warn('V2 learning state could not be migrated.', error);
  }

  try {
    const oldest = JSON.parse(localStorage.getItem('spokenEnglishState') || 'null');
    if (oldest) {
      fresh.completedDays = normalizeCompletedDays(oldest.completedDays);
      const journals = Array.isArray(oldest.journals) ? oldest.journals : [];
      journals.forEach(function (entry, index) {
        if (!entry || !entry.english) return;
        fresh.expressions.push({
          id: 'migrated-' + Date.now() + '-' + index,
          cn: entry.chinese || '以前保存的个人表达',
          en: entry.english,
          source: 'personal',
          createdDay: 1,
          srsStage: 0,
          repetitions: 0,
          dueDay: 1,
          createdAt: entry.date || new Date().toISOString()
        });
      });
      fresh.migratedFrom = 'V1';
    }
  } catch (error) {
    console.warn('Legacy learning state could not be migrated.', error);
  }
  return fresh;
}

let state = readState();
let currentDay = firstIncompleteDay();
let activeExpressionFilter = 'all';
let localVideoUrl = '';
let selectedWord = '';
let previewDay = currentDay;
let activeRecognition = null;
let activeSpeechTimer = null;
let activeRecorder = null;
let activeRecorderStream = null;
let recorderChunks = [];
let recorderStartedAt = 0;
let currentAudioUrl = '';
const revealedReviews = new Set();

function firstIncompleteDay() {
  return core.firstIncompleteDay(state ? state.completedDays : [], TOTAL_DAYS);
}

function isCourseFinished() {
  return TOTAL_DAYS > 0 && normalizeCompletedDays(state.completedDays).length === TOTAL_DAYS;
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.warn('Learning state could not be saved.', error);
    showToast('本机保存失败，请先导出记录或检查浏览器存储空间');
    return false;
  }
}

function showToast(message) {
  const toast = q('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(function () { toast.classList.remove('show'); }, 2600);
}

function phaseForDay(day) {
  const number = Math.min(6, Math.max(1, Math.ceil(Number(day || 1) / 30)));
  return phases[number - 1] || defaultPhases[number - 1];
}

function lessonFor(day) {
  const raw = curriculum[day - 1] || {};
  const phraseFallback = Array.isArray(raw.phrases) ? raw.phrases : [];
  const listening = raw.listening && typeof raw.listening === 'object' ? raw.listening : {};
  const reading = raw.reading && typeof raw.reading === 'object' ? raw.reading : {};
  const kind = raw.kind || (raw.assessment ? (day % 30 === 0 ? 'stage-test' : 'weekly-review') : 'lesson');
  return {
    day: Number(raw.day || day),
    phase: Number(raw.phase || Math.ceil(day / 30)),
    week: Number(raw.week || Math.ceil(day / 7)),
    theme: raw.theme || '第 ' + day + ' 天训练',
    focus: raw.focus || '完成今天的听、说、读和个人表达闭环',
    outcome: raw.outcome || '留下可以复查的学习结果',
    kind: kind,
    assessment: Boolean(raw.assessment || kind === 'stage-test'),
    diaryPrompt: raw.diaryPrompt || '写下今天真正想表达的3—5句话。',
    speakingPrompt: raw.speakingPrompt || raw.question || 'Use today’s expressions to talk about your real life.',
    pronunciation: raw.pronunciation || raw.soundFocus || '句子重音和清楚停顿',
    grammar: raw.grammar || raw.languageFocus || '用简单句准确表达意思',
    phrases: phraseFallback,
    listening: {
      title: listening.title || raw.theme || 'Today’s listening',
      script: listening.script || phraseFallback.map(function (phrase) { return phrase[0]; }).join(' '),
      task: listening.task || '第一次只听大意，然后说出三个关键信息。'
    },
    reading: {
      title: reading.title || raw.theme || 'Today’s reading',
      text: reading.text || phraseFallback.map(function (phrase) { return phrase[0]; }).join(' '),
      task: reading.task || '用英文说出主旨和一个细节。'
    }
  };
}

function dayState(day) {
  const key = String(day || currentDay);
  const existing = state.days[key] && typeof state.days[key] === 'object' ? state.days[key] : {};
  state.days[key] = Object.assign({
    mastered: [],
    personalSaved: false,
    listeningHeard: false,
    listeningScore: 0,
    listeningDone: false,
    transcriptRevealed: false,
    readingSummary: '',
    readingDone: false,
    answer: '',
    audioSaved: false,
    audioSeconds: 0,
    reviewDone: false,
    assessmentSaved: false,
    completedMode: null,
    completedAt: null
  }, existing);
  if (!Array.isArray(state.days[key].mastered)) state.days[key].mastered = [];
  return state.days[key];
}

function speakingTarget() {
  const phase = phaseForDay(currentDay).number;
  if (state.timeMode === 35) return 5 + phase * 2;
  if (state.timeMode === 90) return 10 + phase * 3;
  return 10 + phase * 5;
}

function readingTarget() {
  const phase = phaseForDay(currentDay).number;
  if (state.timeMode === 35) return 3;
  if (state.timeMode === 90) return 5 + phase;
  return 8 + phase * 2;
}

function dueExpressions() {
  return state.expressions.filter(function (expression) {
    return Number(expression.dueDay || 1) <= currentDay;
  });
}

function requirements() {
  const daily = dayState(currentDay);
  const lesson = lessonFor(currentDay);
  const mode = modeSettings[state.timeMode];
  const due = dueExpressions();
  const items = [
    { key: 'review', label: due.length ? '完成 ' + due.length + ' 条到期盲复习' : '今天没有到期复习', done: due.length === 0 || daily.reviewDone },
    { key: 'personal', label: '保存至少1条自己的真实表达', done: daily.personalSaved },
    { key: 'listen', label: state.timeMode === 35 ? '完成首次听力并记录理解率' : '完成无台词首测、查漏和复测', done: daily.listeningHeard && Number(daily.listeningScore) > 0 && (state.timeMode === 35 || daily.listeningDone) },
    { key: 'phrases', label: '无提示会说至少 ' + mode.phraseTarget + ' 个词块', done: daily.mastered.length >= mode.phraseTarget },
    { key: 'reading', label: '阅读总结达到 ' + readingTarget() + ' 个英文词', done: daily.readingDone && wordCount(daily.readingSummary) >= readingTarget() },
    { key: 'conversation', label: '口语作品达到 ' + speakingTarget() + ' 个英文词', done: wordCount(daily.answer) >= speakingTarget() }
  ];
  if (lesson.kind === 'stage-test') {
    items.push({ key: 'assessment', label: '记录四项阶段盲测成绩', done: Boolean(daily.assessmentSaved) });
  }
  return items;
}

function speak(text, rate, onEnd, onError) {
  if (!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) {
    showToast('当前浏览器不支持英文朗读，请直接阅读台词并换用Chrome或Edge');
    if (onError) onError();
    return false;
  }
  const content = String(text || '').trim();
  if (!content) {
    showToast('这里还没有可以播放的英文');
    if (onError) onError();
    return false;
  }
  clearTimeout(activeSpeechTimer);
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(content);
  utterance.lang = 'en-US';
  utterance.rate = rate || 0.86;
  let settled = false;
  function finish(success) {
    if (settled) return;
    settled = true;
    clearTimeout(activeSpeechTimer);
    if (success && onEnd) onEnd();
    if (!success && onError) onError();
  }
  utterance.onend = function () { finish(true); };
  utterance.onerror = function () { finish(false); };
  activeSpeechTimer = setTimeout(function () { finish(false); }, Math.min(240000, Math.max(15000, wordCount(content) * 800)));
  try {
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (error) {
    finish(false);
    showToast('朗读没有启动，请再试一次');
    return false;
  }
}

function openAudioDatabase() {
  return new Promise(function (resolve, reject) {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const request = indexedDB.open('spokenEnglishAudioV1', 1);
    request.onupgradeneeded = function () {
      const database = request.result;
      if (!database.objectStoreNames.contains('recordings')) database.createObjectStore('recordings');
    };
    request.onsuccess = function () { resolve(request.result); };
    request.onerror = function () { reject(request.error || new Error('Audio database failed')); };
  });
}

async function saveAudioBlob(day, blob) {
  const database = await openAudioDatabase();
  return new Promise(function (resolve, reject) {
    const transaction = database.transaction('recordings', 'readwrite');
    transaction.objectStore('recordings').put(blob, 'day-' + day);
    transaction.oncomplete = function () { database.close(); resolve(); };
    transaction.onerror = function () { database.close(); reject(transaction.error); };
  });
}

async function loadAudioBlob(day) {
  const database = await openAudioDatabase();
  return new Promise(function (resolve, reject) {
    const transaction = database.transaction('recordings', 'readonly');
    const request = transaction.objectStore('recordings').get('day-' + day);
    request.onsuccess = function () { resolve(request.result || null); };
    request.onerror = function () { reject(request.error); };
    transaction.oncomplete = function () { database.close(); };
  });
}

async function renderAudioEvidence(day) {
  const evidence = q('#audioEvidence');
  const playback = q('#audioPlayback');
  evidence.hidden = true;
  if (currentAudioUrl) {
    URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = '';
  }
  try {
    const blob = await loadAudioBlob(day);
    if (!blob || day !== currentDay) return;
    currentAudioUrl = URL.createObjectURL(blob);
    playback.src = currentAudioUrl;
    evidence.hidden = false;
    q('#audioStatus').textContent = '第 ' + day + ' 天原始录音 · 只保存在当前浏览器';
  } catch (error) {
    if (dayState(day).audioSaved) q('#audioStatus').textContent = '录音记录存在，但当前浏览器暂时无法读取。';
  }
}

function setView(viewId) {
  qa('.nav-item, .view').forEach(function (element) { element.classList.remove('active'); });
  qa('.nav-item').forEach(function (element) {
    const active = element.dataset.view === viewId;
    element.classList.toggle('active', active);
    if (active) element.setAttribute('aria-current', 'page'); else element.removeAttribute('aria-current');
  });
  const view = q('#' + viewId);
  if (view) view.classList.add('active');
  if (viewId === 'expressions') renderExpressions();
  if (viewId === 'path') renderPath();
  if (viewId === 'progress') renderProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const heading = view ? view.querySelector('h1') : null;
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
}

function renderTimeMode() {
  qa('[data-minutes]').forEach(function (button) {
    const active = Number(button.dataset.minutes) === state.timeMode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  const setting = modeSettings[state.timeMode];
  q('#timePlanDescription').textContent = setting.description;
}

function renderToday() {
  if (!TOTAL_DAYS) {
    q('#todayTitle').textContent = '课程数据没有加载';
    q('#todayFocus').textContent = '请刷新页面，或稍后重新打开网站。';
    return;
  }
  const lesson = lessonFor(currentDay);
  const daily = dayState(currentDay);
  const phase = phaseForDay(currentDay);
  q('#heroDayNumber').textContent = String(currentDay).padStart(3, '0');
  q('#dayLabel').textContent = '第 ' + currentDay + ' 天 / ' + TOTAL_DAYS + ' 天 · 阶段 ' + phase.number + ' ' + phase.name + (lesson.kind === 'stage-test' ? ' · 阶段盲测' : lesson.kind === 'weekly-review' ? ' · 每周复测' : '');
  q('#todayTitle').textContent = lesson.theme;
  q('#todayFocus').textContent = lesson.focus;
  q('#todayOutcome').textContent = lesson.outcome;
  q('#todayPronunciation').textContent = '声音重点：' + lesson.pronunciation;
  q('#todayGrammar').textContent = '表达重点：' + lesson.grammar;
  q('#diaryPrompt').textContent = lesson.diaryPrompt;
  q('#listeningTitle').textContent = lesson.listening.title;
  q('#listeningTask').textContent = lesson.listening.task;
  q('#listeningText').textContent = lesson.listening.script;
  q('#listeningTranscript').hidden = !daily.transcriptRevealed;
  q('#revealTranscript').textContent = daily.transcriptRevealed ? '隐藏英文台词' : '查看英文台词';
  q('#confirmManualListening').hidden = daily.listeningHeard;
  q('#confirmManualRetest').hidden = daily.listeningDone;
  q('#readingTitle').textContent = lesson.reading.title;
  q('#readingText').innerHTML = String(lesson.reading.text).split(/\n\s*\n/).map(function (paragraph) {
    return '<p>' + escapeHtml(paragraph) + '</p>';
  }).join('');
  q('#readingTask').textContent = lesson.reading.task;
  q('#readingMeta').textContent = '约 ' + wordCount(lesson.reading.text) + ' 词';
  q('#readingSummary').value = daily.readingSummary || '';
  q('#conversationQuestion').textContent = lesson.speakingPrompt;
  q('#conversationAnswer').value = daily.answer || '';
  renderAudioEvidence(currentDay);
  q('#assessmentStep').hidden = lesson.kind !== 'stage-test';
  renderAssessment();
  renderPhraseTemplates(lesson);
  renderTodayPhrases(lesson);
  renderListeningScore();
  renderTimeMode();
  renderDueReview();
  renderTodayStatus();
}

function renderPhraseTemplates(lesson) {
  q('#phraseTemplates').innerHTML = lesson.phrases.map(function (phrase, index) {
    return '<button data-template-index="' + index + '">用第' + (index + 1) + '句改写</button>';
  }).join('');
  qa('[data-template-index]').forEach(function (button) {
    button.addEventListener('click', function () {
      const phrase = lesson.phrases[Number(button.dataset.templateIndex)] || ['', ''];
      q('#personalChinese').value = phrase[1] || '';
      q('#personalEnglish').value = phrase[0] || '';
      q('#personalEnglish').focus();
    });
  });
}

function renderTodayPhrases(lesson) {
  const daily = dayState(currentDay);
  q('#todayPhrases').innerHTML = lesson.phrases.map(function (phrase, index) {
    const mastered = daily.mastered.includes(index);
    return '<div class="phrase-row">' +
      '<button data-speak-phrase="' + index + '" aria-label="播放第' + (index + 1) + '句">' + String(index + 1).padStart(2, '0') + '</button>' +
      '<div class="phrase-copy"><strong lang="en">' + escapeHtml(phrase[0]) + '</strong><span>' + escapeHtml(phrase[1]) + '</span></div>' +
      '<button class="master-button ' + (mastered ? 'active' : '') + '" data-master-phrase="' + index + '" aria-pressed="' + String(mastered) + '">' + (mastered ? '已经会说' : '无提示说出') + '</button>' +
      '</div>';
  }).join('');
  qa('[data-speak-phrase]').forEach(function (button) {
    button.addEventListener('click', function () {
      const phrase = lesson.phrases[Number(button.dataset.speakPhrase)] || ['', ''];
      speak(phrase[0], 0.82);
    });
  });
  qa('[data-master-phrase]').forEach(function (button) {
    button.addEventListener('click', function () {
      const index = Number(button.dataset.masterPhrase);
      const mastered = dayState(currentDay).mastered;
      const position = mastered.indexOf(index);
      if (position >= 0) mastered.splice(position, 1); else mastered.push(index);
      saveState();
      renderTodayPhrases(lesson);
      renderTodayStatus();
    });
  });
}

function renderListeningScore() {
  const score = Number(dayState(currentDay).listeningScore || 0);
  qa('[data-listening-score]').forEach(function (button) {
    const active = Number(button.dataset.listeningScore) === score;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function renderTodayStatus() {
  const daily = dayState(currentDay);
  const due = dueExpressions();
  const mode = modeSettings[state.timeMode];
  q('#reviewStatus').textContent = due.length ? due.length + ' 条到期' : '无需复习';
  q('#personalStatus').textContent = daily.personalSaved ? '已保存' : '未保存';
  q('#listenStatus').textContent = daily.listeningDone ? '已复测' : daily.listeningHeard ? '已首听' : '未开始';
  q('#readingStatus').textContent = daily.readingDone ? wordCount(daily.readingSummary) + ' 个词' : '未完成';
  q('#conversationStatus').textContent = daily.answer ? wordCount(daily.answer) + ' 个词' : '未回答';
  q('#assessmentStatus').textContent = daily.assessmentSaved ? '已记录' : '未记录';
  q('[data-step="review"]').classList.toggle('completed', due.length === 0 || daily.reviewDone);
  q('[data-step="personal"]').classList.toggle('completed', daily.personalSaved);
  q('[data-step="listen"]').classList.toggle('completed', daily.listeningHeard && daily.listeningScore > 0 && (state.timeMode === 35 || daily.listeningDone) && daily.mastered.length >= mode.phraseTarget);
  q('[data-step="reading"]').classList.toggle('completed', daily.readingDone && wordCount(daily.readingSummary) >= readingTarget());
  q('[data-step="conversation"]').classList.toggle('completed', wordCount(daily.answer) >= speakingTarget());
  q('[data-step="assessment"]').classList.toggle('completed', daily.assessmentSaved);

  const items = requirements();
  const done = items.filter(function (item) { return item.done; }).length;
  const percent = Math.round(done / items.length * 100);
  q('#completionPercent').textContent = percent + '%';
  q('#completionText').textContent = percent === 100 ? '今天可以完成' : done ? '已完成 ' + done + ' / ' + items.length + ' 项' : '还没有开始';
  q('#requirementList').innerHTML = items.map(function (item) {
    return '<div class="requirement-item ' + (item.done ? 'done' : '') + '"><span>' + (item.done ? '已完成' : '待完成') + '</span>' + escapeHtml(item.label) + '</div>';
  }).join('');
  const completeButton = q('#completeDay');
  const alreadyDone = state.completedDays.includes(currentDay);
  completeButton.disabled = percent < 100 || alreadyDone || isCourseFinished();
  completeButton.textContent = isCourseFinished() ? '180天课程已完成' : alreadyDone ? '今天已完成' : currentDay === TOTAL_DAYS ? '完成第180天' : '完成今天并进入第' + (currentDay + 1) + '天';
  renderHeaderProgress();
}

function renderHeaderProgress() {
  const completed = state.completedDays.length;
  const phase = phaseForDay(currentDay);
  q('#headerPhaseText').textContent = '阶段 ' + phase.number + ' · ' + phase.name;
  q('#headerProgressText').textContent = isCourseFinished() ? '180天完成' : '第 ' + currentDay + ' 天';
  q('#headerProgressFill').style.width = Math.min(100, completed / Math.max(TOTAL_DAYS, 1) * 100) + '%';
}

function renderDueReview() {
  const due = dueExpressions();
  const container = q('#dueReview');
  if (!due.length) {
    dayState(currentDay).reviewDone = true;
    container.innerHTML = '<div class="review-empty">今天没有到期表达。新表达会按D+1、D+3、D+7、D+14、D+30回来。</div>';
    return;
  }
  dayState(currentDay).reviewDone = false;
  container.innerHTML = due.map(function (expression) {
    const revealed = revealedReviews.has(expression.id);
    return '<article class="review-card">' +
      '<div class="review-prompt"><span>根据中文先说英文</span><strong>' + escapeHtml(expression.cn) + '</strong>' +
      (revealed ? '<p lang="en">' + escapeHtml(expression.en) + '</p>' : '') + '</div>' +
      '<div class="review-actions">' +
      (revealed
        ? '<button data-review-listen="' + escapeHtml(expression.id) + '">听答案</button><button data-review-again="' + escapeHtml(expression.id) + '">还不熟</button><button class="primary" data-review-remember="' + escapeHtml(expression.id) + '">说对了</button>'
        : '<button class="primary" data-review-reveal="' + escapeHtml(expression.id) + '">显示答案</button>') +
      '</div></article>';
  }).join('');
  qa('[data-review-reveal]').forEach(function (button) {
    button.addEventListener('click', function () {
      revealedReviews.add(button.dataset.reviewReveal);
      renderDueReview();
    });
  });
  qa('[data-review-listen]').forEach(function (button) {
    button.addEventListener('click', function () {
      const expression = state.expressions.find(function (item) { return item.id === button.dataset.reviewListen; });
      speak(expression ? expression.en : '', 0.82);
    });
  });
  qa('[data-review-again]').forEach(function (button) {
    button.addEventListener('click', function () { reviewExpression(button.dataset.reviewAgain, false); });
  });
  qa('[data-review-remember]').forEach(function (button) {
    button.addEventListener('click', function () { reviewExpression(button.dataset.reviewRemember, true); });
  });
}

function reviewExpression(id, remembered) {
  const expression = state.expressions.find(function (item) { return item.id === id; });
  if (!expression) return;
  Object.assign(expression, core.nextReviewState(expression, currentDay, remembered, REVIEW_OFFSETS));
  revealedReviews.delete(id);
  if (!dueExpressions().length) dayState(currentDay).reviewDone = true;
  saveState();
  renderDueReview();
  renderTodayStatus();
}

function addExpression(cn, en, source, id) {
  const cleanCn = String(cn || '').trim();
  const cleanEn = String(en || '').trim();
  if (!cleanCn || !cleanEn) return false;
  const expressionId = id || Date.now() + '-' + Math.random().toString(16).slice(2);
  if (state.expressions.some(function (item) { return item.id === expressionId; })) return false;
  state.expressions.unshift({
    id: expressionId,
    cn: cleanCn,
    en: cleanEn,
    source: source || 'personal',
    createdDay: currentDay,
    srsStage: 0,
    repetitions: 0,
    totalReviews: 0,
    consecutive: 0,
    dueDay: currentDay + 1,
    createdAt: new Date().toISOString()
  });
  return true;
}

function addCoursePhrasesForDay(day) {
  const lesson = lessonFor(day);
  lesson.phrases.forEach(function (phrase, index) {
    addExpression(phrase[1], phrase[0], 'course', 'course-' + day + '-' + index);
  });
}

function renderAssessment() {
  const lesson = lessonFor(currentDay);
  if (lesson.kind !== 'stage-test') return;
  const stored = state.assessments[String(currentDay)] || null;
  const latest = stored && Array.isArray(stored.attempts) && stored.attempts.length ? stored.attempts[stored.attempts.length - 1] : null;
  q('#scoreSpeaking').value = latest ? latest.speaking : '';
  q('#scoreListening').value = latest ? latest.listening : '';
  q('#scoreReading').value = latest ? latest.reading : '';
  q('#scoreRetention').value = latest ? latest.retention : '';
  if (!latest) {
    q('#assessmentResult').textContent = '总分达到75，且任何单项不低于60，才算阶段通过。';
    return;
  }
  const firstTotal = stored.first ? stored.first.total : latest.total;
  q('#assessmentResult').textContent = '本次总分 ' + latest.total + '；第一次总分 ' + firstTotal + '。' + (latest.passed ? '阶段已通过。' : '暂未通过：下一周先减少新内容，集中修复最低项。');
}

function saveAssessment() {
  const rawValues = {
    speaking: Number(q('#scoreSpeaking').value),
    listening: Number(q('#scoreListening').value),
    reading: Number(q('#scoreReading').value),
    retention: Number(q('#scoreRetention').value)
  };
  const calculated = core.calculateAssessment(rawValues);
  if (!calculated.valid) {
    showToast('请把四项成绩都填写为0—100之间的数字');
    return;
  }
  const values = Object.assign({}, calculated.scores, { total: calculated.total, passed: calculated.passed });
  values.createdAt = new Date().toISOString();
  const key = String(currentDay);
  const record = state.assessments[key] && typeof state.assessments[key] === 'object' ? state.assessments[key] : { first: null, attempts: [] };
  if (!record.first) record.first = Object.assign({}, values);
  record.attempts = Array.isArray(record.attempts) ? record.attempts : [];
  record.attempts.push(values);
  state.assessments[key] = record;
  dayState(currentDay).assessmentSaved = true;
  saveState();
  renderAssessment();
  renderTodayStatus();
  showToast(values.passed ? '阶段成绩已保存：通过' : '阶段成绩已保存：需要专项修复');
}

function completeCurrentDay() {
  if (!requirements().every(function (item) { return item.done; })) {
    showToast('还有验收项目没有完成');
    return;
  }
  if (state.completedDays.includes(currentDay)) return;
  const completedDay = currentDay;
  const daily = dayState(completedDay);
  daily.completedMode = state.timeMode;
  daily.completedAt = new Date().toISOString();
  state.completedDays.push(completedDay);
  state.completedDays = normalizeCompletedDays(state.completedDays);
  state.totalPlannedMinutes = Number(state.totalPlannedMinutes || 0) + state.timeMode;
  addCoursePhrasesForDay(completedDay);
  saveState();
  if (state.completedDays.length >= TOTAL_DAYS) {
    currentDay = TOTAL_DAYS;
    renderToday();
    renderProgress();
    setView('progress');
    showToast('180天全部训练已经完成');
    return;
  }
  currentDay = firstIncompleteDay();
  previewDay = currentDay;
  q('#personalChinese').value = '';
  q('#personalEnglish').value = '';
  renderToday();
  renderPath();
  renderProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('已经进入第 ' + currentDay + ' 天');
}

function renderExpressions() {
  const due = dueExpressions();
  const mastered = state.expressions.filter(function (expression) { return Number(expression.srsStage || 0) >= REVIEW_OFFSETS.length; });
  q('#expressionTotal').textContent = state.expressions.length;
  q('#expressionDue').textContent = due.length;
  q('#expressionMastered').textContent = mastered.length;
  const visible = state.expressions.filter(function (expression) {
    if (activeExpressionFilter === 'due') return Number(expression.dueDay || 1) <= currentDay;
    if (activeExpressionFilter === 'mastered') return Number(expression.srsStage || 0) >= REVIEW_OFFSETS.length;
    return true;
  });
  const library = q('#expressionLibrary');
  if (!visible.length) {
    library.innerHTML = '<div class="empty-state">' + (state.expressions.length ? '这个分类里还没有表达。' : '完成今天的个人表达后，第一句话会出现在这里。') + '</div>';
    return;
  }
  library.innerHTML = visible.map(function (expression) {
    const stage = Number(expression.srsStage || 0);
    const source = expression.source === 'course' ? '课程词块' : '个人表达';
    const isDue = Number(expression.dueDay || 1) <= currentDay;
    return '<article class="expression-card">' +
      '<span class="review-count">' + String(stage).padStart(2, '0') + '</span>' +
      '<div class="expression-copy"><strong lang="en">' + escapeHtml(expression.en) + '</strong><span>' + escapeHtml(expression.cn) + '</span>' +
      '<div class="expression-meta">' + source + ' · ' + expressionDateLabel(expression) + ' · 复习阶段 ' + stage + '/5</div></div>' +
      '<div class="expression-actions"><button data-library-listen="' + escapeHtml(expression.id) + '">听发音</button>' +
      (isDue ? '<button class="primary" data-library-review="' + escapeHtml(expression.id) + '">我能想起</button>' : '') +
      '<button data-library-delete="' + escapeHtml(expression.id) + '">删除</button></div></article>';
  }).join('');
  qa('[data-library-listen]').forEach(function (button) {
    button.addEventListener('click', function () {
      const expression = state.expressions.find(function (item) { return item.id === button.dataset.libraryListen; });
      speak(expression ? expression.en : '', 0.82);
    });
  });
  qa('[data-library-review]').forEach(function (button) {
    button.addEventListener('click', function () {
      reviewExpression(button.dataset.libraryReview, true);
      renderExpressions();
    });
  });
  qa('[data-library-delete]').forEach(function (button) {
    button.addEventListener('click', function () {
      state.expressions = state.expressions.filter(function (item) { return item.id !== button.dataset.libraryDelete; });
      saveState();
      renderExpressions();
    });
  });
}

function expressionDateLabel(expression) {
  if (Number(expression.dueDay || 1) <= currentDay) return '今天需要复习';
  return '第 ' + expression.dueDay + ' 天复习';
}

function renderPath() {
  q('#phaseOverview').innerHTML = phases.map(function (phase) {
    const completed = state.completedDays.filter(function (day) { return day >= phase.start && day <= phase.end; }).length;
    return '<article class="phase-card ' + (currentDay >= phase.start && currentDay <= phase.end ? 'current' : '') + '">' +
      '<span class="phase-number">0' + phase.number + '</span><div><strong>' + escapeHtml(phase.name) + '</strong><small>第 ' + phase.start + '—' + phase.end + ' 天</small></div>' +
      '<p>' + escapeHtml(phase.goal) + '</p><div class="phase-bar"><span style="width:' + Math.round(completed / 30 * 100) + '%"></span></div><small>' + completed + ' / 30 天</small></article>';
  }).join('');

  q('#courseMap').innerHTML = phases.map(function (phase) {
    const lessons = [];
    for (let day = phase.start; day <= Math.min(phase.end, TOTAL_DAYS); day += 1) {
      const lesson = lessonFor(day);
      const done = state.completedDays.includes(day);
      const current = day === currentDay && !isCourseFinished();
      lessons.push('<button class="course-day ' + (done ? 'done' : '') + ' ' + (current ? 'current' : '') + '" data-preview-day="' + day + '">' +
        '<span>' + String(day).padStart(3, '0') + '</span><strong>' + escapeHtml(lesson.theme) + '</strong><small>' + (lesson.kind === 'stage-test' ? '阶段盲测' : lesson.kind === 'weekly-review' ? '每周复测' : escapeHtml(lesson.outcome)) + '</small></button>');
    }
    return '<section class="phase-days"><header><span>阶段 ' + phase.number + '</span><h2>' + escapeHtml(phase.name) + '</h2><p>' + escapeHtml(phase.gate) + '</p></header><div class="phase-day-list">' + lessons.join('') + '</div></section>';
  }).join('');
  qa('[data-preview-day]').forEach(function (button) {
    button.addEventListener('click', function () {
      previewDay = Number(button.dataset.previewDay);
      renderCoursePreview();
      qa('[data-preview-day]').forEach(function (item) { item.classList.toggle('selected', item === button); });
    });
  });
  renderCoursePreview();
}

function renderCoursePreview() {
  const lesson = lessonFor(previewDay);
  const phase = phaseForDay(previewDay);
  q('#coursePreview').innerHTML = '<span class="preview-day">第 ' + previewDay + ' 天 · 阶段 ' + phase.number + '</span>' +
    '<h2>' + escapeHtml(lesson.theme) + '</h2><p>' + escapeHtml(lesson.focus) + '</p>' +
    '<dl><div><dt>当天作品</dt><dd>' + escapeHtml(lesson.outcome) + '</dd></div>' +
    '<div><dt>个人表达</dt><dd>' + escapeHtml(lesson.diaryPrompt) + '</dd></div>' +
    '<div><dt>听力任务</dt><dd>' + escapeHtml(lesson.listening.task) + '</dd></div>' +
    '<div><dt>阅读任务</dt><dd>' + escapeHtml(lesson.reading.task) + '</dd></div>' +
    '<div><dt>口语任务</dt><dd lang="en">' + escapeHtml(lesson.speakingPrompt) + '</dd></div></dl>' +
    '<ol>' + lesson.phrases.map(function (phrase) { return '<li><span lang="en">' + escapeHtml(phrase[0]) + '</span><small>' + escapeHtml(phrase[1]) + '</small></li>'; }).join('') + '</ol>' +
    (previewDay === currentDay && !isCourseFinished() ? '<button class="primary-action" data-train-current>回到今天开始训练</button>' : '<p class="preview-note">可以预览，训练进度仍按顺序进行。</p>');
  const trainButton = q('[data-train-current]');
  if (trainButton) trainButton.addEventListener('click', function () { setView('today'); });
}

function selectVideo(index) {
  if (!videos.length) return;
  const safeIndex = Math.min(Math.max(Number(index || 0), 0), videos.length - 1);
  state.selectedVideo = safeIndex;
  saveState();
  const video = videos[safeIndex];
  const player = q('#immersionVideo');
  if (localVideoUrl) {
    URL.revokeObjectURL(localVideoUrl);
    localVideoUrl = '';
  }
  player.src = video.src;
  q('#videoTitle').textContent = video.title;
  q('#videoNote').textContent = video.note;
  q('#videoSource').href = video.page;
  q('#videoSource').textContent = '查看原课程';
  qa('.video-option').forEach(function (button, position) { button.classList.toggle('active', position === safeIndex); });
}

function renderVideos() {
  q('#videoList').innerHTML = videos.map(function (video, index) {
    return '<button class="video-option ' + (index === Number(state.selectedVideo || 0) ? 'active' : '') + '" data-video-index="' + index + '">' +
      '<span>' + String(index + 1).padStart(2, '0') + '</span><span><strong>' + escapeHtml(video.title) + '</strong><small>' + escapeHtml(video.note) + '</small></span></button>';
  }).join('');
  qa('[data-video-index]').forEach(function (button) {
    button.addEventListener('click', function () { selectVideo(Number(button.dataset.videoIndex)); });
  });
  if (videos.length) selectVideo(Number(state.selectedVideo || 0));
}

function buildInteractiveTranscript() {
  const text = q('#transcriptInput').value.trim();
  if (!text) {
    showToast('请先粘贴台词或载入今天的台词');
    return;
  }
  const parts = text.split(/(\b[A-Za-z][A-Za-z'-]*\b)/g);
  q('#interactiveTranscript').innerHTML = parts.map(function (part) {
    return /^[A-Za-z][A-Za-z'-]*$/.test(part)
      ? '<button class="transcript-word" data-word="' + escapeHtml(part.toLowerCase()) + '">' + escapeHtml(part) + '</button>'
      : escapeHtml(part);
  }).join('');
  qa('[data-word]').forEach(function (button) {
    button.addEventListener('click', function () { lookupWord(button.dataset.word); });
  });
}

const commonMeanings = {
  i: '我', you: '你；你们', we: '我们', they: '他们；她们；它们', he: '他', she: '她',
  am: '是；处于', is: '是；处于', are: '是；处于', be: '成为；处于', have: '有；拥有', do: '做',
  live: '居住；生活', learn: '学习', speak: '说；讲', read: '阅读', listen: '听', want: '想要',
  need: '需要', like: '喜欢', work: '工作', family: '家庭；家人', friend: '朋友', today: '今天',
  tomorrow: '明天', yesterday: '昨天', because: '因为', but: '但是', and: '和；并且', so: '所以',
  can: '能够；可以', could: '可以；能够（更礼貌）', would: '会；愿意', should: '应该', what: '什么',
  where: '哪里', when: '什么时候', why: '为什么', how: '怎样；如何', name: '名字', English: '英语'
};

async function lookupWord(word) {
  selectedWord = String(word || '').toLowerCase();
  q('#wordTitle').textContent = selectedWord;
  q('#wordPhonetic').textContent = '正在查找发音和解释…';
  q('#wordMeaning').textContent = commonMeanings[selectedWord] || '';
  q('#speakWord').disabled = false;
  if (commonMeanings[selectedWord]) {
    q('#wordPhonetic').textContent = '点击下方按钮单独听发音。';
    return;
  }
  try {
    const response = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(selectedWord));
    if (!response.ok) throw new Error('not found');
    const data = await response.json();
    const entry = data[0] || {};
    const meaningGroups = entry.meanings || [];
    const definition = meaningGroups[0] && meaningGroups[0].definitions && meaningGroups[0].definitions[0]
      ? meaningGroups[0].definitions[0].definition
      : '';
    q('#wordPhonetic').textContent = entry.phonetic || '点击下方按钮单独听发音。';
    q('#wordMeaning').textContent = definition || '没有找到简明解释，请结合整句理解。';
  } catch (error) {
    q('#wordPhonetic').textContent = '暂时无法连接词典。';
    q('#wordMeaning').textContent = '仍可点击下方按钮听发音，并结合句子判断意思。';
  }
}

function renderProgress() {
  q('#metricDays').textContent = state.completedDays.length + ' 天';
  q('#metricExpressions').textContent = state.expressions.length + ' 句';
  q('#metricLongest').textContent = state.longestAnswerWords + ' 词';
  const scores = Object.keys(state.days).map(function (key) { return Number(state.days[key].listeningScore || 0); }).filter(Boolean);
  const average = scores.length ? Math.round(scores.reduce(function (sum, score) { return sum + score; }, 0) / scores.length) + '%' : '—';
  q('#metricListening').textContent = average;

  const assessmentDays = curriculum.map(function (raw, index) {
    const lesson = lessonFor(index + 1);
    return lesson.kind === 'stage-test' ? index + 1 : null;
  }).filter(Boolean);
  const finalAssessmentDays = assessmentDays.length ? assessmentDays : STAGE_DAYS.filter(function (day) { return day <= TOTAL_DAYS; });
  q('#assessmentGrid').innerHTML = finalAssessmentDays.map(function (day) {
    const lesson = lessonFor(day);
    const record = state.assessments[String(day)];
    const latest = record && record.attempts && record.attempts.length ? record.attempts[record.attempts.length - 1] : null;
    const status = latest ? (latest.passed ? '已通过 · ' + latest.total + '分' : '待修复 · ' + latest.total + '分') : state.completedDays.includes(day) ? '已完成，未记录分数' : lesson.outcome;
    return '<article class="assessment-card ' + (latest && latest.passed ? 'done' : latest ? 'repair' : '') + '"><span>第 ' + day + ' 天</span><strong>' + escapeHtml(lesson.theme) + '</strong><small>' + escapeHtml(status) + '</small></article>';
  }).join('');

  q('#phaseProgressList').innerHTML = phases.map(function (phase) {
    const completed = state.completedDays.filter(function (day) { return day >= phase.start && day <= phase.end; }).length;
    return '<article class="phase-progress-row"><span>阶段 ' + phase.number + '</span><div><strong>' + escapeHtml(phase.name) + '</strong><small>' + escapeHtml(phase.gate) + '</small><div class="progress-track"><span style="width:' + Math.round(completed / 30 * 100) + '%"></span></div></div><b>' + completed + '/30</b></article>';
  }).join('');
}

function exportLearningData() {
  const payload = JSON.stringify({ exportedAt: new Date().toISOString(), product: '开口英语180天', state: state }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'spoken-english-180-backup.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  showToast('学习记录已经导出');
}

function wireStaticEvents() {
  qa('.nav-item').forEach(function (button) {
    button.addEventListener('click', function () { setView(button.dataset.view); });
  });
  qa('[data-open-view]').forEach(function (button) {
    button.addEventListener('click', function () { setView(button.dataset.openView); });
  });
  qa('[data-minutes]').forEach(function (button) {
    button.addEventListener('click', function () {
      state.timeMode = Number(button.dataset.minutes);
      saveState();
      renderTimeMode();
      renderTodayStatus();
    });
  });
  qa('[data-listening-score]').forEach(function (button) {
    button.addEventListener('click', function () {
      dayState(currentDay).listeningScore = Number(button.dataset.listeningScore);
      saveState();
      renderListeningScore();
      renderTodayStatus();
    });
  });
  qa('[data-expression-filter]').forEach(function (button) {
    button.addEventListener('click', function () {
      activeExpressionFilter = button.dataset.expressionFilter;
      qa('[data-expression-filter]').forEach(function (item) {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      renderExpressions();
    });
  });

  q('#saveExpression').addEventListener('click', function () {
    const cn = q('#personalChinese').value.trim();
    const en = q('#personalEnglish').value.trim();
    if (!cn || !en) {
      showToast('请先填写中文和英文；不会写时从上面的5个句型改写');
      return;
    }
    addExpression(cn, en, 'personal');
    dayState(currentDay).personalSaved = true;
    q('#personalChinese').value = '';
    q('#personalEnglish').value = '';
    saveState();
    renderTodayStatus();
    showToast('已保存，系统会安排五次主动回忆');
  });
  q('#listenPersonal').addEventListener('click', function () {
    const english = q('#personalEnglish').value.trim();
    if (!english) {
      showToast('请先填写英文');
      return;
    }
    speak(english, 0.82);
  });

  q('#listenFirstPass').addEventListener('click', function () {
    const button = q('#listenFirstPass');
    button.disabled = true;
    button.textContent = '正在播放…';
    speak(lessonFor(currentDay).listening.script, 0.82, function () {
      dayState(currentDay).listeningHeard = true;
      button.disabled = false;
      button.textContent = '第一次只听';
      saveState();
      renderTodayStatus();
      showToast('首听完成，请记录真实理解率');
    }, function () {
      button.disabled = false;
      button.textContent = '第一次只听';
      q('#confirmManualListening').hidden = false;
      showToast('播放没有完成，不会计入学习结果');
    });
  });
  q('#listenReplay').addEventListener('click', function () { speak(lessonFor(currentDay).listening.script, 0.78); });
  q('#revealTranscript').addEventListener('click', function () {
    const daily = dayState(currentDay);
    daily.transcriptRevealed = !daily.transcriptRevealed;
    saveState();
    q('#listeningTranscript').hidden = !daily.transcriptRevealed;
    q('#revealTranscript').textContent = daily.transcriptRevealed ? '隐藏英文台词' : '查看英文台词';
  });
  q('#completeListeningRetest').addEventListener('click', function () {
    const daily = dayState(currentDay);
    if (!daily.listeningHeard || !daily.listeningScore) {
      showToast('先完成第一次只听，并记录真实理解率');
      return;
    }
    daily.transcriptRevealed = false;
    q('#listeningTranscript').hidden = true;
    q('#revealTranscript').textContent = '查看英文台词';
    const button = q('#completeListeningRetest');
    button.disabled = true;
    button.textContent = '正在进行无台词复测…';
    speak(lessonFor(currentDay).listening.script, 0.86, function () {
      daily.listeningDone = true;
      button.disabled = false;
      button.textContent = '重新进行关闭台词复测';
      saveState();
      renderTodayStatus();
      showToast('无台词复测已完成');
    }, function () {
      button.disabled = false;
      button.textContent = '完成关闭台词复测';
      q('#confirmManualRetest').hidden = false;
      showToast('复测播放没有完成，请再试一次');
    });
  });
  q('#confirmManualListening').addEventListener('click', function () {
    dayState(currentDay).listeningHeard = true;
    q('#confirmManualListening').hidden = true;
    saveState();
    renderTodayStatus();
    showToast('已记录外部音频首听；请继续填写真实理解率');
  });
  q('#confirmManualRetest').addEventListener('click', function () {
    const daily = dayState(currentDay);
    if (!daily.listeningHeard || !daily.listeningScore) {
      showToast('先完成首听并记录真实理解率');
      return;
    }
    daily.listeningDone = true;
    daily.transcriptRevealed = false;
    q('#listeningTranscript').hidden = true;
    q('#confirmManualRetest').hidden = true;
    saveState();
    renderTodayStatus();
    showToast('已记录外部音频无台词复测');
  });

  q('#readAloud').addEventListener('click', function () { speak(lessonFor(currentDay).reading.text, 0.8); });
  q('#saveReading').addEventListener('click', function () {
    const summary = q('#readingSummary').value.trim();
    if (!summary) {
      showToast('先用简单英文写出你理解的内容');
      return;
    }
    const words = wordCount(summary);
    const daily = dayState(currentDay);
    daily.readingSummary = summary;
    daily.readingDone = words >= readingTarget();
    saveState();
    q('#readingFeedback').textContent = words >= readingTarget()
      ? '已保存 ' + words + ' 个英文词。现在请脱离文章把总结大声说一遍。'
      : '已经写了 ' + words + ' 个词；今天的模式需要至少 ' + readingTarget() + ' 个词，再补充一个重要细节。';
    renderTodayStatus();
  });

  q('#recordAnswer').addEventListener('click', function () {
    if (!SpeechRecognition) {
      showToast('当前浏览器不支持语音识别，可以直接手动输入；推荐Chrome或Edge');
      return;
    }
    if (activeRecognition) {
      activeRecognition.stop();
      return;
    }
    const button = q('#recordAnswer');
    const recognition = new SpeechRecognition();
    activeRecognition = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = true;
    button.textContent = '正在听…再次点击停止';
    button.classList.add('recording');
    function restore() {
      activeRecognition = null;
      button.textContent = '语音转文字';
      button.classList.remove('recording');
    }
    recognition.onresult = function (event) {
      const parts = [];
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        if (event.results[index].isFinal) parts.push(event.results[index][0].transcript);
      }
      if (parts.length) {
        const existing = q('#conversationAnswer').value.trim();
        q('#conversationAnswer').value = (existing ? existing + ' ' : '') + parts.join(' ');
      }
    };
    recognition.onerror = function () {
      showToast('没有听清或麦克风不可用，可以手动输入回答');
      restore();
    };
    recognition.onend = restore;
    try {
      recognition.start();
    } catch (error) {
      restore();
      showToast('语音识别没有启动，请检查麦克风权限');
    }
  });
  q('#recordAnswer').addEventListener('dblclick', function () {
    if (activeRecognition) activeRecognition.stop();
  });
  q('#recordAudio').addEventListener('click', async function () {
    const button = q('#recordAudio');
    if (activeRecorder && activeRecorder.state === 'recording') {
      activeRecorder.stop();
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
      showToast('当前浏览器不支持原始录音，仍可使用语音转文字或手动输入');
      return;
    }
    try {
      activeRecorderStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorderChunks = [];
      recorderStartedAt = Date.now();
      activeRecorder = new MediaRecorder(activeRecorderStream);
      activeRecorder.ondataavailable = function (event) {
        if (event.data && event.data.size) recorderChunks.push(event.data);
      };
      activeRecorder.onstop = async function () {
        const seconds = Math.max(1, Math.round((Date.now() - recorderStartedAt) / 1000));
        const blob = new Blob(recorderChunks, { type: activeRecorder.mimeType || 'audio/webm' });
        activeRecorderStream.getTracks().forEach(function (track) { track.stop(); });
        activeRecorderStream = null;
        activeRecorder = null;
        button.textContent = '录制原始音频';
        button.classList.remove('recording');
        try {
          await saveAudioBlob(currentDay, blob);
          dayState(currentDay).audioSaved = true;
          dayState(currentDay).audioSeconds = seconds;
          saveState();
          renderAudioEvidence(currentDay);
          showToast('原始录音已保存到当前浏览器');
        } catch (error) {
          showToast('录音完成，但浏览器没有保存成功');
        }
      };
      activeRecorder.onerror = function () {
        if (activeRecorderStream) activeRecorderStream.getTracks().forEach(function (track) { track.stop(); });
        activeRecorderStream = null;
        activeRecorder = null;
        button.textContent = '录制原始音频';
        button.classList.remove('recording');
        showToast('录音中断，请检查麦克风权限');
      };
      activeRecorder.start();
      button.textContent = '停止并保存录音';
      button.classList.add('recording');
    } catch (error) {
      showToast('没有获得麦克风权限，仍可手动输入回答');
    }
  });
  q('#listenAnswer').addEventListener('click', function () {
    const answer = q('#conversationAnswer').value.trim();
    if (!answer) {
      showToast('还没有可以播放的回答');
      return;
    }
    speak(answer, 0.84);
  });
  q('#saveAnswer').addEventListener('click', function () {
    const answer = q('#conversationAnswer').value.trim();
    if (!answer) {
      showToast('先用英文回答今天的口语题');
      return;
    }
    const words = wordCount(answer);
    const daily = dayState(currentDay);
    const hadAnswer = Boolean(daily.answer);
    daily.answer = answer;
    if (!hadAnswer) state.conversationCount += 1;
    state.longestAnswerWords = Math.max(Number(state.longestAnswerWords || 0), words);
    saveState();
    q('#answerFeedback').textContent = words >= speakingTarget()
      ? '已保存 ' + words + ' 个词。请换一个细节再说一遍，检查自己能否迁移表达。'
      : '已经表达了 ' + words + ' 个词；今天至少需要 ' + speakingTarget() + ' 个词，再补充原因或例子。';
    renderTodayStatus();
  });

  q('#saveAssessment').addEventListener('click', saveAssessment);
  q('#completeDay').addEventListener('click', completeCurrentDay);
  q('#exportData').addEventListener('click', exportLearningData);

  q('#localVideo').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;
    if (localVideoUrl) URL.revokeObjectURL(localVideoUrl);
    localVideoUrl = URL.createObjectURL(file);
    q('#immersionVideo').src = localVideoUrl;
    q('#videoTitle').textContent = file.name;
    q('#videoNote').textContent = '本机视频 · 刷新后需要重新选择 · 不会上传';
    q('#videoSource').removeAttribute('href');
    q('#videoSource').textContent = '本机视频';
    qa('.video-option').forEach(function (button) { button.classList.remove('active'); });
  });
  q('#immersionVideo').addEventListener('error', function () {
    q('#videoNote').textContent = '视频暂时无法加载。可以打开原课程，或选择另一个视频。';
    showToast('视频没有加载成功，请换一个视频或打开原课程');
  });
  q('#loadTodayTranscript').addEventListener('click', function () {
    q('#transcriptInput').value = lessonFor(currentDay).listening.script;
    buildInteractiveTranscript();
  });
  q('#buildTranscript').addEventListener('click', buildInteractiveTranscript);
  q('#speakWord').addEventListener('click', function () { if (selectedWord) speak(selectedWord, 0.72); });
}

function initializeOnboarding() {
  const modal = q('#onboarding');
  modal.hidden = state.onboarded;
  let selected = state.timeMode;
  qa('[data-onboard-minutes]').forEach(function (button) {
    const active = Number(button.dataset.onboardMinutes) === selected;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
    button.addEventListener('click', function () {
      selected = Number(button.dataset.onboardMinutes);
      qa('[data-onboard-minutes]').forEach(function (item) {
        const itemActive = item === button;
        item.classList.toggle('active', itemActive);
        item.setAttribute('aria-pressed', String(itemActive));
      });
    });
  });
  q('#finishOnboarding').addEventListener('click', function () {
    state.timeMode = selected;
    state.onboarded = true;
    saveState();
    modal.hidden = true;
    renderToday();
  });
}

wireStaticEvents();
renderToday();
renderExpressions();
renderVideos();
renderPath();
renderProgress();
initializeOnboarding();
if (state.migratedFrom) saveState();
