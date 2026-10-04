# UF in Brazil recruitment website

A static seven-section recruitment page and information signup page for **UF in Brazil - Cross-Cultural Engineering and Immersive Technologies for Industry 5.0**.

## Preview

Install development tools with `npm ci`, then run `npm run preview` and open http://127.0.0.1:8081. For a dependency-free preview, `python -m http.server 8081 --bind 127.0.0.1` also works.

The public site has no build step or runtime npm dependencies. HTML, CSS, JavaScript, and assets are served directly by nginx. npm packages are development-only tools for formatting, QR generation, and browser checks.

## Configuration and release

Public integration settings are in `site-config.js`. Signup stays unavailable until an approved acceptance endpoint is configured. Program guide links stay hidden until the approved PDF exists. Book visual settings replace the clearly labeled concept spread when final artwork is supplied. Never place credentials in public configuration or display signup success without service acceptance.

See [release dependencies and email setup](docs/RELEASE.md) before merging or deploying. This implementation is for PR review; it must not be deployed yet.

## Content and assets

Keep the approved sequence: opening, outcomes, project/roles, book, research/industry, coastal life/value, practical details/signup. Alex owns commitments and final messaging. The current copy includes the approved lasting exhibits, portfolio, language support, and full-stay housing commitments. Formats and role examples remain possibilities to develop with Brazilian collaborators.

The opening uses `assets/pelourinho-immersive-concept.png`, the approved AI-generated project visualization extracted from the latest program guide. Its caption identifies it as a concept inspired by Pelourinho. The original `Colorful street scene of Salvador, Brazil.jpg` is retained in destination content and the signup page and also appears in the official UF brochure. It depicts Pelourinho, not a student exhibit or partner facility.

- `assets/praia-do-forte-lighthouse.jpg`: Tatiana Azeviche / Setur, [source](<https://commons.wikimedia.org/wiki/File:Praia_do_Forte._Foto_Tatiana_Azeviche_Setur_(8577174259).jpg>), [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/), resized to 1280px.
- `assets/praia-do-forte-village.jpg`: Glauco Umbelino, [source](https://commons.wikimedia.org/wiki/File:Praia_do_Forte-BA.jpg), [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/).

Both attributions are visible in the footer. These images show the village, not the hostel. Other existing assets are retained in the repository but are not newly used without rights verification.

`assets/signup-qr.png` encodes `https://uf-brazil.mixed.group/`; regenerate with `node scripts/generate-qr.cjs` if that public destination changes. Opening and closing QR codes point to the main website and supplement clickable links.

## Checks

Run `npx playwright install chromium`, then `npm run check`. Windows can use installed Edge with `$env:PLAYWRIGHT_CHANNEL='msedge'; npm run check`. The script starts and stops its own isolated local server. Screenshots and results are written under `docs/` and are excluded from the production Docker image.

Run `npm run format` for formatting. The check suite verifies responsive layouts, automated accessibility, keyboard/reduced-motion behavior, and honest signup acknowledgement handling. No real email is sent in tests.

## Existing deployment

The existing Coolify production application uses the repository's `main` branch, the Dockerfile build pack, port 80, and `https://uf-brazil.mixed.group`. The Dockerfile copies only public site files and assets. Changes in this review branch must not be merged or deployed until authorized.
