const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createServer, validate, messages } = require("../server.cjs");
test("Gmail requires all recipients accepted and reports partial failure", async () => {
  for (const fail of [false, true]) {
    const server = createServer({
      env: { SMTP_USER: "sender@gmail.com", SMTP_PASSWORD: "test-only" },
      smtpTransport: {
        sendMail: async (message) => ({
          accepted:
            fail && message.to[0] === "agomesdesiqueira@ufl.edu"
              ? []
              : message.to,
          rejected:
            fail && message.to[0] === "agomesdesiqueira@ufl.edu"
              ? message.to
              : [],
          messageId: "test-message",
        }),
      },
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const response = await fetch(
        `http://127.0.0.1:${server.address().port}/api/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "student@example.com" }),
        },
      );
      assert.equal(response.status, fail ? 502 : 200);
      const result = await response.json();
      assert.equal(result.accepted, !fail);
      if (fail) {
        assert.equal(result.partial, true);
        assert.match(result.error, /Some emails were accepted/);
      }
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  }
});
test("email only and optional field validation", () => {
  assert.equal(validate({ email: "student@example.com" }).name, "");
  for (const input of [
    { email: "bad" },
    { email: "a@example.com\r\nBcc:x@y.com" },
    { email: "a@example.com", name: 123 },
    { email: "a@example.com", interests: "x".repeat(2001) },
  ])
    assert.throws(() => validate(input));
  const batch = messages(
    validate({ email: "student@example.com" }),
    "Program <info@example.com>",
    "https://ufinbrazil.mixed.group",
  );
  assert.deepEqual(
    batch.map((m) => m.to[0]),
    [
      "student@example.com",
      "agomesdesiqueira@ufl.edu",
      "alexandre.g.siqueira@gmail.com",
    ],
  );
  assert.match(
    batch[0].text,
    /https:\/\/ufinbrazil.mixed.group\/assets\/program-guide.pdf/,
  );
});
test("provider acceptance, failures and private files", async () => {
  for (const [result, status] of [
    [
      { ok: true, data: { data: [{ id: "a" }, { id: "b" }, { id: "c" }] } },
      200,
    ],
    [{ ok: true, data: { data: [{ id: "a" }] } }, 502],
    [{ ok: false, data: { message: "rejected" } }, 502],
    [null, 502],
  ]) {
    const server = createServer({
      env: { RESEND_API_KEY: "test-only", SIGNUP_FROM: "info@example.com" },
      transport: async (_url, options) => {
        assert.equal(JSON.parse(options.body).length, 3);
        if (!result) throw new Error("timeout");
        return { ok: result.ok, json: async () => result.data };
      },
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
      const response = await fetch(base + "/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "student@example.com" }),
      });
      assert.equal(response.status, status);
      assert.equal((await response.json()).accepted, status === 200);
      assert.equal((await fetch(base + "/server.cjs")).status, 404);
      assert.equal((await fetch(base + "/.env")).status, 404);
      assert.equal(
        (await fetch(base + "/assets/program-guide.pdf")).status,
        200,
      );
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  }
});
test("missing configuration never accepts a request", async () => {
  const server = createServer({ env: {} });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const response = await fetch(
      `http://127.0.0.1:${server.address().port}/api/signup`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "student@example.com" }),
      },
    );
    assert.equal(response.status, 503);
    assert.equal((await response.json()).accepted, false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
