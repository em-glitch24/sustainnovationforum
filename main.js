/* ===== EDIT THIS: event start date/time (24h, local time) =====
   Leave as is to hide the countdown until you set a real date. */
const EVENT_DATE = ""; // e.g. "2026-12-05T14:00:00+08:00"

/* ===== EDIT THIS: the 3 videos in the Themes section =====
   The first one plays when the visitor scrolls to the section, then the next, then loops. */
/* ===== EDIT THIS: the 3 Facebook videos (use the public video link) ===== */
const PLAYLIST = [
  {
    fb: "https://www.facebook.com/reel/2652422658529084/",
    title: "2nd Sustainnovation Forum",
  },
  { fb: "https://www.facebook.com/reel/1686306616541017/", title: "Speakers" },
  {
    fb: "https://www.facebook.com/reel/1121226817557898/",
    title: "2nd Sustainnovation",
  },
];

/* Builds the Facebook embed URL from a normal video link */
function fbSrc(url, autoplay) {
  return (
    "https://www.facebook.com/plugins/video.php?href=" +
    encodeURIComponent(url) +
    "&show_text=false" +
    (autoplay ? "&autoplay=true" : "")
  );
}

/* Hide missing images so the dashed placeholder shows instead */
document.querySelectorAll(".ph img, .teaser-thumb img").forEach((img) => {
  img.addEventListener("error", () => img.remove());
});

/* Countdown */
(function () {
  const box = document.getElementById("countdown");
  const target = new Date(EVENT_DATE).getTime();
  if (!EVENT_DATE || isNaN(target)) return;
  box.hidden = false;
  function tick() {
    const d = target - Date.now();
    if (d <= 0) {
      box.textContent = "The forum is underway.";
      return;
    }
    const v = [
      Math.floor(d / 864e5),
      Math.floor(d / 36e5) % 24,
      Math.floor(d / 6e4) % 60,
      Math.floor(d / 1e3) % 60,
    ];
    box.innerHTML = ["Days", "Hours", "Mins", "Secs"]
      .map(
        (l, i) =>
          `<div><b>${String(v[i]).padStart(2, "0")}</b><small>${l}</small></div>`,
      )
      .join("");
  }
  tick();
  setInterval(tick, 1000);
})();

/* Decorative city skyline (deterministic, no image needed) */
(function () {
  const svg = document.getElementById("skyline");
  const W = 1440,
    H = 210;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  let x = 0,
    s = 7,
    out = "";
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  while (x < W) {
    const w = 34 + rnd() * 54,
      h = 40 + rnd() * 150;
    out += `<rect x="${x}" y="${H - h}" width="${w}" height="${h}" fill="#061c15" stroke="#1fd18b" stroke-opacity=".25"/>`;
    for (let wy = H - h + 10; wy < H - 8; wy += 14)
      for (let wx = x + 6; wx < x + w - 8; wx += 11)
        if (rnd() > 0.62)
          out += `<rect x="${wx}" y="${wy}" width="4" height="6" fill="${rnd() > 0.35 ? "#f2d88c" : "#1fd18b"}" opacity=".75"/>`;
    x += w + 3;
  }
  svg.innerHTML =
    out +
    `<rect y="${H - 3}" width="${W}" height="3" fill="#d8b25a" opacity=".7"/>`;
})();

/* Floating teaser (video 1): slides in while the hero is on screen */
(function () {
  const teaser = document.getElementById("teaser"),
    hero = document.querySelector(".hero");
  const lb = document.getElementById("lightbox"),
    player = document.getElementById("lightboxVideo");
  let dismissed = false;
  try {
    dismissed = sessionStorage.getItem("teaserClosed") === "1";
  } catch (e) {}

  if (!dismissed && "IntersectionObserver" in window) {
    let timer;
    new IntersectionObserver(
      ([en]) => {
        clearTimeout(timer);
        if (en.isIntersecting)
          timer = setTimeout(() => teaser.classList.add("show"), 900);
        else teaser.classList.remove("show");
      },
      { threshold: 0.25 },
    ).observe(hero);
  }

  document.getElementById("teaserClose").addEventListener("click", () => {
    teaser.classList.remove("show");
    dismissed = true;
    try {
      sessionStorage.setItem("teaserClosed", "1");
    } catch (e) {}
  });

  function openVideo() {
    player.src = fbSrc(PLAYLIST[0].fb, true);
    lb.classList.add("open");
    const go = lb.requestFullscreen || lb.webkitRequestFullscreen;
    if (go) {
      try {
        Promise.resolve(go.call(lb)).catch(() => {});
      } catch (e) {}
    }
  }
  function closeVideo() {
    player.src = "about:blank"; // stops the video
    lb.classList.remove("open");
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }
  document.getElementById("teaserOpen").addEventListener("click", openVideo);
  document
    .getElementById("lightboxClose")
    .addEventListener("click", closeVideo);
  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeVideo();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lb.classList.contains("open")) closeVideo();
  });
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && lb.classList.contains("open"))
      closeVideo();
  });
})();

/* Themes video player: Facebook embed with prev/next */
(function () {
  const frame = document.getElementById("vp");
  if (!frame || !PLAYLIST.length) return;
  const player = document.getElementById("vpMain"),
    label = document.getElementById("vpTitle");
  const n = PLAYLIST.length;
  let cur = 0;

  function go(i, autoplay) {
    cur = (i + n) % n;
    const v = PLAYLIST[cur];
    player.src = fbSrc(v.fb, autoplay);
    label.textContent =
      "Video " + (cur + 1) + " of " + n + (v.title ? " · " + v.title : "");
  }

  document
    .getElementById("vpPrev")
    .addEventListener("click", () => go(cur - 1, true));
  document
    .getElementById("vpNext")
    .addEventListener("click", () => go(cur + 1, true));

  go(0, false);
})();
