(() => {
  const config = window.UFBrazilConfig || {};
  const safeUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const url = new URL(value, window.location.href);
      return url.protocol === "https:" || url.origin === window.location.origin
        ? url.href
        : null;
    } catch {
      return null;
    }
  };
  const guide = safeUrl(config.programGuideUrl);
  if (guide)
    document.querySelectorAll("[data-guide]").forEach((link) => {
      link.href = guide;
      link.hidden = false;
    });
  const bookVisual = safeUrl(config.bookVisualUrl);
  const book = document.querySelector("[data-book-visual]");
  if (book && bookVisual && config.bookVisualAlt && config.bookVisualCaption) {
    const image = document.createElement("img");
    image.src = bookVisual;
    image.alt = config.bookVisualAlt;
    image.loading = "lazy";
    const caption = document.createElement("figcaption");
    caption.textContent = config.bookVisualCaption;
    book.replaceChildren(image, caption);
  }
  const form = document.querySelector("[data-signup]");
  if (!form) return;
  const status = document.querySelector("[data-status]");
  const submit = form.querySelector("button[type=submit]");
  const endpoint = safeUrl(config.signupEndpoint);
  if (!endpoint) {
    form.addEventListener("submit", (event) => event.preventDefault());
    status.textContent =
      "Online signup is not available yet. Contact the program director using the email link below to request information.";
    return;
  }
  submit.disabled = false;
  status.textContent = "";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity() || submit.disabled) return;
    submit.disabled = true;
    status.textContent = "Sending your request...";
    const fields = new FormData(form);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fields)),
        signal: controller.signal,
        credentials: "omit",
      });
      const result = await response.json();
      if (!response.ok || result.accepted !== true)
        throw new Error("Not accepted");
      status.textContent =
        "Your information request has been accepted. Thank you for your interest in UF in Brazil.";
      form.reset();
    } catch {
      status.textContent =
        "We could not confirm your signup. Please try again or contact the program director below.";
    } finally {
      clearTimeout(timeout);
      submit.disabled = false;
    }
  });
})();
