import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function fail(message) {
  console.error(`錯誤：${message}`);
  process.exit(1);
}

const password = process.env.STATICRYPT_PASSWORD ?? process.env.SITE_PASSWORD ?? "";
if (!String(password).trim()) {
  fail(
    "未設定 SITE_PASSWORD。請到 GitHub repo 嘅 Settings → Secrets and variables → Actions 新增名為 SITE_PASSWORD 的 secret，然後重新執行「部署網頁」。未有密碼就唔會部署，避免網頁冇加密。"
  );
}
if (!process.env.STATICRYPT_PASSWORD) {
  process.env.STATICRYPT_PASSWORD = password;
}

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    fail(`${relativePath} 讀唔到。JSON 格式可能有問題（逗號、引號）。${error.message}`);
  }
}

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^\d{2}:\d{2}$/;

function assertDate(value, label) {
  if (!datePattern.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00+08:00`))) {
    fail(`${label} 必須係 2027-04-06 呢種日期。而家係：${value}`);
  }
}

const configFile = readJson("data/config.json");
const eventsFile = readJson("data/events.json");
const papersFile = readJson("data/papers.json");
const messagesFile = readJson("data/messages.json");
const tipsFile = readJson("data/tips.json");

assertDate(configFile.examDate, "data/config.json 嘅 examDate");
if (configFile.writtenExamStart) assertDate(configFile.writtenExamStart, "data/config.json 嘅 writtenExamStart");
if (configFile.writtenExamEnd) assertDate(configFile.writtenExamEnd, "data/config.json 嘅 writtenExamEnd");
if (configFile.timezone !== "Asia/Hong_Kong") {
  fail("data/config.json 嘅 timezone 要保持 Asia/Hong_Kong。");
}
if (!configFile.examLabel || typeof configFile.examLabel !== "string") {
  fail("data/config.json 要有 examLabel，例如「第一份卷：中文」。");
}
if (!configFile.timetableUrl || !/^https:\/\//.test(configFile.timetableUrl)) {
  fail("data/config.json 要有 https 開頭嘅 timetableUrl。");
}
const timeOfDay = /上午|下午|早上|晚上|凌晨|早晨|\d{1,2}:\d{2}|\d+時/;
if (!Array.isArray(papersFile.papers) || papersFile.papers.length === 0) {
  fail("data/papers.json 要有考試日程。");
}
for (const paper of papersFile.papers) {
  if (!paper.title) fail("考試日程每一項都要有標題。");
  if (!paper.start) fail(`「${paper.title}」要有 start，用來排序同判斷已過。`);
  assertDate(paper.start, `「${paper.title}」嘅 start`);
  if (paper.end) {
    assertDate(paper.end, `「${paper.title}」嘅 end`);
    if (paper.end < paper.start) fail(`「${paper.title}」嘅結束日早過開始日。`);
  }
  if (paper.startTime || paper.endTime) fail(`「${paper.title}」唔好寫鐘點。`);
  const blob = [paper.title, paper.label || "", paper.detail || ""].join("\n");
  if (timeOfDay.test(blob)) fail(`「${paper.title}」唔好寫上晝、下晝或者鐘點。`);
}
if (!Array.isArray(messagesFile.messages) || messagesFile.messages.length < 60) {
  fail("data/messages.json 至少要有 60 句鼓勵。");
}
for (const message of messagesFile.messages) {
  if (typeof message !== "string" || !message.trim()) fail("data/messages.json 有一句係空嘅。");
}
if (!Array.isArray(tipsFile.subjects) || tipsFile.subjects.length === 0) {
  fail("data/tips.json 要有科目。");
}
for (const subject of tipsFile.subjects) {
  if (!subject.name || !Array.isArray(subject.tips) || subject.tips.length === 0) {
    fail("每個科目都要有名同至少一句貼士。");
  }
}
if (!Array.isArray(eventsFile.events) || eventsFile.events.length === 0) {
  fail("data/events.json 要有日子。");
}
const categories = new Set(["info", "jupas", "school"]);
for (const event of eventsFile.events) {
  if (!event.title || !categories.has(event.category)) {
    fail(`日子「${event.title || "未命名"}」要有標題，category 只可以係 info、jupas 或者 school。`);
  }
  if (event.period) {
    if (!["上午", "下午", "晚上"].includes(event.period)) {
      fail(`「${event.title}」嘅 period 只可以係上午、下午或者晚上，唔好估鐘點。`);
    }
    if (event.startTime || event.endTime || event.end) {
      fail(`「${event.title}」有 period 就唔好再填鐘點或者結束日。`);
    }
  }
  if (event.unannounced) {
    if (event.start) fail(`「${event.title}」標明未公布，就唔好填 start。`);
  } else {
    assertDate(event.start, `「${event.title}」嘅 start`);
    if (event.end) {
      assertDate(event.end, `「${event.title}」嘅 end`);
      if (event.end < event.start) fail(`「${event.title}」嘅結束日早過開始日。`);
    }
  }
  for (const key of ["startTime", "endTime"]) {
    if (event[key] && !timePattern.test(event[key])) {
      fail(`「${event.title}」嘅 ${key} 要用 09:00 呢種格式。`);
    }
  }
}

const data = {
  config: {
    examDate: configFile.examDate,
    examLabel: configFile.examLabel,
    examDateTentative: Boolean(configFile.examDateTentative),
    writtenExamStart: configFile.writtenExamStart || null,
    writtenExamEnd: configFile.writtenExamEnd || null,
    writtenExamEndTentative:
      configFile.writtenExamEndTentative == null ? null : Boolean(configFile.writtenExamEndTentative),
    sourceUrl: configFile.sourceUrl,
    timetableUrl: configFile.timetableUrl,
  },
  events: eventsFile.events,
  papers: papersFile.papers,
  messages: messagesFile.messages,
  subjects: tipsFile.subjects,
  builtAt: new Date().toISOString(),
};

const logic = fs
  .readFileSync(path.join(root, "src/logic.mjs"), "utf8")
  .replace(/\nexport\s*\{[\s\S]*?\};?\s*$/, "\n");
const page = fs.readFileSync(path.join(root, "src/page.js"), "utf8");
const css = fs.readFileSync(path.join(root, "src/styles.css"), "utf8");
const template = fs.readFileSync(path.join(root, "src/index.template.html"), "utf8");
const safeJson = JSON.stringify(data).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
const html = template
  .replace("/*__CSS__*/", css)
  .replace("/*__DATA__*/", safeJson)
  .replace("/*__JS__*/", `${logic}\n${page}`);

if (html.includes("/*__")) fail("網頁模板有欄位未填好。");

const buildDir = path.join(root, "build");
const distDir = path.join(root, "dist");
fs.rmSync(buildDir, { recursive: true, force: true });
fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(buildDir, { recursive: true });
fs.writeFileSync(path.join(buildDir, "index.html"), html);

const staticrypt = path.join(root, "node_modules/staticrypt/cli/index.js");
const result = spawnSync(
  process.execPath,
  [
    staticrypt,
    "build/index.html",
    "--directory",
    "dist",
    "--template",
    "src/password_template.html",
    "--config",
    ".staticrypt.json",
    "--short",
    "--remember",
    "0",
    "--template-title",
    "私人小頁面",
    "--template-instructions",
    "輸入密碼就可以入去。用自己部手機嘅話，可以剔低記住密碼，下次就唔使再打。",
    "--template-placeholder",
    "密碼",
    "--template-button",
    "入去",
    "--template-remember",
    "喺呢部手機記住密碼",
    "--template-error",
    "密碼唔啱，再試一次啦。",
    "--template-toggle-show",
    "顯示密碼",
    "--template-toggle-hide",
    "隱藏密碼",
  ],
  {
    cwd: root,
    env: process.env,
    stdio: ["ignore", "inherit", "inherit"],
  }
);

if (result.status !== 0) {
  fail("加密失敗，所以冇部署。請確認 SITE_PASSWORD 已設定，而且冇人改壞密碼頁模板。");
}

const encryptedPath = path.join(distDir, "index.html");
if (!fs.existsSync(encryptedPath)) fail("加密後搵唔到 dist/index.html。");
const encrypted = fs.readFileSync(encryptedPath, "utf8");
const leaked = [
  "Jasmine",
  "公民與社會發展",
  "慢慢嚟都得",
  "香港理工大學",
  "概率同正態分佈",
  "我嘅考試日程",
  "第一份卷",
  "中六家長之夜",
  "聽力及綜合能力",
].filter((phrase) => encrypted.includes(phrase));
if (leaked.length > 0) {
  fail(`加密後嘅網頁仍然睇到內容（${leaked.join("、")}）。已停止，唔會當成功。`);
}
if (!encrypted.includes("staticrypt-password") || !encrypted.includes("記住密碼")) {
  fail("密碼頁未有密碼輸入或者「記住密碼」選項。");
}

console.log("完成：已建立加密網頁 dist/index.html。密碼冇寫入檔案。");
