# Super Elly: Bakery Monsters, Level 1

Routes: `/superelly` and `/superelly/bakery-monsters`. Phaser + TypeScript with portrait iPhone controls.

Elly moves within the illustrated floor and throws traveling cookies using Cookie (keyboard F). Action breaks crates or performs an acrobatic attack. Crates drop donuts, hash browns, or waffles that restore one heart. Full-health snacks remain available.

Hyper Front Walkover pulls in a nearby monster, plants into a front walkover, holds an inverted helicopter kick, then completes the walkover. Each activation chooses 35–55 hits, inclusive, and counts actual hit events. Entry and finish frame the multi-hit phase. Total boss damage is 16 regardless of hit count. No oval aura or flashlight beam is rendered. Ollie’s future flashlight attack is not implemented.

All monsters can throw eggs, milk, cheese, or peanuts. Telegraphs announce EGG ALLERGY!, DAIRY ALLERGY!, or NUT ALLERGY! before a projectile launches. Ordinary monsters have slower projectiles and longer cooldowns than the boss.

Boss defeat starts a wordless animated repair scene: Elly walks to the machine, stops it, straightens the conveyor, restarts it, and delivers cookies to the display. Level-complete controls appear after the sequence. No educational message or comparison cards remain.

`node scripts/test-superelly.cjs` verifies movement, healing, traveling cookie damage, allergens and warning timing, combo endpoint counts, and a complete input-driven level run. `npm run build` checks production compilation and TypeScript. Physical iPhone touch feel and visual animation quality require device review.
