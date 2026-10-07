function hongKongParts(now = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = {};
  for (const part of fmt.formatToParts(now)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function dateToDayNumber(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

function pickByDate(list, isoDate) {
  if (!list || list.length === 0) return null;
  const index = dateToDayNumber(isoDate) % list.length;
  return list[(index + list.length) % list.length];
}

function countdownParts(examDate, now = new Date()) {
  const target = Date.parse(`${examDate}T00:00:00+08:00`);
  const diff = target - now.getTime();
  if (!(diff > 0)) {
    return { past: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const totalSeconds = Math.floor(diff / 1000);
  return {
    past: false,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function weekdayChar(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const noonInHongKong = new Date(Date.UTC(y, m - 1, d, 4, 0, 0));
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Hong_Kong",
    weekday: "short",
  }).format(noonInHongKong);
  const map = { Sun: "日", Mon: "一", Tue: "二", Wed: "三", Thu: "四", Fri: "五", Sat: "六" };
  return map[weekday] || "";
}

function formatChineseDate(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return `${y}年${m}月${d}日（${weekdayChar(isoDate)}）`;
}

function formatTime(hhmm) {
  if (!hhmm) return "";
  const [hRaw, mRaw] = hhmm.split(":");
  const hour = Number(hRaw);
  const minute = Number(mRaw);
  const period = hour < 12 ? "上午" : "下午";
  let hour12 = hour % 12;
  if (hour12 === 0) hour12 = 12;
  return minute === 0 ? `${period}${hour12}時` : `${period}${hour12}時${minute}分`;
}

function formatEventWhen(event) {
  if (!event.start) return "未公布";
  let start = formatChineseDate(event.start);
  if (event.startTime) start += formatTime(event.startTime);
  const sameDay = !event.end || event.end === event.start;
  if (sameDay) {
    if (!event.startTime && event.period) start += event.period;
    if (event.endTime && event.endTime !== event.startTime) {
      return `${start} 至 ${formatTime(event.endTime)}`;
    }
    return start;
  }
  let end = formatChineseDate(event.end);
  if (event.endTime) end += formatTime(event.endTime);
  return `${start} 至 ${end}`;
}

function countdownCaption(config) {
  const label = config.examLabel ? `${config.examLabel} ` : "";
  const tentative = config.examDateTentative ? "（暫定）" : "";
  return `${label}${formatChineseDate(config.examDate)}${tentative}`;
}

function writtenExamStartNote(isoDate) {
  if (!isoDate) return "";
  const [, month, day] = isoDate.split("-").map(Number);
  return `文憑試筆試 ${month}月${day}日開始`;
}

function formatPaperLine(paper) {
  if (paper.label) {
    const notes = [];
    if (paper.tentative) notes.push("暫定");
    if (paper.detail) notes.push(paper.detail);
    const tail = notes.length ? `（${notes.join("，")}）` : "";
    return `${paper.title}：${paper.label}${tail}`;
  }
  return `${formatChineseDate(paper.start)} ${paper.title}`;
}

function classifyEvents(events, today) {
  const decorated = events.map((event, index) => {
    const start = event.start || null;
    const end = event.end || event.start || null;
    let phase = "unannounced";
    if (start && end) {
      if (end < today) phase = "past";
      else if (start > today) phase = "future";
      else phase = "ongoing";
    }
    return { event, index, start, phase };
  });

  const ongoing = decorated.filter((item) => item.phase === "ongoing");
  const highlighted = new Set();
  if (ongoing.length > 0) {
    for (const item of ongoing) highlighted.add(item.index);
  } else {
    const future = decorated.filter((item) => item.phase === "future");
    if (future.length > 0) {
      const soonest = future.reduce((min, item) => (item.start < min ? item.start : min), future[0].start);
      for (const item of future) {
        if (item.start === soonest) highlighted.add(item.index);
      }
    }
  }

  return decorated.map((item) => {
    let phase = item.phase;
    if (highlighted.has(item.index)) {
      phase = item.phase === "ongoing" ? "ongoing" : "next";
    }
    return { ...item.event, phase };
  });
}

function nextSchoolEvent(events, today) {
  const upcoming = events.filter((event) => event.category === "school" && event.start && event.start >= today);
  upcoming.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
  return upcoming[0] || null;
}

function sortEvents(events) {
  return [...events].sort((a, b) => {
    if (!a.start && !b.start) return 0;
    if (!a.start) return 1;
    if (!b.start) return -1;
    if (a.start < b.start) return -1;
    if (a.start > b.start) return 1;
    return 0;
  });
}

export {
  hongKongParts,
  dateToDayNumber,
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
};
