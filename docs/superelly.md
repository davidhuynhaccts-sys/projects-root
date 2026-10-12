# Super Elly: Bakery Monsters, Level 1

Routes: `/superelly` and `/superelly/bakery-monsters`. Phaser + TypeScript, portrait iPhone layout and scoped Home Screen support. No new backend. Only Level 1.

## Controls and combat
Four-way movement stays in the bottom 16% of the illustrated room, with feet grounded on the floor. Jump is separate. Hold Flashlight for ranged attacks; Action randomly cartwheels, rolls or bridges. Five hearts with brief damage protection.

Special requires full charge and an active monster within 520 world units. It pulls the closest target into a four-second, 40-hit gymnastics blitz. Front walkover, back walkover and aerial cartwheel sequences cycle sprite poses, rotations and airborne arcs with pastel trails. The live counter counts actual hits. Small monsters stay in the combo until the finisher; a boss receives 16 total damage. Elly is protected throughout the move.

Crates take two flashlight hits or one Action and drop a donut, hash brown or waffle. Walk over a snack to recover one heart. At five hearts snacks remain available. Broken crates stop blocking movement. Cookie collection charges Special as before.

## Level ending
No mid-level questions or pauses. Defeating the boss automatically ends the level after any active combo completes. The ending explains unnecessary transportation waste and compares a tangled route with a short kitchen-to-display route. Best cookie score is saved locally. Replay starts fresh.

Four distinct watercolor rooms, vertical monsters, knockback, and randomized egg/milk/cheese boss projectiles remain. Original music and ten effects start through the Play gesture; a mute/retry control is available.

## Verification
`node scripts/test-superelly.cjs` checks floor bounds at four heights, movement/jumping, acrobatics, healing, all snack types, full-health pickup preservation, all boss projectiles, 40 real hits, boss damage, loss/reset and an input-driven full level run to the ending. `npm run build` checks Next.js production compilation and TypeScript.

Physical iPhone performance and simultaneous touch feel require device testing.
