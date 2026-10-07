function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function badge(text, kind) {
  return el("span", `badge badge-${kind}`, text);
}

function pad(number) {
  return String(number).padStart(2, "0");
}

function externalLink(href, label) {
  if (!href || !/^https:\/\//.test(href)) return null;
  const link = document.createElement("a");
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = label;
  return link;
}

function heart() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("heart");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "M12 20s-6.2-3.9-8.4-7.2C2.2 10.2 2.9 7 5.4 5.8 7.2 5 9 5.6 10.2 7.1L12 9.2l1.8-2.1C15 5.6 16.8 5 18.6 5.8 21.1 7 21.8 10.2 20.4 12.8 18.2 16.1 12 20 12 20z"
  );
  svg.append(path);
  return svg;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function svgFrom(markup, className) {
  const holder = el("div", className);
  holder.innerHTML = markup;
  const svg = holder.querySelector("svg");
  if (svg) svg.setAttribute("aria-hidden", "true");
  return holder;
}

function subjectCharms() {
  const items = [
    [
      "中文",
      `<svg viewBox="0 0 32 32"><g transform="rotate(-38 16 16)"><rect x="14" y="11" width="4.2" height="14" rx="2" fill="#f3a0b8"/><rect x="13" y="9.2" width="6.2" height="3" rx="1" fill="#ffe08a"/><path d="M13 9.2c.2-3.4 1.6-6.2 3.1-6.2s2.9 2.8 3.1 6.2z" fill="#5c3a48"/></g></svg>`,
    ],
    [
      "英文",
      `<svg viewBox="0 0 32 32"><path d="M5 8h17a4 4 0 0 1 4 4v6.5a4 4 0 0 1-4 4H14l-4.5 4v-4H8a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z" fill="#fff" stroke="#e7a8bc" stroke-width="1.6" stroke-linejoin="round"/><text x="15" y="18.2" text-anchor="middle" font-family="Nunito, sans-serif" font-size="8" font-weight="800" fill="#8e2a52">Abc</text></svg>`,
    ],
    [
      "數學",
      `<svg viewBox="0 0 32 32"><path d="M6.5 23.5h14M6.5 23.5V11" fill="none" stroke="#d7b7f0" stroke-width="1.6" stroke-linecap="round"/><path d="M8 21.5c2.2-.8 3.4-5.2 6.2-5.2 2.6 0 3.2 3.2 5.6 2.2" fill="none" stroke="#e07a98" stroke-width="1.7" stroke-linecap="round"/><path d="M21.5 8.5h7M23.2 8.5v7.2M26.6 8.5v7.2" fill="none" stroke="#8e2a52" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    ],
    [
      "M1",
      `<svg viewBox="0 0 32 32"><path d="M20 5.2c-2.2.2-3.4 1.5-3.7 3.2-.6 3.4 3 4.2 3 8.4 0 5.4-7.2 6.2-7.2 11.2 0 2.3 1.6 3.6 4 3.6" fill="none" stroke="#8e2a52" stroke-width="2" stroke-linecap="round"/><path d="M8 24.5c3.4-.4 5.2-2.6 7.4-6.4" fill="none" stroke="#d7b7f0" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    ],
    [
      "公民",
      `<svg viewBox="0 0 32 32"><circle cx="14" cy="14.5" r="8" fill="#f6ecff" stroke="#d7b7f0" stroke-width="1.5"/><path d="M14 6.8c2.1 2.2 3.1 4.8 3.1 7.7s-1 5.5-3.1 7.7c-2.1-2.2-3.1-4.8-3.1-7.7s1-5.5 3.1-7.7z" fill="none" stroke="#e7a8bc" stroke-width="1.2"/><path d="M7.2 14.5h13.6M8.4 11.2h11.2M8.4 17.8h11.2" fill="none" stroke="#e7a8bc" stroke-width="1"/><path d="M23 17.5c1.8 0 3.4 1.3 3.4 3 0 2.2-3.4 5.3-3.4 5.3s-3.4-3.1-3.4-5.3c0-1.7 1.6-3 3.4-3z" fill="#f3a0b8"/><circle cx="23" cy="20.3" r="1" fill="#fff"/></svg>`,
    ],
    [
      "經濟",
      `<svg viewBox="0 0 32 32"><rect x="4" y="18" width="4.2" height="8" rx="1.2" fill="#ffd0e2"/><rect x="10" y="14" width="4.2" height="12" rx="1.2" fill="#f3a0b8"/><rect x="16" y="9" width="4.2" height="17" rx="1.2" fill="#e07a98"/><circle cx="25.2" cy="11.2" r="4.6" fill="#ffe08a" stroke="#e0b15a" stroke-width="1.1"/><text x="25.2" y="13.6" text-anchor="middle" font-family="Nunito, sans-serif" font-size="7" font-weight="800" fill="#8e2a52">$</text></svg>`,
    ],
    [
      "物理",
      `<svg viewBox="0 0 32 32"><ellipse cx="16" cy="16" rx="11" ry="4.2" fill="none" stroke="#e8a36a" stroke-width="1.4"/><ellipse cx="16" cy="16" rx="11" ry="4.2" fill="none" stroke="#d7b7f0" stroke-width="1.4" transform="rotate(60 16 16)"/><ellipse cx="16" cy="16" rx="11" ry="4.2" fill="none" stroke="#f3a0b8" stroke-width="1.4" transform="rotate(-60 16 16)"/><circle cx="16" cy="16" r="2.3" fill="#e07a98"/></svg>`,
    ],
  ];
  const wrap = el("div", "subject-charms");
  wrap.setAttribute("aria-hidden", "true");
  for (const rowItems of [items.slice(0, 4), items.slice(4)]) {
    const row = el("div", "charm-row");
    for (const [name, markup] of rowItems) {
      const charm = svgFrom(markup, "charm");
      charm.append(el("span", "charm-name", name));
      row.append(charm);
    }
    wrap.append(row);
  }
  return wrap;
}

function girlAvatar() {
  return svgFrom(
    `<svg viewBox="0 0 140 168">
      <path d="M34 78c-8 28-6 62 8 78 10 4 22-6 28-18 4 16 16 26 30 24 16-2 28-24 26-52 12-8 16-28 10-46-8-28-28-42-48-40-22-2-40 16-54 54z" fill="#f7c5d4" stroke="#d4849c" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M22 150c14-22 32-32 48-32s36 10 50 32c-16 14-82 14-98 0z" fill="#ffe3ee" stroke="#e7a8bc" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M62 118h16c2 10 2 18 0 26h-16c-2-8-2-16 0-26z" fill="#fff4ee"/>
      <ellipse cx="70" cy="84" rx="32" ry="34" fill="#fff6f2" stroke="#e7a8bc" stroke-width="2.2"/>
      <path d="M42 74c4-28 18-40 32-40 16 0 30 14 34 38-12-12-20 2-30-4-8 10-16-6-36 6z" fill="#f7c5d4" stroke="#d4849c" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M40 86c-6 18-8 40-2 62" fill="none" stroke="#e7a0b6" stroke-width="9" stroke-linecap="round"/>
      <path d="M100 86c6 18 8 40 2 62" fill="none" stroke="#e7a0b6" stroke-width="9" stroke-linecap="round"/>
      <path d="M46 70c8 8 14 4 18-2" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
      <g class="avatar-eyes">
        <ellipse cx="57" cy="86" rx="7.2" ry="8.2" fill="#fff"/>
        <ellipse cx="83" cy="86" rx="7.2" ry="8.2" fill="#fff"/>
        <ellipse cx="58" cy="88" rx="3.6" ry="4.2" fill="#5c3a48"/>
        <ellipse cx="84" cy="88" rx="3.6" ry="4.2" fill="#5c3a48"/>
        <circle cx="59.4" cy="86.2" r="1.35" fill="#fff"/>
        <circle cx="85.4" cy="86.2" r="1.35" fill="#fff"/>
      </g>
      <g fill="none" stroke="#c45b7a" stroke-width="2.15">
        <circle cx="57" cy="86" r="11.2"/>
        <circle cx="83" cy="86" r="11.2"/>
        <path d="M68.2 86h3.6" stroke-linecap="round"/>
        <path d="M46 82h-6M94 82h6" stroke-linecap="round"/>
      </g>
      <ellipse cx="44" cy="98" rx="5.5" ry="3" fill="#ffb7cc"/>
      <ellipse cx="96" cy="98" rx="5.5" ry="3" fill="#ffb7cc"/>
      <path d="M70 96.5v3.2" stroke="#e7a8bc" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M62 106q8 7 16 0" fill="none" stroke="#c45b7a" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
    "mascot"
  );
}

function hourglass() {
  return svgFrom(
    `<svg class="hourglass" viewBox="0 0 64 108">
      <defs>
        <clipPath id="bulb-top"><path d="M14 16 H50 L36 48 H28 Z"/></clipPath>
        <clipPath id="bulb-bottom"><path d="M28 58 H36 L50 92 H14 Z"/></clipPath>
      </defs>
      <rect x="10" y="8" width="44" height="6" rx="3" fill="#f3a0b8"/>
      <rect x="10" y="94" width="44" height="6" rx="3" fill="#f3a0b8"/>
      <path d="M14 16 H50 L36 50 H28 Z" fill="rgba(255,255,255,0.55)" stroke="#e7a8bc" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M28 56 H36 L50 92 H14 Z" fill="rgba(255,255,255,0.55)" stroke="#e7a8bc" stroke-width="2.4" stroke-linejoin="round"/>
      <g clip-path="url(#bulb-top)">
        <rect class="sand sand-top" x="14" y="16" width="36" height="32"/>
      </g>
      <g clip-path="url(#bulb-bottom)">
        <rect class="sand sand-bottom" x="14" y="60" width="36" height="32"/>
      </g>
      <line class="sand-stream" x1="32" y1="48" x2="32" y2="60"/>
      <circle class="grain grain-a" cx="32" cy="50" r="1.5"/>
      <circle class="grain grain-b" cx="32" cy="50" r="1.3"/>
      <circle class="grain grain-c" cx="32" cy="50" r="1.2"/>
    </svg>`,
    "hourglass-wrap"
  );
}

function flipHalf(className, digit) {
  const face = el("span", className);
  face.append(el("span", "flip-num", digit));
  return face;
}

function setFlipHalf(unit, which, digit) {
  const face = unit.querySelector(which === "top" ? ".flip-face-top" : ".flip-face-bottom");
  const num = face && face.querySelector(".flip-num");
  if (num) num.textContent = digit;
}

function createDigit(digit) {
  const unit = el("span", "flip-digit");
  unit.dataset.value = digit;
  unit.append(
    flipHalf("flip-face flip-face-top", digit),
    flipHalf("flip-face flip-face-bottom", digit)
  );
  return unit;
}

function playFlip(unit, digit) {
  const from = unit.dataset.value;
  if (from === digit) return;
  if (prefersReducedMotion()) {
    setFlipHalf(unit, "top", digit);
    setFlipHalf(unit, "bottom", digit);
    unit.dataset.value = digit;
    return;
  }
  const previous = unit.querySelector(".flip-anim");
  if (previous) previous.remove();
  const anim = el("span", "flip-anim");
  anim.append(flipHalf("flip-anim-top", from), flipHalf("flip-anim-bottom", digit));
  setFlipHalf(unit, "top", digit);
  setFlipHalf(unit, "bottom", from);
  unit.append(anim);
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    setFlipHalf(unit, "bottom", digit);
    anim.remove();
    unit.dataset.value = digit;
  };
  anim.addEventListener("animationend", finish, { once: true });
  window.setTimeout(finish, 1000);
}

function paintDigits(row, value, animate) {
  const digits = String(value);
  const existing = [...row.querySelectorAll(":scope > .flip-digit")];
  if (existing.length !== digits.length) {
    row.replaceChildren(...[...digits].map((digit) => createDigit(digit)));
    return;
  }
  [...digits].forEach((digit, index) => {
    const unit = existing[index];
    if (unit.dataset.value === digit) return;
    if (animate) playFlip(unit, digit);
    else {
      setFlipHalf(unit, "top", digit);
      setFlipHalf(unit, "bottom", digit);
      unit.dataset.value = digit;
    }
  });
}

let shownDate = "";

function highlightedEvents(events) {
  const ongoing = events.filter((event) => event.phase === "ongoing");
  if (ongoing.length > 0) return ongoing;
  return events.filter((event) => event.phase === "next");
}

function renderEvent(event) {
  const article = el("article", `event phase-${event.phase}`);
  article.id = event.domId;
  const badges = el("div", "badges");
  if (event.phase === "past") badges.append(badge("已過", "past"));
  if (event.phase === "next") badges.append(badge("下一個", "next"));
  if (event.phase === "ongoing") badges.append(badge("進行中", "now"));
  if (event.phase === "unannounced") badges.append(badge("未公布", "unknown"));
  if (event.tentative) badges.append(badge("暫定", "tentative"));
  if (event.adjustable) badges.append(badge("或會調整", "adjustable"));
  if (badges.childNodes.length > 0) article.append(badges);
  article.append(el("h4", "event-title", event.title));
  article.append(el("p", "event-when", formatEventWhen(event)));
  if (event.detail) article.append(el("p", "event-detail", event.detail));
  const link = externalLink(event.source, "官方資料");
  if (link) {
    const source = el("p", "event-source");
    source.append(link);
    article.append(source);
  }
  return article;
}

function renderCountdownDate(config) {
  const line = el("p", "countdown-date");
  if (config.examLabel) line.append(el("span", "countdown-date-label", config.examLabel));
  const day = formatChineseDate(config.examDate) + (config.examDateTentative ? "（暫定）" : "");
  line.append(el("span", "countdown-date-day", day));
  return line;
}

function renderPaper(paper) {
  const row = el("article", `paper phase-${paper.phase}`);
  if (paper.phase === "past") row.append(el("span", "sr-only", "已過"));
  if (paper.phase === "next") {
    const badges = el("div", "badges");
    badges.append(badge("下一個", "next"));
    row.append(badges);
  } else if (paper.phase === "ongoing") {
    const badges = el("div", "badges");
    badges.append(badge("進行中", "now"));
    row.append(badges);
  }
  if (paper.label) {
    row.append(el("p", "paper-text", formatPaperLine(paper)));
  } else {
    row.append(el("p", "paper-when", formatChineseDate(paper.start)));
    row.append(el("p", "paper-text", paper.title));
  }
  return row;
}

function renderPapers(papers) {
  const section = el("section", "card papers");
  section.id = "papers";
  section.append(el("h2", null, "DSE 考程"));
  section.append(el("p", "fine", "已過嘅日子會劃線。下一個未過嘅會特別標出。"));
  const list = el("div", "paper-list");
  for (const paper of papers) list.append(renderPaper(paper));
  section.append(list);
  const source = el("p", "event-source");
  const link = externalLink(DATA.config.timetableUrl, "考評局時間表");
  if (link) source.append(link);
  section.append(source);
  return section;
}

function renderExamCountdown(config) {
  const block = el("div", "countdown-main");
  const cd = countdownParts(config.examDate);
  if (cd.past) {
    block.append(el("p", "countdown-arrived", "第一份卷到喇"));
    block.append(el("p", "countdown-soft", "慢慢嚟，你得㗎。"));
    return block;
  }
  const kicker = el("p", "countdown-kicker");
  kicker.append(
    svgFrom(
      `<svg viewBox="0 0 24 24"><path d="M12 2.5l1.8 5.2 5.5.2-4.3 3.5 1.5 5.3L12 13.8 7.5 16.7l1.5-5.3L4.7 7.9l5.5-.2L12 2.5z"/></svg>`,
      "inline-spark"
    ),
    document.createTextNode("仲有"),
    svgFrom(
      `<svg viewBox="0 0 24 24"><path d="M12 20s-6.2-3.9-8.4-7.2C2.2 10.2 2.9 7 5.4 5.8 7.2 5 9 5.6 10.2 7.1L12 9.2l1.8-2.1C15 5.6 16.8 5 18.6 5.8 21.1 7 21.8 10.2 20.4 12.8 18.2 16.1 12 20 12 20z"/></svg>`,
      "inline-spark inline-spark-heart"
    )
  );
  block.append(kicker);
  const days = el("div", "flip-row");
  days.id = "cd-days";
  days.setAttribute("aria-hidden", "true");
  paintDigits(days, String(cd.days), false);
  block.append(days);
  block.append(el("p", "countdown-unit", "日"));
  const timeRow = el("div", "time-row");
  timeRow.append(hourglass());
  const hms = el("div", "countdown-hms");
  hms.id = "cd-hms";
  hms.append(hmsLine("cd-hours", pad(cd.hours), "小時"));
  hms.append(hmsLine("cd-minutes", pad(cd.minutes), "分鐘"));
  hms.append(hmsLine("cd-seconds", pad(cd.seconds), "秒"));
  timeRow.append(hms);
  block.append(timeRow);
  const live = el("p", "sr-only", `仲有 ${cd.days} 日 ${cd.hours} 小時 ${cd.minutes} 分鐘`);
  live.id = "cd-live";
  block.append(live);
  return block;
}

function renderSchoolCountdown(events, today) {
  const card = el("aside", "school-countdown");
  card.append(el("h3", null, "林護倒數"));
  const target = nextSchoolEvent(events, today);
  if (!target) {
    card.append(el("p", "school-cd-name", "呢啲日子都過咗。"));
    return card;
  }
  const cd = countdownParts(target.start);
  const days = cd.past ? 0 : cd.days;
  card.append(el("p", "school-cd-kicker", "仲有"));
  card.append(el("p", "school-cd-days", String(days)));
  card.append(el("p", "school-cd-unit", "日"));
  card.append(el("p", "school-cd-name", target.title));
  card.append(el("p", "school-cd-date", formatChineseDate(target.start)));
  return card;
}

function renderCountdown(config, events, today) {
  const section = el("section", "card countdown");
  section.id = "countdown";
  const labelRow = el("div", "label-row");
  labelRow.append(el("h2", null, "DSE 倒數"));
  if (config.examDateTentative) labelRow.append(badge("暫定", "tentative"));
  section.append(labelRow);
  const columns = el("div", "countdown-columns");
  columns.append(renderExamCountdown(config), renderSchoolCountdown(events, today));
  section.append(columns);
  section.append(renderCountdownDate(config));
  const startNote = writtenExamStartNote(config.writtenExamStart);
  if (startNote) section.append(el("p", "fine", startNote));
  if (config.writtenExamEnd) {
    const endTentative = config.writtenExamEndTentative ?? config.examDateTentative;
    section.append(
      el(
        "p",
        "countdown-range",
        `筆試期至 ${formatChineseDate(config.writtenExamEnd)}${endTentative ? "（暫定）" : ""}`
      )
    );
  }
  section.append(el("p", "fine", "倒數計到當日凌晨（香港時間），秒數會喺手機上自己跳。"));
  const source = el("p", "event-source");
  const link = externalLink(config.sourceUrl, "考評局重要日期");
  if (link) source.append(link);
  section.append(source);
  return section;
}

function hmsLine(id, value, label) {
  const line = el("p", "hms-line");
  const num = el("span", "hms-num", value);
  num.id = id;
  line.append(num, document.createTextNode(label));
  return line;
}

function renderMessage(today) {
  const section = el("section", "card message");
  section.id = "message";
  const heading = el("h2");
  heading.append(heart(), document.createTextNode("今日想同你講"));
  section.append(heading);
  const quote = el("blockquote", null, pickByDate(DATA.messages, today));
  section.append(quote);
  section.append(el("p", "fine", formatChineseDate(today)));
  return section;
}

function renderTip(today) {
  const pool = [];
  for (const subject of DATA.subjects) {
    for (const tip of subject.tips) {
      pool.push({ subject: subject.name, text: tip });
    }
  }
  const tip = pickByDate(pool, today);
  const section = el("section", "card tip");
  section.id = "tip";
  section.append(el("h2", null, "今日小貼士"));
  if (tip) {
    section.append(el("p", "tip-subject", tip.subject));
    section.append(el("p", "tip-text", tip.text));
  }
  return section;
}

function renderNext(events) {
  const section = el("section", "card next-card");
  section.id = "next";
  section.append(el("h2", null, "下一個日子"));
  const picked = highlightedEvents(events);
  if (picked.length === 0) {
    section.append(el("p", null, "日程入面嘅日子都過咗。有新安排就可以改資料檔。"));
    return section;
  }
  const list = el("ul", "next-list");
  for (const event of picked) {
    const item = el("li");
    const link = document.createElement("a");
    link.href = `#${event.domId}`;
    link.append(el("span", "next-title", event.title));
    link.append(el("span", "next-when", formatEventWhen(event)));
    item.append(link);
    list.append(item);
  }
  section.append(list);
  return section;
}

function renderGroup(title, note, events) {
  const block = el("div", "group");
  block.append(el("h3", null, title));
  if (note) block.append(el("p", "fine", note));
  const list = el("div", "events");
  for (const event of events) list.append(renderEvent(event));
  block.append(list);
  return block;
}

function renderDates(events) {
  const section = el("section", "dates");
  section.id = "dates";
  section.append(el("h2", "section-title", "重要日子"));
  section.append(
    el(
      "p",
      "fine section-note",
      "下一個未過嘅日子會特別標出。已過嘅標明已過。未有公布就寫未公布，唔會估。有「或會調整」嘅，聯招網頁寫明日期可能會改。有「暫定」嘅，考評局仍未落實。"
    )
  );
  const info = events.filter((event) => event.category === "info");
  const jupas = events.filter((event) => event.category === "jupas");
  section.append(renderGroup("大學資訊日", "2026 年。", info));
  section.append(
    renderGroup("大學聯招", "2027 年入學。正式日子以聯招同考評局最新公布為準。", jupas)
  );
  return section;
}

function renderSchoolDates(events) {
  const section = el("section", "dates");
  section.id = "school-dates";
  section.append(el("h2", "section-title", "林護重要日子"));
  const list = el("div", "events");
  for (const event of events) list.append(renderEvent(event));
  section.append(list);
  return section;
}

function renderSubjects() {
  const section = el("section", "subjects");
  section.id = "tips";
  section.append(el("h2", "section-title", "溫書貼士"));
  section.append(el("p", "fine section-note", "撳科目就可以展開。慢慢睇，唔使一次過做晒。"));
  for (const subject of DATA.subjects) {
    const details = el("details", "card subject");
    const summary = document.createElement("summary");
    summary.append(heart(), document.createTextNode(subject.name));
    details.append(summary);
    const list = el("ul");
    for (const tip of subject.tips) list.append(el("li", null, tip));
    details.append(list);
    section.append(details);
  }
  return section;
}

function renderFooter() {
  const footer = el("footer", "footer");
  const built = new Date(DATA.builtAt);
  const parts = hongKongParts(built);
  footer.append(
    el(
      "p",
      null,
      `呢一版喺 ${formatChineseDate(parts.date)} ${pad(parts.hour)}:${pad(parts.minute)}（香港時間）整好。兩個倒數、考程、每日一句同下一個日子，會喺你部手機按香港時間即時計算。`
    )
  );
  return footer;
}

function updateCountdown() {
  const cd = countdownParts(DATA.config.examDate);
  const days = document.getElementById("cd-days");
  if (cd.past) {
    if (days) render();
    return;
  }
  if (!days) return;
  paintDigits(days, String(cd.days), true);
  const hours = document.getElementById("cd-hours");
  const minutes = document.getElementById("cd-minutes");
  const seconds = document.getElementById("cd-seconds");
  if (hours) hours.textContent = pad(cd.hours);
  if (minutes) minutes.textContent = pad(cd.minutes);
  if (seconds) seconds.textContent = pad(cd.seconds);
  const live = document.getElementById("cd-live");
  if (live && (seconds == null || seconds.textContent === "00")) {
    live.textContent = `仲有 ${cd.days} 日 ${cd.hours} 小時 ${cd.minutes} 分鐘`;
  }
}

function render() {
  shownDate = hongKongParts().date;
  const classified = classifyEvents(DATA.events, shownDate);
  const events = sortEvents(classified);
  const school = events.filter((event) => event.category === "school");
  const info = events.filter((event) => event.category === "info");
  const jupas = events.filter((event) => event.category === "jupas");
  school.forEach((event, index) => {
    event.domId = `school-${index}`;
  });
  info.forEach((event, index) => {
    event.domId = `info-${index}`;
  });
  jupas.forEach((event, index) => {
    event.domId = `jupas-${index}`;
  });
  const ordered = [...school, ...info, ...jupas];
  const papers = sortEvents(classifyEvents(DATA.papers || [], shownDate));

  const root = document.getElementById("app");
  root.replaceChildren();

  const header = el("header", "hero");
  const row = el("div", "hero-row");
  const copy = el("div", "hero-copy");
  const kicker = el("p", "kicker");
  kicker.append(heart(), document.createTextNode("小小加油頁"));
  copy.append(kicker);
  copy.append(el("h1", null, "Jasmine，加油！"));
  copy.append(el("p", "lede", "一日一步，已經好好。"));
  copy.append(el("p", "today", formatChineseDate(shownDate)));
  row.append(copy, girlAvatar());
  header.append(row, subjectCharms());
  const nav = el("nav", "quick");
  nav.setAttribute("aria-label", "頁面章節");
  const links = [
    ["#countdown", "DSE 倒數"],
    ["#school-dates", "林護重要日子"],
    ["#papers", "DSE 考程"],
    ["#message", "今日一句"],
    ["#tips", "溫書貼士"],
  ];
  for (const [href, label] of links) {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    nav.append(link);
  }
  header.append(nav);
  root.append(header);
  root.append(renderCountdown(DATA.config, school, shownDate));
  root.append(renderSchoolDates(school));
  root.append(renderPapers(papers));
  root.append(renderMessage(shownDate));
  root.append(renderSubjects());
  root.append(renderTip(shownDate));
  root.append(renderNext(ordered));
  root.append(renderDates(ordered));
  root.append(renderFooter());
}

render();
setInterval(() => {
  const today = hongKongParts().date;
  if (today !== shownDate) {
    render();
    return;
  }
  updateCountdown();
}, 1000);
