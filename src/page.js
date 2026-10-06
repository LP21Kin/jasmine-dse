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

function renderCountdown(config) {
  const section = el("section", "card countdown");
  section.id = "countdown";
  const labelRow = el("div", "label-row");
  labelRow.append(el("h2", null, "倒數"));
  if (config.examDateTentative) labelRow.append(badge("暫定", "tentative"));
  section.append(labelRow);

  const cd = countdownParts(config.examDate);
  if (cd.past) {
    section.append(el("p", "countdown-arrived", "筆試首日到喇"));
    section.append(el("p", "countdown-soft", "慢慢嚟，你得㗎。"));
  } else {
    section.append(el("p", "countdown-kicker", "仲有"));
    const days = el("p", "countdown-days", String(cd.days));
    days.id = "cd-days";
    section.append(days);
    section.append(el("p", "countdown-unit", "日"));
    const hms = el("p", "countdown-hms");
    hms.id = "cd-hms";
    hms.append(el("span", null, pad(cd.hours)), " 小時 ");
    hms.append(el("span", null, pad(cd.minutes)), " 分鐘 ");
    hms.append(el("span", null, pad(cd.seconds)), " 秒");
    section.append(hms);
  }

  const dateLine = el(
    "p",
    "countdown-date",
    `筆試首日：${formatChineseDate(config.examDate)}${config.examDateTentative ? "（暫定）" : ""}`
  );
  section.append(dateLine);
  if (config.writtenExamEnd) {
    section.append(
      el(
        "p",
        "countdown-range",
        `筆試期至 ${formatChineseDate(config.writtenExamEnd)}${config.examDateTentative ? "（暫定）" : ""}`
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

function renderSubjects() {
  const section = el("section", "subjects");
  section.id = "tips";
  section.append(el("h2", "section-title", "溫書小貼士"));
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
      `呢一版喺 ${formatChineseDate(parts.date)} ${pad(parts.hour)}:${pad(parts.minute)}（香港時間）整好。倒數、每日一句同下一個日子，會喺你部手機按香港時間即時計算。`
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
  days.textContent = String(cd.days);
  const hms = document.getElementById("cd-hms");
  if (!hms) return;
  const spans = hms.querySelectorAll("span");
  if (spans.length >= 3) {
    spans[0].textContent = pad(cd.hours);
    spans[1].textContent = pad(cd.minutes);
    spans[2].textContent = pad(cd.seconds);
  }
}

function render() {
  shownDate = hongKongParts().date;
  const classified = classifyEvents(DATA.events, shownDate);
  const events = sortEvents(classified);
  const info = events.filter((event) => event.category === "info");
  const jupas = events.filter((event) => event.category === "jupas");
  info.forEach((event, index) => {
    event.domId = `info-${index}`;
  });
  jupas.forEach((event, index) => {
    event.domId = `jupas-${index}`;
  });
  const ordered = [...info, ...jupas];

  const root = document.getElementById("app");
  root.replaceChildren();

  const header = el("header", "hero");
  const kicker = el("p", "kicker");
  kicker.append(heart(), document.createTextNode("小小加油頁"));
  header.append(kicker);
  header.append(el("h1", null, "Jasmine，加油！"));
  header.append(el("p", "lede", "一日一步，已經好好。"));
  header.append(el("p", "today", formatChineseDate(shownDate)));
  const nav = el("nav", "quick");
  nav.setAttribute("aria-label", "頁面章節");
  const links = [
    ["#countdown", "倒數"],
    ["#message", "今日一句"],
    ["#dates", "重要日子"],
    ["#tips", "溫書"],
  ];
  for (const [href, label] of links) {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    nav.append(link);
  }
  header.append(nav);
  root.append(header);
  root.append(renderCountdown(DATA.config));
  root.append(renderMessage(shownDate));
  root.append(renderTip(shownDate));
  root.append(renderNext(ordered));
  root.append(renderDates(ordered));
  root.append(renderSubjects());
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
