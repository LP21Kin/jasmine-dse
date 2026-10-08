import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  hongKongParts,
  pickByDate,
  countdownParts,
  formatChineseDate,
  formatTime,
  formatEventWhen,
  countdownCaption,
  writtenExamStartNote,
  formatPaperLine,
  classifyEvents,
  nextSchoolEvent,
  sortEvents,
} from "../src/logic.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    failed += 1;
    console.error(`唔通過：${message}`);
  }
}

function contrast(hexA, hexB) {
  const lum = (hex) => {
    const raw = hex.replace("#", "");
    const channels = [0, 2, 4].map((index) => {
      const value = parseInt(raw.slice(index, index + 2), 16) / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const [hi, lo] = [lum(hexA), lum(hexB)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

const config = JSON.parse(fs.readFileSync(path.join(root, "data/config.json"), "utf8"));
const events = JSON.parse(fs.readFileSync(path.join(root, "data/events.json"), "utf8")).events;
const papers = JSON.parse(fs.readFileSync(path.join(root, "data/papers.json"), "utf8")).papers;
const messages = JSON.parse(fs.readFileSync(path.join(root, "data/messages.json"), "utf8")).messages;
const subjects = JSON.parse(fs.readFileSync(path.join(root, "data/tips.json"), "utf8")).subjects;

assert(config.examDate === "2027-04-08", "倒數目標應該係第一份卷 2027-04-08");
assert(config.examLabel === "第一份卷：中文", "倒數標題應該係第一份卷中文");
assert(config.examDateTentative === false, "筆試開始日已經公布，唔再標暫定");
assert(config.writtenExamStart === "2027-04-06", "筆試開始日應該係 2027-04-06");
assert(config.writtenExamEndTentative === true, "筆試期尾段仍然暫定");
assert(
  config.timetableUrl === "https://www.hkeaa.edu.hk/DocLibrary/HKDSE/Exam_Timetable/2027_DSE_Timetable.pdf",
  "要連結去考評局時間表"
);
assert(countdownCaption(config) === "第一份卷：中文 2027年4月8日（四）", `倒數標題不正確：${countdownCaption(config)}`);
assert(!countdownCaption(config).includes("暫定"), "第一份卷唔好標暫定");
assert(writtenExamStartNote(config.writtenExamStart) === "文憑試筆試 4月6日開始", "筆試開始小字不正確");
assert(formatChineseDate("2027-04-08") === "2027年4月8日（四）", "4 月 8 日係星期四");
assert(messages.length >= 60, "鼓勵句子至少 60 句");
assert(new Set(messages).size === messages.length, "鼓勵句子唔好重複");
assert(!messages.some((message) => message.includes("Jasmine")), "鼓勵句子唔好寫名");

const expectedSubjects = ["中文", "英文", "數學", "M1", "公民與社會發展", "經濟", "物理"];
assert(
  expectedSubjects.every((name) => subjects.some((subject) => subject.name === name && subject.tips.length >= 3)),
  "七科都要有貼士"
);

const banned = ["HKU", "CUHK", "HKUST", "PolyU", "CityU", "HKBU", "EdUHK", "THEi", "JUPAS", "HKDSE"];
const visibleText = [
  ...events.flatMap((event) => [event.title, event.detail || "", event.period || ""]),
  ...papers.flatMap((paper) => [paper.title, paper.label || "", paper.detail || "", formatPaperLine(paper)]),
  ...messages,
  ...subjects.flatMap((subject) => [subject.name, ...subject.tips]),
].join("\n");
for (const word of banned) {
  assert(!visibleText.includes(word), `頁面文字唔應該有英文簡稱 ${word}`);
}

const tungWah = events.find((event) => event.title === "東華學院資訊日");
assert(tungWah && tungWah.unannounced && !tungWah.start, "東華學院應該係未公布");

assert(hongKongParts(new Date("2026-10-05T15:59:00.000Z")).date === "2026-10-05", "香港午夜前仍然係 10 月 5 日");
assert(hongKongParts(new Date("2026-10-05T16:00:00.000Z")).date === "2026-10-06", "香港午夜後係 10 月 6 日");
assert(formatChineseDate("2026-10-06") === "2026年10月6日（二）", "10 月 6 日係星期二");
assert(formatTime("09:00") === "上午9時", "09:00 顯示");
assert(formatTime("10:30") === "上午10時30分", "10:30 顯示");
assert(formatTime("15:00") === "下午3時", "15:00 顯示");
assert(formatTime("17:00") === "下午5時", "17:00 顯示");

const noon = new Date("2026-10-06T04:00:00.000Z");
const cd = countdownParts("2027-04-08", noon);
assert(cd.past === false && cd.days === 183 && cd.hours === 12 && cd.minutes === 0, `倒數不正確：${JSON.stringify(cd)}`);
assert(countdownParts("2027-04-08", new Date("2027-04-07T16:00:00.000Z")).past === true, "4 月 8 日凌晨一到就當日開始");
assert(countdownParts("2027-04-08", new Date("2027-04-07T15:59:00.000Z")).past === false, "4 月 8 日凌晨前仍然倒數");

const classified = classifyEvents(events, "2026-10-06");
const pastInfo = classified.find((event) => event.title.includes("香港城市大學"));
const nextEvent = classified.find((event) => event.phase === "next");
assert(pastInfo && pastInfo.phase === "past", "10 月 3 日資訊日應該已過");
assert(nextEvent && nextEvent.title === "遞交聯招申請同繳付申請費", `下一個日子不正確：${nextEvent && nextEvent.title}`);
assert(classified.find((event) => event.title === "東華學院資訊日").phase === "unannounced", "未公布狀態");
assert(formatEventWhen(tungWah) === "未公布", "未公布唔好顯示估出來嘅日期");

const schoolEvents = events.filter((event) => event.category === "school");
assert(schoolEvents.length === 8, "學校日子應該有 8 項");
assert(schoolEvents.every((event) => event.title.startsWith("林護 ")), "學校日子標題要加簡稱，方便同其他日子分辨");
const farewell = schoolEvents.find((event) => event.title === "林護 告別崇拜");
assert(farewell && formatEventWhen(farewell) === "2027年2月23日（二）下午", `告別崇拜日子不正確：${farewell && formatEventWhen(farewell)}`);
assert(
  formatEventWhen(schoolEvents.find((event) => event.title === "林護 統一測驗")) === "2026年10月26日（一） 至 2026年10月31日（六）",
  "統一測驗日子不正確"
);
assert(formatEventWhen(schoolEvents.find((event) => event.title === "林護 中六家長之夜")) === "2026年10月16日（五）", "家長之夜日子不正確");
assert(formatEventWhen(schoolEvents.find((event) => event.title === "林護 中六家長日")) === "2026年12月5日（六）", "家長日日子不正確");
const parentNight = classifyEvents(events, "2026-10-07").find((event) => event.title === "林護 中六家長之夜");
assert(parentNight && parentNight.phase === "future", "10 月 7 日家長之夜未到");
const parentNightPast = classifyEvents(events, "2026-10-17").find((event) => event.title === "林護 中六家長之夜");
assert(parentNightPast && parentNightPast.phase === "past", "10 月 17 日家長之夜已過");
const schoolNow = nextSchoolEvent(schoolEvents, "2026-10-07");
assert(schoolNow && schoolNow.start === "2026-10-16" && schoolNow.title === "林護 中六家長之夜", "而家林護倒數應該計去家長之夜");
assert(nextSchoolEvent(schoolEvents, "2026-10-16").start === "2026-10-16", "家長之夜當日仍然計緊嗰日");
assert(nextSchoolEvent(schoolEvents, "2026-10-17").start === "2026-10-26", "家長之夜過咗就計去統一測驗第一日");
assert(nextSchoolEvent(schoolEvents, "2026-10-27").start === "2026-12-05", "統一測驗開始日過咗就計去下一個");
assert(countdownParts("2026-10-16", new Date("2026-10-07T00:00:00+08:00")).days === 9, "10 月 7 日零時到家長之夜係 9 日");
const release = events.find((event) => event.title === "文憑試放榜");
assert(release && release.start === "2027-07-14" && release.tentative === true, "放榜日 7 月 14 日仍然暫定");

const timeOfDay = /上午|下午|早上|晚上|凌晨|早晨|\d{1,2}:\d{2}|\d+時/;
assert(papers.length === 9, "考試日程應該有 9 項");
const sortedPapers = sortEvents(papers);
assert(sortedPapers[0].title === "英文口試", "考試日程第一個應該係英文口試");
assert(
  formatPaperLine(sortedPapers[0]) === "英文口試：2027年3月中至下旬（暫定，個別日子睇考試入座表）",
  `英文口試句子不正確：${formatPaperLine(sortedPapers[0])}`
);
assert(!formatPaperLine(sortedPapers[0]).includes("3月11"), "口試唔好顯示大約範圍嘅實日");
for (const paper of papers) {
  assert(!timeOfDay.test(formatPaperLine(paper)), `考試日程唔好寫時間：${formatPaperLine(paper)}`);
}
const expectedPapers = [
  ["2027-04-08", "中文 卷一、卷二", "2027年4月8日（四） 中文 卷一、卷二"],
  ["2027-04-09", "英文 卷一、卷二", "2027年4月9日（五） 英文 卷一、卷二"],
  ["2027-04-10", "英文 卷三（聽力及綜合能力）", "2027年4月10日（六） 英文 卷三（聽力及綜合能力）"],
  ["2027-04-12", "數學 卷一、卷二", "2027年4月12日（一） 數學 卷一、卷二"],
  ["2027-04-13", "公社", "2027年4月13日（二） 公社"],
  ["2027-04-21", "物理 卷一、卷二", "2027年4月21日（三） 物理 卷一、卷二"],
  ["2027-04-22", "經濟 卷一、卷二", "2027年4月22日（四） 經濟 卷一、卷二"],
  ["2027-04-23", "M1", "2027年4月23日（五） M1"],
];
for (const [start, title, line] of expectedPapers) {
  const paper = papers.find((item) => item.start === start && item.title === title);
  assert(paper && formatPaperLine(paper) === line, `試卷不正確：${title}`);
}

function paperPhase(today, title) {
  return classifyEvents(papers, today).find((paper) => paper.title === title).phase;
}
assert(paperPhase("2026-10-07", "英文口試") === "next", "而家下一個試應該係英文口試");
assert(paperPhase("2026-10-07", "中文 卷一、卷二") === "future", "中文卷未到");
assert(paperPhase("2027-03-20", "英文口試") === "ongoing", "3 月中口試進行中");
assert(paperPhase("2027-04-01", "英文口試") === "past", "4 月口試已過");
assert(paperPhase("2027-04-01", "中文 卷一、卷二") === "next", "口試之後下一個係中文");
assert(paperPhase("2027-04-08", "中文 卷一、卷二") === "ongoing", "中文卷當日唔好劃線");
assert(paperPhase("2027-04-09", "中文 卷一、卷二") === "past", "4 月 9 日中文卷已過");
assert(paperPhase("2027-04-09", "英文 卷一、卷二") === "ongoing", "4 月 9 日係英文卷一、卷二");
assert(paperPhase("2027-04-11", "數學 卷一、卷二") === "next", "4 月 11 日下一個係數學");
assert(paperPhase("2027-04-24", "M1") === "past", "最後一科過咗要劃線");
assert(
  !classifyEvents(papers, "2027-04-24").some((paper) => paper.phase === "next" || paper.phase === "ongoing"),
  "全部試過咗就冇下一個"
);

const first = pickByDate(messages, "2026-10-06");
assert(pickByDate(messages, "2026-10-06") === first, "同一日句子要穩定");
const seen = new Set();
for (let day = 1; day <= 60; day += 1) {
  seen.add(pickByDate(messages, `2026-10-${String(day).padStart(2, "0")}`));
}
assert(seen.size === 60, "連續 60 日應該換 60 句");

const pairs = [
  ["#3c2430", "#fff6f2", 4.5],
  ["#3c2430", "#fffcfa", 4.5],
  ["#5e3d4a", "#fffcfa", 4.5],
  ["#8e2a52", "#fffcfa", 4.5],
  ["#ffffff", "#8e2a52", 4.5],
  ["#ffffff", "#6d3d78", 4.5],
  ["#5c3a48", "#f3e8ec", 4.5],
  ["#5c3d0a", "#fff4d8", 4.5],
  ["#4a2d66", "#f3e8fa", 4.5],
  ["#4a3f3c", "#efeae7", 4.5],
  ["#742443", "#ffe4ee", 4.5],
  ["#742443", "#fffcfa", 4.5],
];
for (const [fg, bg, min] of pairs) {
  const ratio = contrast(fg, bg);
  assert(ratio >= min, `${fg} 喺 ${bg} 對比 ${ratio.toFixed(2)}，低過 ${min}`);
}

const pageSource = fs.readFileSync(path.join(root, "src/page.js"), "utf8");
const cssSource = fs.readFileSync(path.join(root, "src/styles.css"), "utf8");
assert(pageSource.includes("flip-digit") && pageSource.includes("playFlip"), "日子要用揭頁牌");
assert(pageSource.includes("hourglass") && pageSource.includes("sand-top"), "時間旁邊要有沙漏");
assert(pageSource.includes("avatar-eyes") && pageSource.includes("mascot"), "封面要有原創長髮女孩頭像");
assert(!pageSource.includes("bunny"), "封面唔再使用兔子");
assert(
  pageSource.includes("subject-charms") &&
    ["中文", "英文", "數學", "M1", "公民", "經濟", "物理"].every((name) => pageSource.includes(`"${name}"`)),
  "封面要有七科小圖"
);
assert(!pageSource.includes("單元一"), "封面同程式唔好再寫單元一");
assert(cssSource.includes("flip-down") && cssSource.includes("sand-drain"), "翻牌同沙漏要有動畫");
assert(cssSource.includes("prefers-reduced-motion"), "要尊重減少動態");
assert(pageSource.includes("DSE 考程") && pageSource.includes("考評局時間表"), "要有考程同時間表連結");
assert(pageSource.includes("林護重要日子") && pageSource.includes("DSE 倒數") && pageSource.includes("溫書貼士"), "章節名稱要改好");
const navOrder = ["DSE 倒數", "今日一句", "林護重要日子", "DSE 考程", "溫書貼士"];
let navCursor = 0;
for (const label of navOrder) {
  const at = pageSource.indexOf(`"${label}"`, navCursor);
  assert(at > navCursor, `導覽次序要係 ${navOrder.join("、")}`);
  navCursor = at;
}
const renderBody = pageSource.slice(pageSource.indexOf("function render()"));
const sectionOrder = ["renderCountdown(", "renderMessage(", "renderSchoolDates(", "renderPapers(", "renderSubjects("];
let sectionCursor = 0;
for (const call of sectionOrder) {
  const at = renderBody.indexOf(call, sectionCursor);
  assert(at > sectionCursor, "章節次序要係倒數、今日一句、林護重要日子、考程、溫書貼士");
  sectionCursor = at;
}
assert(pageSource.includes("林護倒數") && pageSource.includes("countdown-columns"), "倒數要左右並列，右邊係林護倒數");
assert(pageSource.includes("仲有") && !pageSource.includes("仔有"), "倒數用字係仲有");
assert(pageSource.includes("大學資訊日") && pageSource.includes("大學聯招"), "大學資訊日同聯招要留低");
assert(!pageSource.includes('renderGroup("學校"'), "林護日子唔再塞喺大學重要日子入面");
assert(cssSource.includes("countdown-columns") && cssSource.includes("grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr)"), "手機都要左右並列");
assert(cssSource.includes("line-through") && cssSource.includes(".paper.phase-past"), "已過嘅試卷要劃線");
assert(cssSource.includes(".paper.phase-next"), "下一個試卷要特別標出");

const workflow = fs.readFileSync(path.join(root, ".github/workflows/pages.yml"), "utf8");
assert(workflow.includes('cron: "5 16 * * *"'), "每日排程應該係 16:05 UTC");
assert(workflow.includes("secrets.SITE_PASSWORD"), "workflow 要用 SITE_PASSWORD");
assert(workflow.includes("workflow_dispatch"), "要可以手動執行");
assert(workflow.includes("branches: [\"main\"]") || workflow.includes("branches: ['main']"), "push main 先部署");

fs.rmSync(path.join(root, "dist"), { recursive: true, force: true });
const missingEnv = { ...process.env };
delete missingEnv.STATICRYPT_PASSWORD;
delete missingEnv.SITE_PASSWORD;
const missing = spawnSync(process.execPath, ["scripts/build.mjs"], {
  cwd: root,
  env: missingEnv,
  encoding: "utf8",
});
assert(missing.status !== 0, "冇密碼應該失敗");
assert(`${missing.stdout}\n${missing.stderr}`.includes("SITE_PASSWORD"), "失敗訊息要提到 SITE_PASSWORD");
assert(!fs.existsSync(path.join(root, "dist/index.html")), "冇密碼唔好產出網頁");

const password = `local-test-${Date.now()}-not-the-site-password`;
const built = spawnSync(process.execPath, ["scripts/build.mjs"], {
  cwd: root,
  env: { ...process.env, STATICRYPT_PASSWORD: password },
  encoding: "utf8",
});
assert(built.status === 0, `加密建置失敗：${built.stderr || built.stdout}`);

const encrypted = fs.readFileSync(path.join(root, "dist/index.html"), "utf8");
for (const phrase of [
  "Jasmine",
  "公民與社會發展",
  "慢慢嚟都得",
  "香港理工大學",
  "2027-04-06",
  "2027-04-08",
  "概率同正態分佈",
  "DSE 考程",
  "林護倒數",
  "林護重要日子",
  "第一份卷",
  "中六家長之夜",
  "聽力及綜合能力",
  "告別崇拜",
]) {
  assert(!encrypted.includes(phrase), `加密頁唔應該睇到「${phrase}」`);
}
assert(encrypted.includes("喺呢部手機記住密碼"), "密碼頁要有記住密碼");
assert(encrypted.includes("staticrypt-password"), "密碼頁要有輸入框");
assert(encrypted.includes("84ec7ef3707c16fa561ecd87869516a8"), "鹽要固定，記住密碼先可以跨日仍然有效");
assert(!encrypted.includes(password), "密碼唔可以出現喺網頁");

const decrypted = spawnSync(
  process.execPath,
  ["node_modules/staticrypt/cli/index.js", "dist/index.html", "--decrypt", "--directory", "build/plain", "--short"],
  {
    cwd: root,
    env: { ...process.env, STATICRYPT_PASSWORD: password },
    encoding: "utf8",
  }
);
assert(decrypted.status === 0, `解密失敗：${decrypted.stderr || decrypted.stdout}`);
const plain = fs.readFileSync(path.join(root, "build/plain/index.html"), "utf8");
assert(plain.includes("Jasmine，加油！"), "解鎖後要有招呼");
assert(plain.includes("慢慢嚟都得"), "解鎖後要有鼓勵句子");
assert(plain.includes("東華學院資訊日"), "解鎖後要有資訊日");
assert(plain.includes("暫定"), "解鎖後放榜同筆試期尾段仍然標明暫定");
assert(plain.includes("第一份卷：中文"), "解鎖後倒數要計去第一份卷");
assert(plain.includes("DSE 考程"), "解鎖後要有考程");
assert(plain.includes("林護重要日子"), "解鎖後要有林護重要日子");
assert(plain.includes("林護倒數"), "解鎖後要有林護倒數");
assert(plain.includes("中六家長之夜"), "解鎖後要有學校日子");
assert(plain.includes("考評局時間表"), "解鎖後要有時間表連結");
assert(plain.includes('"examDateTentative":false'), "解鎖後嘅資料唔好再把筆試開始標做暫定");
assert(plain.includes('"tentative":true'), "放榜嘅暫定標記要留喺資料入面");

if (failed > 0) {
  console.error(`共 ${failed} 項唔通過`);
  process.exit(1);
}
console.log("全部測試通過");
