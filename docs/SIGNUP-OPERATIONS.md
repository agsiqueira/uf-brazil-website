# Signup delivery

Gmail uses one pooled SMTP connection to avoid three simultaneous authentication attempts. The browser waits up to 60 seconds for acknowledgement. Partial acceptance returns `accepted: false`, `partial: true`, and a specific message advising recipients who already received information to contact the director. SMTP failure logs include message index (0 student, 1 UF, 2 Gmail), sanitized error code, response code, and elapsed time; no raw provider error or credentials are logged.

## Gmail (selected sender)

Set `SMTP_USER=alexandre.g.siqueira@gmail.com` and `SMTP_PASSWORD` to a Google app password in Coolify runtime variables. Alex must create and enter this secret himself; do not use the normal Google password. The account needs 2-Step Verification and app-password eligibility. The server uses `smtp.gmail.com:465` with TLS and sends from that Gmail address. Gmail takes priority over Resend when both SMTP variables are supplied. Each of the three messages must be accepted by SMTP before success is returned. Partial acceptance returns failure and logs the accepted count; retries can duplicate already accepted messages. No automatic retries or subscription are performed.

The Dockerfile serves public files and `/api/signup` using Node on port 80. Only email is required. No student data is persisted locally. The endpoint returns `accepted: true` only after Resend acknowledges three message IDs: the student information email and separate notifications to both director addresses. This means provider acceptance, not inbox receipt. Errors and timeouts return failure and preserve form fields; an ambiguous timeout can still have sent mail, so retries may duplicate messages.

Set these runtime variables in the UF-Brazil Coolify application (never frontend files or build arguments):

- `RESEND_API_KEY`: a Resend key allowed to send from the verified domain.
- `SIGNUP_FROM`: an approved sender on that domain, e.g. `UF in Brazil <program@your-verified-domain>`.
- `PUBLIC_ORIGIN`: `https://ufinbrazil.mixed.group` (also the default).

Alex must supply a verified sending domain/sender and the API key, with provider-required DNS records completed. Resend is the prepared transport, not an existing configured service. If an existing SMTP/provider service is preferred, supply its host, port, TLS mode, authentication secret, and approved sender so the transport can be adapted.

Missing credentials return HTTP 503 and `accepted: false`. Provider rejection, incomplete acknowledgement, malformed response or timeout return HTTP 502 and `accepted: false`. Logs contain request IDs and provider message IDs, not email addresses or credentials. In-memory rate limiting is conservative behind a reverse proxy (10 requests per socket address per minute); configure additional edge abuse protection if volume requires it.

Run `node --test scripts/signup.test.cjs` for simulated-provider regression checks. These do not prove real delivery. After deploying, submit email-only and optional-field requests with a controlled student inbox; check the guide link and actual receipt in that inbox and both director inboxes. Record commit, request IDs, provider IDs, and receipt evidence. Do not claim completion until all three inboxes are verified.
