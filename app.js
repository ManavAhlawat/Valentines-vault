const galleryEl = document.getElementById("gallery");

const yesBtn = document.getElementById("yesBtn");
const alwaysBtn = document.getElementById("alwaysBtn");
const afterYes = document.getElementById("afterYes");
const confettiCanvas = document.getElementById("confetti");


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

const screens = ["login", "home", "memories", "playlist", "final"];

const el = {
  nav: document.getElementById("nav"),
  lockBtn: document.getElementById("lockBtn"),
  passcode: document.getElementById("passcode"),
  unlockBtn: document.getElementById("unlockBtn"),
  hint: document.getElementById("loginHint"),
};

const PASSCODE = "iloveyou"; // CHANGE THIS

function show(name){
  for (const s of screens) {
    document.getElementById(`screen-${s}`).hidden = (s !== name);
  }
  el.nav.hidden = !isUnlocked();
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
}

yesBtn.addEventListener("click", onYes);
alwaysBtn.addEventListener("click", onYes);

if (isUnlocked()) show("home");
else show("login");