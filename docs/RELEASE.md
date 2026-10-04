# Recruitment page release dependencies

This branch is for review only. Do not merge or deploy until the delivery dependency is resolved and forthcoming content has been reviewed.

## Signup and email infrastructure

The repository contains a static nginx application. No signup backend, SMTP transport, subscription storage, provider integration, or provider configuration was found. The current task environment exposes no SMTP, MAIL, RESEND, SENDGRID, or POSTMARK variable names. Production Coolify secrets and DNS settings were not accessible through this checkout and were not audited.

`signup.html` requires only email. Name, major, and interests are optional. Until a service is configured, submission stays disabled with a readable explanation and a working mailto alternative. No data is stored in browser storage and no request is sent to an unconfigured destination.

Set `signupEndpoint` in `site-config.js` only after connecting an approved HTTPS service. Prefer a same-origin `/api/signup` endpoint routed to a backend; nginx's static container alone cannot accept these requests. An external endpoint must allow CORS from `https://ufinbrazil.mixed.group` (including the JSON POST preflight). No provider secrets belong in `site-config.js`.

Request contract:

```json
{
  "email": "student@example.test",
  "name": "",
  "major": "",
  "interests": ""
}
```

Acceptance contract: a successful HTTP response with JSON `{ "accepted": true }`, returned only after the service has durably recorded the information request or the email provider has accepted it. A 200 response without that explicit acknowledgement, an error, malformed JSON, and a timeout all show failure and preserve the entered fields. Acceptance is not a claim of inbox delivery.

Delivery setup requires an approved provider or SMTP service, server-side credentials, a verified sender/domain (including provider-required SPF/DKIM records), destination/list ownership, and the approved information email. The backend must validate the email and optional field limits, prevent header injection, handle abuse/rate limits and duplicate requests, and define consent/retention and unsubscribe behavior appropriate to its mail workflow. Test provider acceptance, failure, and the actual received email before release.

## Program guide

The approved PDF is forthcoming. `programGuideUrl` is null and both download integration points remain hidden, rather than linking to a nonexistent file. Add the approved PDF under `assets/` and set its public URL when supplied. The Dockerfile already ships `assets/`. Verify it loads without signup and has the current fees, eligibility, inclusions, exclusions, dates, and contact details.

## Book imagery

Alex supplied `Updated Author Credit Book Mockup.png`, now included as `assets/book-cover-mockup.png`. The author-credit mockup replaces the earlier illustrative spread, including without JavaScript. It remains labeled as a concept cover preview; final publication design may change. `bookVisualUrl`, `bookVisualAlt`, and `bookVisualCaption` are configured for this supplied asset. Future final artwork can replace it through these settings. The website book-mockup dependency is fulfilled; final publication artwork approval remains distinct from this preview. Participation copy and the editorial qualification remain intact.

## Content provenance

- Alex's approved instructions establish lasting exhibits at SENAI locations, a guided portfolio tailored to each field, English-taught classes, the Summer 2026 mixed UF/Brazilian classroom experience, bilingual coordination, and eight weeks at Praia do Forte Hostel with private bathrooms.
- The full eight-week hostel stay is explicitly included on the page, following the approved housing/value direction. The official brochure's inclusion list still uses the narrower phrase about accommodation on scheduled excursions; its housing section describes the hostel stay separately. The official listing should be aligned with Alex's clarified full-stay wording before release. This does not reopen the approved housing facts.
- The UF Abroad brochure was inspected on October 3, 2026: dates, deadline, fees, eligibility, course titles/codes, deposit, payment timing, and remaining inclusions match the page. The brochure remains the source of current application terms.
- Ford's September 23, 2026 official article confirms its Development and Technology Center at CIMATEC Park in Camacari: https://www.fromtheroad.ford.com/br/pt/articles/2026/ford-abre-as-portas-de-seu-centro-tecnologico-na-bahia-para-a-19 . This is an ecosystem connection, not a confirmed Ford meeting or endorsement. No Ford logo is used. Visit arrangements can be added to the practical disclosure once confirmed.
- The opening uses the approved AI-generated immersive-project visualization extracted from page 1 of the latest `UF-Brazil-Program-Guide (1).pdf` supplied in Downloads (October 3, 2026). It is stored as `assets/pelourinho-immersive-concept.png`, with the requested AI-generated concept caption. The entire image is shown on desktop and mobile to retain students, projections, and prototyping; the caption sits below the image. The original Pelourinho photograph is preserved as authentic destination imagery in coastal life, as well as on the signup page. Praia do Forte lighthouse and village photo attributions and license links remain in the footer. Scenic photographs are not labeled as hostel images. Other repository photographs without documented clearance are not introduced into the new page.
- Two visible video previews load titled YouTube privacy-enhanced embedded players only when clicked. Keyboard activation works and YouTube links remain available as a fallback, including without JavaScript. Supplementary SENAI, Bahia, Ilha dos Frades, and Gainesville resources are retained. Preview images and fonts depend on external services.
- Opening and closing QR codes now point to the main website, `https://ufinbrazil.mixed.group/`.
- Pelourinho is identified as part of Salvador's UNESCO-listed Historic Centre, with the UNESCO listing linked. The SVR 2025 host reference is supported by the official SBC conference documentation and https://comissoes.sbc.org.br/ce-rv/ . Dr. Alexandre Siqueira and his Summer 2026 course are named in the English-support evidence.

## Verification

The opening asset was subsequently upgraded from the PDF extraction to Alex's supplied full-resolution `Students project stories onto Pelourinho.png` (1774 x 887). Desktop allocates approximately two-thirds of the hero to this image; the entire scene remains uncropped on every checked viewport.

Run `npm ci`, install a Playwright Chromium browser (`npx playwright install chromium`), then `npm run check`. On Windows with installed Edge, use `$env:PLAYWRIGHT_CHANNEL='msedge'; npm run check` instead.

The checks cover desktop 1440px, tablet 820px, phones 390px/320px, signup layouts, horizontal overflow, loaded images, internal anchors, seven-section order, book positioning in the first half, opening photo in the mobile first screen, keyboard skip/disclosure controls, reduced motion, and WCAG A/AA automated axe checks. Signup tests use local intercepted responses only; no real registrations or email are sent. Accepted, rejected, ambiguous-200, and network-failure cases are covered, as are email-only requirements and guide/book configuration integration.

`docs/checks.json` contains the latest result. `docs/screenshots/` contains responsive page, opening, book, and signup captures. Automated checks do not replace screen-reader or real-device testing. No production delivery was tested because no service is configured. Docker image build was not verified in this environment.

After the marketing revision, the suite was rerun and all responsive captures refreshed. Click-to-load keyboard/player creation and stable dimensions are verified with local iframe fixtures. Actual SENAI and Salvador playback was also observed in the in-app browser at the local preview, without navigating away. Third-party availability and browser autoplay settings can still affect playback. These checks are implementation evidence; they do not imply Alex independently verified accessibility or screenshots.
