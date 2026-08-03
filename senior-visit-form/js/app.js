/* ==========================================================================
   Daily Senior Beneficiary Visit Report — Front-end logic
   Pure vanilla JS, no build step required.
   ========================================================================== */

// ---- CONFIGURATION -------------------------------------------------------
// Paste your deployed Google Apps Script Web App URL here.
// See docs/SHEETS_SETUP.md for how to generate this.
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzgUwbT29ZqtjLCTRAPWg7xAGD3k18JRJqEmjNTWfznrbH8WsyRPYzfqgjTAASUk958zQ/exec";

const DRAFT_KEY = "svr_draft_v1";
const SUBMITTED_KEY_PREFIX = "svr_submitted_";
const MAX_PHOTO_DIMENSION = 1000; // px, for client-side compression

// ---- ELEMENT REFERENCES ---------------------------------------------------
const form = document.getElementById("visitForm");
const progressBar = document.getElementById("progressBar");
const progressLabel = document.getElementById("progressLabel");
const darkModeToggle = document.getElementById("darkModeToggle");
const connectionStatus = document.getElementById("connectionStatus");
const toast = document.getElementById("toast");
const loadingOverlay = document.getElementById("loadingOverlay");
const submitBtn = document.getElementById("submitBtn");
const formErrorSummary = document.getElementById("formErrorSummary");

// ==========================================================================
// Init
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initSubmissionId();
  initDarkMode();
  initConnectionStatus();
  initDefaultDate();
  initGpsCapture();
  initMedicationTable();
  initItemsTable();
  initConditionalSections();
  initSignaturePads();
  initPhotoPreviews();
  initBmiCalculation();
  restoreDraft();
  attachAutosave();
  updateProgress();
  form.addEventListener("submit", handleSubmit);
});

// ==========================================================================
// Submission ID (also used for duplicate prevention)
// ==========================================================================
function initSubmissionId() {
  const field = document.getElementById("submissionId");
  field.value = "SVR-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

function initDefaultDate() {
  const dateField = document.getElementById("visitDate");
  if (!dateField.value) {
    dateField.value = new Date().toISOString().slice(0, 10);
  }
}

// ==========================================================================
// Dark mode
// ==========================================================================
function initDarkMode() {
  const saved = localStorage.getItem("svr_theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  applyTheme(theme);

  darkModeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("svr_theme", next);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  darkModeToggle.setAttribute("aria-pressed", theme === "dark");
  darkModeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

// ==========================================================================
// Online / offline status
// ==========================================================================
function initConnectionStatus() {
  updateConnectionStatus();
  window.addEventListener("online", updateConnectionStatus);
  window.addEventListener("offline", updateConnectionStatus);
}

function updateConnectionStatus() {
  const online = navigator.onLine;
  connectionStatus.textContent = online ? "Online" : "Offline";
  connectionStatus.classList.toggle("status-pill--online", online);
  connectionStatus.classList.toggle("status-pill--offline", !online);
}

// ==========================================================================
// GPS capture
// ==========================================================================
function initGpsCapture() {
  const btn = document.getElementById("captureGpsBtn");
  const status = document.getElementById("gpsStatus");
  btn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      status.textContent = "GPS is not supported on this device.";
      return;
    }
    status.textContent = "Getting location…";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        document.getElementById("gpsLat").value = pos.coords.latitude.toFixed(6);
        document.getElementById("gpsLng").value = pos.coords.longitude.toFixed(6);
        status.textContent = "Location captured (accuracy ±" + Math.round(pos.coords.accuracy) + "m).";
      },
      (err) => {
        status.textContent = "Could not get location: " + err.message;
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  });
}

// ==========================================================================
// Dynamic tables — Medications & Items Distributed
// ==========================================================================
function initMedicationTable() {
  const takingMeds = document.getElementById("takingMedications");
  const wrap = document.getElementById("medicationTableWrap");
  takingMeds.addEventListener("change", () => {
    wrap.hidden = takingMeds.value !== "Yes";
    if (!wrap.hidden && wrap.querySelector("tbody").children.length === 0) {
      addMedicationRow();
    }
  });

  document.querySelectorAll('[data-add-row="medicationTable"]').forEach((btn) =>
    btn.addEventListener("click", addMedicationRow)
  );
}

function addMedicationRow() {
  const tbody = document.querySelector("#medicationTable tbody");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" class="med-name" placeholder="Medicine"></td>
    <td><input type="text" class="med-dosage" placeholder="Dosage"></td>
    <td><input type="text" class="med-frequency" placeholder="Frequency"></td>
    <td>
      <select class="med-compliance">
        <option value="">Select...</option>
        <option>Full</option><option>Partial</option><option>None</option>
      </select>
    </td>
    <td><input type="number" class="med-missed" min="0" placeholder="0"></td>
    <td><input type="text" class="med-side-effects" placeholder="None"></td>
    <td><button type="button" class="row-remove-btn" aria-label="Remove row">✕</button></td>
  `;
  row.querySelector(".row-remove-btn").addEventListener("click", () => row.remove());
  tbody.appendChild(row);
}

function initItemsTable() {
  document.querySelectorAll('[data-add-row="itemsTable"]').forEach((btn) =>
    btn.addEventListener("click", addItemRow)
  );
  addItemRow(); // start with one empty row
}

function addItemRow() {
  const tbody = document.querySelector("#itemsTable tbody");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" class="item-name" placeholder="Item"></td>
    <td><input type="number" class="item-qty" min="0" placeholder="0"></td>
    <td><input type="text" class="item-unit" placeholder="e.g. pcs, kg"></td>
    <td><button type="button" class="row-remove-btn" aria-label="Remove row">✕</button></td>
  `;
  row.querySelector(".row-remove-btn").addEventListener("click", () => row.remove());
  tbody.appendChild(row);
}

function collectDynamicTable(rowSelector, fieldClasses) {
  const rows = document.querySelectorAll(rowSelector);
  const result = [];
  rows.forEach((row) => {
    const entry = {};
    let hasValue = false;
    fieldClasses.forEach(({ cls, key }) => {
      const el = row.querySelector("." + cls);
      const val = el ? el.value.trim() : "";
      if (val) hasValue = true;
      entry[key] = val;
    });
    if (hasValue) result.push(entry);
  });
  return result;
}

// ==========================================================================
// Conditional sections (referral details, risk warning)
// ==========================================================================
function initConditionalSections() {
  const referralNeeded = document.getElementById("referralNeeded");
  const referralDetails = document.getElementById("referralDetails");
  referralNeeded.addEventListener("change", () => {
    referralDetails.hidden = referralNeeded.value !== "Yes";
  });

  const riskWarning = document.getElementById("riskWarning");
  document.querySelectorAll('input[name="riskAssessment"]').forEach((cb) => {
    cb.addEventListener("change", () => {
      const dangerBox = document.querySelector('input[name="riskAssessment"][value="Immediate danger"]');
      riskWarning.hidden = !dangerBox.checked;
    });
  });
}

// ==========================================================================
// BMI auto-calculation
// ==========================================================================
function initBmiCalculation() {
  const weight = document.getElementById("weight");
  const height = document.getElementById("height");
  const bmi = document.getElementById("bmi");
  function recalc() {
    const w = parseFloat(weight.value);
    const h = parseFloat(height.value) / 100;
    if (w > 0 && h > 0) {
      bmi.value = (w / (h * h)).toFixed(1);
    } else {
      bmi.value = "";
    }
  }
  weight.addEventListener("input", recalc);
  height.addEventListener("input", recalc);
}

// ==========================================================================
// Signature pads
// ==========================================================================
const signaturePads = {};

function initSignaturePads() {
  document.querySelectorAll(".signature-pad").forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0b3d78";
    let drawing = false;
    let hasContent = false;

    // Scale canvas for device pixel ratio for crisper lines
    fitCanvas(canvas);
    window.addEventListener("resize", () => fitCanvas(canvas));

    function pos(evt) {
      const rect = canvas.getBoundingClientRect();
      const point = evt.touches ? evt.touches[0] : evt;
      return {
        x: (point.clientX - rect.left) * (canvas.width / rect.width) / (window.devicePixelRatio || 1),
        y: (point.clientY - rect.top) * (canvas.height / rect.height) / (window.devicePixelRatio || 1),
      };
    }

    function start(evt) {
      drawing = true;
      hasContent = true;
      const p = pos(evt);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      evt.preventDefault();
    }
    function move(evt) {
      if (!drawing) return;
      const p = pos(evt);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      evt.preventDefault();
    }
    function end() { drawing = false; }

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end);

    signaturePads[canvas.id] = {
      canvas,
      isEmpty: () => !hasContent,
      clear: () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasContent = false;
      },
    };
  });

  document.querySelectorAll("[data-clear-sig]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pad = signaturePads[btn.getAttribute("data-clear-sig")];
      if (pad) pad.clear();
    });
  });
}

function fitCanvas(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const displayWidth = canvas.clientWidth || 500;
  canvas.width = displayWidth * ratio;
  canvas.height = 160 * ratio;
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#0b3d78";
}

// ==========================================================================
// Photo previews + client-side compression
// ==========================================================================
function initPhotoPreviews() {
  const beneficiaryInput = document.getElementById("beneficiaryPhoto");
  const preview = document.getElementById("beneficiaryPhotoPreview");
  beneficiaryInput.addEventListener("change", async () => {
    const file = beneficiaryInput.files[0];
    if (!file) { preview.hidden = true; return; }
    const dataUrl = await compressImage(file);
    preview.src = dataUrl;
    preview.hidden = false;
  });
}

function compressImage(file, maxDim = MAX_PHOTO_DIMENSION, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function collectPhoto(inputId) {
  const input = document.getElementById(inputId);
  if (!input || !input.files[0]) return null;
  const dataUrl = await compressImage(input.files[0]);
  return { filename: input.files[0].name, dataUrl };
}

// ==========================================================================
// Progress indicator
// ==========================================================================
function updateProgress() {
  const requiredFields = form.querySelectorAll("[required]");
  let filled = 0;
  requiredFields.forEach((f) => { if (f.value && f.value.trim()) filled++; });
  const pct = requiredFields.length ? Math.round((filled / requiredFields.length) * 100) : 0;
  progressBar.style.width = pct + "%";
  progressBar.parentElement.setAttribute("aria-valuenow", pct);
  progressLabel.textContent = pct + "% of required fields complete";

  // Mark sections with all their required fields filled
  document.querySelectorAll(".form-section").forEach((section) => {
    const reqs = section.querySelectorAll("[required]");
    if (reqs.length === 0) { section.classList.remove("section--complete"); return; }
    const allFilled = Array.from(reqs).every((f) => f.value && f.value.trim());
    section.classList.toggle("section--complete", allFilled);
  });
}

form.addEventListener("input", debounce(updateProgress, 200));

// ==========================================================================
// Autosave draft (localStorage)
// ==========================================================================
function attachAutosave() {
  form.addEventListener("input", debounce(saveDraft, 500));
  form.addEventListener("change", debounce(saveDraft, 500));
}

function saveDraft() {
  try {
    const data = serializeSimpleFields();
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Could not save draft:", e);
  }
}

function serializeSimpleFields() {
  const data = {};
  new FormData(form).forEach((value, key) => {
    if (data[key] === undefined) {
      data[key] = value;
    } else if (Array.isArray(data[key])) {
      data[key].push(value);
    } else {
      data[key] = [data[key], value];
    }
  });
  return data;
}

function restoreDraft() {
  const saved = localStorage.getItem(DRAFT_KEY);
  if (!saved) return;
  try {
    const data = JSON.parse(saved);
    Object.entries(data).forEach(([key, value]) => {
      const els = form.querySelectorAll(`[name="${CSS.escape(key)}"]`);
      if (els.length === 0) return;
      if (els.length === 1 && els[0].type !== "checkbox") {
        if (els[0].id === "submissionId") return; // keep freshly generated ID
        els[0].value = value;
      } else {
        const values = Array.isArray(value) ? value : [value];
        els.forEach((el) => {
          if (el.type === "checkbox") el.checked = values.includes(el.value);
        });
      }
    });
    // Re-trigger conditional visibility based on restored values
    document.getElementById("takingMedications").dispatchEvent(new Event("change"));
    document.getElementById("referralNeeded").dispatchEvent(new Event("change"));
  } catch (e) {
    console.warn("Could not restore draft:", e);
  }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

// ==========================================================================
// Validation
// ==========================================================================
function validateForm() {
  const errors = [];
  form.querySelectorAll("[required]").forEach((field) => {
    field.classList.add("touched");
    if (!field.value || !field.value.trim()) {
      errors.push(fieldLabel(field) + " is required.");
    }
  });

  const phone = document.getElementById("caregiverPhone");
  if (phone.value && !/^[0-9+\-\s()]{7,15}$/.test(phone.value)) {
    errors.push("Caregiver phone number looks invalid.");
  }

  return errors;
}

function fieldLabel(field) {
  const label = form.querySelector(`label[for="${field.id}"]`);
  return label ? label.textContent.replace("*", "").trim() : field.name;
}

// ==========================================================================
// Submit
// ==========================================================================
async function handleSubmit(evt) {
  evt.preventDefault();

  const submissionId = document.getElementById("submissionId").value;
  if (localStorage.getItem(SUBMITTED_KEY_PREFIX + submissionId)) {
    showToast("This report was already submitted.", "error");
    return;
  }

  const errors = validateForm();
  if (errors.length > 0) {
    formErrorSummary.hidden = false;
    formErrorSummary.innerHTML = "Please fix the following:<br>" + errors.map(e => "• " + e).join("<br>");
    formErrorSummary.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  formErrorSummary.hidden = true;

  if (!confirm("Submit this visit report? You won't be able to edit it after submitting.")) {
    return;
  }

  document.getElementById("submitBtn").disabled = true;
  loadingOverlay.hidden = false;

  try {
    const payload = await buildPayload();

    if (APPS_SCRIPT_URL.includes("https://script.google.com/macros/s/AKfycbz9s-HNZalSozOiYyv1UOe9P-DeKhF8O5L-8VH-dF1W5guy85-rowCalwnxQCycNDzCPw/exec")) {
      throw new Error("Apps Script URL is not configured yet. See docs/SHEETS_SETUP.md.");
    }

    // Apps Script Web Apps don't return CORS headers for POST, so we use
    // mode: "no-cors" and treat the request as fire-and-forget.
    // text/plain avoids a CORS preflight request.
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    localStorage.setItem(SUBMITTED_KEY_PREFIX + submissionId, "1");
    clearDraft();
    showToast("Visit report submitted successfully.", "success");
    setTimeout(() => window.location.reload(), 1800);
  } catch (err) {
    console.error(err);
    showToast("Could not submit: " + err.message, "error");
    submitBtn.disabled = false;
  } finally {
    loadingOverlay.hidden = true;
  }
}

async function buildPayload() {
  const simple = serializeSimpleFields();

  const medications = collectDynamicTable("#medicationTable tbody tr", [
    { cls: "med-name", key: "name" },
    { cls: "med-dosage", key: "dosage" },
    { cls: "med-frequency", key: "frequency" },
    { cls: "med-compliance", key: "compliance" },
    { cls: "med-missed", key: "missedDoses" },
    { cls: "med-side-effects", key: "sideEffects" },
  ]);

  const itemsDistributed = collectDynamicTable("#itemsTable tbody tr", [
    { cls: "item-name", key: "item" },
    { cls: "item-qty", key: "quantity" },
    { cls: "item-unit", key: "unit" },
  ]);

  const [beneficiaryPhoto, photoBeneficiary, photoMedicine, photoEnvironment, photoDocuments] = await Promise.all([
    collectPhoto("beneficiaryPhoto"),
    collectPhoto("photoBeneficiary"),
    collectPhoto("photoMedicine"),
    collectPhoto("photoEnvironment"),
    collectPhoto("photoDocuments"),
  ]);

  return {
    ...simple,
    timestamp: new Date().toISOString(),
    medications,
    itemsDistributed,
    caregiverSignature: signaturePads.caregiverSignature && !signaturePads.caregiverSignature.isEmpty()
      ? signaturePads.caregiverSignature.canvas.toDataURL("image/png") : null,
    beneficiarySignature: signaturePads.beneficiarySignature && !signaturePads.beneficiarySignature.isEmpty()
      ? signaturePads.beneficiarySignature.canvas.toDataURL("image/png") : null,
    photos: {
      beneficiaryPhoto, photoBeneficiary, photoMedicine, photoEnvironment, photoDocuments,
    },
  };
}

// ==========================================================================
// Toast helper
// ==========================================================================
let toastTimer;
function showToast(message, type = "info") {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = "toast toast--" + type;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 4000);
}

// ==========================================================================
// Utility
// ==========================================================================
function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// ==========================================================================
// Service worker registration (PWA)
// ==========================================================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((e) => console.warn("SW registration failed:", e));
  });
}
