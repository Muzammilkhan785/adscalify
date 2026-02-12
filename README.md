# Adscalify — Static Website (GitHub Pages Ready)

Adscalify is a high-conversion digital marketing agency website using a sci-fi/polygon visual style with a custom animated particle hero background.

This version is a **static export** of the original WordPress-themed build, prepared for direct hosting on **GitHub Pages** without changing the site appearance.

## Live Site

- Production URL: https://muzammilkhan785.github.io/adscalify/
- Repository: https://github.com/Muzammilkhan785/adscalify

## Features

- Single-page marketing layout with anchored navigation
- Custom hero particle animation (`assets/js/particles.js`)
- Responsive mobile menu
- FAQ accordion interactions
- Testimonial carousel with dot navigation
- Smooth scrolling between sections
- Scroll-triggered reveal animations
- GitHub Pages compatible file structure

## Project Structure

```text
.
├── index.html
├── 404.html
└── assets/
    ├── css/
    │   └── main.css
    ├── js/
    │   ├── main.js
    │   └── particles.js
    └── fonts/
```

## Local Development

No build step is required.

### Option 1 — VS Code Live Server
1. Open this folder in VS Code.
2. Start a local server (for example with Live Server extension).
3. Open `index.html` in the browser.

### Option 2 — Python static server
From this folder, run:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy to GitHub Pages

This project is already configured to deploy from:

- Branch: `master`
- Folder: `/` (repository root)

To redeploy after changes:

```bash
git add .
git commit -m "Update site"
git push origin master
```

## Form Handling (Important)

Because GitHub Pages is static hosting, PHP form handlers are not available.

`index.html` currently uses placeholder actions:

- Contact form: `https://formspree.io/f/your-form-id`
- Newsletter form: `https://formspree.io/f/your-form-id`

Replace `your-form-id` with your real endpoint (Formspree or another form backend).

## Fonts

- Body font is loaded via Google Fonts (`JetBrains Mono`)
- `Sentient` font-face is expected in `assets/fonts/` if you want exact typography parity:
  - `Sentient-Extralight.woff`
  - `Sentient-LightItalic.woff`

If these files are missing, fallback serif fonts are used.

## Performance Notes

The hero particle system is custom and visually dense by design.

- File: `assets/js/particles.js`
- Main control for density: `CONFIG.gridSize`

Larger values improve visual richness but can reduce FPS on low-end devices.

## Tech Stack

- HTML5
- CSS3 (custom styles, clip-path based UI)
- Vanilla JavaScript (no framework/runtime required)

## License

This project is provided as-is for portfolio and business website usage.