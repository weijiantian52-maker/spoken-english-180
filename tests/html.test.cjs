const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

test('HTML has no duplicate ids', function () {
  const ids = Array.from(html.matchAll(/\sid="([^"]+)"/g), function (match) { return match[1]; });
  assert.equal(new Set(ids).size, ids.length);
});

test('every static id queried by the app exists in HTML', function () {
  const queried = Array.from(app.matchAll(/q\('#([A-Za-z0-9_-]+)'\)/g), function (match) { return match[1]; });
  const missing = Array.from(new Set(queried)).filter(function (id) {
    return !html.includes('id="' + id + '"');
  });
  assert.deepEqual(missing, []);
});

test('cache-versioned scripts load curriculum, core, then app in the required order', function () {
  const legacy = html.indexOf('curriculum.js?v=');
  const curriculum = html.indexOf('curriculum180.js?v=');
  const core = html.indexOf('core.js?v=');
  const appIndex = html.indexOf('app.js?v=');
  assert.ok(legacy >= 0 && legacy < curriculum);
  assert.ok(curriculum < core);
  assert.ok(core < appIndex);
});

test('the primary navigation exposes the five product routes', function () {
  ['today', 'path', 'expressions', 'immersion', 'progress'].forEach(function (view) {
    assert.ok(html.includes('data-view="' + view + '"'));
    assert.ok(html.includes('id="' + view + '"'));
  });
});
