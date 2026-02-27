/* ---------------- DOM refs ---------------- */
const screens = ["login", "home", "memories", "playlist", "reunion", "final"];

// Reunion refs
const timeET = document.getElementById("timeET");
const timeIST = document.getElementById("timeIST");
const cdDays = document.getElementById("cdDays");
const cdHours = document.getElementById("cdHours");
const cdMins = document.getElementById("cdMins");
const cdSecs = document.getElementById("cdSecs");
const progressFill = document.getElementById("progressFill");
const progressPct = document.getElementById("progressPct");
const asciiBar = document.getElementById("asciiBar");
const dailyMsg = document.getElementById("dailyMsg");
const daysPulse = document.getElementById("daysPulse");

let reunionTimer = null;
let lastWholeDays = null;

const el = {
  nav: document.getElementById("nav"),
  lockBtn: document.getElementById("lockBtn"),
  passcode: document.getElementById("passcode"),
  unlockBtn: document.getElementById("unlockBtn"),
  hint: document.getElementById("loginHint"),
};

const galleryEl = document.getElementById("gallery");
const songsEl = document.getElementById("songs");

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const valRow = document.getElementById("valRow");
const finalText = document.getElementById("finalText");

const afterYes = document.getElementById("afterYes");
const confettiCanvas = document.getElementById("confetti");

const bgSongWrap = document.getElementById("bgSongWrap");
const gif1 = document.getElementById("gif1");
const gif2 = document.getElementById("gif2");

const gifRow = document.getElementById("gifRow"); // only if you add the wrapper div


const heartsLayer = document.getElementById("heartsLayer");

/* ---------------- Auth ---------------- */
const PASSCODES = ["maanilovesyoumerijaan", "2318"]; // add more if you want

function isUnlocked() {
  return sessionStorage.getItem("vault_unlocked") === "true";
}

function unlock() {
  const entered = (el.passcode.value || "").trim();
  if (!entered) return;

  if (PASSCODES.includes(entered)) {
    sessionStorage.setItem("vault_unlocked", "true");
    el.passcode.value = "";
    el.hint.textContent = "";
    show("home");
  } else {
    el.hint.textContent = "Hmm… try again ❤️";
    const loginCard = document.getElementById("screen-login");
    if (loginCard) {
      loginCard.classList.remove("shake");
      void loginCard.offsetWidth; // restart animation
      loginCard.classList.add("shake");
    }
  }
}

function lock() {
  sessionStorage.removeItem("vault_unlocked");
  el.passcode.value = "";
  el.hint.textContent = "";
  show("login");
}

/* ---------------- Navigation ---------------- */
function show(name) {
  for (const s of screens) {
    const node = document.getElementById(`screen-${s}`);
    if (name === "reunion") startReunionTimer();
      else stopReunionTimer();
    if (node) node.hidden = (s !== name);
  }

  // nav hidden on login
  el.nav.hidden = (name === "login") || !isUnlocked();

  // hearts only on login
  if (name === "login") startHearts();
  else stopHearts();

  // refresh dynamic screens when shown
  if (name === "memories") renderGallery();
  if (name === "playlist") renderSongs();
  if (name === "final") resetFinalScreen();
}

function go(dest) {
  if (!isUnlocked()) return show("login");
  show(dest);
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-go]");
  if (!btn) return;
  go(btn.getAttribute("data-go"));
});

el.unlockBtn?.addEventListener("click", unlock);
el.passcode?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") unlock();
});
el.lockBtn?.addEventListener("click", lock);

/* ---------------- Login hearts ---------------- */
let heartsTimer = null;

function spawnHeart() {
  if (!heartsLayer) return;

  const heart = document.createElement("div");
  heart.className = "heart";

  const chars = ["❤️", "💖", "💘", "💝", "💕", "💗"];
  heart.textContent = chars[Math.floor(Math.random() * chars.length)];

  heart.style.setProperty("--x", (Math.floor(Math.random() * 95) + "%"));
  heart.style.setProperty("--fs", (10 + Math.random() * 18).toFixed(0) + "px");
  heart.style.setProperty("--d", (2.2 + Math.random() * 2.6).toFixed(2) + "s");
  heart.style.setProperty("--s", (0.7 + Math.random() * 1.1).toFixed(2));
  heart.style.setProperty("--r", (((Math.random() * 80) - 40).toFixed(0)) + "deg");

  heartsLayer.appendChild(heart);
  heart.addEventListener("animationend", () => heart.remove());
}

function startHearts() {
  if (heartsTimer) return;
  for (let i = 0; i < 6; i++) spawnHeart();
  heartsTimer = setInterval(spawnHeart, 350);
}

function stopHearts() {
  if (!heartsTimer) return;
  clearInterval(heartsTimer);
  heartsTimer = null;
  if (heartsLayer) heartsLayer.innerHTML = "";
}

/* ---------------- Memories ---------------- */
function renderGallery() {
  if (!galleryEl) return;
  const photos = window.APP_DATA?.photos || [];
  galleryEl.innerHTML = "";

  if (!photos.length) {
    galleryEl.innerHTML = `<p class="muted">No photos yet — add some to /assets/photos ❤️</p>`;
    return;
  }

  for (const filename of photos) {
    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = `assets/photos/${filename}`;
    img.alt = "Memory photo";
    galleryEl.appendChild(img);
  }
}

/* ---------------- Playlist ---------------- */
function renderSongs() {
  if (!songsEl) return;
  const songs = window.APP_DATA?.songs || [];
  songsEl.innerHTML = "";

  if (!songs.length) {
    songsEl.innerHTML = `<p class="muted">No songs yet — add Spotify embed links in data.js 🎵</p>`;
    return;
  }

  for (const s of songs) {
    const card = document.createElement("div");
    card.className = "songCard";

    const title = document.createElement("div");
    title.className = "songTitle";
    title.textContent = s.title || "Song";

    const note = document.createElement("div");
    note.className = "songNote";
    note.textContent = s.note || "";

    card.appendChild(title);
    card.appendChild(note);

    if (s.embed) {
      const iframe = document.createElement("iframe");
      iframe.src = s.embed;
      iframe.width = "100%";
      iframe.height = "80";
      iframe.style.borderRadius = "12px";
      iframe.frameBorder = "0";
      iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
      iframe.loading = "lazy";
      card.appendChild(iframe);
    }

    songsEl.appendChild(card);
  }
}

/* ---------------- Confetti ---------------- */
function startConfetti() {
  if (!confettiCanvas) return;

  const canvas = confettiCanvas;
  const ctx = canvas.getContext("2d");
  canvas.hidden = false;

  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth, h = window.innerHeight;

  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const pieces = Array.from({ length: 160 }, () => ({
    x: Math.random() * w,
    y: -20 - Math.random() * h,
    r: 3 + Math.random() * 5,
    vy: 2 + Math.random() * 4,
    vx: -1 + Math.random() * 2,
    rot: Math.random() * Math.PI,
    vr: -0.1 + Math.random() * 0.2,
  }));

  let frames = 0;
  function tick() {
    frames++;
    ctx.clearRect(0, 0, w, h);

    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y > h + 30) p.y = -30;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 1.2);
      ctx.restore();
    }

    if (frames < 220) requestAnimationFrame(tick);
    else canvas.hidden = true;
  }
  tick();
}

/* ---------------- Final screen: No button antics + Yes sequence ---------------- */
let noCount = 0;

const noLines = [
  "Nice try 😄",
  "No button is shy today 🙈",
  "Absolutely not happening 😂",
  "You can’t click that one 😌",
  "Plot twist: ‘No’ is disabled by love 💘",
  "Okay okay… but why though? 🥺",
  "Error 404: No not found 😇",
  "I’m faster than your finger 😈",
  "Stoppp 😂 just press Yes",
  "This is a rigged election 😤",
];

function moveNoButton() {
  if (!noBtn || !valRow) return;

  noCount += 1;
  if (finalText) {
    const line = noLines[Math.min(noCount - 1, noLines.length - 1)];
    finalText.textContent = line;
  }

  valRow.style.position = "relative";
  noBtn.style.position = "absolute";

  const rowRect = valRow.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const pad = 8;
  const maxX = Math.max(pad, rowRect.width - btnRect.width - pad);
  const maxY = Math.max(pad, rowRect.height - btnRect.height - pad);

  const x = pad + Math.random() * maxX;
  const y = pad + Math.random() * maxY;

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
  noBtn.style.transform = `rotate(${(-8 + Math.random() * 16).toFixed(0)}deg)`;
}

function restartGif(imgEl) {
  if (!imgEl) return;
  const src = imgEl.src;
  imgEl.src = "";
  imgEl.src = src;
}

function showGifSideBySide() {
  // If you added the wrapper div:
  if (gifRow) gifRow.hidden = false;

  // Show GIF1 immediately and keep it
  if (gif1) {
    gif1.hidden = false;            // if you did NOT add wrapper
    restartGif(gif1);
    requestAnimationFrame(() => gif1.classList.add("show"));
  }

  // After 5 seconds, show GIF2 beside it (do NOT hide GIF1)
  setTimeout(() => {
    if (gif2) {
      gif2.hidden = false;          // if you did NOT add wrapper
      restartGif(gif2);
      requestAnimationFrame(() => gif2.classList.add("show"));
    }
  }, 5000);
}


function onYes() {
  if (afterYes) afterYes.hidden = false;
  if (finalText) finalText.textContent = "YAYYY!! 🥹💞 Best answer ever.";

  startConfetti();

  if (noBtn) noBtn.hidden = true;

  // show embedded song player
  if (bgSongWrap) bgSongWrap.hidden = false;

  // show gifs in order
  showGifSideBySide();
}

function resetFinalScreen() {
  noCount = 0;

  if (finalText) finalText.textContent = "No pressure… but also yes pressure 😄";
  if (afterYes) afterYes.hidden = true;

  if (bgSongWrap) bgSongWrap.hidden = true;

  if (gif1) {
    gif1.hidden = true;
    gif1.classList.remove("show");
  }
  if (gif2) {
    gif2.hidden = true;
    gif2.classList.remove("show");
  }

  if (noBtn) {
    noBtn.hidden = false;
    noBtn.style.position = "";
    noBtn.style.left = "";
    noBtn.style.top = "";
    noBtn.style.transform = "";
  }
}

/* attach final listeners once */
yesBtn?.addEventListener("click", onYes);

if (noBtn) {
  noBtn.addEventListener("mouseenter", moveNoButton);
  noBtn.addEventListener("mousedown", (e) => { e.preventDefault(); moveNoButton(); });
  noBtn.addEventListener("touchstart", (e) => { e.preventDefault(); moveNoButton(); }, { passive: false });
}

/* ---------------- Boot ---------------- */
renderGallery();
renderSongs();
show(isUnlocked() ? "home" : "login");

function pad2(n){ return String(n).padStart(2, "0"); }

// Get a Date for a specific wall-clock time in a specific IANA timezone (ET safe incl DST)
function zonedTimeToUtcDate({ year, month, day, hour=0, minute=0, second=0, timeZone }) {
  // Start with an approximate UTC time
  const approx = new Date(Date.UTC(year, month-1, day, hour, minute, second));

  // Figure out what time that "approx" corresponds to in the target timezone
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });
  const parts = Object.fromEntries(dtf.formatToParts(approx).map(p => [p.type, p.value]));

  // Convert that displayed zoned time back to a UTC timestamp
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );

  // Offset between approx and actual UTC we want
  const diffMs = asUtc - approx.getTime();
  return new Date(approx.getTime() - diffMs);
}

function setFlipText(el, text){
  if (!el) return;
  const next = String(text);
  if (el.textContent === next) return;
  el.textContent = next;
  el.classList.remove("flipAnim");
  void el.offsetWidth;
  el.classList.add("flipAnim");
}

function buildAsciiBar(pct){
  const total = 18;
  const filled = Math.round((pct/100) * total);
  return "[" + "█".repeat(filled) + "░".repeat(total - filled) + "]";
}

function pickDailyMessage(daysLeft){

  const messages = {
    0: "She’s here. Go get that hug 🥹💞",
    1: "Tomorrow. I’m basically vibrating 😭✈️",
    2: "48 hours. My heart is already at the airport ❤️",
    3: "3 days. Warning: excessive cuddling expected on arrival.",
    4: "4 days. My arms are pre-reserved for you.",
    5: "5 days. Counting down kisses in advance 😌",
    6: "6 days. Your side of the bed is waiting 🛏️❤️",
    7: "One week. We survived long distance like champions 💪💖",
    8: "8 days. Congratulations, my love 🤍" + "\n\r" + "First step of a lifetime of memories we will build together.",
    9: "9 days. Congratulations, my love 🤍" + "\n\r" + "First step of a lifetime of memories we will build together.",
    10: "10 days. Happy Roka Day, my love ❤️. Even though I’m miles away, my heart is right next to you. I wish I could be there to see you, to hold your hand and laugh with you. I am with you in every prayer, every smile, every blessing exchanged today. Today, our forever becomes official. So proud of us. So grateful for you. So ready for forever.",
    11: "11 days. Soon this countdown becomes a memory.",
    12: "12 days. Time moves slower without your smile 😌",
    13: "13 days. Every sunrise is one closer to you.",
    14: "14 days. Two weeks. Every day closer to you 💖",
    15: "15 days. I miss your laugh 🥹😂",
    16: "16 days. Missing your eyes today 👀💖",
    17: "17 days. I miss your laugh the most 🥹",
    18: "18 days. Feels close. Feels real. ❤️"
  };

  if (messages[daysLeft]) {
    return messages[daysLeft];
  }

  if (daysLeft < 0) {
    return "You’re together. Stop reading this and hug her 😌💞";
  }

  // fallback for larger numbers
  return `${daysLeft} days left. Every day closer to you 💖`;
}

function startReunionTimer(){
  stopReunionTimer();

  // Target window: Feb 6, 2026 6:00 PM ET → Mar 8, 2026 9:00 AM ET
  const start = zonedTimeToUtcDate({
    year: 2026, month: 2, day: 6, hour: 18, minute: 0, second: 0,
    timeZone: "America/New_York",
  });

  const target = zonedTimeToUtcDate({
    year: 2026, month: 3, day: 8, hour: 9, minute: 0, second: 0,
    timeZone: "America/New_York",
  });

  // Cache these once (avoid repeated DOM lookups)
  const progressFill = document.getElementById("progressFill");
  const progressPct  = document.getElementById("progressPct");
  const asciiBar     = document.getElementById("asciiBar");

  let rafId = null;

  // Updates clocks, countdown numbers, daily message (1x/sec)
  function tick(){
    const now = new Date();

    // Live clocks
    if (timeET) {
      timeET.textContent = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        weekday: "short", month: "short", day: "2-digit"
      }).format(now);
    }
    if (timeIST) {
      timeIST.textContent = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        weekday: "short", month: "short", day: "2-digit"
      }).format(now);
    }

    // Countdown
    let ms = target.getTime() - now.getTime();
    if (ms < 0) ms = 0;

    const totalSec = Math.floor(ms / 1000);
    const days  = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins  = Math.floor((totalSec % 3600) / 60);
    const secs  = totalSec % 60;

    setFlipText(cdDays, days);
    setFlipText(cdHours, pad2(hours));
    setFlipText(cdMins, pad2(mins));
    setFlipText(cdSecs, pad2(secs));

    // Pulse when whole-day changes
    if (lastWholeDays === null) lastWholeDays = days;
    if (days !== lastWholeDays) {
      lastWholeDays = days;
      if (daysPulse) {
        daysPulse.classList.remove("dayPulse");
        void daysPulse.offsetWidth;
        daysPulse.classList.add("dayPulse");
      }
    }

    // Daily message
    if (dailyMsg) dailyMsg.textContent = pickDailyMessage(days);
  }

  // Smooth progress (runs every animation frame)
  function animateProgress(){
    const now = new Date();

    const total = target.getTime() - start.getTime();
    const done  = Math.max(0, Math.min(total, now.getTime() - start.getTime()));
    const pct   = total > 0 ? (done / total) * 100 : 100;

    if (progressFill) progressFill.style.width = `${pct.toFixed(2)}%`;
    if (progressPct)  progressPct.textContent  = `${pct.toFixed(1)}%`;
    if (asciiBar)     asciiBar.textContent     = buildAsciiBar(pct);

    // Stop animating once complete (optional)
    if (done >= total) return;

    rafId = requestAnimationFrame(animateProgress);
  }

  // Start both loops
  tick();
  reunionTimer = setInterval(tick, 1000);
  rafId = requestAnimationFrame(animateProgress);

  // Ensure stopReunionTimer can stop the RAF too
  startReunionTimer._rafId = () => rafId;
}

function stopReunionTimer(){
  if (reunionTimer) {
    clearInterval(reunionTimer);
    reunionTimer = null;
  }
  const rafGetter = startReunionTimer._rafId;
  if (rafGetter) {
    const id = rafGetter();
    if (id) cancelAnimationFrame(id);
  }
}