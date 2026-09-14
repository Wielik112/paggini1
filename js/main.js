/* ============================================================
   PAGGINI — main.js  (interactions & animations)
   ============================================================ */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  /* ---------- Year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Preloader ---------- */
  window.addEventListener("load", () => {
    const pl = $("#preloader");
    if (!pl) return;
    setTimeout(() => {
      pl.classList.add("is-done");
      document.body.style.overflow = "";
      startHeroIntro();
    }, prefersReduced ? 200 : 1400);
  });
  document.body.style.overflow = "hidden";
  // safety: never lock scroll forever
  setTimeout(() => {
    const pl = $("#preloader");
    if (pl && !pl.classList.contains("is-done")) {
      pl.classList.add("is-done");
      document.body.style.overflow = "";
      startHeroIntro();
    }
  }, 3500);

  /* ---------- Lenis smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !prefersReduced) {
    lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
    }
  }

  /* ---------- Anchor smooth scroll ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMobileMenu();
      if (lenis) lenis.scrollTo(target, { offset: -70 });
      else target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- Nav scroll state ---------- */
  const nav = $("#nav");
  const onScroll = () => { if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 30); };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const burger = $("#burger");
  function closeMobileMenu() { if (nav) nav.classList.remove("is-open"); }
  if (burger) burger.addEventListener("click", () => nav.classList.toggle("is-open"));

  /* ---------- Language switcher ---------- */
  const lang = $("#lang");
  const langBtn = $("#langBtn");
  if (langBtn) {
    langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      lang.classList.toggle("is-open");
      langBtn.setAttribute("aria-expanded", lang.classList.contains("is-open"));
    });
    $$("[data-lang]").forEach((b) => {
      b.addEventListener("click", () => {
        applyLang(b.getAttribute("data-lang"));
        lang.classList.remove("is-open");
        langBtn.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("click", () => {
      lang.classList.remove("is-open");
      langBtn.setAttribute("aria-expanded", "false");
    });
  }

  /* ---------- Custom cursor ---------- */
  if (!isTouch) {
    const cursor = $("#cursor");
    const dot = $("#cursorDot");
    let mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      if (dot) { dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`; }
    });
    function loop() {
      cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
      if (cursor) cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
    loop();
    $$("a, button, [data-magnetic], .card, .project, input, textarea").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor && cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor && cursor.classList.remove("is-hover"));
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (!isTouch && !prefersReduced) {
    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- 3D tilt on cards ---------- */
  if (!isTouch && !prefersReduced) {
    $$("[data-tilt]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateY(-8px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const siblings = Array.from(el.parentElement ? el.parentElement.querySelectorAll(":scope > .reveal") : [el]);
          const idx = siblings.indexOf(el);
          el.style.transitionDelay = (idx > 0 ? idx * 0.08 : 0) + "s";
          el.classList.add("is-visible");
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Hero intro (GSAP) ---------- */
  function startHeroIntro() {
    if (prefersReduced || !window.gsap) {
      $$(".hero__title .line > span").forEach((s) => (s.style.transform = "translateY(0)"));
      return;
    }
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(".hero__title .line > span", { yPercent: 120, duration: 1, stagger: 0.12 })
      .from(".hero__badge", { y: 20, opacity: 0, duration: 0.6 }, "-=0.9")
      .from(".hero__wordmark", { y: 30, opacity: 0, duration: 0.8 }, "-=0.7")
      .from(".hero__sub", { y: 20, opacity: 0, duration: 0.6 }, "-=0.6")
      .from(".hero__cta", { y: 20, opacity: 0, duration: 0.6 }, "-=0.5")
      .from(".hero__scroll", { opacity: 0, duration: 0.6 }, "-=0.3");
  }

  /* ---------- Counters ---------- */
  function animateCount(el) {
    const target = parseInt(el.getAttribute("data-count"), 10) || 0;
    const suffix = el.getAttribute("data-suffix") || "";
    if (prefersReduced) { el.textContent = target + suffix; return; }
    let cur = 0;
    const dur = 1600, start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      cur = Math.round(target * eased);
      el.textContent = cur + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    $$(".stat__num").forEach((el) => cio.observe(el));
  } else {
    $$(".stat__num").forEach((el) => animateCount(el));
  }

  /* ---------- Contact form (client-side demo) ---------- */
  const form = $("#contactForm");
  if (form) {
    // required placeholders so floating labels work
    $$("input, textarea", form).forEach((f) => f.setAttribute("placeholder", " "));
    const note = $("#formNote");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#name").value.trim();
      const email = $("#email").value.trim();
      const msg = $("#message").value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      note.className = "form__note";
      if (!name || !emailOk || !msg) {
        note.textContent = (window.t ? t("form_err") : "Uzupełnij wymagane pola.");
        note.classList.add("is-err");
        return;
      }
      // Demo: open a prefilled email. Replace with real backend/Formspree later.
      const subject = encodeURIComponent(($("#subject").value.trim()) || "Nowe zapytanie — Paggini");
      const body = encodeURIComponent(`Imię: ${name}\nE-mail: ${email}\n\n${msg}`);
      window.location.href = `mailto:kontakt@paggini.com?subject=${subject}&body=${body}`;
      note.textContent = (window.t ? t("form_ok") : "Dziękujemy!");
      note.classList.add("is-ok");
      form.reset();
    });
  }

  /* ---------- Animated particle background ---------- */
  (function particles() {
    const canvas = $("#bgCanvas");
    if (!canvas || prefersReduced) return;
    const ctx = canvas.getContext("2d");
    let w, h, dots, raf;
    const COUNT = window.innerWidth < 700 ? 34 : 66;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    function init() {
      dots = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.4,
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(120,170,255,0.6)";
        ctx.fill();
        for (let j = i + 1; j < dots.length; j++) {
          const d2 = dots[j];
          const dx = d.x - d2.x, dy = d.y - d2.y;
          const dist = dx * dx + dy * dy;
          if (dist < 15000) {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y); ctx.lineTo(d2.x, d2.y);
            ctx.strokeStyle = `rgba(80,140,255,${0.14 * (1 - dist / 15000)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    resize(); init(); draw();
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { resize(); init(); }, 200); });
  })();

})();
