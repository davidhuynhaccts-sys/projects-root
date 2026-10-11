# Super Elly: Bakery Monsters, Level 1

Routes: `/superelly` (series landing page), `/superelly/bakery-monsters` (game).

Phaser 3.90 + TypeScript, lazy-loaded into the existing Next.js application. No new backend, authentication, or database. Best cookie score is stored locally. PWA scope and cache names are limited to Super Elly.

## Play

Touch: left/right, jump, hold flashlight, tap Action for a nearby attack or machine interaction, Special when its meter fills. Keyboard: arrows/A/D, Space, F, E, Q; Escape pauses.

Cross the bakery, rescue cookies, defeat the cookie-machine monster, then approach the machine and press Action. Three hearts; invulnerability briefly follows damage. Retry resets all game state. The app pauses on backgrounding.

## Art

Visual references: the supplied approved game mockup and the sketches in `Elly and the Bakery Monsters 220404(1).pdf`. Built-in image generation produced a transparent character sheet and environment, then cropped/optimized WebP assets. Elly retains the skeleton costume, ponytail, flashlight, and watercolor style. Boss follows the first machine-monster sketch, with horns, whisk, and measuring cup.

Atlas prompt: Three Elly poses (idle/run/jump), yellow/pink/blue monsters, mint whisk-and-measuring-cup boss, cookie, crate. Transparent, warm watercolor, brown outlines; match the supplied art canon.
Background prompt: Side-view bakery, peach plaster, turquoise windows, plants, pendant lights, glass pastry counter, unobstructed tiled floor. Watercolor and pastel, no UI or characters.

## Development

`npm ci`, `npm run dev`, `npm run build`. Game source: `app/superelly/bakery-monsters/game.ts`. Touch UI: `GameClient.tsx`. Art: `public/superelly/assets`.

Home Screen: open the game in iPhone Safari, Share > Add to Home Screen. A first online load is required. Offline runtime assets are cached by the scoped service worker after they have been fetched.

Only Level 1 is implemented. Other series entries on the landing page are future titles, not playable links.
