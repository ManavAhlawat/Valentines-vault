const galleryEl = document.getElementById("gallery");

const yesBtn = document.getElementById("yesBtn");
const alwaysBtn = document.getElementById("alwaysBtn");
const afterYes = document.getElementById("afterYes");
const confettiCanvas = document.getElementById("confetti");

const noBtn = document.getElementById("noBtn");
const valRow = document.getElementById("valRow");
const finalText = document.getElementById("finalText");


const heartsLayer = document.getElementById("heartsLayer");
let heartsTimer = null;

function spawnHeart() {
  if (!heartsLayer) return;

  const heart = document.createElement("div");
  heart.className = "heart";

  // Pick a heart style (mix it up)
  const chars = ["❤️", "💖", "💘", "💝", "💕", "💗"];
  heart.textContent = chars[Math.floor(Math.random() * chars.length)];

  // Randomize motion + look
  const x = Math.floor(Math.random() * 95) + "%";     // 0–95%
  const fs = (10 + Math.random() * 18).toFixed(0) + "px"; // size
  const d = (2.2 + Math.random() * 2.6).toFixed(2) + "s"; // duration
  const s = (0.7 + Math.random() * 1.1).toFixed(2);       // scale
  const r = ((Math.random() * 80) - 40).toFixed(0) + "deg"; // rotate

  heart.style.setProperty("--x", x);
  heart.style.setProperty("--fs", fs);
  heart.style.setProperty("--d", d);
  heart.style.setProperty("--s", s);
  heart.style.setProperty("--r", r);

  heartsLayer.appendChild(heart);

  // Cleanup after animation ends
  heart.addEventListener("animationend", () => heart.remove());
}

function startHearts() {
  if (heartsTimer) return;
  // Spawn a few immediately
  for (let i = 0; i < 6; i++) spawnHeart();
  // Then keep spawning
  heartsTimer = setInterval(spawnHeart, 350);
}

function stopHearts() {
  if (!heartsTimer) return;
  clearInterval(heartsTimer);
  heartsTimer = null;
  if (heartsLayer) heartsLayer.innerHTML = "";
}

function renderGallery() {
  const photos = window.APP_DATA?.photos || [];
  galleryEl.innerHTML = "";

  for (const filename of photos) {
    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = `assets/photos/${filename}`;
    img.alt = "Memory photo";
    galleryEl.appendChild(img);
  }

  if (!photos.length) {
    galleryEl.innerHTML = `<p class="muted">No photos yet — add some to /assets/photos ❤️</p>`;
  }
}

const songsEl = document.getElementById("songs");

function renderSongs() {
  const songs = window.APP_DATA?.songs || [];
  songsEl.innerHTML = "";

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
      iframe.allow =
        "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
      iframe.loading = "lazy";

      card.appendChild(iframe);
    }

    songsEl.appendChild(card);
  }

  if (!songs.length) {
    songsEl.innerHTML =
      `<p class="muted">No songs yet — add Spotify embed links in data.js 🎵</p>`;
  }
}

function startConfetti() {
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

function moveNoButton() {
  if (!noBtn || !valRow) return;

  // Make sure row can contain an absolutely positioned button
  valRow.style.position = "relative";

  // First time: switch to absolute so we can move it freely
  noBtn.style.position = "absolute";

  const rowRect = valRow.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const pad = 6;
  const maxX = Math.max(pad, rowRect.width - btnRect.width - pad);
  const maxY = Math.max(pad, rowRect.height - btnRect.height - pad);

  const x = pad + Math.random() * maxX;
  const y = pad + Math.random() * maxY;

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

// "No" runs away on hover/touch
noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("mousedown", (e) => { e.preventDefault(); moveNoButton(); });

// Mobile: run away when finger approaches
noBtn.addEventListener("touchstart", (e) => { e.preventDefault(); moveNoButton(); }, { passive: false });


const screens = ["login", "home", "memories", "playlist", "final"];

const el = {
  nav: document.getElementById("nav"),
  lockBtn: document.getElementById("lockBtn"),
  passcode: document.getElementById("passcode"),
  unlockBtn: document.getElementById("unlockBtn"),
  hint: document.getElementById("loginHint"),
};

const PASSCODE = "maanilovesyoumerijaan"; // CHANGE THIS

function show(name){
  for (const s of screens) {
    document.getElementById(`screen-${s}`).hidden = (s !== name);
  }

  // Always hide nav on login screen
  el.nav.hidden = (name === "login") || !isUnlocked();

  // Hearts only on login screen
  if (name === "login") startHearts();
  else stopHearts();
}

function isUnlocked(){
  return sessionStorage.getItem("vault_unlocked") === "true";
}

function unlock(){
  const entered = (el.passcode.value || "").trim();
  if (!entered) return;

  if (entered === PASSCODE) {
    sessionStorage.setItem("vault_unlocked", "true");
    el.passcode.value = "";
    el.hint.textContent = "";
    show("home");
  } else {
    el.hint.textContent = "Hmm… try again ❤️";

    const loginCard = document.getElementById("screen-login");
    loginCard.classList.remove("shake");
    void loginCard.offsetWidth; // restart animation
    loginCard.classList.add("shake");
  }
}

function lock(){
  sessionStorage.removeItem("vault_unlocked");
  show("login");
}

function go(dest){
  if (!isUnlocked()) return show("login");
  show(dest);
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-go]");
  if (!btn) return;
  go(btn.getAttribute("data-go"));
});

el.unlockBtn.addEventListener("click", unlock);
el.passcode.addEventListener("keydown", (e) => {
  if (e.key === "Enter") unlock();
});
el.lockBtn.addEventListener("click", lock);

// boot
if (isUnlocked()) show("home");
else show("login");

renderGallery();
renderSongs();

function onYes() {
  afterYes.hidden = false;
  startConfetti();
  if (noBtn) noBtn.hidden = true;
}

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

  // Update funny message
  if (finalText) {
    const line = noLines[Math.min(noCount - 1, noLines.length - 1)];
    finalText.textContent = line;
  }

  const rowRect = valRow.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  // Keep it within the row bounds
  const pad = 8;
  const maxX = Math.max(pad, rowRect.width - btnRect.width - pad);
  const maxY = Math.max(pad, rowRect.height - btnRect.height - pad);

  const x = pad + Math.random() * maxX;
  const y = pad + Math.random() * maxY;

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;

  // Make it feel extra cheeky
  noBtn.style.transform = `rotate(${(-8 + Math.random() * 16).toFixed(0)}deg)`;
}

if (noBtn) {
  // Desktop: run away as you approach
  noBtn.addEventListener("mouseenter", moveNoButton);

  // Desktop: if they try to click anyway
  noBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    moveNoButton();
  });

  // Mobile: run away on touch attempt
  noBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    moveNoButton();
  }, { passive: false });
}


 function onYes() {
  afterYes.hidden = false;
  startConfetti();

  if (finalText) finalText.textContent = "YAYYY!! 🥹💞 Best answer ever.";
  if (noBtn) noBtn.hidden = true;
}


yesBtn.addEventListener("click", onYes);
alwaysBtn.addEventListener("click", onYes);

if (isUnlocked()) show("home");
else show("login");