(() => {
  // Scroll progress
  const bar = document.querySelector(".scroll-progress");
  const update = () => {
    if (!bar) return;
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const p = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    bar.style.width = `${p}%`;
  };
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();

  // Fade-up
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const faders = document.querySelectorAll(".fade-up, .hero-content");

  if (reduced) {
    faders.forEach((el) => el.classList.add("visible"));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );

    faders.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i * 45, 220)}ms`;
      io.observe(el);
    });
  }

  // Nav active
  const normalize = (p) => (p.endsWith("/") ? p + "index.html" : p);
  const path = normalize(location.pathname.split("/").pop() || "index.html");

  document.querySelectorAll("nav a[data-nav]").forEach((a) => {
    const href = a.getAttribute("href") || "";
    const clean = normalize(href.split("/").pop() || "");
    if (clean === path) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
})();