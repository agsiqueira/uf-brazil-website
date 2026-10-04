(() => {
  const config = window.UFBrazilConfig || {};
  const availability = config.availability;
  if (
    Number.isInteger(availability?.places) &&
    availability.places >= 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(availability.updated || "")
  ) {
    const date = new Date(`${availability.updated}T00:00:00Z`);
    if (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === availability.updated
    ) {
      const updated = new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
      document.querySelectorAll("[data-availability]").forEach((block) => {
        const count = document.createElement("strong");
        count.textContent = `${availability.places} ${availability.places === 1 ? "place" : "places"} currently available`;
        const stamp = document.createElement("span");
        stamp.textContent = `Updated ${updated}`;
        block.replaceChildren(count, stamp);
        block.hidden = false;
      });
    }
  }
  document.querySelectorAll("[data-video]").forEach((link) => {
    const id = link.dataset.video;
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = link.className;
    button.setAttribute("aria-label", link.getAttribute("aria-label"));
    button.append(...link.childNodes);
    link.replaceWith(button);
    button.addEventListener("click", () => {
      const player = document.createElement("iframe");
      player.className = "video-player";
      player.title = link.dataset.videoTitle;
      player.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1`;
      player.allow =
        "autoplay; encrypted-media; picture-in-picture; fullscreen";
      player.allowFullscreen = true;
      player.referrerPolicy = "strict-origin-when-cross-origin";
      button.replaceWith(player);
      player.focus();
    });
  });
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
