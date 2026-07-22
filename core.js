(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.SPOKEN_ENGLISH_CORE = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  function normalizeCompletedDays(value, totalDays) {
    const total = Number(totalDays || 180);
    const days = Array.isArray(value) ? value : [];
    return Array.from(new Set(days.map(Number).filter(function (day) {
      return Number.isInteger(day) && day >= 1 && day <= total;
    }))).sort(function (a, b) { return a - b; });
  }

  function firstIncompleteDay(value, totalDays) {
    const total = Number(totalDays || 180);
    const completed = new Set(normalizeCompletedDays(value, total));
    for (let day = 1; day <= total; day += 1) {
      if (!completed.has(day)) return day;
    }
    return total;
  }

  function normalizeTimeMode(value) {
    const minutes = Number(value);
    if (minutes === 35 || minutes === 90 || minutes === 180) return minutes;
    if (minutes <= 15) return 35;
    if (minutes <= 30) return 90;
    return 180;
  }

  function migrateV2(previous, totalDays) {
    const source = previous && typeof previous === 'object' ? previous : {};
    const migrated = {
      onboarded: Boolean(source.onboarded),
      timeMode: normalizeTimeMode(source.timeMode),
      completedDays: normalizeCompletedDays(source.completedDays, totalDays),
      expressions: Array.isArray(source.expressions) ? source.expressions.map(function (expression) {
        return Object.assign({ source: 'personal', srsStage: Number(expression.repetitions || 0) }, expression);
      }) : [],
      conversationCount: Number(source.conversationCount || 0),
      longestAnswerWords: Number(source.longestAnswerWords || 0),
      selectedVideo: Number(source.selectedVideo || 0),
      days: {}
    };
    if (source.days && typeof source.days === 'object') {
      Object.keys(source.days).forEach(function (key) {
        const oldDay = source.days[key] || {};
        migrated.days[key] = {
          mastered: Array.isArray(oldDay.mastered) ? oldDay.mastered : [],
          personalSaved: Boolean(oldDay.personalSaved),
          listeningHeard: Boolean(oldDay.listened),
          listeningScore: oldDay.listened ? 50 : 0,
          listeningDone: Boolean(oldDay.listened),
          transcriptRevealed: false,
          readingSummary: '',
          readingDone: false,
          answer: oldDay.answer || '',
          reviewDone: Boolean(oldDay.reviewDone)
        };
      });
    }
    return migrated;
  }

  function nextReviewState(expression, currentDay, remembered, offsets) {
    const schedule = Array.isArray(offsets) && offsets.length ? offsets : [1, 3, 7, 14, 30];
    const next = Object.assign({}, expression);
    const stage = Number(next.srsStage || 0);
    const today = Number(currentDay || 1);
    next.totalReviews = Number(next.totalReviews || next.repetitions || 0) + 1;
    next.lastReviewedDay = today;
    next.lastResult = remembered ? 'remembered' : 'again';

    if (remembered) {
      const nextStage = Math.min(schedule.length, stage + 1);
      next.srsStage = nextStage;
      next.consecutive = Number(next.consecutive || 0) + 1;
      next.repetitions = Number(next.repetitions || 0) + 1;
      const offset = schedule[nextStage];
      next.dueDay = offset == null
        ? today + 60
        : Math.max(today + 1, Number(next.createdDay || today) + Number(offset));
    } else {
      next.srsStage = Math.max(0, stage - 1);
      next.consecutive = 0;
      next.dueDay = today + 1;
    }
    return next;
  }

  function calculateAssessment(scores) {
    const values = {
      speaking: Number(scores && scores.speaking),
      listening: Number(scores && scores.listening),
      reading: Number(scores && scores.reading),
      retention: Number(scores && scores.retention)
    };
    const valid = Object.keys(values).every(function (key) {
      return Number.isFinite(values[key]) && values[key] >= 0 && values[key] <= 100;
    });
    if (!valid) return { valid: false, total: null, passed: false, scores: values };
    const total = Math.round(values.speaking * 0.4 + values.listening * 0.25 + values.reading * 0.2 + values.retention * 0.15);
    return {
      valid: true,
      total: total,
      passed: total >= 75 && Math.min(values.speaking, values.listening, values.reading, values.retention) >= 60,
      scores: values
    };
  }

  return {
    normalizeCompletedDays: normalizeCompletedDays,
    firstIncompleteDay: firstIncompleteDay,
    normalizeTimeMode: normalizeTimeMode,
    migrateV2: migrateV2,
    nextReviewState: nextReviewState,
    calculateAssessment: calculateAssessment
  };
});
