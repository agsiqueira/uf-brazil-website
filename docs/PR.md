## Change

The previous recruitment page delayed the opening image on phones, repeated the all-majors invitation, and directed every main action to application. This revision presents nine concise sections: opening, outcomes, project/roles, book participation, research/industry, Ayush's portrait feature, coastal life/value, World Cup host-city experience, and practical details/signup.

Preserves the opening image, cleared coastal photographs with attribution, official application link, useful cultural resources, keyboard disclosures, skip link, and reduced motion. Includes the approved Ford and English-language context naming Dr. Alexandre Siqueira's Summer 2026 course, full-stay hostel coverage, visible prices, UNESCO/SVR 2025 context, and stronger book recognition. Two visible previews now load embedded players on click so students can watch in place; fallback YouTube links remain. Opening/closing QR codes point to the main website. The book spread is explicitly labeled concept artwork.

The separate signup page requires only email. It stays disabled until a service is configured; success requires HTTP success plus an explicit `accepted: true` acknowledgement. The forthcoming guide has hidden configuration hooks, with no dead download links.

Alex's supplied author-credit book mockup now replaces the initial sample spread, with a concept-cover caption and accessible description. The website mockup dependency is fulfilled.

## Validation

The supplied high-resolution `Students project stories onto Pelourinho.png` replaces the PDF-extracted opening asset. Desktop now gives the image roughly two-thirds of the hero width (about 850px at a 1440px viewport), with compact copy alongside it. The complete scene and concept caption remain visible; phone reading order is preserved.

The opening now uses the approved AI-generated immersive-project scene from the latest guide, with the exact concept caption. Desktop and mobile show the full scene without trimming students, projections, or prototypes. The original photograph appears as authentic Pelourinho destination imagery in coastal life and remains on the signup page.

- `npm run check` in Chromium-based Edge: 1440px desktop, 820px tablet, 390px and 320px phones; signup desktop/phone.
- No horizontal overflow, missing internal anchors, unloaded images, or automated WCAG A/AA axe violations in checked layouts.
- Opening photograph enters the first phone screen; book appears in the first half of the page.
- Keyboard skip link/disclosures and reduced motion verified.
- Click-to-load player creation, keyboard activation, unchanged page URL, titled iframes, fallback links, and stable player dimensions verified. No YouTube player is loaded before activation. Player creation checks use local iframe fixtures; real playback is separately checked where accessible.
- Both real embedded videos were manually verified in the in-app browser on the local preview: SENAI playback showed changing scenes/captions, and Salvador playback showed elapsed time and the Pause control. Both remained on the program page.
- Email-only validation and accepted/rejected/ambiguous-200/network-failure flows verified using local fixtures, without real mail.
- Guide and approved-book visual integration hooks verified using local fixtures.
- `git diff --check`; dependency audit found no vulnerabilities during installation.
- Docker build and production email delivery were not tested.

## Screenshots

Added the supplied Ayush portrait and factual introduction/credentials after research, before coastal life. The neutral headline is "Meet Dr. Ayush Bhargava." No unapproved first-person headline, script, or quote is public. A signup CTA is present. The configurable recording slot remains hidden until approval plus video/captions/transcript are supplied; fixture tests cover gating and click-to-play controls, not recording playback. Portrait proportions and mobile headline/portrait/introduction/credentials/action order are preserved.

![Desktop Ayush feature](https://raw.githubusercontent.com/agsiqueira/uf-brazil-website/codex/recruitment-seven-section/docs/screenshots/desktop-ayush.png)
![Phone Ayush feature](https://raw.githubusercontent.com/agsiqueira/uf-brazil-website/codex/recruitment-seven-section/docs/screenshots/phone-ayush.png)

Added the director-confirmed availability snapshot (12 places, October 3, 2026) at both opening and closing, maintained in one editable configuration and never reduced by information signups. Added a brief image-led World Cup host-city feature after coastal life with the supplied AI stadium illustration, FIFA schedule link, tournament dates, and ticket/program qualification. This extends the page to eight sections. Tests cover shared availability rendering, editable count/date, signup independence, feature order, and uncropped stadium imagery.

![Desktop World Cup feature](https://raw.githubusercontent.com/agsiqueira/uf-brazil-website/codex/recruitment-seven-section/docs/screenshots/desktop-world-cup.png)
![Phone World Cup feature](https://raw.githubusercontent.com/agsiqueira/uf-brazil-website/codex/recruitment-seven-section/docs/screenshots/phone-world-cup.png)

Latest refinement adds the supplied project concept image, preserves natural coastal image proportions, combines housing, moves inclusions beside fees and courses into Academics, and consolidates research evidence/English support without increasing page text. Responsive crop/order assertions pass. Real HTTP playback in Edge was verified through advancing clocks and successful media responses with the correct Referer; Error 153 was not reproduced. The in-app browser also played both videos. The older public HTTPS page has no click-to-load players, so this PR's deployed HTTPS playback remains unverified. Request/header/context evidence is in `docs/video-verification.json`; see release notes for diagnosis and follow-up.

![Desktop project](https://raw.githubusercontent.com/agsiqueira/uf-brazil-website/codex/recruitment-seven-section/docs/screenshots/desktop-project.png)
![Phone project](https://raw.githubusercontent.com/agsiqueira/uf-brazil-website/codex/recruitment-seven-section/docs/screenshots/phone-project.png)
![Desktop coastal crops](https://raw.githubusercontent.com/agsiqueira/uf-brazil-website/codex/recruitment-seven-section/docs/screenshots/desktop-coast.png)
![Desktop research](https://raw.githubusercontent.com/agsiqueira/uf-brazil-website/codex/recruitment-seven-section/docs/screenshots/desktop-research.png)
![Phone practical details](https://raw.githubusercontent.com/agsiqueira/uf-brazil-website/codex/recruitment-seven-section/docs/screenshots/phone-practical.png)

![Desktop opening](https://raw.githubusercontent.com/agsiqueira/uf-brazil-website/codex/recruitment-seven-section/docs/screenshots/desktop-opening.png)
![Phone opening](https://raw.githubusercontent.com/agsiqueira/uf-brazil-website/codex/recruitment-seven-section/docs/screenshots/phone-opening.png)
![Tablet book feature](https://raw.githubusercontent.com/agsiqueira/uf-brazil-website/codex/recruitment-seven-section/docs/screenshots/tablet-book.png)
![Phone signup](https://raw.githubusercontent.com/agsiqueira/uf-brazil-website/codex/recruitment-seven-section/docs/screenshots/signup-phone.png)

Full responsive captures and machine-readable results are in `docs/screenshots/` and `docs/checks.json`.

## Release Dependencies

Keep this PR unmerged and undeployed. Configure an approved signup service and email provider; supply the approved program guide. The supplied book mockup is integrated as a concept cover preview. Align the official brochure's accommodation-inclusions wording with the approved full-stay housing commitment. See [release notes](https://github.com/agsiqueira/uf-brazil-website/blob/codex/recruitment-seven-section/docs/RELEASE.md) for configuration, acceptance contract, content provenance, and verification limits.
