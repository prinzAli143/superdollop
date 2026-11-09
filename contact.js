(() => {
  const config = window.SUPERDOLLOP_CONFIG || {};
  const form = document.getElementById("contact-form");
  if (!form) return;
  const email = config.contactEmail || "";
  const calendly = config.calendlyUrl || "";
  const submit = document.getElementById("contact-submit");
  const error = document.getElementById("form-error");
  const done = document.getElementById("contact-done");
  const doneText = document.getElementById("contact-done-text");

  document.querySelectorAll("[data-email]").forEach((a) => { a.href = "mailto:" + email; a.textContent = email; });
  if (!calendly) submit.textContent = "Send";

  const showError = (msg) => { error.textContent = msg; error.hidden = false; };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    error.hidden = true;
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    const bad = [...form.querySelectorAll("input[required]")].filter((el) => !el.value.trim() || !el.checkValidity());
    if (bad.length) {
      bad.forEach((el) => el.setAttribute("aria-invalid", "true"));
      bad[0].focus();
      showError("Please fill in your first name, last name, a valid email and your phone number.");
      return;
    }
    const fd = new FormData(form);
    if (fd.get("_honey")) return;
    const v = (k) => (fd.get(k) || "").toString().trim();
    const name = `${v("first_name")} ${v("last_name")}`;
    const payload = {
      _subject: `New SuperDollop lead: ${name}`,
      _template: "table",
      "First name": v("first_name"),
      "Last name": v("last_name"),
      Email: v("email"),
      Phone: v("phone"),
      Website: v("website") || "—",
      "Networks used": fd.getAll("networks").join(", ") || "—",
      "Profile links": v("profiles") || "—",
    };
    submit.disabled = true;
    submit.textContent = "Sending…";
    try {
      const res = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(email), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) !== "true") throw new Error(data.message || res.status);
    } catch (err) {
      submit.disabled = false;
      submit.textContent = calendly ? "Continue to booking" : "Send";
      showError(`We couldn't send your details. Please try again, or email us at ${email}.`);
      return;
    }
    form.hidden = true;
    done.hidden = false;
    done.focus();
    document.querySelectorAll(".contact-steps li").forEach((li, i) => li.classList.toggle("is-current", i === 1));
    if (calendly) {
      const url = new URL(calendly);
      url.searchParams.set("name", name);
      url.searchParams.set("email", v("email"));
      doneText.innerHTML = `Opening the booking page… If nothing happens, <a href="${url}">pick your 20-minute slot here</a>.`;
      setTimeout(() => location.assign(url.toString()), 900);
    } else {
      doneText.textContent = `We'll email you at ${v("email")} to set up your 20-minute call.`;
    }
  });
})();
