(() => {
  const form = document.getElementById("contactForm");
  const overlay = document.getElementById("overlay");
  const submitBtn = document.getElementById("submitBtn");
  const consent = document.getElementById("privacyConsent");

  // endpoint Worker
  const GATE_URL = "https://tobia.me/api/contact";
  const startedAt = Date.now();

  let turnstileToken = "";

  // Turnstile callbacks (global per data-callback)
  window.onTurnstileSuccess = (token) => {
    turnstileToken = token || "";
    updateSubmitState();
  };
  window.onTurnstileExpired = () => {
    turnstileToken = "";
    updateSubmitState();
  };
  window.onTurnstileError = () => {
    turnstileToken = "";
    updateSubmitState();
  };

  function updateSubmitState() {
    // abilita solo se: consenso privacy + token presente
    const ok = !!turnstileToken && consent.checked;
    submitBtn.disabled = !ok;
  }

  consent.addEventListener("change", updateSubmitState);

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const setInvalid = (fieldEl, msg) => {
    fieldEl.classList.add("invalid");
    const em = fieldEl.querySelector(".error-message");
    if (em && msg) em.textContent = msg;
  };

  const setValid = (fieldEl) => {
    fieldEl.classList.remove("invalid");
  };

  // Live validation
  ["nome", "email", "messaggio"].forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener("input", () => {
      const wrapper = el.closest(".field");
      if (!wrapper) return;
      if (id === "email") {
        if (el.value.trim() === "" || !isEmailValid(el.value.trim())) return setInvalid(wrapper, "Inserisci una email valida.");
      } else {
        if (el.value.trim() === "") return setInvalid(wrapper, "Per favore compila questo campo.");
      }
      setValid(wrapper);
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Anti-spam base
    const honeypot = document.getElementById("company");
    if (honeypot && honeypot.value.trim() !== "") return;
    if (Date.now() - startedAt < 1500) return;

    // Gate: consenso + token (in teoria già gestito dal disabled)
    if (!turnstileToken || !consent.checked) return;

    // Validate
    let ok = true;

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const messaggio = document.getElementById("messaggio").value.trim();

    const nomeWrap = document.getElementById("nome").closest(".field");
    const emailWrap = document.getElementById("email").closest(".field");
    const msgWrap = document.getElementById("messaggio").closest(".field");

    if (!nome) { setInvalid(nomeWrap, "Per favore inserisci il tuo nome completo."); ok = false; }
    if (!email) { setInvalid(emailWrap, "Per favore compila questo campo."); ok = false; }
    else if (!isEmailValid(email)) { setInvalid(emailWrap, "Inserisci una email valida."); ok = false; }
    if (!messaggio) { setInvalid(msgWrap, "Il messaggio non può essere vuoto."); ok = false; }

    if (!ok) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Invio...";

    const formData = {
      name: nome,
      email: email,
      message: messaggio,
      turnstileToken
    };

    try {
      const res = await fetch(GATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Errore invio");

      overlay.classList.add("active");
      overlay.setAttribute("aria-hidden", "false");

      form.reset();
      consent.checked = false;

      turnstileToken = "";
      if (window.turnstile) window.turnstile.reset();
      updateSubmitState();

    } catch (err) {
      console.error(err);
      alert("Si è verificato un errore durante l’invio. Riprova tra poco.");
      updateSubmitState();
    } finally {
      submitBtn.textContent = "Invia";
    }
  });

  // Serve perché nel contenuto hai onclick="closeOverlay()" (lo lasciamo invariato)
  window.closeOverlay = function closeOverlay() {
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("active")) window.closeOverlay();
  });
})();