# Coherence Tech site

One-page showcase for **Coherence Tech**: the brand film, how we think, our work (ParaIQ) and the ParaIQ product deck.
A plain static site (HTML, CSS, JavaScript). No build step, nothing to install.

## Structure

```
index.html               Page markup
assets/css/styles.css    All styles (colours are at the top)
assets/js/main.js        Hero ring animation, reveals, deck viewer, copy button
assets/video/            coherence-film.mp4 (compressed) and poster.jpg
assets/deck/             slide-01.jpg ... slide-18.jpg and ParaIQ-Product-Deck.pdf
vercel.json              Vercel settings (headers and caching)
```

## Run locally

```
python -m http.server 8080
```

Open http://localhost:8080.

## Deploy (GitHub, then Vercel)

1. Push this folder to a new GitHub repository.
2. In Vercel: **Add New, Project**, import the repository, framework preset **Other**, then **Deploy**.
3. Every push to the main branch goes live on its own. A custom domain can be added later under **Settings, Domains**.

## Common edits

- **Film:** replace `assets/video/coherence-film.mp4` (and `poster.jpg`) keeping the names.
  Compress long videos first (about 6 MB for 2.5 minutes works well on phones).
- **Deck:** the viewer shows `slide-01.jpg` to `slide-18.jpg`. For a deck with a different number of slides,
  export new images with the same naming and change `var N=18` in `assets/js/main.js` and the "eighteen slides" heading.
  Update the PDF in `assets/deck/` for the Download button.
- **Contact address:** search for `paraiq.app@gmail.com` in `index.html`.
- **Colours:** the three brand lights are `--blue`, `--orange` and `--gold` at the top of `assets/css/styles.css`.
- **More products or case studies:** copy the `<article class="proj">` block in `index.html`.

## Before going public

- Make sure you have the rights to everything shown in the film (footage, music, voice).
- Replace the contact email with a Coherence Tech address when you have one.
