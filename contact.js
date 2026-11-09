(() => {
  const config = window.SUPERDOLLOP_CONFIG || {};
  const form = document.getElementById("contact-form");
  if (!form) return;
  // formKey is FormSubmit's random form ID, or the destination address base64-encoded so it never sits in the page as text.
  const key = config.formKey || "";
  const target = /^[a-f0-9]{20,}$/i.test(key) ? key : atob(key);
  const calendly = config.calendlyUrl || "";
  const submit = document.getElementById("contact-submit");
  const error = document.getElementById("form-error");
  const done = document.getElementById("contact-done");
  const doneText = document.getElementById("contact-done-text");

  if (!calendly) submit.textContent = "Send";

  const showError = (msg) => { error.textContent = msg; error.hidden = false; };
  form.addEventListener("input", (e) => {
    const el = e.target;
    if (el.getAttribute("aria-invalid") !== "true") return;
    el.removeAttribute("aria-invalid");
    el.removeAttribute("aria-describedby");
    document.getElementById(el.id + "-error")?.remove();
    if (!form.querySelector("[aria-invalid]")) error.hidden = true;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    error.hidden = true;
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    form.querySelectorAll(".field-error").forEach((el) => el.remove());
    const checks = {
      first_name: (x) => (x ? "" : "Enter your first name."),
      last_name: (x) => (x ? "" : "Enter your last name."),
      email: (x) => (!x ? "Enter your email." : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x) ? "" : "This email looks incomplete. It should look like name@business.com."),
      phone: (x) => (x.replace(/\D/g, "").length >= 7 ? "" : "Enter a phone number we can call."),
    };
    const bad = [];
    Object.entries(checks).forEach(([id, check]) => {
      const el = document.getElementById(id);
      const msg = check(el.value.trim());
      if (!msg) return;
      el.setAttribute("aria-invalid", "true");
      const p = document.createElement("p");
      p.className = "field-error";
      p.id = id + "-error";
      p.textContent = msg;
      el.setAttribute("aria-describedby", p.id);
      el.after(p);
      bad.push(el);
    });
    if (bad.length) {
      bad[0].focus();
      showError(bad.length === 1 ? "One field needs a fix before we can send this." : `${bad.length} fields need a fix before we can send this.`);
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
      const res = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(target), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) !== "true") throw new Error(data.message || res.status);
    } catch (err) {
      submit.disabled = false;
      submit.textContent = calendly ? "Continue to booking" : "Send";
      showError("We couldn't send your details. Please try again in a moment.");
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
