const form = document.querySelector("#examForm");
const statusNode = document.querySelector("#saveStatus");
const timerDisplay = document.querySelector("#timerDisplay");
const timerStartBtn = document.querySelector("#timerStartBtn");
const timerPauseBtn = document.querySelector("#timerPauseBtn");
const timerResetBtn = document.querySelector("#timerResetBtn");
const examId = document.body.dataset.examId || "fanrunran_reading_page";
const examTitle = document.body.dataset.examTitle || document.title;
const storageKey = `fanrunran_reading_page_${examId}`;
const readingFontStorageKey = "fanrunran_reading_material_font_size";
const readingFontRange = { min: 16, max: 24, step: 1, defaultSize: 18 };

let timer = {
  elapsedSeconds: 0,
  isRunning: false,
  startedAt: null
};
let timerInterval = null;
let readingFontSize = readingFontRange.defaultSize;

function serializeForm() {
  const data = {};
  if (!form) return data;
  form.querySelectorAll("input, textarea").forEach((field) => {
    if (field.type === "radio") {
      if (field.checked) data[field.name] = field.value;
      return;
    }
    data[field.name] = field.value;
  });
  return data;
}

function getElapsedSeconds() {
  if (!timer.isRunning || !timer.startedAt) return timer.elapsedSeconds;
  return Math.floor((Date.now() - timer.startedAt) / 1000);
}

function formatTime(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function renderTimer() {
  if (!timerDisplay || !timerStartBtn || !timerPauseBtn) return;
  timerDisplay.textContent = formatTime(getElapsedSeconds());
  timerStartBtn.textContent = timer.isRunning ? "计时中" : "开始计时";
  timerStartBtn.disabled = timer.isRunning;
  timerPauseBtn.disabled = !timer.isRunning;
}

function applyReadingFontSize(size) {
  readingFontSize = Math.min(readingFontRange.max, Math.max(readingFontRange.min, size));
  document.documentElement.style.setProperty("--reading-font-size", `${readingFontSize}px`);
  localStorage.setItem(readingFontStorageKey, String(readingFontSize));
}

function setupReadingFontControls() {
  const readingHead = document.querySelector(".reading-page .section-head");
  if (!readingHead || document.querySelector("#readingFontIncreaseBtn")) return;

  const storedValue = localStorage.getItem(readingFontStorageKey);
  const storedSize = storedValue === null ? null : Number(storedValue);
  if (Number.isFinite(storedSize)) applyReadingFontSize(storedSize);
  else applyReadingFontSize(readingFontRange.defaultSize);

  const controls = document.createElement("div");
  controls.className = "reading-tools";
  controls.setAttribute("aria-label", "阅读材料字号");
  controls.innerHTML = `
    <button type="button" class="font-control" id="readingFontDecreaseBtn" title="缩小阅读材料字号" aria-label="缩小阅读材料字号">A-</button>
    <button type="button" class="font-control reset" id="readingFontResetBtn" title="恢复默认阅读材料字号" aria-label="恢复默认阅读材料字号">默认</button>
    <button type="button" class="font-control" id="readingFontIncreaseBtn" title="放大阅读材料字号" aria-label="放大阅读材料字号">A+</button>
  `;
  readingHead.appendChild(controls);

  document.querySelector("#readingFontDecreaseBtn").addEventListener("click", () => {
    applyReadingFontSize(readingFontSize - readingFontRange.step);
  });
  document.querySelector("#readingFontResetBtn").addEventListener("click", () => {
    applyReadingFontSize(readingFontRange.defaultSize);
  });
  document.querySelector("#readingFontIncreaseBtn").addEventListener("click", () => {
    applyReadingFontSize(readingFontSize + readingFontRange.step);
  });
}

function getState() {
  return {
    version: 1,
    exam_id: examId,
    exam_title: examTitle,
    saved_at: new Date().toISOString(),
    form: serializeForm(),
    timer: {
      elapsedSeconds: getElapsedSeconds(),
      formattedElapsed: formatTime(getElapsedSeconds()),
      isRunning: timer.isRunning
    }
  };
}

function saveState(showMessage = true) {
  if (!form) return;
  localStorage.setItem(storageKey, JSON.stringify(getState()));
  if (showMessage && statusNode) statusNode.textContent = "已自动保存。";
}

function restoreState() {
  if (!form) return;
  const raw = localStorage.getItem(storageKey);
  if (!raw) return;
  try {
    const stored = JSON.parse(raw);
    Object.entries(stored.form || {}).forEach(([name, value]) => {
      form.querySelectorAll(`[name="${CSS.escape(name)}"]`).forEach((field) => {
        if (field.type === "radio") {
          field.checked = field.value === value;
        } else {
          field.value = value;
        }
      });
    });
    if (stored.timer) {
      timer.elapsedSeconds = Number(stored.timer.elapsedSeconds) || 0;
      timer.isRunning = false;
      timer.startedAt = null;
      renderTimer();
    }
    if (statusNode) statusNode.textContent = "已恢复上次作答。";
  } catch {
    if (statusNode) statusNode.textContent = "未能恢复上次作答。";
  }
}

function startTimer() {
  if (timer.isRunning) return;
  timer.startedAt = Date.now() - timer.elapsedSeconds * 1000;
  timer.isRunning = true;
  timerInterval = window.setInterval(() => {
    renderTimer();
    saveState(false);
  }, 1000);
  renderTimer();
  saveState();
}

function pauseTimer() {
  if (!timer.isRunning) return;
  timer.elapsedSeconds = getElapsedSeconds();
  timer.startedAt = null;
  timer.isRunning = false;
  window.clearInterval(timerInterval);
  timerInterval = null;
  renderTimer();
  saveState();
}

function resetTimer() {
  if (!confirm("确定重置计时吗？")) return;
  timer.elapsedSeconds = 0;
  timer.startedAt = timer.isRunning ? Date.now() : null;
  renderTimer();
  saveState();
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function buildPayload() {
  const state = getState();
  return {
    exam_id: examId,
    exam_title: examTitle,
    exported_at: new Date().toISOString(),
    student_meta: {
      name: state.form.student_name || "",
      grade: state.form.grade || "",
      age: state.form.age || "",
      class_name: state.form.class_name || "",
      student_id: state.form.student_id || "",
      exam_date: state.form.exam_date || ""
    },
    timing: state.timer,
    responses: state.form
  };
}

function exportJson() {
  const payload = buildPayload();
  const filenameName = payload.student_meta.name ? payload.student_meta.name.trim() : "学生";
  downloadFile(`${examTitle}_${filenameName}_画像输入.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
}

function exportTxt() {
  const payload = buildPayload();
  const lines = [
    payload.exam_title,
    `姓名：${payload.student_meta.name}`,
    `年级：${payload.student_meta.grade}`,
    `年龄：${payload.student_meta.age}`,
    `班级：${payload.student_meta.class_name}`,
    `学号：${payload.student_meta.student_id}`,
    `日期：${payload.student_meta.exam_date}`,
    `计时：${payload.timing.formattedElapsed}`,
    ""
  ];
  Object.entries(payload.responses).forEach(([key, value]) => {
    if (["student_name", "grade", "age", "class_name", "student_id", "exam_date"].includes(key)) return;
    lines.push(`${key}：`);
    lines.push(String(value || ""));
    lines.push("");
  });
  const filenameName = payload.student_meta.name ? payload.student_meta.name.trim() : "学生";
  downloadFile(`${examTitle}_${filenameName}_作答.txt`, lines.join("\n"), "text/plain;charset=utf-8");
}

if (form) {
  form.addEventListener("input", () => saveState());
  form.addEventListener("change", () => saveState());
}

if (timerStartBtn) timerStartBtn.addEventListener("click", startTimer);
if (timerPauseBtn) timerPauseBtn.addEventListener("click", pauseTimer);
if (timerResetBtn) timerResetBtn.addEventListener("click", resetTimer);

document.querySelectorAll("[data-print-page]").forEach((button) => {
  button.addEventListener("click", () => window.print());
});

const exportJsonBtn = document.querySelector("#exportJsonBtn");
const exportTxtBtn = document.querySelector("#exportTxtBtn");
const clearBtn = document.querySelector("#clearBtn");

if (exportJsonBtn) exportJsonBtn.addEventListener("click", exportJson);
if (exportTxtBtn) exportTxtBtn.addEventListener("click", exportTxt);
if (clearBtn && form) {
  clearBtn.addEventListener("click", () => {
    if (!confirm("确定清空当前页面中的作答吗？")) return;
    window.clearInterval(timerInterval);
    localStorage.removeItem(storageKey);
    form.reset();
    timer = { elapsedSeconds: 0, isRunning: false, startedAt: null };
    renderTimer();
    if (statusNode) statusNode.textContent = "已清空。";
  });
}

renderTimer();
setupReadingFontControls();
restoreState();
