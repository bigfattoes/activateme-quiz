#!/usr/bin/env node
/*
 * Checks public/data/quiz.js, public/data/clubs.js and public/data/strings.js
 * for mistakes, then tries EVERY possible combination of answers and shows
 * how often each activity comes out as the top match.
 *
 * Run with:  npm test
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..", "public", "data");
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const f of ["strings.js", "quiz.js", "clubs.js"]) {
  try {
    vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), sandbox, { filename: f });
  } catch (e) {
    console.error(`\n❌ ${f} has a typo and won't load:\n   ${e.message}\n`);
    process.exit(1);
  }
}
const { QUIZ, CLUBS, STRINGS, scoreQuiz } = sandbox.window;
const errors = [];
const ids = Object.keys(QUIZ.activities);
// Every Acti pose available = every image in public/assets/acti/
const poses = fs.readdirSync(path.join(__dirname, "..", "public", "assets", "acti"))
  .filter((f) => f.endsWith(".webp")).map((f) => f.replace(".webp", ""));

if (!STRINGS) errors.push("strings.js did not define window.STRINGS");
if (QUIZ.questions.length < 1) errors.push("No questions found");
const qIds = new Set();
QUIZ.questions.forEach((q, qi) => {
  const where = `Question ${qi + 1} (${q.id})`;
  if (qIds.has(q.id)) errors.push(`${where}: question id is used twice`);
  qIds.add(q.id);
  if (!q.title) errors.push(`${where}: missing title`);
  if (q.acti && !poses.includes(q.acti)) errors.push(`${where}: unknown Acti pose "${q.acti}"`);
  const aIds = new Set();
  q.answers.forEach((a) => {
    if (aIds.has(a.id)) errors.push(`${where}: answer id "${a.id}" is used twice`);
    aIds.add(a.id);
    if (!a.label) errors.push(`${where}: an answer is missing its label`);
    Object.keys(a.points || {}).forEach((act) => {
      if (!ids.includes(act)) errors.push(`${where}, answer "${a.label}": unknown activity "${act}"`);
      if (typeof a.points[act] !== "number") errors.push(`${where}, answer "${a.label}": points for ${act} must be a number`);
    });
  });
});
ids.forEach((id) => {
  const a = QUIZ.activities[id];
  ["name", "emoji", "reason", "short", "builds", "tryAtHome"].forEach((k) => {
    if (!a[k]) errors.push(`Activity "${id}" is missing "${k}"`);
  });
  if (!poses.includes(a.acti)) errors.push(`Activity "${id}": unknown Acti pose "${a.acti}"`);
  if (!QUIZ.tieBreakOrder.includes(id)) errors.push(`Activity "${id}" is missing from tieBreakOrder`);
  if (!CLUBS || !Array.isArray(CLUBS[id])) errors.push(`clubs.js has no list for "${id}"`);
});
QUIZ.tieBreakOrder.forEach((id) => {
  if (!ids.includes(id)) errors.push(`tieBreakOrder has unknown activity "${id}"`);
});

if (errors.length) {
  console.error("\n❌ Found problems:\n" + errors.map((e) => "   - " + e).join("\n") + "\n");
  process.exit(1);
}

// Try every combination of answers.
const tops = Object.fromEntries(ids.map((id) => [id, 0]));
const anyTop3 = Object.fromEntries(ids.map((id) => [id, 0]));
let total = 0;
let ties = 0;
(function walk(i, answers) {
  if (i === QUIZ.questions.length) {
    const r = scoreQuiz(answers, QUIZ);
    total++;
    tops[r.ranked[0]]++;
    r.ranked.slice(0, 3).forEach((id) => anyTop3[id]++);
    if (r.scores[r.ranked[0]] === r.scores[r.ranked[1]]) ties++;
    return;
  }
  const q = QUIZ.questions[i];
  q.answers.forEach((a) => walk(i + 1, Object.assign({}, answers, { [q.id]: a.id })));
})(0, {});

console.log(`\n✅ Data files look good.\n\nTried all ${total} possible answer combinations:\n`);
console.log("Activity        Top match    In top 3");
ids
  .slice()
  .sort((a, b) => tops[b] - tops[a])
  .forEach((id) => {
    const pct = ((tops[id] / total) * 100).toFixed(1).padStart(5);
    const pct3 = ((anyTop3[id] / total) * 100).toFixed(1).padStart(5);
    const bar = "█".repeat(Math.round((tops[id] / total) * 100));
    console.log(`${QUIZ.activities[id].name.padEnd(14)} ${pct}%      ${pct3}%   ${bar}`);
  });
console.log(`\n(${((ties / total) * 100).toFixed(0)}% of combinations needed the tie-break order for the top spot.)`);
const never = ids.filter((id) => tops[id] === 0);
if (never.length) {
  console.error(`\n❌ These activities can never be the top match: ${never.join(", ")}\n`);
  process.exit(1);
}
console.log("");
