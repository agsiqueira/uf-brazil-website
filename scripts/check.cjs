const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { chromium } = require("playwright");
const { default: AxeBuilder } = require("@axe-core/playwright");
const root = path.resolve(__dirname, "..");
const output = path.join(root, "docs", "screenshots");
const base = "http://127.0.0.1:8082";
const server = spawn(process.execPath, [path.join(__dirname, "preview.cjs")], {
  cwd: root,
  env: { ...process.env, PORT: "8082" },
  stdio: ["ignore", "pipe", "inherit"],
});
let browser;
const report = [];
const ready = new Promise((resolve, reject) => {
  server.stdout.once("data", resolve);
  server.once("error", reject);
  server.once("exit", (code) => reject(new Error(`Preview exited: ${code}`)));
});
async function checkLayout(page, label, url, size) {
  await page.setViewportSize(size);
  await page.goto(base + url);
  await page.evaluate(() => document.fonts.ready);
  // Load below-the-fold images before documenting the complete page.
  await page.evaluate(async () => {
    for (const img of document.images) img.loading = "eager";
    await Promise.all(
      [...document.images].map((img) => img.decode().catch(() => {})),
    );
  });
  const metrics = await page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    photoTop: document.querySelector(".hero-photo")?.getBoundingClientRect()
      .top,
    bookTop: document.querySelector("#book")?.getBoundingClientRect().top,
    broken: [...document.images]
      .filter((img) => !img.naturalWidth)
      .map((img) => img.src),
    missingAnchors: [...document.querySelectorAll('a[href^="#"]')]
      .filter((a) => !document.getElementById(a.getAttribute("href").slice(1)))
      .map((a) => a.href),
  }));
  assert(metrics.scrollWidth <= metrics.width, `${label}: horizontal overflow`);
  assert.deepEqual(metrics.broken, [], `${label}: broken images`);
  assert.deepEqual(metrics.missingAnchors, [], `${label}: missing anchors`);
  if (url === "/") {
    assert.equal(await page.locator("main > section").count(), 9);
    assert.equal(await page.locator("main > section:visible").count(), 9);
    assert.deepEqual(
      await page
        .locator("main > section")
        .evaluateAll((sections) => sections.map((s) => s.id || "opening")),
      [
        "opening",
        "future",
        "project",
        "book",
        "world-cup",
        "testimonials",
        "academics",
        "life",
        "details",
      ],
    );
    assert.equal(await page.locator('#ayush a[href="signup.html"]').count(), 0);
    assert.equal(await page.locator("[data-ayush-video]:visible").count(), 0);
    assert.equal(
      await page.locator("#ayush-title").innerText(),
      "Meet Dr. Ayush Bhargava.",
    );
    assert.deepEqual(
      await page.locator("[data-availability]:visible").allTextContents(),
      [
        "12 places currently availableUpdated October 3, 2026",
        "12 places currently availableUpdated October 3, 2026",
      ],
    );
    assert.equal(
      await page.locator("#book + #world-cup + #testimonials").count(),
      1,
    );
    assert.equal(
      (await page.locator(".stadium-photo figcaption").innerText()).trim(),
      "AI-generated illustration of match-day atmosphere.",
    );
    assert(metrics.bookTop < metrics.height / 2, `${label}: book too late`);
    if (size.width <= 760)
      assert(
        metrics.photoTop < size.height,
        `${label}: photo below first screen`,
      );
    assert.equal(await page.locator("[data-guide]:visible").count(), 2);
    assert.equal(await page.locator(".video-preview").count(), 2);
    const heroImage = page.locator(".hero-photo img");
    const displayed = await heroImage.boundingBox();
    const intrinsic = await heroImage.evaluate((img) => ({
      width: img.naturalWidth,
      height: img.naturalHeight,
    }));
    assert(
      Math.abs(
        displayed.width / displayed.height - intrinsic.width / intrinsic.height,
      ) < 0.01,
      "Opening scene must not crop students, projections, or prototypes",
    );
    assert.equal(
      (await page.locator(".hero-photo figcaption").innerText()).trim(),
      "AI-generated concept visualization inspired by Pelourinho.",
    );
    assert.equal(await page.locator(".video-player").count(), 0);
    assert.equal(await page.locator("[data-leandro-video]:visible").count(), 0);
    assert.equal(await page.locator("#testimonials .testimonial").count(), 2);
    const menu = page.locator(".nav-menu");
    if (size.width <= 1100) {
      await menu.locator("summary").focus();
      await page.keyboard.press("Enter");
      assert.equal(await menu.locator("nav").isVisible(), true);
      await page.keyboard.press("Escape");
      assert.equal(await menu.locator("nav").isVisible(), false);
    }
    for (const destination of [
      "project",
      "book",
      "world-cup",
      "testimonials",
      "life",
      "details",
    ]) {
      if (size.width <= 1100) await menu.locator("summary").click();
      await menu.locator(`a[href="#${destination}"]`).click();
      await page.waitForFunction((id) => {
        const box = document.querySelector(`#${id} h2`).getBoundingClientRect();
        return box.top >= 0 && box.top < innerHeight;
      }, destination);
      const heading = await page
        .locator(`#${destination} h2`)
        .first()
        .boundingBox();
      assert(
        heading.y >= 0 && heading.y < size.height,
        `${label}: heading obscured for ${destination}`,
      );
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    for (const selector of [
      ".project-photo img",
      ".coast-photos img",
      ".stadium-photo img",
      ".ayush-portrait",
    ]) {
      for (const image of await page.locator(selector).all()) {
        const box = await image.boundingBox();
        const ratio = await image.evaluate(
          (img) => img.naturalWidth / img.naturalHeight,
        );
        assert(
          Math.abs(box.width / box.height - ratio) < 0.01,
          `${label}: ${selector} cropped`,
        );
      }
    }
    assert.equal(
      await page.locator("#life .included, #academics .courses").count(),
      0,
    );
    assert.equal(
      await page.locator("#details .included, #details .courses").count(),
      2,
    );
    if (size.width <= 760) {
      const intro = await page.locator(".project-intro").boundingBox();
      const photo = await page.locator(".project-photo").boundingBox();
      assert(
        photo.y >= intro.y + intro.height &&
          photo.y - intro.y - intro.height <= 20,
      );
    }
    assert.equal(
      await page
        .locator('.qr a[href="https://ufinbrazil.mixed.group/"]')
        .count(),
      2,
    );
  }
  const a11y = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  assert.deepEqual(
    a11y.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
    [],
    `${label}: accessibility violations`,
  );
  await page.screenshot({
    path: path.join(output, label + ".png"),
    fullPage: true,
  });
  if (url === "/") {
    await page.screenshot({ path: path.join(output, label + "-opening.png") });
    await page
      .locator("#book")
      .screenshot({ path: path.join(output, label + "-book.png") });
    for (const [name, selector] of [
      ["project", "#project"],
      ["research", "#academics"],
      ["coast", ".coast-photos"],
      ["practical", "#details"],
      ["world-cup", "#world-cup"],
      ["testimonials", "#testimonials"],
    ]) {
      await page
        .locator(selector)
        .screenshot({ path: path.join(output, `${label}-${name}.png`) });
    }
  }
  report.push({
    label,
    ...metrics,
    accessibilityViolations: a11y.violations.length,
  });
}
async function signupScenario(context, name, response, expected) {
  const page = await context.newPage();
  await page.route("**/site-config.js", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: 'window.UFBrazilConfig = Object.freeze({ signupEndpoint: "/test-signup", availability: Object.freeze({ places: 12, updated: "2026-10-03" }) });',
    }),
  );
  let sent = 0;
  await page.route("**/test-signup", async (route) => {
    sent++;
    assert.deepEqual(route.request().postDataJSON(), {
      email: "student@example.test",
      name: "",
      major: "",
      interests: "",
    });
    if (response === "network") await route.abort();
    else
      await route.fulfill({
        status: response.status,
        contentType: "application/json",
        body: JSON.stringify(response.body),
      });
  });
  await page.goto(base + "/signup.html");
  await page.locator("#email").fill("not-an-email");
  await page.getByRole("button", { name: "Send me more information" }).click();
  assert.equal(sent, 0, "Invalid email must not be sent");
  await page.locator("#email").fill("student@example.test");
  await page.getByRole("button", { name: "Send me more information" }).click();
  await page.getByRole("status").filter({ hasText: expected }).waitFor();
  assert.equal(sent, 1);
  assert.equal(
    await page.evaluate(() => window.UFBrazilConfig.availability.places),
    12,
    "Information requests must not reduce program availability",
  );
  if (name !== "accepted")
    assert.equal(
      await page.locator("#email").inputValue(),
      "student@example.test",
    );
  await page.close();
  report.push({ signupScenario: name, passed: true });
}
(async () => {
  await ready;
  fs.mkdirSync(output, { recursive: true });
  browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  for (const [label, size] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["tablet", { width: 820, height: 1180 }],
    ["phone", { width: 390, height: 844 }],
    ["small-phone", { width: 320, height: 700 }],
  ])
    await checkLayout(page, label, "/", size);
  await checkLayout(page, "signup-desktop", "/signup.html", {
    width: 1440,
    height: 1000,
  });
  await checkLayout(page, "signup-phone", "/signup.html", {
    width: 390,
    height: 844,
  });
  assert.equal(await page.locator("[required]").count(), 1);
  assert.equal(await page.locator("[required]").getAttribute("name"), "email");
  assert(
    await page
      .getByRole("button", { name: "Send me more information" })
      .isDisabled(),
  );
  assert.match(await page.getByRole("status").innerText(), /not available/);
  await page.goto(base + "/");
  await page.route("https://www.youtube-nocookie.com/embed/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Local player fixture</title><p>Player integration test</p>",
    }),
  );
  const initialUrl = page.url();
  for (const [title, id] of [
    ["Meet SENAI CIMATEC", "5Fza7_oQT28"],
    ["Explore Salvador", "ia_2SHV88Q0"],
  ]) {
    const trigger = page.getByRole("button", { name: "Play " + title });
    const before = await trigger.boundingBox();
    await trigger.focus();
    await page.keyboard.press("Enter");
    const player = page.locator(`iframe[title="${title}"]`);
    await player.waitFor();
    assert.match(
      await player.getAttribute("src"),
      new RegExp(`youtube-nocookie.com/embed/${id}`),
    );
    assert.equal(page.url(), initialUrl);
    const after = await player.boundingBox();
    assert(
      Math.abs(before.height - after.height) < 2,
      "Player should not shift layout",
    );
  }
  assert.equal(await page.locator(".video-fallback").count(), 2);
  report.push({
    clickToLoadPlayers:
      "passed (local iframe fixtures; no real playback asserted)",
  });
  await page.goto(base + "/");
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(":focus").innerText(), "Skip to content");
  await page.locator("summary").first().focus();
  await page.keyboard.press("Enter");
  assert((await page.locator("details").first().getAttribute("open")) !== null);
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
    "auto",
  );
  await signupScenario(
    context,
    "accepted",
    { status: 200, body: { accepted: true } },
    "has been accepted",
  );
  await signupScenario(
    context,
    "rejected",
    { status: 400, body: { accepted: false } },
    "could not confirm",
  );
  await signupScenario(
    context,
    "ambiguous-200",
    { status: 200, body: {} },
    "could not confirm",
  );
  await signupScenario(
    context,
    "network-failure",
    "network",
    "could not confirm",
  );
  const configured = await context.newPage();
  await configured.route("**/site-config.js", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: 'window.UFBrazilConfig = {availability: {places: 1, updated: "2026-10-04"}, programGuideUrl: "/assets/approved-guide.pdf", bookVisualUrl: "/assets/praia-do-forte-village.jpg", bookVisualAlt: "Approved visual test", bookVisualCaption: "Approved caption test"};',
    }),
  );
  await configured.goto(base + "/");
  assert.equal(await configured.locator("[data-guide]:visible").count(), 2);
  assert.deepEqual(
    await configured.locator("[data-availability]").allTextContents(),
    [
      "1 place currently availableUpdated October 4, 2026",
      "1 place currently availableUpdated October 4, 2026",
    ],
  );
  assert.equal(
    await configured.locator("[data-book-visual] img").getAttribute("alt"),
    "Approved visual test",
  );
  report.push({ configuredIntegrationPoints: "passed (local fixtures only)" });
  const invitationPage = await context.newPage();
  let approved = false;
  await invitationPage.route("**/site-config.js", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `window.UFBrazilConfig = {ayushInvitation: {approved: ${approved}, headline: "Approved test headline", videoUrl: "/assets/test-invitation.mp4", captionsUrl: "/assets/test-captions.vtt", transcript: "Approved transcript fixture", durationSeconds: 31}, leandroInvitation: {approved: ${approved}, headline: "Approved Leandro headline", videoUrl: "/assets/test-invitation.mp4", captionsUrl: "/assets/test-captions.vtt", transcript: "Leandro transcript fixture", durationSeconds: 42}};`,
    }),
  );
  await invitationPage.goto(base + "/");
  assert.equal(
    await invitationPage.locator("[data-ayush-video]:visible").count(),
    0,
  );
  assert.equal(
    await invitationPage.locator("#ayush-title").innerText(),
    "Meet Dr. Ayush Bhargava.",
  );
  approved = true;
  await invitationPage.reload();
  assert.equal(
    await invitationPage.locator("#ayush-title").innerText(),
    "Approved test headline",
  );
  assert.equal(
    await invitationPage.locator("#ayush video").count(),
    0,
    "Recording must load only on activation",
  );
  await invitationPage
    .getByRole("button", { name: "Watch Ayush's invitation" })
    .click();
  assert.equal(
    await invitationPage.locator("#ayush video[controls]").count(),
    1,
  );
  assert.equal(
    await invitationPage
      .locator('#ayush track[kind="captions"][srclang="en"]')
      .count(),
    1,
  );
  await invitationPage
    .locator("#ayush")
    .getByText("Transcript", { exact: true })
    .click();
  assert.equal(
    await invitationPage.getByText("Approved transcript fixture").isVisible(),
    true,
  );
  report.push({
    ayushInvitation:
      "Approval gate and click-to-play/captions/transcript structure passed (fixtures only; recording not supplied)",
  });
  await invitationPage
    .getByRole("button", { name: "Watch Leandro's invitation" })
    .click();
  assert.equal(
    await invitationPage.locator("#leandro video[controls]").count(),
    1,
  );
  assert.equal(
    await invitationPage.locator("#testimonials video[autoplay]").count(),
    0,
  );
  assert.equal(
    await invitationPage.locator("#leandro video").evaluate((v) => v.paused),
    true,
  );
  await invitationPage.locator("#leandro summary").click();
  assert.equal(
    await invitationPage.getByText("Leandro transcript fixture").isVisible(),
    true,
  );
  assert.equal(
    await invitationPage.locator('#leandro track[kind="captions"]').count(),
    1,
  );
  assert.equal(
    await invitationPage.locator("#ayush video").evaluate((v) => v.paused),
    true,
  );
  report.push({
    testimonials:
      "Both approval gates, configured durations, native controls, captions/transcripts, and no-autoplay checks passed with fixtures; real recordings pending",
  });
  await invitationPage.close();
  fs.writeFileSync(
    path.join(root, "docs", "checks.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (browser) await browser.close();
    server.kill();
  });
