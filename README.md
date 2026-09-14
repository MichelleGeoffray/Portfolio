# Michelle Geoffray — Portfolio

A static site: `index.html`, `styles.css`, `script.js`. No build step, no dependencies — it runs as-is.

## Before you publish

1. **Add your résumé.** Drop a PDF at `assets/resume.pdf` (the "Résumé" button and download links already point there).
2. **Fill in the internship date.** In `index.html`, search for `<p class="exp-entry__date">2025</p>` under the Experience section and set the real start/end (e.g. "Jun 2025 – Present").
3. **Optional: add a photo.** The design intentionally doesn't require one, but if you'd like your headshot somewhere (e.g. next to the hero bio), drop an image in `assets/` and I can wire it in — just ask.
4. **Double check the links** in the Work and Contact sections (GitHub repo URL, LinkedIn) still point where you want.

## Deploying with GitHub Pages

1. Create a new repo on GitHub (e.g. `michelle-geoffray.github.io` if you want it at the root of your GitHub Pages domain, or any name for a project site).
2. Push these three files (plus `assets/`) to the repo's default branch:
   ```
   git init
   git add .
   git commit -m "Portfolio v1"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages**, set **Source** to "Deploy from a branch," branch `main`, folder `/ (root)`. Save.
4. Your site will be live in a minute or two at `https://<your-username>.github.io/<repo-name>/` (or `https://<your-username>.github.io/` if you used the special repo name above).

## How the "wireframe → built" piece works

The switch in the header and the hero graphic are the same component in two states, toggled with one CSS class (`wf-hero` on `<body>`) — see the `WIREFRAME state` / `BUILT state` blocks in `styles.css` and `setHeroFrame()` in `script.js`. It plays once automatically on page load, and visitors can flip it manually afterward.
