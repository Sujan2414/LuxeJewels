/* ============ Trending products (Elara images; hover swaps Preview 1 -> Preview 2) ============ */
const PRODUCTS = [
  { name: "Serpenti Emerald Handle Bag",           price: "₹4.1L", a: "assets/el-t1a.png", b: "assets/el-t1b.png" },
  { name: "Fiorever Ruby Diamond Necklace",        price: "₹2.7L", a: "assets/el-t2a.png", b: "assets/el-t2b.png" },
  { name: "Modern Geometric Diamond Eternity Ring",price: "₹2.0L", a: "assets/el-t3a.png", b: "assets/el-t3b.png" },
  { name: "Serpenti Day Night Shoulder Bag",       price: "₹4.5L", a: "assets/el-t4a.png", b: "assets/el-t4b.png" },
  { name: "Gemstone Fan Statement Necklace",       price: "₹2.5L", a: "assets/el-t5a.png", b: "assets/el-t5b.png" },
  { name: "Golden Leaf Diamond Ring",              price: "₹1.6L", a: "assets/el-t6a.png", b: "assets/el-t6b.png" },
];
const grid = document.getElementById("trendingGrid");
if (grid) {
  grid.innerHTML = PRODUCTS.map(p => `
    <a href="#" class="tcard">
      <div class="tcard__media">
        <img class="tcard__img tcard__img--a" src="${p.a}" alt="${p.name}" />
        <img class="tcard__img tcard__img--b" src="${p.b}" alt="${p.name} — alternate view" />
      </div>
      <p class="tcard__name">${p.name}</p>
      <p class="tcard__price">${p.price}</p>
    </a>`).join("");

  const tPrev = document.getElementById("trendingPrev");
  const tNext = document.getElementById("trendingNext");
  const dots = document.querySelectorAll(".trending__dot");

  function updateArrows() {
    const atStart = grid.scrollLeft <= 4;
    const atEnd = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 4;
    if (tPrev) tPrev.style.display = atStart ? "none" : "flex";
    if (tNext) tNext.style.display = atEnd ? "none" : "flex";
  }

  if (tPrev && tNext) {
    tPrev.addEventListener("click", () => {
      grid.scrollBy({ left: -grid.clientWidth * 0.9, behavior: "smooth" });
    });
    tNext.addEventListener("click", () => {
      grid.scrollBy({ left: grid.clientWidth * 0.9, behavior: "smooth" });
    });
  }

  // Update dots + arrows on scroll
  grid.addEventListener("scroll", () => {
    updateArrows();
    const scrollRatio = grid.scrollLeft / (grid.scrollWidth - grid.clientWidth || 1);
    const activeIndex = Math.round(scrollRatio * (dots.length - 1));
    dots.forEach((dot, idx) => {
      dot.classList.toggle("trending__dot--active", idx === activeIndex);
    });
  });

  // Add click to dots
  dots.forEach((dot, idx) => {
    dot.addEventListener("click", () => {
      const targetScroll = idx * (grid.scrollWidth - grid.clientWidth) / (dots.length - 1 || 1);
      grid.scrollTo({ left: targetScroll, behavior: "smooth" });
    });
  });

  // Initial arrow state
  updateArrows();
}

/* ============ Hero scroll effect ============ */
(function () {
  const hero = document.getElementById("hero");
  const marquee = document.getElementById("marquee");
  const intro = document.getElementById("intro");
  const cardrow = document.getElementById("cardrow");
  const floatsBox = document.getElementById("floats");
  if (!hero || !marquee || !cardrow) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  /* ---- build floating rings with depth: FRONT rings are big & sharp, BACK rings are
         smaller, blurred & faded so they recede behind the hero (depth-of-field) ---- */
  const floatsBack = document.getElementById("floatsBack");
  // l: left %, r: rotation, img: 1-4, sv: start (vh), sp: speed, dir: x drift, back: behind the hero?
  const FLOATERS = [
    {l:9,  r:-14, img:1, sv:20,  sp:1.05, dir:-1, back:false},  // front, sharp
    {l:84, r:-18, img:4, sv:70,  sp:1.10, dir:1,  back:false},  // front, sharp
    {l:14, r:18,  img:1, sv:165, sp:1.15, dir:-1, back:false},  // front, sharp
    {l:70, r:-12, img:3, sv:210, sp:1.00, dir:1,  back:false},  // front, sharp
    {l:82, r:16,  img:2, sv:12,  sp:1.25, dir:1,  back:true},   // behind, blurred
    {l:20, r:20,  img:3, sv:78,  sp:0.95, dir:-1, back:true},   // behind, blurred
    {l:46, r:8,   img:2, sv:150, sp:1.30, dir:1,  back:true},   // behind, blurred
    {l:34, r:-9,  img:4, sv:255, sp:1.10, dir:-1, back:true},   // behind, blurred
  ];
  const floatEls = [];
  FLOATERS.forEach((f, i) => {
    // depth drives size, blur and opacity: front = large/sharp/opaque, back = small/blurred/faded
    const size    = f.back ? 96 + (i % 3) * 12 : 150 + (i % 3) * 8;
    const blur    = f.back ? 6 : 0.4;
    const opacity = f.back ? 0.6 : 1;

    const wrap = document.createElement("div");
    wrap.className = "floatwrap";
    wrap.style.left = f.l + "%";
    wrap.style.top = f.sv + "vh";
    wrap.style.width = size + "px";
    wrap.style.filter = `blur(${blur}px)`;
    wrap.style.opacity = opacity;
    const inner = document.createElement("div");
    inner.className = "float";
    inner.style.setProperty("--rot", f.r + "deg");
    inner.style.setProperty("--dur", (7 + (i % 4)) + "s");
    inner.innerHTML = `<img src="assets/ring${f.img}.png" alt="" />`;
    wrap.appendChild(inner);
    (f.back && floatsBack ? floatsBack : floatsBox).appendChild(wrap);
    floatEls.push({ el: wrap, sp: f.sp, dir: f.dir, baseOpacity: opacity });
  });

  /* ---- card row config ---- */
  const cards = Array.from(cardrow.querySelectorAll(".rowcard"));
  const cfImgs = cardrow.querySelectorAll(".rowcard--mid .cf");
  const centersVw  = [10, 29, 50, 71, 90];  // uniform ~1vw gaps with larger card scales
  const baseScale  = [0.95, 1.05, 1.30, 1.05, 0.95]; // center card prominently largest
  const rotY  = [-34, 34, 0, -34, 34];  // mirror-symmetric alternating 3D tilt (neighbours face opposite ways)
  const dyVh  = [0, 0, 0, 0, 0];        // cards stay level — depth comes from the 3D rotation

  let progress = 0, target = 0;
  let startX = 0, endX = 0, travel = 0;

  function measure() {
    const vw = window.innerWidth;
    const textW = marquee.firstElementChild.getBoundingClientRect().width;
    startX = vw;                       // begin fully off the right edge (not visible)
    endX = -(textW + vw * 0.06);       // end fully off the left edge (text gone)
    travel = window.innerHeight * 2.9; // how far rings rise across the scroll
  }
  function computeTarget() {
    const total = hero.offsetHeight - window.innerHeight;
    target = clamp(-hero.getBoundingClientRect().top / total, 0, 1);
  }

  function apply(p) {
    const vw = window.innerWidth;

    // 1) intro heading fades out as the scroll begins
    if (intro) intro.style.opacity = (1 - clamp((p - 0.04) / 0.08, 0, 1)).toFixed(3);

    // 2) giant headline sweeps right -> left, fully gone by p=0.9
    const mP = clamp(p / 0.9, 0, 1);
    marquee.style.transform = `translateY(-50%) translateX(${lerp(startX, endX, mP)}px)`;

    // 3) rings stream upward; fade out as the row takes over
    const fOut = 1 - clamp((p - 0.7) / 0.1, 0, 1);
    floatEls.forEach((f) => {
      const ty = -(p * travel * f.sp);
      const tx = f.dir * p * 60;
      f.el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      f.el.style.opacity = (fOut * f.baseOpacity).toFixed(3);   // keep back rings faded
    });

    // phases: spread opens in ~one scroll; tilt only AFTER the text is gone
    const spread = clamp((p - 0.80) / 0.08, 0, 1);   // 0.80 -> 0.88 (opens all at once)
    const tilt   = clamp((p - 0.90) / 0.10, 0, 1);   // 0.90 -> 1.00 (text already gone)

    // 4) Elara-style GLOBAL group zoom: the whole card group scales 0.5 -> 1.0 across the scroll,
    //    reaching 1.0 by the end so the final coverflow is unchanged.
    const groupScale = lerp(0.5, 1.0, clamp(p / 0.95, 0, 1));
    cardrow.style.transform = `scale(${groupScale.toFixed(4)})`;

    // center is the largest of the pyramid (a touch above the inner cards' 0.93)
    const midScale = lerp(1.0, 1.05, clamp(p / 0.80, 0, 1));
    if (cfImgs.length) {
      // crossfade box -> ... -> red across the scroll, then settle on the last shot (red) once spread
      const idx = spread > 0 ? cfImgs.length - 1
                             : Math.min(cfImgs.length - 1, Math.floor((p / 0.78) * cfImgs.length));
      cfImgs.forEach((im, n) => im.classList.toggle("is-active", n === idx));
    }

    // 5) cards: middle grows forward & stays put; others spread out then zig-zag tilt
    cards.forEach((c, i) => {
      const offset = ((centersVw[i] - 50) / 100) * vw * spread;
      const dy = (dyVh[i] / 100) * window.innerHeight * tilt;
      const ry = rotY[i] * tilt;                       // 3D coverflow rotation
      const scale = (i === 2) ? midScale : baseScale[i];
      c.style.transform =
        `translate(calc(-50% + ${offset}px), calc(-50% + ${dy}px)) perspective(1200px) rotateY(${ry}deg) scale(${scale})`;
      c.style.opacity = (i === 2 ? 1 : clamp((p - 0.76) / 0.06, 0, 1)).toFixed(3);
    });
  }

  function frame() {
    progress += (target - progress) * 0.09;   // smoothing
    apply(progress);
    requestAnimationFrame(frame);
  }

  measure();
  computeTarget();
  window.addEventListener("scroll", computeTarget, { passive: true });
  window.addEventListener("resize", () => { measure(); computeTarget(); });
  window.addEventListener("load", () => { measure(); computeTarget(); });

  if (reduce) { measure(); apply(1); }       // static end-state for reduced motion
  else requestAnimationFrame(frame);
})();

/* ============ Scroll-expand video showcase (in-page scrub — no scroll hijack) ============ */
(function () {
  const section = document.querySelector(".sxp");
  if (!section) return;

  const bg      = section.querySelector("[data-sxp-bg]");
  const media   = section.querySelector("[data-sxp-media]");
  const overlay = section.querySelector("[data-sxp-overlay]");
  const dateEl  = section.querySelector("[data-sxp-date]");
  const cueEl   = section.querySelector("[data-sxp-cue]");
  const first   = section.querySelector("[data-sxp-first]");
  const rest    = section.querySelector("[data-sxp-rest]");
  const cap     = section.querySelector("[data-sxp-cap]");
  const video   = section.querySelector("[data-sxp-video]");

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  let isMobile = window.innerWidth < 768;

  // keep the live video playing even if the browser tries to pause it
  if (video) {
    const play = () => { const p = video.play(); if (p && p.catch) p.catch(() => {}); };
    video.addEventListener("pause", play);
    play();
  }

  function apply(p) {
    // same growth curve as the original component
    const w  = 300 + p * (isMobile ? 650 : 1250);
    const h  = 400 + p * (isMobile ? 200 : 400);
    const tx = p * (isMobile ? 180 : 150);

    bg.style.opacity = (1 - p).toFixed(3);
    media.style.width  = w + "px";
    media.style.height = h + "px";
    if (overlay) overlay.style.opacity = (0.7 - p * 0.3).toFixed(3);

    const metaFade = clamp(1 - p * 1.6, 0, 1).toFixed(3);
    dateEl.style.transform = `translateX(-${tx}vw)`; dateEl.style.opacity = metaFade;
    cueEl.style.transform  = `translateX(${tx}vw)`;  cueEl.style.opacity  = metaFade;
    first.style.transform  = `translateX(-${tx}vw)`;
    rest.style.transform   = `translateX(${tx}vw)`;
    if (cap) cap.style.opacity = clamp((p - 0.82) / 0.12, 0, 1).toFixed(3);
  }

  function frame() {
    // progress 0..1 as the (taller-than-viewport) section scrolls past the pin
    const total = section.offsetHeight - window.innerHeight;
    apply(clamp(-section.getBoundingClientRect().top / total, 0, 1));
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", () => { isMobile = window.innerWidth < 768; });
  requestAnimationFrame(frame);
})();

/* ============ Eclipse image: blur -> sharp + zoom-in, scrubbed by scroll ============ */
(function () {
  const card = document.querySelector(".eclipse__card");
  if (!card) return;
  const img = card.querySelector("img");
  if (!img) return;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  function frame() {
    const vh = window.innerHeight;
    const top = card.getBoundingClientRect().top;
    const p = clamp((vh - top) / (vh * 0.9), 0, 1);   // 0 entering from below -> 1 once risen into view
    img.style.filter = `blur(${((1 - p) * 18).toFixed(2)}px)`;
    img.style.transform = `scale(${(1 + p * 0.12).toFixed(4)})`;  // zooms in as it sharpens
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* ============ Scroll reveal ============ */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* ============ Mobile Menu Toggle ============ */
const hamburger = document.getElementById("navHamburger");
const mobileMenu = document.getElementById("mobileMenu");
const closeMenu = document.getElementById("mobileMenuClose");
const menuLinks = document.querySelectorAll(".mobile-menu__links a");

if (hamburger && mobileMenu && closeMenu) {
  hamburger.addEventListener("click", () => {
    mobileMenu.classList.add("is-open");
    document.body.style.overflow = "hidden"; // Prevent scrolling
  });

  closeMenu.addEventListener("click", () => {
    mobileMenu.classList.remove("is-open");
    document.body.style.overflow = "";
  });

  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("is-open");
      document.body.style.overflow = "";
    });
  });
}

