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

- Replace the `#enter-salvador` teaser with the approved Marble world URL once it is ready; retain an accessible fallback.
- Add approved footage and Ingrid Winkler's invitation when available.
- Verify the exact housing and partner site captions before publishing photos as documentary representations of those places.
- Check program fee and deadline against the official UF Abroad brochure whenever they change.
