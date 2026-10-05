# Signup delivery

The Dockerfile serves public files and `/api/signup` using Node on port 80. Only email is required. No student data is persisted locally. The endpoint returns `accepted: true` only after Resend acknowledges three message IDs: the student information email and separate notifications to both director addresses. This means provider acceptance, not inbox receipt. Errors and timeouts return failure and preserve form fields; an ambiguous timeout can still have sent mail, so retries may duplicate messages.

Set these runtime variables in the UF-Brazil Coolify application (never frontend files or build arguments):

- `RESEND_API_KEY`: a Resend key allowed to send from the verified domain.
- `SIGNUP_FROM`: an approved sender on that domain, e.g. `UF in Brazil <program@your-verified-domain>`.
- `PUBLIC_ORIGIN`: `https://ufinbrazil.mixed.group` (also the default).

Alex must supply a verified sending domain/sender and the API key, with provider-required DNS records completed. Resend is the prepared transport, not an existing configured service. If an existing SMTP/provider service is preferred, supply its host, port, TLS mode, authentication secret, and approved sender so the transport can be adapted.

Missing credentials return HTTP 503 and `accepted: false`. Provider rejection, incomplete acknowledgement, malformed response or timeout return HTTP 502 and `accepted: false`. Logs contain request IDs and provider message IDs, not email addresses or credentials. In-memory rate limiting is conservative behind a reverse proxy (10 requests per socket address per minute); configure additional edge abuse protection if volume requires it.

Run `node --test scripts/signup.test.cjs` for simulated-provider regression checks. These do not prove real delivery. After deploying, submit email-only and optional-field requests with a controlled student inbox; check the guide link and actual receipt in that inbox and both director inboxes. Record commit, request IDs, provider IDs, and receipt evidence. Do not claim completion until all three inboxes are verified.
