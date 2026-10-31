(() => {
  const config = window.SUPERDOLLOP_CONFIG || {};

  // ---------- Links from config.js ----------
  const targets = { contact: config.contactUrl, client: config.apiUrl };
  document.querySelectorAll("[data-link]").forEach((a) => {
    const url = targets[a.dataset.link];
    if (url) {
      a.href = url;
      if (/^https?:/.test(url)) {
        a.target = "_blank";
        a.rel = "noopener";
      }
    } else {
      a.removeAttribute("href");
      a.setAttribute("aria-disabled", "true");
    }
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();
