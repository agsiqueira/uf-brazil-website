const fs = require("node:fs");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const results = [];
  try {
    for (const url of process.argv.slice(2)) {
      const page = await browser.newPage();
      const result = { url, embeds: [], media: [], failures: [] };
      page.on("request", async (request) => {
        if (/youtube(?:-nocookie)?\.com\/embed\//.test(request.url())) {
          const headers = await request.allHeaders();
          result.embeds.push({
            url: request.url(),
            referer: headers.referer || null,
          });
        }
      });
      page.on("response", (response) => {
        if (/googlevideo\.com\/videoplayback/.test(response.url()))
          result.media.push({ status: response.status() });
      });
      page.on("requestfailed", (request) => {
        if (/youtube|googlevideo/.test(request.url()))
          result.failures.push({
            url: request.url().split("?")[0],
            error: request.failure(),
          });
      });
      try {
        const response = await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
        result.headers = await response.allHeaders();
        result.context = await page.evaluate(() => ({
          origin: location.origin,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        }));
        const triggers = page.locator(".video-trigger");
        result.playerCount = await triggers.count();
        result.verificationStatus = result.playerCount
          ? "Playback inspection performed below"
          : "Not verified: deployed page does not contain click-to-load players";
        for (let i = 0; i < result.playerCount; i++)
          await triggers.first().click();
        await page.waitForTimeout(12000);
        result.players = [];
        for (const frame of page
          .frames()
          .filter((frame) =>
            /youtube(?:-nocookie)?\.com\/embed\//.test(frame.url()),
          )) {
          const sample = () =>
            frame.evaluate(() => ({
              text: document.body.innerText,
              videos: [...document.querySelectorAll("video")].map((video) => ({
                currentTime: video.currentTime,
                paused: video.paused,
                readyState: video.readyState,
              })),
            }));
          const before = await sample();
          await page.waitForTimeout(4000);
          const after = await sample();
          result.players.push({
            url: frame.url(),
            before,
            after,
            playbackVerified: after.videos.some(
              (video, index) =>
                !video.paused &&
                video.currentTime > (before.videos[index]?.currentTime || 0),
            ),
          });
        }
      } catch (error) {
        result.error = error.message;
      }
      results.push(result);
      await page.close();
    }
    fs.writeFileSync(
      "docs/video-verification.json",
      JSON.stringify(results, null, 2),
    );
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
