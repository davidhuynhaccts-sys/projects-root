# Super Elly: Bakery Monsters, Levels 1–3

Routes: `/superelly` and `/superelly/bakery-monsters`. Phaser + TypeScript with portrait iPhone controls.

Level 2 is directly accessible at `/superelly/bakery-monsters?level=2`, through the level picker, or after the Level 1 ending. Its source story is the storage-room encounter in the April 4, 2022 book draft: a monster buys excess ingredients, which crowd the room and get old. Gameplay adapts this with four storage-themed rooms, nine breakable crates, eight regular monsters and a 32-health inventory boss throwing paired allergen projectiles. The wordless ending stops incoming deliveries, removes excess boxes, organizes remaining stock, and fills the freed space with cookies. The boss uses the existing pink monster illustration enlarged; no new book character design is claimed.

Level 3 is directly accessible at `/superelly/bakery-monsters?level=3`, through the level picker, or after the Level 2 ending. Its source story is the kitchen motion-waste encounter: tools and ingredients are scattered in different areas, making Jaylean run around and get tired. The four-room kitchen/prep route has eight breakable obstacles, eight regular monsters, and a 30-health Motion Monster boss. The wordless ending shows Elly gathering tools and ingredients onto labeled storage spots near Jaylean's workbench, while the monster spins away.

Each level starts with five hearts, zero cookies and zero charge. Scores are stored separately. Switching levels destroys the prior Phaser/audio session. Level 1 behavior is preserved. Levels 2 and 3 tests cover three seeded input-driven completions each, using ranged attacks, Action, dodges, and Special, plus model reset and layout bounds.

Elly moves within the illustrated floor and throws traveling cookies using Cookie (keyboard F). Action breaks crates or performs an acrobatic attack. Crates drop donuts, hash browns, or waffles that restore one heart. Full-health snacks remain available.

Hyper Front Walkover pulls in a nearby monster, plants into a front walkover, holds an inverted helicopter kick, then completes the walkover. Each activation chooses 35–55 hits, inclusive, and counts actual hit events. Entry and finish frame the multi-hit phase. Total boss damage is 16 regardless of hit count. No oval aura or flashlight beam is rendered. Ollie’s future flashlight attack is not implemented.

All monsters can throw eggs, milk, cheese, or peanuts. Telegraphs announce EGG ALLERGY!, DAIRY ALLERGY!, or NUT ALLERGY! before a projectile launches. Ordinary monsters have slower projectiles and longer cooldowns than the boss.

Boss defeat starts a wordless animated repair scene: Elly walks to the machine, stops it, straightens the conveyor, restarts it, and delivers cookies to the display. Level-complete controls appear after the sequence. No educational message or comparison cards remain.

`node scripts/test-superelly.cjs` verifies movement, healing, traveling cookie damage, allergens and warning timing, combo endpoint counts, and a complete input-driven level run. `npm run build` checks production compilation and TypeScript. Physical iPhone touch feel and visual animation quality require device review.
