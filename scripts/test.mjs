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
  classifyEvents,
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
const messages = JSON.parse(fs.readFileSync(path.join(root, "data/messages.json"), "utf8")).messages;
const subjects = JSON.parse(fs.readFileSync(path.join(root, "data/tips.json"), "utf8")).subjects;

assert(config.examDate === "2027-04-06", "筆試首日應該係 2027-04-06");
assert(config.examDateTentative === true, "筆試首日仍然係暫定");
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
  ...events.flatMap((event) => [event.title, event.detail || ""]),
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
const cd = countdownParts("2027-04-06", noon);
assert(cd.past === false && cd.days === 181 && cd.hours === 12 && cd.minutes === 0, `倒數不正確：${JSON.stringify(cd)}`);

const classified = classifyEvents(events, "2026-10-06");
const pastInfo = classified.find((event) => event.title.includes("香港城市大學"));
const nextEvent = classified.find((event) => event.phase === "next");
assert(pastInfo && pastInfo.phase === "past", "10 月 3 日資訊日應該已過");
assert(nextEvent && nextEvent.title === "遞交聯招申請同繳付申請費", `下一個日子不正確：${nextEvent && nextEvent.title}`);
assert(classified.find((event) => event.title === "東華學院資訊日").phase === "unannounced", "未公布狀態");
assert(formatEventWhen(tungWah) === "未公布", "未公布唔好顯示估出來嘅日期");

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
for (const phrase of ["Jasmine", "公民與社會發展", "慢慢嚟都得", "香港理工大學", "2027-04-06", "概率同正態分佈"]) {
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
assert(plain.includes("暫定"), "解鎖後要標明暫定");

if (failed > 0) {
  console.error(`共 ${failed} 項唔通過`);
  process.exit(1);
}
console.log("全部測試通過");
