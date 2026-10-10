# Chop to it! full coverage playtest — 10 October 2026

Verified release: **f519469acdc0e29c**. [Play this release](https://spacepilot121.github.io/choptoit/play/f519469acdc0e29c/index.html).

## Results

| Requirement | Verified result | Method |
| --- | --- | --- |
| Start fresh and finish the story | All six contracts, freedom ending, 80 chops, 60 hits, rank 12, 17 campaign days | Fresh isolated save, automated normal meter/aim/power selections, earned money and XP. No debug grants. |
| Hit every target | 84/84 variants | Physical projectile collisions in the shipped Phaser engine: 68 pole/royal props, 6 basket variants, 6 bird species, UFO, hot-air balloon, thrown ring and golf hole. Multi-hit, descending-only and timed props exercise their real rules. |
| Buy every workshop upgrade | Weapon 30, caravan 16, platform 25; 68 upgrade purchases | Actual workshop buttons, starting equipment at level 1, paid using gold earned during the assisted challenge run. |
| Unlock and shop in every town | 15/15 city keys and visits; 73/73 paid target options, plus 3 free starters | Actual travel, key and market buttons; no debug money or key grants in this purchase run. |
| Complete all challenges | 100/100 earned, claimed, saved and reloaded | 1,000 actual chop sequences, physical target chains, barrel blasts and bank catches. Controlled timing and target arrangements are test assistance; counters and claim flags were not set directly. |
| Inspect city graphics | All 15 cities at normal and maximum zoom | 30 rendered phone-sized screenshots inspected, alongside target attachment checks. |
| Fresh intro and phone layout | Opening completes; 320/390/430-pixel controls fit; reduced motion and failed-download retry pass | Normally rendered browser tests. |

The broad challenge/purchase run is **assisted coverage**, not a claim that a human completed all 100 challenges naturally. It uses exact timing, controlled target placements, a test sky zoom and accelerated engine frames. Its rewards come from actual gameplay events. The independent story run uses no gold, XP, city or achievement grants. The intro is tested separately before the accelerated story run skips a previously verified opening.

Your existing save was never used or modified. These are Chrome phone-layout tests, not physical iPhone/Android performance or app-store installation tests.

## Bugs fixed

| Reproduced problem | Fix | Verification |
| --- | --- | --- |
| Moving targets drift away from pole tips | Reset scripted physics displacement history after attaching a target to its visible pole. Arcade physics no longer adds the same movement again. | The original engine fixture reproduced a 57-pixel gap. All moving variants now complete with attached visuals and collision bodies; rendered height/zoom checks also pass. |
| Gentle golf drops do not register | Check golf crossings even below four pixels of movement per frame. | A physical 200-pixel/second descending head failed before the change and sinks afterward. |
| Winchester introduces itself as a York challenge | Replace the leftover city-specific hint with “Ring troupe”. | Rendered city audit exposed the old text; source and event coverage verify the corrected hint. |
| Ring/golf rewards use old oversized text | Compact silver/gold reward numbers plus “RING MASTER!” and “HOLE IN ONE!” arcade callouts. | Both events complete through real projectile crossings in the target audit. |
| Closing a menu before its queued pause is processed can strand the scene | Always queue the matching resume when closing. | The accelerated fresh run reproduced a closed journal with a paused scene before the fix; the same control path now reaches the ending. |

Royal visitors also retain their market-option identity, so their distinct variants remain identifiable during coverage.

## Remaining playability concerns

- Some persistent target arrangements take repeated attempts, especially when a timed prop obstructs a straightforward shot. Several automated runs stalled despite successful chops. The completed earned run deliberately missed after five dry launches to refresh the stage. This is a balance/readability concern, not proof that every stalled aim was a collision failure.
- Maximum zoom makes ground characters and targets very small. The extra sky is visually continuous and landmarks remain unique, but many screens still feel sparse between aerial encounters.
- Caravan upgrades are visually distinct but still mostly cosmetic in the current mobile economy. A travel/show benefit would make those purchases more compelling.
- The story finished on campaign day 17 of 360. The automated driver is unusually accurate, but the deadline currently applies little pressure along this route.
- The largest challenges demand 1,000 chops, 100 basket catches and 150 barrel hits. Completion paths work; whether that repetition is enjoyable still needs human phone playtesting.

## Reproduce and inspect

- `node scripts/campaign-engine-playtest.cjs` — fresh earned campaign to a verified ending; fails if the ending is not reached.
- `node scripts/full-target-playtest.cjs --challenges` — all 84 variants, then 100 challenges, claims and reload verification.
- `node scripts/upgrade-economy-playtest.cjs` — continue that run's earned checkpoint, purchase every upgrade/key/target and reload.
- `node scripts/visual-audit.cjs` — all fifteen cities at two zoom levels.
- `node scripts/verticality-playtest.cjs` and `node scripts/opening-playtest.cjs` — normally rendered mobile checks.
- `npm run release` — required regression suite, offline package and 82-file HTTP integrity check.

[Per-target checklist](TARGET-COVERAGE.csv) · [Structured completion evidence](PLAYTEST-COVERAGE.json). Detailed isolated saves and screenshots remain locally under `qa/`; they are excluded from the published game.

---

## Earlier playtest history

# Chop to it! playtest — 9 October 2026

## Scope and current status

Tested the game in an isolated Chrome browser at 390 × 844 with touch enabled. The player's existing save was not changed. Browser emulation checks layout and game behavior; it does not establish performance or installation behavior on a physical Android phone or iPhone.

The campaign began with fresh storage and used earned gold, normal upgrades, city keys and actual menu controls. Shot timing and aim were automated. It completed all six contracts and the **buy your freedom** ending: 140 chops, 62 target hits, rank 14, 19 campaign days, and 198,169 gold remaining after paying 1,000,001. It resumed from its own earned checkpoints while fixes were introduced, so this was not an uninterrupted run of one unchanged build. No debug gold or rank was used in this campaign. The completed run recorded no runtime exception.

An earlier broad-aim stress run completed 121 chops without a runtime exception but stalled in chapter five at 29 target hits. That run is not an ending pass. The more accurate driver and the accessible-target refill resolved the remaining test progression.

A separate, explicitly debug-assisted tour visited all 15 cities, purchased all available market targets, and bought caravan level 16 and platform level 25. That tour completed without a runtime exception. Automated engine checks also exercise all 45 special targets, baskets, bird chains, thrown rings, pole attachment, saves and offline packaging.

## Reproduced bugs and fixes

| Problem | Evidence | Fix and verification |
| --- | --- | --- |
| Chopping meter restarts during a fast launch | The one-second result timer treated cleared aim/power flags as permission to restart. | Successful shots now advance only through their next prisoner entrance. Regression checks cover successful shots, retries and three-strike escapes. |
| Two prisoners/entrance animations can overlap at startup | The hourly callback fired while the first prisoner was still entering; a later entrance completion reset an active shot. | Reserve the round during entrances. Fresh browser reproduction now has exactly one startup round and stays in GET READY during flight. |
| Traveling during a shot schedules an old-city prisoner after arrival | A browser reproduction produced two entrances and round count 3 instead of 2 in Durham. | Invalidate old round callbacks and stop old character/weapon tweens. The same reproduction now produces one entrance and round count 2. Tests also cover travel during axe wind-up. |
| Collision handlers accumulate for heads and fallen birds | Source inspection found a new persistent overlap handler for every projectile. | One shared group handler replaces per-projectile handlers. A real browser stress check creates 50 fallen birds while the handler count remains 1; ordinary corpses and settled remains cannot hit targets. |
| Contract reward is difficult to find on mobile | In the original layout the first claim button was about 2,890 pixels down an 844-pixel viewport. | Put the current contract first. The first claim button is now around 560 pixels down and visible without scrolling on the tested viewport. |
| Market and Journal overwhelm a new player | Market rendered 76 options, including unavailable stock; Journal rendered a long list of active challenges before the story. | Available city stock comes first; undiscovered cities expand on demand. Ready challenge rewards appear before a short list of ongoing challenges. All content remains accessible. |
| Workshop/travel instructions describe removed trading gameplay | Cart cards advertised cargo spaces and travel cards advertised exports/demand, while the mobile market sells targets. | Replace this copy with what caravan upgrades and the current market actually do. Existing inventory saves are preserved. |
| Thick fog or shot-changing weather can arrive before the first tutorial chops | A fresh browser screenshot started in thick fog. | The initial three-chop contract starts in clear weather. Existing weather behavior resumes afterward; snow/rain/wind/fog regression checks pass. |
| Long shows can fill every slot with timed/multi-hit props | Late London screenshots show a square entirely occupied by special props; ordinary hits cease while those props persist. | Preserve those props and replenish one ordinary bullseye if none remains. Regression checks verify one refill, no duplicate while it remains, and replenishment after collection. |

## Playability findings to investigate

- Target progress stalled for a long stretch in London in the first automated run. Its broad aiming tolerance and preference for the closest special target were confounding factors. Tighter aim/power selection progressed to chapter six, so that result does not establish a broken collision system. The ordinary-target refill also provides a route to continued scoring alongside hard props.
- Maximum combo zoom makes the executioner and targets small and exposes a lot of empty sky. It creates space, but the game is not yet using that space consistently for exciting encounters.
- Caravan upgrades currently change appearance and legacy cargo capacity. With the target shop replacing trading, the mobile player needs a clearer gameplay reason to spend money on the caravan.
- The three-tap sequence followed by entrance/wind-up/flight waits repeats often. This makes strong individual shots satisfying but can interrupt the arcade rhythm.
- The year deadline provided little pressure in the completed automated campaign: the ending arrived on day 19 of 360. Menu time is paused and this driver is more accurate than a person, so that is not a human difficulty benchmark, but the deadline currently contributes little to the story route.

## Highest-value arcade improvements

1. **Use the expanding view for escalating encounters.** Introduce short, readable formations at higher combos: rising ring ladders, diagonal target chains, powder-keg clusters and a basket finish. Mix generous targets with one tricky target so a show can recover from a difficult combination.
2. **Make successful chains reduce downtime.** A short “encore” period could bring the next prisoner in faster, brighten the stage and add a beat to the music. Keep normal play readable; reserve the wild effects for earned streaks.
3. **Make each town teach one trick.** Show a brief demonstration and give a small challenge before combining its targets with earlier mechanics. Keep the town's own targets prominent after many global purchases.
4. **Turn the market into a small loadout choice.** Keep permanent purchases, but let the player equip a handful of favorites. A barrel → bird → basket loadout is an understandable route to a spectacular combo. Buying everything should not dilute every town into the same random mixture.
5. **Show a more useful flight prediction.** The current ribbon only previews the first two-thirds of a second. A longer, weather-aware curve, clipped at the floor, would make bank shots and descending catches easier to learn.
6. **Give caravan upgrades a show-related benefit.** Consider shorter real-time journeys, a travelling attraction, or an extra loadout slot. Avoid advertising storage as a mobile benefit when cargo trading is unavailable.
7. **Give short sessions a purpose.** Offer a daily three-minute score attack with a fixed weather/target sequence, a clear personal best, and an immediate restart. The story can remain the longer progression path.

These are recommendations, not a claim that the new encounter/loadout systems have already been implemented.

## Validation limits

The full regression suite and offline build pass after the fixes. Browser checks passed at 320 × 568, 360 × 640, 390 × 844 and 430 × 932; shot buttons remain within the viewport and at least 44 pixels high. Menus preserve timing, aim and power selection. Reload during power selection preserves earned currency, city, rank and chop totals. All five weather modes render without a runtime exception. Starting a new story resets progression and clears the stored error.

The earned campaign ending is verified. Physical-device performance, App Store/Google Play installation, and subjective difficulty still need real-phone playtesting. No “bug-free” or physical-device certification is claimed.

The final web package is release `a5545002c125dd7b`: 79 packaged files with matching integrity hashes and working HTTP entry points. Publication is verified separately against the live release manifest and file contents.
