# UF in Brazil program website

A static, mobile-friendly site for **UF in Brazil - Cross-Cultural Engineering and Immersive Technologies for Industry 5.0**.

## Run locally

From this directory, run `python3 -m http.server 8080`, then open `http://localhost:8080`.

## Deploy with Coolify

1. Push this directory as the root of a GitHub repository.
2. In the existing **UF-Brazil Website / production** environment, add an **Application** from the GitHub repository.
3. Select the `main` branch, choose **Dockerfile** as the build pack, and keep port **80**.
4. Set the application's domain to `https://uf-brazil.mixed.group`, deploy, and follow Coolify's displayed DNS instructions at your domain provider.

No environment variables or backend service are needed. The application button goes to UF Abroad's official program brochure.

## Content updates

- The page follows the Pelourinho project, interdisciplinary roles, life in Bahia, academics, and application details. Keep the invitation to all majors and the no-prior-VR-experience message visible in the hero and project section.
- Project themes and formats are possibilities to develop with Brazilian collaborators, not confirmed exhibits. Keep that distinction when updating copy.
- Practical details were checked against the live [UF Abroad brochure](https://ufabroad.internationalcenter.ufl.edu/_portal/tds-program-brochure?programid=14652) on September 27, 2026. The brochure remains the source of current terms.
- The [Digital e Criativo campus page](https://senaicimatec.com.br/sobre-o-senai-cimatec/nossos-campi/cimatec-digital/) describes the partner's location and areas of work. SVR 2025's official [conference sponsorship prospectus](https://sibgrapi.sbc.org.br/2025/wp-content/uploads/2025/02/SVR-SIBGRAPI-SBGAMES-2025_Sponsorship-Proposal_English.pdf) identifies SENAI CIMATEC as the venue.
- The `#enter-salvador` section links to the first Marble concept world. Check the link and loading behavior periodically and retain an accessible text description.
- Add approved footage and Ingrid Winkler's invitation when available.
- Verify the exact housing and partner site captions before publishing photos as documentary representations of those places.
- Check program fee and deadline against the official UF Abroad brochure whenever they change.

## Praia do Forte images

- `assets/praia-do-forte-lighthouse.jpg`: Tatiana Azeviche / Setur (Turismo Bahia), [source](https://commons.wikimedia.org/wiki/File:Praia_do_Forte._Foto_Tatiana_Azeviche_Setur_(8577174259).jpg), [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/). Resized from the original to 1280 px wide.
- `assets/praia-do-forte-village.jpg`: Glauco Umbelino, [source](https://commons.wikimedia.org/wiki/File:Praia_do_Forte-BA.jpg), [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/).

Attribution and license links also appear in the site footer. These photographs show Praia do Forte; they do not depict the program hostel.

The hero reuses the repository's `Colorful street scene of Salvador, Brazil.jpg`, also shown in the official UF Abroad brochure. It depicts Pelourinho, not a completed project exhibit or the partner's facilities.

## Checking the page

There is no build step or JavaScript dependency. Serve the site locally and check the hero, project, courses, and practical details at desktop, tablet, and phone widths. Navigation, application links, and native disclosure controls work without JavaScript. Verify that disclosures also work with the keyboard and that narrow layouts do not scroll horizontally. Honor the system's reduced-motion preference when changing animation.
