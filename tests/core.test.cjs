const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../core.js');

test('normalizes sparse, duplicated, string and invalid completed days', function () {
  assert.deepEqual(core.normalizeCompletedDays([3, 1, 1, 0, 181, '2'], 180), [1, 2, 3]);
});

test('finds the first real gap instead of using completed count', function () {
  assert.equal(core.firstIncompleteDay([1, 2, 4], 180), 3);
  assert.equal(core.firstIncompleteDay(Array.from({ length: 30 }, function (_, index) { return index + 1; }), 180), 31);
  assert.equal(core.firstIncompleteDay(Array.from({ length: 180 }, function (_, index) { return index + 1; }), 180), 180);
});

test('migrates a completed 30-day V2 learner into day 31 without losing evidence', function () {
  const old = {
    version: 2,
    onboarded: true,
    timeMode: 60,
    completedDays: Array.from({ length: 30 }, function (_, index) { return index + 1; }),
    expressions: [{ id: 'old-1', en: 'I am ready.', cn: '我准备好了。', repetitions: 2, dueDay: 31 }],
    days: { 30: { mastered: [0, 1, 2, 3, 4], personalSaved: true, listened: true, answer: 'I finished phase one.', reviewDone: true } },
    conversationCount: 10,
    longestAnswerWords: 25,
    selectedVideo: 2
  };
  const migrated = core.migrateV2(old, 180);
  assert.equal(core.firstIncompleteDay(migrated.completedDays, 180), 31);
  assert.equal(migrated.expressions[0].dueDay, 31);
  assert.equal(migrated.days[30].answer, 'I finished phase one.');
  assert.equal(migrated.conversationCount, 10);
  assert.equal(migrated.timeMode, 180);
});

test('uses D+1, D+3, D+7, D+14 and D+30 review dates', function () {
  let expression = { createdDay: 1, dueDay: 2, srsStage: 0, repetitions: 0 };
  expression = core.nextReviewState(expression, 2, true);
  assert.equal(expression.dueDay, 4);
  expression = core.nextReviewState(expression, 4, true);
  assert.equal(expression.dueDay, 8);
  expression = core.nextReviewState(expression, 8, true);
  assert.equal(expression.dueDay, 15);
  expression = core.nextReviewState(expression, 15, true);
  assert.equal(expression.dueDay, 31);
  expression = core.nextReviewState(expression, 31, true);
  assert.equal(expression.srsStage, 5);
  assert.equal(expression.dueDay, 91);
});

test('a forgotten expression returns tomorrow and loses one schedule stage', function () {
  const expression = core.nextReviewState({ createdDay: 1, srsStage: 3, consecutive: 3 }, 20, false);
  assert.equal(expression.dueDay, 21);
  assert.equal(expression.srsStage, 2);
  assert.equal(expression.consecutive, 0);
});

test('stage assessment requires total 75 and every skill at least 60', function () {
  assert.deepEqual(core.calculateAssessment({ speaking: 80, listening: 80, reading: 80, retention: 80 }).passed, true);
  assert.deepEqual(core.calculateAssessment({ speaking: 100, listening: 100, reading: 100, retention: 50 }).passed, false);
  assert.deepEqual(core.calculateAssessment({ speaking: 70, listening: 70, reading: 70, retention: 70 }).passed, false);
  assert.deepEqual(core.calculateAssessment({ speaking: -1, listening: 80, reading: 80, retention: 80 }).valid, false);
});
