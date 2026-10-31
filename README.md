# Coherence Tech link board

This is **not a website**. It is a link board: the Coherence Tech mark (three lights that keep merging into one ring
and rising apart again, with the name held inside) and three links.
Nothing else on the page.

- **Watch the film** opens the film in a full-screen overlay.
- **ParaIQ** opens https://www.paraiq.site in a new tab.
- **Connect with us** opens a small card with the email address, an Email us button and a Copy button.

## Structure

```
index.html               The board
assets/css/styles.css    Styles (brand colours at the top)
assets/js/main.js        The ring animation and the two overlays
assets/video/            coherence-film.mp4 and poster.jpg
vercel.json              Vercel settings
```

## Common edits

- **Add or change a link:** copy one `<a class="link">` block in `index.html` (for links to other sites) and change the label and address.
- **Animation speed:** in `assets/js/main.js`, `var P=11` is the length of one cycle in seconds.
- **Contact address:** search for `paraiq.app@gmail.com` in `index.html`.
- **Film:** replace `assets/video/coherence-film.mp4` and `poster.jpg`, keeping the names.

## Run locally

```
python -m http.server 8080
```

## Deploy

Push to GitHub, then in Vercel choose **Add New, Project**, import the repository, framework preset **Other**, **Deploy**.
