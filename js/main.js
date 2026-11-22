const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const root = document.documentElement;

const WORKS = {
  mizu: {
    bits: 4,
    scene: "mizu",
    meta: "01 — 銀座 · 2024",
    title: "水面茶室",
    text: "銀座の路地に、四畳半。天井は低く、水面は床の中央にあります。光源は天井の一点だけ。波紋が杯の縁まで届いたとき、初めて湯気が見えます。",
    note: "照明器具は、見せていません。",
  },
  kaze: {
    bits: 9,
    scene: "kaze",
    meta: "02 — 豊洲 · 2025",
    title: "風のカーテン",
    text: "展望デッキの十四メートル。光ファイバーではなく、風で間隔が変わる細いスリットです。風が会話を超えると、光は黙って揺れます。",
    note: "風速三メートルが、この仕事の閾値です。",
  },
  page: {
    bits: 8,
    scene: "page",
    meta: "03 — 神保町 · 2023",
    title: "頁の縁",
    text: "書棚はほとんど暗闇です。本を開くと、頁の小口だけが暖かい光を受けます。タイトルは探し、本文は読む。その順番を光が守っています。",
    note: "色温度は、2800K。それ以上は明るすぎました。",
  },
  floor: {
    bits: 24,
    scene: "floor",
    meta: "04 — 京都 · 2022",
    title: "歩く床",
    text: "町家ホテルの廊下。石は昼と同じ顔をしています。夜、足音の半歩先だけが淡く灯り、通り過ぎると消えます。案内板はありません。",
    note: "光は案内ではなく、拍子です。",
  },
};
const ORDER = ["mizu", "kaze", "page", "floor"];

function paintScene(el, bits) {
  const count = Math.max(0, Math.min(40, Number(bits) || 0));
  el.replaceChildren();
  for (let i = 0; i < count; i += 1) el.appendChild(document.createElement("i"));
}

document.querySelectorAll(".scene[data-bits]").forEach((el) => {
  paintScene(el, el.dataset.bits);
});

function grain() {
  const c = document.createElement("canvas");
  c.width = 140;
  c.height = 140;
  const g = c.getContext("2d");
  const img = g.createImageData(140, 140);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 210 + Math.random() * 45;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  root.style.setProperty("--grain", `url(${c.toDataURL("image/png")})`);
}
grain();

const loader = document.getElementById("loader");
if (reduce) {
  loader.remove();
} else {
  const dismiss = () => loader.classList.add("is-done");
  loader.addEventListener("click", dismiss);
  loader.addEventListener("animationend", (event) => {
    if (event.target === loader && event.animationName === "curtain") loader.remove();
  });
}

if (!reduce) {
  document.querySelectorAll("[data-split]").forEach((el) => {
    let index = 0;
    el.querySelectorAll(".line").forEach((line) => {
      const chars = [...line.textContent];
      line.textContent = "";
      chars.forEach((ch) => {
        const span = document.createElement("span");
        span.className = "char";
        span.style.setProperty("--i", String(index));
        span.textContent = ch;
        line.appendChild(span);
        index += 1;
      });
    });
  });
}

const reveals = document.querySelectorAll(".reveal");
if (reduce) {
  reveals.forEach((el) => el.classList.add("is-in"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );
  reveals.forEach((el) => io.observe(el));
}

const counters = document.querySelectorAll("[data-count]");
const countIo = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      if (reduce) {
        el.textContent = String(target);
      } else {
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - start) / 1100);
          const eased = 1 - (1 - p) ** 3;
          el.textContent = String(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
      countIo.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
counters.forEach((el) => countIo.observe(el));

if (fine && !reduce) {
  const cursor = document.getElementById("cursor");
  const ring = document.getElementById("ring");
  document.body.classList.add("has-cursor");
  let x = innerWidth / 2;
  let y = innerHeight / 2;
  let tx = x;
  let ty = y;
  addEventListener("pointermove", (event) => {
    tx = event.clientX;
    ty = event.clientY;
  });
  const follow = () => {
    x += (tx - x) * 0.35;
    y += (ty - y) * 0.22;
    cursor.style.transform = `translate(${tx}px, ${ty}px)`;
    ring.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(follow);
  };
  follow();
  document.addEventListener("pointerover", (event) => {
    ring.classList.toggle("is-hot", Boolean(event.target.closest("a, button")));
  });
}

const spot = document.getElementById("spot");
const placeSpot = (event) => {
  const rect = spot.getBoundingClientRect();
  const sx = ((event.clientX - rect.left) / rect.width) * 100;
  const sy = ((event.clientY - rect.top) / rect.height) * 100;
  spot.style.setProperty("--sx", `${Math.min(100, Math.max(0, sx))}%`);
  spot.style.setProperty("--sy", `${Math.min(100, Math.max(0, sy))}%`);
  spot.classList.add("is-hot");
};
spot.addEventListener("pointermove", placeSpot);
spot.addEventListener("pointerdown", placeSpot);
spot.addEventListener("pointerleave", () => {
  spot.style.removeProperty("--sx");
  spot.style.removeProperty("--sy");
  spot.classList.remove("is-hot");
});

document.querySelectorAll(".temp button").forEach((button) => {
  button.addEventListener("click", () => {
    root.dataset.temp = button.dataset.temp;
    document.querySelectorAll(".temp button").forEach((item) => {
      item.setAttribute("aria-checked", item === button ? "true" : "false");
    });
    readColors();
  });
});

let accent = "240, 160, 90";
let glow = "255, 90, 50";
function readColors() {
  const style = getComputedStyle(root);
  accent = style.getPropertyValue("--accent-rgb").trim() || accent;
  glow = style.getPropertyValue("--glow").trim() || glow;
}
readColors();

const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d", { alpha: true });
const dots = Array.from({ length: 64 }, () => ({
  x: Math.random(),
  y: Math.random(),
  v: 0.00022 + Math.random() * 0.0004,
  s: Math.random() * 1.3 + 0.35,
  a: Math.random() * 0.45 + 0.12,
}));
let width = 0;
let height = 0;
let dpr = 1;
function resize() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
addEventListener("resize", resize);

const pointer = { x: 0.68, y: 0.4, tx: 0.68, ty: 0.4 };
canvas.parentElement.addEventListener("pointermove", (event) => {
  const rect = canvas.getBoundingClientRect();
  pointer.tx = (event.clientX - rect.left) / rect.width;
  pointer.ty = (event.clientY - rect.top) / rect.height;
});

let heroVisible = true;
let frame = 0;
const heroWatch = new IntersectionObserver(([entry]) => {
  heroVisible = entry.isIntersecting;
  if (heroVisible) startField();
});
heroWatch.observe(canvas.parentElement);

function startField() {
  if (reduce || frame) return;
  frame = requestAnimationFrame(draw);
}
function draw(time) {
  frame = 0;
  pointer.x += (pointer.tx - pointer.x) * 0.05;
  pointer.y += (pointer.ty - pointer.y) * 0.05;
  ctx.clearRect(0, 0, width, height);
  const orbs = [
    { x: width * (0.74 + (pointer.x - 0.5) * 0.1), y: height * (0.36 + (pointer.y - 0.5) * 0.08), r: Math.max(width, height) * 0.46, color: accent, alpha: 0.34 },
    { x: width * (0.18 + Math.sin(time * 0.00018) * 0.03), y: height * 0.74, r: Math.max(width, height) * 0.36, color: glow, alpha: 0.18 },
    { x: width * 0.52, y: height * (0.16 + Math.cos(time * 0.00015) * 0.025), r: Math.max(width, height) * 0.28, color: "255, 236, 214", alpha: 0.1 },
  ];
  orbs.forEach((orb) => {
    const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
    gradient.addColorStop(0, `rgba(${orb.color}, ${orb.alpha})`);
    gradient.addColorStop(1, `rgba(${orb.color}, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalCompositeOperation = "lighter";
  dots.forEach((dot) => {
    const angle = Math.sin(dot.x * 6.2 + time * 0.00015) + Math.cos(dot.y * 5.4 - time * 0.00012);
    dot.x += Math.cos(angle) * dot.v + (pointer.x - dot.x) * 0.0007;
    dot.y += Math.sin(angle) * dot.v * 0.85 + (pointer.y - dot.y) * 0.0007;
    if (dot.x < -0.05) dot.x = 1.05;
    if (dot.x > 1.05) dot.x = -0.05;
    if (dot.y < -0.05) dot.y = 1.05;
    if (dot.y > 1.05) dot.y = -0.05;
    ctx.fillStyle = `rgba(${accent}, ${dot.a})`;
    ctx.beginPath();
    ctx.arc(dot.x * width, dot.y * height, dot.s, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalCompositeOperation = "source-over";
  if (heroVisible && !document.hidden) frame = requestAnimationFrame(draw);
}
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) startField();
});
if (!reduce) startField();

if (fine && !reduce) {
  document.querySelectorAll(".work").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transition = "transform 0.08s linear";
      card.style.transform = `rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transition = "transform 0.6s cubic-bezier(.16,1,.3,1)";
      card.style.transform = "";
    });
  });

  document.querySelectorAll(".btn").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);
      button.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
    });
    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });
}

const steps = document.getElementById("steps");
const progress = document.getElementById("progress");
const nav = document.getElementById("nav");
const spyLinks = [...document.querySelectorAll(".nav-links a, .side a")];
const spyTargets = spyLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  nav.classList.toggle("is-solid", window.scrollY > 12);
  const paper = [...document.querySelectorAll("[data-surface='paper']")].some((section) => {
    const rect = section.getBoundingClientRect();
    return rect.top < 70 && rect.bottom > 70;
  });
  nav.classList.toggle("is-paper", paper);

  const rect = steps.getBoundingClientRect();
  const passed = Math.min(rect.height, Math.max(0, innerHeight * 0.45 - rect.top));
  steps.style.setProperty("--p", rect.height ? (passed / rect.height).toFixed(3) : "0");

  let current = spyTargets[0];
  spyTargets.forEach((section) => {
    if (section.getBoundingClientRect().top < innerHeight * 0.38) current = section;
  });
  spyLinks.forEach((link) => {
    const on = current && link.getAttribute("href") === `#${current.id}`;
    if (on) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}
let ticking = false;
addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    onScroll();
    ticking = false;
  });
}, { passive: true });
onScroll();

function tickClock() {
  const now = new Date();
  const clock = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
  document.getElementById("clock").textContent = `${clock} JST`;
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tokyo", weekday: "short" }).format(now);
  const hour = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    hour: "numeric",
    hourCycle: "h23",
  }).format(now));
  const open = weekday !== "Sun" && hour >= 11 && hour < 19;
  document.getElementById("status").textContent = open ? "開室中" : "休室中";
  document.getElementById("dot").classList.toggle("is-closed", !open);
}
tickClock();
setInterval(tickClock, 30000);

const menu = document.getElementById("menu");
const menuBtn = document.getElementById("menuBtn");
let menuTimer = 0;
function closeMenu() {
  if (menu.hidden) return;
  menu.classList.add("is-out");
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.textContent = "メニュー";
  document.body.classList.remove("menu-open");
  clearTimeout(menuTimer);
  menuTimer = setTimeout(() => {
    menu.hidden = true;
    menu.classList.remove("is-out");
  }, reduce ? 0 : 420);
}
menuBtn.addEventListener("click", () => {
  const open = menuBtn.getAttribute("aria-expanded") === "true";
  if (open) {
    closeMenu();
    return;
  }
  clearTimeout(menuTimer);
  menu.hidden = false;
  menu.classList.remove("is-out");
  menuBtn.setAttribute("aria-expanded", "true");
  menuBtn.textContent = "閉じる";
  document.body.classList.add("menu-open");
});
menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

const dialog = document.getElementById("dialog");
const dialogScene = document.getElementById("dialogScene");
let currentId = "mizu";

function fillDialog(id) {
  const work = WORKS[id];
  if (!work) return;
  currentId = id;
  dialogScene.className = `dialog-visual scene scene-${work.scene}`;
  paintScene(dialogScene, work.bits);
  document.getElementById("dialogMeta").textContent = work.meta;
  document.getElementById("dialogTitle").textContent = work.title;
  document.getElementById("dialogText").textContent = work.text;
  document.getElementById("dialogNote").textContent = work.note;
}

function openDialog(id) {
  fillDialog(id);
  if (!dialog.open) dialog.showModal();
}
document.querySelectorAll("[data-open]").forEach((button) => {
  button.addEventListener("click", () => openDialog(button.dataset.open));
});
document.getElementById("dialogClose").addEventListener("click", closeDialog);
dialog.querySelectorAll("[data-dir]").forEach((button) => {
  button.addEventListener("click", () => {
    const index = ORDER.indexOf(currentId);
    const next = (index + Number(button.dataset.dir) + ORDER.length) % ORDER.length;
    fillDialog(ORDER[next]);
  });
});
dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeDialog();
});
addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !dialog.open) closeMenu();
});

function closeDialog() {
  if (!dialog.open || dialog.classList.contains("is-closing")) return;
  if (reduce) {
    dialog.close();
    return;
  }
  dialog.classList.add("is-closing");
  dialog.addEventListener("animationend", () => {
    dialog.classList.remove("is-closing");
    dialog.close();
  }, { once: true });
}

const toast = document.getElementById("toast");
let toastTimer = 0;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-on"), 2200);
}
document.getElementById("copyBtn").addEventListener("click", async () => {
  const address = "desk@yako-atelier.jp";
  try {
    await navigator.clipboard.writeText(address);
  } catch {
    const area = document.createElement("textarea");
    area.value = address;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-999px";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  showToast("宛先をコピーしました");
});
