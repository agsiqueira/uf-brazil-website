const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 8081);
const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".pdf": "application/pdf",
};
const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
  } catch {
    res.writeHead(400).end();
    return;
  }
  const relative = pathname === "/" ? "index.html" : pathname.slice(1);
  const file = path.resolve(root, relative);
  const allowed = [
    "index.html",
    "signup.html",
    "styles.css",
    "site.js",
    "site-config.js",
    "Colorful street scene of Salvador, Brazil.jpg",
  ];
  if (
    !file.startsWith(root + path.sep) ||
    (!allowed.includes(relative) && !relative.startsWith("assets/"))
  ) {
    res.writeHead(404).end("Not found");
    return;
  }
  fs.readFile(file, (error, content) => {
    if (error) {
      res.writeHead(404).end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
    });
    res.end(content);
  });
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Preview: http://127.0.0.1:${port}`),
);
