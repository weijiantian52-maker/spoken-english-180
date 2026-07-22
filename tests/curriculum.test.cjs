const test = require('node:test');
const assert = require('node:assert/strict');

global.window = {};
require('../curriculum180.js');
const curriculum = global.window.SPOKEN_ENGLISH_CURRICULUM_180;
const phases = global.window.SPOKEN_ENGLISH_PHASES;

test('contains exactly 180 ordered lessons across six 30-day phases', function () {
  assert.equal(curriculum.length, 180);
  assert.equal(phases.length, 6);
  assert.deepEqual(curriculum.map(function (lesson) { return lesson.day; }), Array.from({ length: 180 }, function (_, index) { return index + 1; }));
  for (let phase = 1; phase <= 6; phase += 1) {
    assert.equal(curriculum.filter(function (lesson) { return lesson.phase === phase; }).length, 30);
  }
});

test('contains 150 lessons, 24 weekly reviews and six stage tests', function () {
  assert.equal(curriculum.filter(function (lesson) { return lesson.kind === 'lesson'; }).length, 150);
  assert.equal(curriculum.filter(function (lesson) { return lesson.kind === 'weekly-review'; }).length, 24);
  assert.equal(curriculum.filter(function (lesson) { return lesson.kind === 'stage-test'; }).length, 6);
});

test('every lesson has complete speaking, listening, reading and phrase material', function () {
  curriculum.forEach(function (lesson) {
    assert.ok(lesson.theme && lesson.focus && lesson.outcome);
    assert.ok(lesson.diaryPrompt && lesson.speakingPrompt);
    assert.equal(lesson.phrases.length, 5);
    lesson.phrases.forEach(function (phrase) {
      assert.ok(phrase[0].trim());
      assert.ok(phrase[1].trim());
    });
    assert.ok(lesson.listening.title && lesson.listening.script && lesson.listening.task);
    assert.ok(lesson.reading.title && lesson.reading.text && lesson.reading.task);
  });
});

test('ordinary materials grow by phase and never collapse to five short phrases', function () {
  const readingMinimums = [80, 105, 145, 195, 255, 335];
  const listeningMinimums = [60, 75, 100, 130, 160, 205];
  for (let phase = 1; phase <= 6; phase += 1) {
    const rows = curriculum.filter(function (lesson) { return lesson.phase === phase; });
    const readingWords = rows.map(function (lesson) { return lesson.reading.text.trim().split(/\s+/).length; });
    const listeningWords = rows.map(function (lesson) { return lesson.listening.script.trim().split(/\s+/).length; });
    assert.ok(Math.min.apply(null, readingWords) >= readingMinimums[phase - 1]);
    assert.ok(Math.min.apply(null, listeningWords) >= listeningMinimums[phase - 1]);
  }
});

test('ships 900 distinct English learning chunks', function () {
  const chunks = curriculum.flatMap(function (lesson) { return lesson.phrases.map(function (phrase) { return phrase[0]; }); });
  assert.equal(chunks.length, 900);
  assert.equal(new Set(chunks).size, 900);
});
