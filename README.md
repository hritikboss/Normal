# Birthday Website for Prachi

React + Vite, no other dependencies.

## Run locally
```
npm install
npm run dev
```

## Put it online (to send the link)
```
npm run build
```
Upload the generated `dist/` folder to any static host (Netlify Drop, Vercel, GitHub Pages). Paths are relative, so it works anywhere.

## Customise
- **Photos:** copy 8 images into `public/photos/` named `memory-01` ... `memory-08` (`.jpg`, `.jpeg`, `.png` or `.webp`). Captions: `CAPTIONS` in `src/App.jsx`.
- **Cartoon:** `public/hritik-cartoon.png` (set in `CUSTOM_AVATAR`, `src/App.jsx`).
- **Songs:** `public/audio/fun-background.wav` (background) and `public/audio/tum-jiyo-hazaron-saal.mp3` (celebration song). Use audio you have the right to use. If the song file is missing, the player says so and offers a file picker.
- **Letter:** the `LETTER` array in `src/App.jsx`.

Silent mode never plays audio on its own. Respects `prefers-reduced-motion`.
