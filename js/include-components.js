(async () => {
  const load = async () => {
    const nodes = document.querySelectorAll("[data-include]");
    if (!nodes.length) return;

    await Promise.all([...nodes].map(async (el) => {
      const url = el.getAttribute("data-include");
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        console.error("Include failed:", url, res.status);
        return;
      }
      el.outerHTML = await res.text();
    }));

    // Se i componenti inclusi contengono altri include, ricarica
    if (document.querySelector("[data-include]")) await load();
  };

  await load();
})();