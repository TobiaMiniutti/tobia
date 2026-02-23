// Filtri + Modal anteprima (Portfolio)
(() => {
  // --- FILTERS ---
  const chips = document.querySelectorAll(".chip");
  const cards = Array.from(document.querySelectorAll(".project-card"));

  const setActiveChip = (active) => {
    chips.forEach(c => c.setAttribute("aria-pressed", String(c.dataset.filter === active)));
  };

  const applyFilter = (filter) => {
    cards.forEach(card => {
      const cat = (card.dataset.category || "").toLowerCase();
      const match = (filter === "all") || cat.split(/\s+/).includes(filter);
      card.classList.toggle("is-hidden", !match);
    });
  };

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter;
      setActiveChip(filter);
      applyFilter(filter);
    });
  });

  // --- MODAL PREVIEW ---
  const modal = document.getElementById("modal");
  const modalMedia = document.getElementById("modalMedia");
  const modalBody = document.getElementById("modalBody");
  const modalTitle = document.getElementById("modalTitle");
  let lastFocus = null;

  const openModalFromCard = (card) => {
    lastFocus = document.activeElement;

    const title = card.dataset.title || "Anteprima";
    const desc  = card.dataset.description || "";
    const type  = card.dataset.type || "image";

    modalTitle.textContent = title;
    modalBody.textContent = desc;
    modalMedia.innerHTML = "";

    if (type === "youtube") {
      const yt = card.dataset.youtubeId;
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${yt}?autoplay=1&rel=0&modestbranding=1`;
      iframe.title = `${title} — YouTube`;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allowFullscreen = true;
      modalMedia.appendChild(iframe);
    } else {
      const src = card.dataset.imageSrc;
      const img = document.createElement("img");
      img.src = src;
      img.alt = `Anteprima ${title}`;
      img.loading = "eager";
      modalMedia.appendChild(img);
    }

    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    const closeBtn = modal.querySelector('[data-action="close"]');
    closeBtn && closeBtn.focus({ preventScroll: true });
  };

  const closeModal = () => {
    modal.setAttribute("aria-hidden", "true");
    modalMedia.innerHTML = "";
    document.body.style.overflow = "";

    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
  };

  document.addEventListener("click", (e) => {
    const btn = e.target.closest('[data-action="preview"]');
    if (btn) {
      const card = btn.closest(".project-card");
      if (card) openModalFromCard(card);
    }

    const ph = e.target.closest(".yt-placeholder");
    if (ph) {
      const card = ph.closest(".project-card");
      if (card) openModalFromCard(card);
    }

    const close = e.target.closest('[data-action="close"]');
    if (close) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (modal.getAttribute("aria-hidden") === "false" && e.key === "Escape") closeModal();

    const active = document.activeElement;
    if ((e.key === "Enter" || e.key === " ") && active?.classList?.contains("yt-placeholder")) {
      e.preventDefault();
      const card = active.closest(".project-card");
      if (card) openModalFromCard(card);
    }
  });
})();