const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const directors = [
  "agomesdesiqueira@ufl.edu",
  "alexandre.g.siqueira@gmail.com",
];
function validate(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Invalid request");
  const result = {};
  for (const [field, limit] of Object.entries({
    email: 254,
    name: 120,
    major: 160,
    interests: 2000,
  })) {
    const value = input[field] ?? "";
    if (
      typeof value !== "string" ||
      value.length > limit ||
      /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)
    )
      throw new Error("Invalid fields");
    result[field] = value.trim();
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email))
    throw new Error("Valid email required");
  return result;
}
function messages(student, sender, origin) {
  const guide = `${origin}/assets/program-guide.pdf?v=20261003-invitation`;
  const info = `UF in Brazil — Cross-Cultural Engineering and Immersive Technologies for Industry 5.0\n\nJune 6–August 1, 2027. Explore cross-cultural engineering, immersive storytelling, and lasting exhibits in Bahia, Brazil. The program includes a guided portfolio, English-taught classes with bilingual coordination, and eight weeks at Praia do Forte Hostel.\n\nRead the program guide for details, fees, eligibility, and application terms:\n${guide}\n\nProgram website: ${origin}/\nQuestions? Contact ${directors.join(" or ")}.\n\nThis email responds to your request for information; it does not reserve a place or submit an application.`;
  return [
    {
      from: sender,
      to: [student.email],
      subject: "Your UF in Brazil program information",
      text: `Hello${student.name ? ` ${student.name}` : ""},\n\n${info}`,
      reply_to: directors[0],
    },
    ...directors.map((to) => ({
      from: sender,
      to: [to],
      reply_to: student.email,
      subject: "UF in Brazil: new information request",
      text: `Email: ${student.email}\nName: ${student.name || "(not supplied)"}\nMajor: ${student.major || "(not supplied)"}\nInterests: ${student.interests || "(not supplied)"}\n\nThe student requested program information and the guide. This batch includes the student reply.`,
    })),
  ];
}
function createServer({
  env = process.env,
  transport = fetch,
  smtpTransport,
} = {}) {
  const origin = env.PUBLIC_ORIGIN || "https://ufinbrazil.mixed.group";
  const gmail = env.SMTP_USER && env.SMTP_PASSWORD;
  const smtp = gmail
    ? smtpTransport ||
      require("nodemailer").createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
      })
    : null;
  const attempts = new Map();
  const json = (res, status, body) => {
    res.writeHead(status, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify(body));
  };
  return http.createServer(async (req, res) => {
    const pathname = new URL(req.url, origin).pathname;
    if (pathname === "/api/signup") {
      if (req.method !== "POST") return json(res, 405, { accepted: false });
      if (req.headers.origin && req.headers.origin !== origin)
        return json(res, 403, { accepted: false });
      if (!req.headers["content-type"]?.startsWith("application/json"))
        return json(res, 415, { accepted: false });
      if (!gmail && (!env.RESEND_API_KEY || !env.SIGNUP_FROM))
        return json(res, 503, {
          accepted: false,
          error:
            "Information service unavailable. Please contact the director.",
        });
      // Use the socket address, never a visitor-controlled forwarded header.
      const now = Date.now();
      for (const [key, entry] of attempts)
        if (entry.expires <= now) attempts.delete(key);
      const key = req.socket.remoteAddress;
      const entry = attempts.get(key) || { count: 0, expires: now + 60000 };
      if (++entry.count > 10 || attempts.size > 10000)
        return json(res, 429, { accepted: false });
      attempts.set(key, entry);
      let student;
      try {
        let body = "";
        for await (const chunk of req) {
          body += chunk;
          if (Buffer.byteLength(body) > 16384)
            return json(res, 413, { accepted: false });
        }
        student = validate(JSON.parse(body));
      } catch {
        return json(res, 400, {
          accepted: false,
          error: "Check your email and optional fields.",
        });
      }
      const requestId = randomUUID();
      try {
        if (smtp) {
          const outcomes = await Promise.allSettled(
            messages(student, env.SMTP_USER, origin).map(
              ({ reply_to, ...message }) =>
                smtp.sendMail({ ...message, replyTo: reply_to }),
            ),
          );
          const accepted = outcomes.filter(
            (item) =>
              item.status === "fulfilled" &&
              item.value.accepted?.length === 1 &&
              !item.value.rejected?.length,
          );
          console.info(
            JSON.stringify({
              event: "signup_smtp_result",
              requestId,
              acceptedCount: accepted.length,
              messageIds: accepted.map((item) => item.value.messageId),
            }),
          );
          if (accepted.length !== 3)
            throw new Error("SMTP did not accept all messages");
          return json(res, 200, { accepted: true, requestId });
        }
        const response = await transport(
          "https://api.resend.com/emails/batch",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
              "Idempotency-Key": requestId,
            },
            body: JSON.stringify(messages(student, env.SIGNUP_FROM, origin)),
            signal: AbortSignal.timeout(10000),
          },
        );
        const result = await response.json();
        if (
          !response.ok ||
          !Array.isArray(result.data) ||
          result.data.length !== 3 ||
          result.data.some((item) => typeof item.id !== "string" || !item.id)
        )
          throw new Error("Provider did not acknowledge all messages");
        console.info(
          JSON.stringify({
            event: "signup_accepted",
            requestId,
            messageIds: result.data.map((item) => item.id),
          }),
        );
        return json(res, 200, { accepted: true, requestId });
      } catch {
        console.error(
          JSON.stringify({ event: "signup_delivery_unconfirmed", requestId }),
        );
        return json(res, 502, {
          accepted: false,
          error:
            "We could not confirm email acceptance. Please retry or contact the director.",
        });
      }
    }
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405);
      return res.end();
    }
    let file;
    try {
      file = decodeURIComponent(pathname === "/" ? "/index.html" : pathname);
    } catch {
      res.writeHead(400);
      return res.end();
    }
    // Only public assets are served; server source and environment files stay private.
    if (
      !/^\/(index\.html|signup\.html|styles\.css|site\.js|site-config\.js|Colorful street scene of Salvador, Brazil\.jpg)$/.test(
        file,
      ) &&
      !/^\/assets\/[\w .()/-]+$/.test(file)
    ) {
      res.writeHead(404);
      return res.end();
    }
    if (file.split("/").includes("..")) {
      res.writeHead(404);
      return res.end();
    }
    try {
      const data = await fs.readFile(path.join(__dirname, file));
      const type =
        {
          ".html": "text/html",
          ".js": "text/javascript",
          ".css": "text/css",
          ".pdf": "application/pdf",
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".svg": "image/svg+xml",
          ".mp4": "video/mp4",
          ".vtt": "text/vtt",
        }[path.extname(file)] || "application/octet-stream";
      res.writeHead(200, {
        "Content-Type": type,
        "X-Content-Type-Options": "nosniff",
      });
      res.end(req.method === "HEAD" ? undefined : data);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
}
if (require.main === module)
  createServer().listen(Number(process.env.PORT || 80), "0.0.0.0");
module.exports = { createServer, validate, messages };
