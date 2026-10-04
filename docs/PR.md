## Change

The previous recruitment page delayed the opening image on phones, repeated the all-majors invitation, and directed every main action to application. This revision presents seven concise sections: opening, outcomes, project/roles, book participation, research/industry, coastal life/value, and practical details/signup.

Preserves the opening image, cleared coastal photographs with attribution, official application link, useful cultural resources, keyboard disclosures, skip link, and reduced motion. Includes the approved Ford and English-language context naming Dr. Alexandre Siqueira's Summer 2026 course, full-stay hostel coverage, visible prices, UNESCO/SVR 2025 context, and stronger book recognition. Two visible previews now load embedded players on click so students can watch in place; fallback YouTube links remain. Opening/closing QR codes point to the main website. The book spread is explicitly labeled concept artwork.

The separate signup page requires only email. It stays disabled until a service is configured; success requires HTTP success plus an explicit `accepted: true` acknowledgement. The forthcoming guide has hidden configuration hooks, with no dead download links.

Alex's supplied author-credit book mockup now replaces the initial sample spread, with a concept-cover caption and accessible description. The website mockup dependency is fulfilled.

## Validation

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

![Desktop opening](https://raw.githubusercontent.com/agsiqueira/uf-brazil-website/codex/recruitment-seven-section/docs/screenshots/desktop-opening.png)
![Phone opening](https://raw.githubusercontent.com/agsiqueira/uf-brazil-website/codex/recruitment-seven-section/docs/screenshots/phone-opening.png)
![Tablet book feature](https://raw.githubusercontent.com/agsiqueira/uf-brazil-website/codex/recruitment-seven-section/docs/screenshots/tablet-book.png)
![Phone signup](https://raw.githubusercontent.com/agsiqueira/uf-brazil-website/codex/recruitment-seven-section/docs/screenshots/signup-phone.png)

Full responsive captures and machine-readable results are in `docs/screenshots/` and `docs/checks.json`.

## Release Dependencies

Keep this PR unmerged and undeployed. Configure an approved signup service and email provider; supply the approved program guide. The supplied book mockup is integrated as a concept cover preview. Align the official brochure's accommodation-inclusions wording with the approved full-stay housing commitment. See [release notes](https://github.com/agsiqueira/uf-brazil-website/blob/codex/recruitment-seven-section/docs/RELEASE.md) for configuration, acceptance contract, content provenance, and verification limits.
