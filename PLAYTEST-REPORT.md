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
