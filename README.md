# Velvet Nikah Invitation

A digital wedding invitation built with React + Vite.

## Run it

```bash
npm install
npm run dev
```

## Make it yours

Everything is in **`src/config.js`**: names, parents, dates, venues, program, events, dress-code colours, RSVP number and closing text.

- **Photos**: put them in `public/photos/` and set `src: '/photos/1.jpg'` on each `story` item. Portrait photos (3:4) look best in the arch frames.
- **Music**: add `public/music.mp3`. It starts when the guest taps the seal. If there's no file, the music button doesn't show.
- **RSVP**: set `rsvp.whatsapp` to the number that should receive replies (country code + number, digits only, e.g. `919876543210`). Set it to `''` to hide the RSVP section.
- **Personal links**: add `?to=Name` to the link to greet each guest by name, e.g.
  `https://your-site.netlify.app/?to=The%20Khan%20Family`
- **Link preview**: add a 1200×630 `public/og.jpg` and edit the `og:` tags in `index.html` so WhatsApp shows a nice preview card.

## Textures

All the realistic textures in `public/assets/` (velvet curtains, tied-back drapes, gold leaf, paper, embossed jaali card, wax seal) were rendered with the Python scripts in `tools/textures/`, so they're original and free to use. To re-render (needs `numpy`, `scipy`, `pillow`):

```bash
cd tools/textures && mkdir -p out && python curtain.py out && python drape.py out && python surfaces.py out
```

Then copy the files from `out/` into `public/assets/`. The gold filigree ornaments are SVG masks in `public/assets/ornaments/`.

## Photo credits

The roses in `public/assets/flowers/` are cut out of two photos used under the free [Unsplash License](https://unsplash.com/license) (no attribution required, credited with thanks):

- Red roses on black, by Cody Chan: https://unsplash.com/photos/red-roses-OsHqxjVV0HE
- Red rose on white background, by engin akyurt: https://unsplash.com/photos/red-rose-on-white-background-5y7_BMelZsY

`tools/textures/cutout.py` turns the original photos into the transparent rose sprites.

## Publish

```bash
npm run build
```

Upload the `dist/` folder to Netlify (drag and drop at app.netlify.com/drop), Vercel or GitHub Pages.
