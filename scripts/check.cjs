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
    assert.equal(await page.locator("main > section").count(), 7);
    assert(metrics.bookTop < metrics.height / 2, `${label}: book too late`);
    if (size.width <= 760)
      assert(
        metrics.photoTop < size.height,
        `${label}: photo below first screen`,
      );
    assert.equal(await page.locator("[data-guide]:visible").count(), 0);
    assert.equal(await page.locator(".video-preview").count(), 2);
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
      body: 'window.UFBrazilConfig = { signupEndpoint: "/test-signup" };',
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
      body: 'window.UFBrazilConfig = {programGuideUrl: "/assets/approved-guide.pdf", bookVisualUrl: "/assets/praia-do-forte-village.jpg", bookVisualAlt: "Approved visual test", bookVisualCaption: "Approved caption test"};',
    }),
  );
  await configured.goto(base + "/");
  assert.equal(await configured.locator("[data-guide]:visible").count(), 2);
  assert.equal(
    await configured.locator("[data-book-visual] img").getAttribute("alt"),
    "Approved visual test",
  );
  report.push({ configuredIntegrationPoints: "passed (local fixtures only)" });
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
