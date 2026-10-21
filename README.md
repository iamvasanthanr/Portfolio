# Vasanthan R, 3D Portfolio World

A real-time **3D explorable portfolio** built with **Three.js + TypeScript + Vite**.
Walk an avatar through themed sectors (a park, a living room, an ad street, a neon lab)
and step up to the book, TV, billboard or terminal to read each project. Collect the
glowing stars as you explore.

## Why this stack

- **Three.js (WebGL)** for genuine 3D: a perspective follow-camera, soft shadows,
  distance fog, lighting, and a day/night cycle. Not a CSS fake, real depth.
- **TypeScript**, strict mode, organized as a small engine (clear module boundaries).
- **Vite** for instant dev server and an optimized production build.

## Project structure

```
game/
  index.html              entry + HUD / intro / panel markup
  src/
    main.ts               boot (with reduced-motion / no-WebGL fallback to classic)
    core/
      Game.ts             renderer, main loop, HUD + interaction wiring
      Input.ts            keyboard + mobile joystick + drag-to-look
    entities/
      Player.ts           low-poly character + third-person follow camera
      Collectibles.ts     glowing stars + pickup logic
    world/
      World.ts            scene, lights, shadows, fog, ground, 5 sectors
    ui/
      Panel.ts            the project panel
      animations.ts       the 4 signature animations (book / tv / ads / agents)
    data/
      projects.ts         single source of truth for all sector content
    styles/
      ui.css              all 2D overlay + panel styling
  public/
    resume.pdf            bundled so the Download button works standalone
    classic.html          the fallback / "classic view" page
```

## Run locally

```bash
cd game
npm install
npm run dev      # http://localhost:5173
```

## Build + preview

```bash
npm run build    # type-checks (tsc) then bundles to dist/
npm run preview  # serve the production build
```

`dist/` is a complete static site (index.html + assets + resume.pdf + classic.html).

## Deploy

**Vercel:** import the repo, set the project root to `game/`, framework **Vite**
(build `npm run build`, output `dist`). Done.

**GitHub Pages:** `npm run build`, then publish the `game/dist/` folder (e.g. via the
`gh-pages` branch or an action). `vite.config.ts` uses `base: './'` so it works from any
subpath.

## Controls

- **Move:** `W A S D` or arrow keys (mobile: on-screen joystick)
- **Look:** drag anywhere
- **Read:** walk up to a prop, press `E` (mobile: the **READ** button)
- **Close:** `Esc`
- Toggle day/night (top-right), collect all the stars

## Notes

- `src/data/projects.ts` is the only place to edit project copy and metrics.
- All content is plain-language and free of internal jargon.
- `prefers-reduced-motion` or no WebGL support redirects to `classic.html`.
- A local `.npmrc` pins the public npm registry so `three` / `vite` install anywhere.
