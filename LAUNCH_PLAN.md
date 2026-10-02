# Chop To It — launch work

Target: a polished portrait mobile game released on the web, App Store and Google Play together, retaining timing/aim/power, day/night, a running calendar, varied characters, upgrades, markets and travel. Ridiculous Fishing is a reference for satisfying arcade progression, not a visual or mechanical template to copy.

## Required before calling this near finished

- [ ] Responsive, readable mobile play and menus at 360–430px widths, small heights and desktop fallback.
- [ ] Consistent timing across refresh rates; interruption-safe pause, menus and saving.
- [ ] Cohesive refreshed environments, characters, targets, feedback and audio.
- [ ] Learnable first session with contextual instruction and meaningful first purchase.
- [x] Story integrated into progression with recurring characters, chapters and an ending.
- [ ] Balanced upgrades, rewards, trading, travel and one-year campaign; no progression dead ends.
- [ ] Reliable save migration, recovery, full state restoration and new-game flow.
- [ ] Offline installation, loading/error states and phone lifecycle handling.
- [ ] Browser playtests of full round, purchases, travel, save/resume, campaign and ending.
- [ ] Launch packaging/documentation; real-device iOS/Android validation remains distinct from viewport emulation.

## Current work

As of 20 September, all fifteen towns have illustrated backgrounds. The executioner, main cast, jesters and ring-event guards use updated artwork. The mobile HUD, pause-safe menus, six contracts, endings, trade routes, upgrades, local save recovery, audio, install affordance and offline package are implemented. All work remains local; the public site is unchanged.

Latest exported build: `83239100c0da62ba`, 66 upload files, 15.8 MB. The full automated release pipeline passes, including serving every file from the isolated export, and both native projects contain this release. The preceding release's Android debug app and iOS simulator app compiled in GitHub Actions. Neither has been installed or tested on a physical phone yet. Earlier entries below are historical evidence and may describe superseded artwork, file counts or behaviour.

### Android navigation — 2 October

Back closes a menu or returns from a guide/backup page to the ledger. During play it pauses and saves; a second Back from the pause screen saves again and minimizes the app with sound suspended. Startup, town downloads and save-conflict recovery consume Back without leaving those operations. Closing a menu by keyboard also respects an in-progress town download. Focused tests cover game navigation and the native event bridge; hardware Back and gesture navigation still need physical Android validation.

### Scenery polish — 2 October

Replaced clipped circular clouds with feathered canvas wisps shared by gameplay and travel. Clouds stay in the upper sky and use lower opacity to keep the painted towns, characters and targets readable. Inspected the fresh packaged game at 390×844 through dawn and night; the calendar, moon, stars and targets remained visible, and no browser warnings or errors were captured. The complete release and native-copy checks pass. Live special-target hits and real-phone playtests remain open.

### Remaining launch gates, in priority order

1. Finish live ring/bird hits. Fog rendering has been inspected in ordinary daytime and night rounds of release `83239100c0da62ba`; mist edges are soft and fading targets remain readable. A starter crow is visibly below the HUD, and full-path checks show bird crossings pay the correct reward. York's ring now has a reachable arc even in the worst allowed wind, and the updated event is visible in the packaged browser build. A live ring or bird hit has not yet been landed by hand; physical touch performance remains unverified.
2. [Completed in desktop browser] A clean save earned all six contracts and the reform ending without imported progress. The final chop requirement was reduced from 100 to 50 after play revealed an unproductive stretch. Repeat on a real phone to judge feel and pacing.
3. [Completed in desktop browser] The current compact package installed its offline cache, travelled to a town image not loaded in the page with the server stopped, and reopened in that town offline. A preceding package also accepted an offline shot and retained the reward after reload. Repeat installation, offline travel/trading and storage-pressure checks on real phones.
4. Test real iPhone and Android touch controls, sound, app switching, safe areas, short screens and home-screen installation. Desktop viewport checks are not sufficient evidence.
5. Weapon, cart and bird artwork have been replaced. Inspect the remaining weapon grips in motion and birds during actual target collisions; isolated artwork previews do not prove gameplay readability.
6. Build and test signed Android and iOS candidates from the same release. Check native save sharing/restoration, app switching, launch screens, icons and all core play paths. Confirm the final package ID, signing and store accounts; the current `io.github.spacepilot121.choptoit` ID is provisional.
7. Publish the web build and submit both stores as one coordinated launch after the intended release is reviewed. Keep a recoverable previous web build and verify the live site, saved progress and update behaviour after deployment. Store review dates may differ.

## Native app packaging (28 September)

Capacitor 8 projects under `android/` and `ios/` package the exact verified web release through `npm run native:sync`. Both are portrait. Android targets API 36. The generated platform icons and splash screens use the existing axe emblem. Native apps skip browser installation/service-worker messaging because their game files are bundled; app switching calls the existing pause/save path. The Journal shares save backups as JSON files through the native share sheet and can open a JSON backup for restoration. `npm run native:check` verifies the copied game assets, native bridge and basic platform settings. No signed build, store review or real-phone test has been claimed. See `NATIVE_RELEASE.md`.

## Evidence so far (11 September)

- `node scripts/check.cjs`: scripts parse, timing agrees at 30/60/90/120/144 Hz, reflected overshoot stays within bounds, legacy saves validate, corrupt/non-finite saves reject, backup recovery and clearing pass.
- Campaign unit checks: six sequential claims, no duplicate payouts, contract totals can fund the stated goal, guarded ending choice, save roundtrip and 360-day deadline.
- Browser: new HUD and opening inspected at 390×844; complete timing/aim/power shot played; workshop opened during aim and closed back to aim.
- Browser: first contract paid 40 gold, advanced to chapter 2, then weapon purchase deducted 10 gold and changed level 1 / 1.00× to level 2 / 1.06×.
- Browser: new York art renders and day/night remains active. 360×640 inspection found controls obscuring the actors; stage and York backdrop moved higher. Rechecked at 360×640: actors and stage now remain above the control panel.
- Browser: refreshed executioner renders with transparency at 390×844 in Durham. Reduced weather density leaves actors and targets visible.
- Browser: invalid JSON-shaped save rejected by restore form without changing the game.
- Browser: offline package reported ready; stopped the local HTTP server, reloaded, started the cached game and resumed Durham with the same purse and rank.
- Browser: bought one potato offline (45→44 gold, stock 12→11, owned 0→1), reloaded offline, and verified the same purse, stock, inventory and full market prices. This exposed an inverted buy/sell quote, now capped in generated and restored markets to prevent infinite same-town profit.
- Browser: downloaded the updated offline release, closed/reopened the game, and verified the saved potato quote changed from buy 1 / sell 2 to buy 1 / sell 1 while preserving 44 gold, 11 stock and 1 owned. No error logs captured after this startup.
- Browser: deliberately served a 404 for the executioner image on isolated port 4174. Startup showed an actionable retry screen; game creation was halted. Restored the asset, pressed Try again, observed download progress (19%), and reached the opening story. Deliberately missing Phaser on port 4175 also produced a keyboard-accessible retry title screen. These tests bypass the offline cache on separate local origins.
- `npm run build`: unreadable primary plus unreadable backup are preserved with autosaving disabled; future-version saves reject; valid recovery backup survives importing over a corrupt primary; explicit reset works while autosaving is disabled. Market pricing checks cover discount and regional modifier inversions. Offline checks cover all 220 asset paths, cached navigation, scoped cleanup, and failed-install rollback. Package is currently 45.7 MB.

## Art pass (12 September)

- Generated and integrated distinct Oswin, Merrin and Agnes portraits into the opening, all six chapter pages, and a new journal cast page. Prompts and source paths are in `assets/ART_NOTES.md`.
- Browser: inspected the opening and all three cast portraits at 390×844. All images loaded successfully. Checked the cast page at 360×640; the title wraps and the cards scroll within the dialog.
- Browser: found and fixed retained scroll position when moving between journal pages. Verified cast page opens at scrollTop 0 after following its link from the bottom of the journal. Same-page market rerenders retain their scroll position.
- Build checks pass; offline package now includes 223 files and is 52.7 MB. Asset optimization remains required before release.

## Shot feedback pass (12 September)

- Refreshed native target drawings: coral/mint bullseyes, a crown for royal targets, wood-grain shields, banded barrels and a pale-robed monk. Existing standard target collision radii are retained.
- Chop feedback reports actual gold and streak; target feedback names the hit and reports actual fame, including multipliers. Shield blocks explain the power requirement. Added a journal target/weather guide and removed the duplicate legacy timing popup from mobile display.
- Fixed negative fame/XP from monk hits. Penalties clamp fame at zero and do not subtract XP; monks and doves no longer advance target contracts. Crow hits no longer create a second zero-fame popup.
- Focused checks prove a penalty at 1 fame leaves 0 fame and a valid save, awards no negative XP, and displays the actual 1-fame loss. Positive reward check verifies a 2× multiplier in both state and message.
- Browser: at 390×844, inspected refreshed standard rings, played a perfect chop (+10 gold / 1 streak), completed aim/power and returned to CHOP with no captured errors. Reload retained 10 gold and 1/3 chapter progress. Opened and verified Targets & tricks. Special-target collision/feedback combinations still need a broader browser playtest.

## Campaign flow verification (12 September)

- Added reproducible, staged save fixtures under `scripts/fixtures/`. Tested through the regular restore form on isolated localhost port 4176, keeping ordinary preview progress separate.
- Browser: restored 100 successful chops, 60 targets, 10 trades and the required visits/upgrades. Claimed all six contracts sequentially: 40, 400, 4,000, 30,000, 180,000 and 850,000 gold. Purse went from 1,000 to 1,065,440; each claim advanced to the next chapter and the final page offered both choices.
- Browser: freedom ending deducted 1,000,001, left 65,439, showed the epilogue and persisted after closing/reopening. Restored the final-choice fixture and verified the reform ending with the same cost and remaining purse.
- Found and fixed overdue saves with no recorded ending. Restore now sets the expired ending immediately while preserving completed success endings during later free play. Unit checks cover both cases.
- Browser: restored the 360-day fixture, automatically saw the deadline epilogue, then used the confirmed new-story flow. The new story opened in York with 0 gold and the introduction.
- These staged tests verify UI, payouts and persistence, not the difficulty or pacing of earning the goals through normal play.

## Story destination artwork and travel (13 September)

- Generated and integrated Durham, Chester and London scenery, matching York's illustrated palette and open gameplay sky. Per-city vertical offsets align painted stages with the shared actor baseline. Original destination assets remain available. Full prompts and paths are in `assets/TOWN_ART_NOTES.md`.
- Browser: inspected all three destinations at 390×844; actors stand on the stage surfaces and controls remain below the play area.
- Browser: travelled London→Durham (10 days), Durham→Chester (5 days), Chester→London (7 days). Dates moved 1→11→16→23 May and purse/rank were retained.
- Browser: bought one mead in Chester for 3 gold (1,000→997), reopened the saved game, travelled to London, and verified 1 owned. Southern goods appeared. Sold for the displayed 2 gold (997→999), ownership became 0 and market stock increased by 1. This is a state/persistence test, not a claim that every route is profitable.
- Build includes 226 files / 59.1 MB. New scenes are included in offline packaging; this exact enlarged package still needs another browser offline check after optimization.

## Offline footprint pass (13 September)

- Reduced the offline package from 59.1 MB / 226 files to 39.6 MB / 204 files. Legacy travel animation scenery is skipped by the mobile preload. Offline packaging now records the actual preload, including generated sprite paths, instead of including every root PNG. Original files remain in the repository.
- Checks verify every mobile preload asset is cached, the highest character and weapon variants remain, and the legacy fallback retains its travel assets. A manifest freshness check now runs in `npm test`.
- Browser: installed the reduced package on isolated port 4177, observed offline readiness, stopped the server, reloaded, reached gameplay and made a perfect chop for 10 gold. No startup errors were captured.

## Remaining release work

1. Enlarge/redesign remaining characters and targets, integrate cohesive art across destinations. Add stronger hit/launch/chain feedback and richer audio.
2. Play a complete campaign to assess pacing and balance; broaden special-target, trade-count and travel checks. Staged campaign, ending, deadline and fresh-start UI tests pass.
3. Browser-test unreadable-save recovery and storage failures. Valid import and both ending paths pass with fixtures. Reload currently resets the active shot; decide whether full shot restoration is needed. Review progression migrations and save-failure messaging.
4. Finish install icons and consider further optimization of the 39.6 MB asset package. Loading progress, retry and failed-engine fallback are implemented and browser-tested; the 30-second slow-connection message still needs throttled-network testing. Test installation on physical devices.
5. Balance via complete campaign runs; provide launch notes and clearly separate viewport checks from real-device validation.

### Audio feedback — 13 September 2026
Added distinct synthesized shot, impact and reward cues and an optional original melody. Journal controls store effects and music preferences independently. Automated checks cover user-gesture startup, scheduled voice cleanup, muting, hidden-page suspension and a single music loop on resume. Browser UI verified both switches and restored defaults. Listening on physical phones remains needed to judge mix and timbre. Build: 205 files, 39.6 MB.


### Fame upgrades — 13 September 2026
Restored Grand Stage, Traveling Caravan and Royal Horse to the mobile workshop. Strongest owned bonus restores from saves and cannot be downgraded by buying a weaker upgrade. Bonuses affect positive rewards only. Automated checks cover legacy reset, saved ownership, purchase requirements and duplicate/weaker rejection. Browser purchase and reopen preserved Royal Horse, 1.3x fame and 399 gold from a 999-gold starting purse. All release checks pass. Character atlas generation was attempted but returned usage_limit_reached; no new cast art was produced.


### Trade routes — 13 September 2026
Added export/demand profiles for all 15 towns, daily price variation and specials with a same-town sell-price cap. Market cards name buyers; travel cards identify cargo wanted at a destination. Automated checks cover positive integer quotes, all role/special bands and worst-case margins on York–Durham wool, Durham–Chester salt and Chester–London mead. Browser bought mead in Chester for 3 gold, travelled seven days and sold in London for 5 (999 -> 996 -> 1001 gold, cart 0 -> 1 -> 0). Existing saved quotes stay until the next market refresh. Full campaign pacing still needs normal playtesting. Observed a later test tab loading older progress while other test tabs existed; investigate stale-tab autosave before launch.


### Stale save protection — 13 September 2026
SaveManager remembers the stored snapshot it loaded/wrote and checks it before autosaving. A changed or deleted primary disables writes without rotating the backup. Storage notifications pause stale copies and show a focused Load latest progress action plus export. Keyboard shots and menu mutations remain blocked until reload. Automated checks verify newer-save/backup preservation, reset protection and resumed writes after reload. Two-tab browser test on port 4178 confirmed the recovery screen and reload action. This is snapshot conflict detection, not an atomic cross-process lock; exact simultaneous writes have not been stress-tested.


### In-play story guidance — 13 September 2026
Added a tappable HUD contract tracker showing the next objective, its progress and remaining days. Required weapon preparation takes priority; ready contracts and the ending choice highlight the tracker and Journal. Automated coverage checks early objectives, claim readiness, weapon preparation, final funding and expired free play. Browser verified 2/3 chops, matching journal progress and tap-to-open behavior; screenshot reviewed at a 360-pixel game width. Tall York target poles now stop below the HUD instead of reaching behind it. Full campaign playtesting and physical phone checks remain.


### Batch trading — 13 September 2026
Added batch buy and sell buttons with exact quantities and total prices. Buy quantity is limited by purse, stock and free cart space; selling updates the contract by the exact transferred count. Invalid/non-integer quantities reject. Receipts appear within the affected item card. Automated checks cover quantity limits, exact gold/stock/inventory changes and contract totals. Browser bought eight turnips for eight gold (999 -> 991), reopened with all eight intact, then sold all eight (991 -> 999), restoring stock and clearing the cart. An old retained test tab was identified and closed after conflict detection prevented it overwriting the current test. Latest build checks pass.


### Launch preview — 13 September 2026
Added a short eight-dot guide during power selection. It uses the same initial velocity helper as the launched head and previews approximately two thirds of a second with drag, gravity, wind and extra falling gravity in rain. It is a learning aid, not a collision or moving-target prediction. Automated tests cover velocity, mirrored aim, upgrade strength, wind and rain. Browser completed chop/aim/power/launch, showed the guide, returned to CHOP, and visually confirmed guide cleanup with no captured errors. Two artwork requests failed with image-service network errors; no new character atlas was returned.


### Night atmosphere — 13 September 2026
Moved sun/moon above the opaque painted towns and below gameplay objects, with their paths inside the visible central sky. The crescent now uses transparent cutout geometry instead of a black overlapping disc. Added a sparse star field fading at dawn, a softer blue night wash (maximum 0.62 opacity), and night-aware foreground cloud tint. Browser screenshot reviewed at 00:45 and near dawn: moon/stars visible, town and targets readable, no captured errors. Calendar duration and gameplay lighting separation are preserved. Remaining cast art still needs the image service to recover.


### Fresh opening playtest — 13 September 2026
Started a clean game on isolated port 4179 without imports. Three successful chops earned 5, 20 and 30 gold; bought weapon level 2 for 10 during aim and resumed the same shot. Claimed the first 40-gold contract, arriving at chapter two with 85 gold, weapon level 2 and one naturally hit target already counted. This verifies the opening loop, not full-campaign balance. Replaced mobile rank-up's old fullscreen flash/text with a concise rank toast and reward cue; suppressed obsolete Weapons/Travel/Shopping Unlocked messages because mobile menus are already available.


### Home-screen presentation — 13 September 2026
Created an original crown-and-axe SVG icon with 180px Apple and 192/512px standard PNG exports. Opaque padding preserves the design inside maskable icon crops. Updated favicon, Apple link and manifest; all three PNGs are in the offline package. Journal now offers an install button when the browser provides an install event, detects standalone play, and otherwise explains platform menu steps. Automated checks verify icon dimensions and prompt lifecycle without triggering a real install. Physical iOS/Android installation remains unverified. Icon source: assets/app-icon.svg; optional render script needs sharp.


### Illustrated stage cast — 13 September 2026
Image generation recovered. Added sixteen illustrated faces and four costume bodies, alpha-bounded atlas metadata, and CastArt mapping for the main prisoner, clergy and escort guards. The same art follows flying heads and falling bodies. Stage characters use larger 58px face/100px body artwork; flying-head collision bounds follow the larger sprite, so later balancing should account for the more forgiving hits. Legacy 87 townfolk identifiers map to twelve new faces; four clergy variants remain distinct. Original files remain. Browser verified transparent edges/alignment and a full shot hitting a target (chapter two 1/5 -> 2/5), followed by the next CHOP with no errors. High York targets now require weapon level 8 to avoid unreachable early shots. Jester artwork remains old. Offline package: 213 files, 42.8 MB. Prompts and asset paths are in assets/CAST_ART_NOTES.md.


### Illustrated jesters — 14 September 2026
Integrated four full-figure jester costumes for standard, shield, barrel and moving target roles. Poles render separately behind the figures; target motion and collisions are unchanged. Browser screenshot verified transparent sprites, consistent stage scale and clear target spacing. A full chop/aim/power/launch returned to the next CHOP with no captured errors; that particular shot missed, so target count correctly stayed at 2/5. All atlas/build/offline checks pass. New package: 215 files, 43.9 MB. Final prompt and source path: assets/JESTER_ART_NOTES.md.


### 14 September — Hull, Newcastle and Lincoln environments
- Added three illustrated portrait backgrounds and city-specific stage offsets. Seven of fifteen destinations now use the new environment style.
- Browser travel through all three towns confirmed distinct artwork, characters standing on the painted stages, readable targets and night lighting; no browser errors recorded.
- Release 3ff589c0599bfe63 passes the build and offline checks: 215 files, 46.5 MB. Physical phone testing and a current full offline download remain outstanding.


### 14 September — calendar rollover reliability
- Fixed full-day and multi-day updates losing calendar days when the clock wrapped to the same or a later time. Hour boundaries now dispatch in order, with midnight advancing the date before the new hour.
- New calendar checks exercise 30/60/120/144 FPS, exact full days, multi-day steps, invalid deltas, and the actual date-to-campaign bridge at the year-end deadline. Zero-time redraws do not repeat hourly events.
- Build and offline checks pass for release 3f7cc05cda05b293.


### 14 September — southern town environments
- Added illustrated Canterbury, Dover, Norwich and Winchester backgrounds with individual stage alignment. Eleven of fifteen towns now use the updated environment style.
- Travelled through all four in the browser: backgrounds load, cast feet align with the stages, and target markers remain readable. No browser errors recorded.
- Build and offline checks pass: release 96d3801ffdb073ee, 215 files, 50.5 MB. Remaining legacy towns: Colchester, Oxford, Southampton and Gloucester.


### 14 September — complete town background set
- Added Colchester, Oxford, Southampton and Gloucester. All fifteen towns now use illustrated portrait backgrounds with individual stage offsets; legacy originals remain in the repository.
- Travelled through the final four towns in the browser. Cast stands on painted stages, targets remain visible, and fog/night effects continue to work. No browser errors recorded.
- Build and offline checks pass: a328761e178c42b3, 215 files, 54.8 MB. Actual full-package offline verification remains outstanding. The old pixel fog texture is visibly inconsistent with the new art and needs a polish pass.


### 14 September — fog polish and target lifecycle
- Replaced tiled rectangular fog with a soft procedural mist texture. Both stage and legacy travel emit one patch every 300 ms with a six-second life, keeping roughly twenty alive instead of frame-dependent dense emission.
- Fixed new targets failing to inherit fog: all four spawn paths now apply current weather, and destroy handlers stop looping fade effects. Reapplying weather replaces existing tweens; clear weather restores opacity.
- Automated weather lifecycle, build and offline checks pass (release e910d60229b0b3c0). Browser reached a fog round before the browser-control tool changed, but the final visual and shooting check remains unverified.


### 14 September — XP reward progression
- Large XP rewards now grant every earned rank immediately and retain the correct remainder. Only the final rank is announced, avoiding overlapping rank notifications. Invalid and nonpositive awards leave progress unchanged.
- Regression checks compare a 40-XP total split across small awards with large awards, verify exact thresholds, remaining XP and single notifications, and check very large finite awards.
- Full build and offline checks pass: release 17a3659843bdbd51. Browser validation of the new rank notification and the final fog presentation remains outstanding.


### 14 September — reproducible upload package
- Added npm run release to run checks and create releases/<version>/site with only selected runtime assets, service worker, offline manifest and Phaser license.
- Exported release 17a3659843bdbd51: 218 files, 54.8 MB. Every copied file is verified by SHA-256; integrity.json records hashes and byte counts outside the upload folder. Unexpected files and mismatched existing exports fail rather than silently overwrite.
- Export folder is excluded from Git. Public site unchanged. Packaged-site browser testing, full offline loading and physical phones remain required.


### 14 September — isolated package serving
- Preview server supports CHOP_RELEASE=<version>, serving only the immutable export folder. Added a local HTTP check to npm run release.
- Served all 218 exported files from 17a3659843bdbd51 on an ephemeral loopback port, checked exact SHA-256, lengths and MIME types, confirmed index at the root, and confirmed development notes, tests and old Canterbury art return 404. Server closed after verification.
- This proves package completeness over HTTP, not browser rendering, service-worker installation or physical-device performance. Those remain outstanding.


### 19 September — mobile interruption handling
- Pagehide now pauses active play as well as saving, preserving the shot when a browser keeps the page alive for back navigation. Finishing loading in a hidden page also suspends play. Existing menus and backup forms are preserved; returning does not automatically resume.
- Lifecycle regression checks verify hidden/visible transitions, pagehide without a visibility event, repeated events, existing menus and uninitialized loading state. Physical browser back-cache behaviour remains unverified.
- Full release pipeline passes for d3bf53c14d2e75b2, including checksums and MIME types for all 218 files served from its isolated export folder. Nothing published.


### 19 September — York ring event portrait layout
- Entire ring arc is positioned below the top-quarter HUD using actual platform texture height. Event unlocks at blade 8; guards now use illustrated cast sprites.
- Layout checks confirm HUD clearance, stage clearance and spawn gating with actual platform dimensions. Build passes at 2c6fa13f22a26c4c. Final on-screen placement and shot reachability still require browser playtesting.


### 20 September — saved inventory validation
- Reject inventories containing unknown goods or a combined quantity exceeding the saved cart capacity. Valid empty, mixed, full and maximum-capacity cargo remain supported; original save files are left untouched when import validation fails.
- Checks use the actual market catalogue, cover multiple goods exceeding capacity together, and verify failed restore preserves the prior save. Full release pipeline passes, including isolated HTTP serving.


### 20 September — illustrated weapon upgrades
- Added thirty distinct illustrated axes in a transparent atlas. Main carried weapon and mobile workshop preview follow the current upgrade level; prices, power and timing bonuses are unchanged. Original weapon files remain for legacy interfaces.
- Atlas bounds, syntax, gameplay regression and offline checks pass: 0cca1866d1a5fb8f, 217 cached assets, 56.1 MB. Browser checks of sprite margins, grip alignment, swing and all workshop previews remain outstanding. This newer working build has not replaced the previously exported test ZIP.
- Prompts and asset paths: assets/WEAPON_ART_NOTES.md.


### 23 September — ring event lifecycle
- Ring hits now cancel the flight tween's actual target object. Town departure marks the event inactive, cancels the throw timer and kills animations on the ring, guards and platforms before destroying them. Removed unused tween-handle checks.
- Regression checks cover removal of every live event animation, actor destruction, timer cleanup and repeated cleanup. Full build and offline checks pass; browser event interaction is still pending.


## 23 September — weapon separation and current export

Replaced crowded weapon artwork with a transparent, generously spaced 30-weapon sheet. Metadata mapping passes with strict rejection of overlapping row boundaries. All automated checks pass. Current exported build: 2627d26f9d537fa6; 220 upload files, 55.6 MB, all served bytes and MIME types verified by the isolated HTTP release check. Previous zip exports remain historical. Nothing published.

Browser preview attempt first reached a connection-refused page before the server started; the tool then blocked access to that error page under its URL policy. No visual verification claimed for the new weapon grip/swing. Real-phone controls, full ordinary-play campaign balance and current full-size offline installation remain launch gates.

## 25 September — browser verification resumed

Browser preview now works. Tested at 390 by 844: opening story fits, main controls and first contract are visible, first miss gives feedback and returns to the next customer, level-one axe renders without adjacent sprites on stage and in the workshop, and reload preserves calendar progress. Discovered the original storage_1.png is blank; replaced the mobile workshop illustration with assets/trading-cart-v2.png and visually confirmed it appears. Maximum-capacity text now stops offering another ten spaces at level 16.

Current exported build: 20d183384af9ba54 (221 upload files, 56.8 MB). All automated game/offline checks and isolated HTTP release checks pass. Preview: http://127.0.0.1:4186 while the local server is running. No public deployment. Browser inspection covers level-one static weapon placement; complete weapon animation, normal campaign progression, real-phone controls and full current offline installation still require playtesting.

## 25 September — full current offline release checked in browser

Current 56.8 MB build 20d183384af9ba54 installed on the isolated local test origin 4187. After Ready to play offline appeared, the server was stopped and independent HTTP verification returned ECONNREFUSED. Browser reload then loaded the title, game assets, saved York session and Workshop including both new illustrations. Current desktop-browser offline reopening is verified; real-phone install/performance and complete campaign balancing remain open.

## 25 September — floating target platform art

Replaced the procedural neon-green placeholder style with muted mint turf, teal contours, outlined layered rock, grass details and a coral pennant. Kept getFlyingIslandMetrics, hole placement, landing geometry and event behaviour unchanged. Browser screenshot confirms the platform appears correctly above York with the new palette; it spawned naturally from the saved chapter-two profile. No bitmap added. Current exported build 6da286123ad44c48: 221 upload files, 56.8 MB; automated gameplay/offline and isolated HTTP release checks pass. Previous build 20d183384af9ba54 has the recorded actual server-off offline test; this art-only build has automated offline verification. Nothing published.

## 25 September — remove replaced face downloads

All townsfolk and clergy heads now instantiate from castHeads directly, including the legacy menu characters and flying head. Removed the 87 townsfolk and four clergy individual face preload requests; source PNGs remain in the repository. Offline verification now checks the replacement atlas and metadata, and rejects obsolete face downloads. This saves 91 requests and approximately 165 KB; it is primarily a request-count improvement, not a major byte reduction. Browser load completes with the illustrated prisoner visible and no captured warning/error logs.

Current release 90f394d175aaa78c: 127 offline entries, 130 upload files, 56.7 MB. Automated tests and isolated HTTP release checks pass. No public deployment. Complete campaign and real-phone launch checks remain open.

## 26 September — normal trading progression and menu focus

Earned and claimed chapters two and three through normal controls, including profitable York-to-Durham wool trading. Saved progression reopened correctly. Fixed same-menu rebuilds stealing focus from trading and upgrade controls; exhausted actions now leave focus on their item card. Browser verified purchases, sold-out stock, and six blade upgrades through level eight on a phone-sized viewport. Current release 6f5b5f1406c80a05: 127 offline entries, 130 upload files, 56.7 MB; all automated release checks pass. No public deployment. Full campaign and physical-phone validation remain open; preview pointer targeting was unreliable, so keyboard interaction was used for the later trade/upgrade checks.

## 26 September — bird visual and movement pass

Current c51e3cdd39225bde removes four obsolete bird PNG requests (123 offline entries, 126 upload files). Procedural animated crows/doves use the same outlined target palette. Flight is below the HUD, direction reverses correctly, hitbox is centered and destroyed birds release animations. Browser art preview and a complete packaged-game shot passed with no captured errors. Dedicated movement/cleanup regression and release checks pass. Actual bird collisions and real-device flight readability remain to be tested.

## 27 September — reduce mobile startup work

Current release 6b47d2f78646ff0c loads only the saved town background at game startup, avoiding about 29.5 MiB of other town images on a Chester start. Travel downloads the next town before committing calendar, market or save changes; a failed download offers retry without spending travel days. Browser success and forced-404 travel paths passed, as did the release checks. The offline package still contains all fifteen towns and remains 56.7 MB. Actual phone startup and offline travel are the next validation gates.

## 27 September — offline travel confirmed with server down

Release 6b47d2f78646ff0c installed fully in the test browser. With its server stopped and independently returning connection refused, the game reopened, loaded uncached-in-memory Norwich art from the offline package, advanced travel time and reopened again with town and purse preserved. Real phone installation, storage behaviour, touch and audio remain open.

## Clean campaign and final balance (27 September)

The independent, empty save on port 4189 reached all six contracts through normal controls, a profitable York–Durham trade, weapon/fame upgrades and York–Durham–Chester–London travel. By chapter six it had 36 chops, 60 target hits and 15 fame. Completing the original 100-chop requirement would have repeated the same round 64 more times after the other goals were met, so the final goal is now 50 chops. The updated release d010ba3c9eba00cc restored that same save at 36/50, completed after 14 successful rounds, paid the final 850,000 gold and offered both endings. The reform choice spent 1,000,001 gold and retained 66,587; the epilogue and free play survived reload. Final ledger: 50 chops, 83 targets, four towns and 18 calendar days. See PLAYTEST.md and clean-campaign-preview.png. This resolves the desktop clean-campaign reachability check, while physical-device experience and subjective fun remain unverified.

The exact d010ba3c9eba00cc package then reported Ready to play offline. Its server was stopped and independently refused HTTP connections; two browser reloads still loaded the game and saved ending. An offline successful chop increased the purse to 66,597 and persisted. The preview server was restored. Real iOS/Android installation and storage behaviour remain open.

Export a1ccc0f61e1d9f70 changes only trailing whitespace after the campaign test. A separate fresh York profile installed that offline package, reopened with its server stopped, landed a successful chop and retained 10 gold and 1/3 contract progress through a second offline reload. The preview server was restored. The ZIP has 126 root-level upload files.

## Compact phone width (27 September)

Build 1bafe9c9f44ffad4 lets the mobile HUD, menus and controls fill the phone viewport below 600px width while keeping the 1:2 game canvas centered. At heights below 600px, shorter control spacing preserves the actor view without lifting the high target and bird lanes. Browser checks at 320 × 520, 320 × 568, 360 × 640 and 390 × 844 show readable controls and a scrollable Market; a compact-screen round completed. The 320 × 520 viewport has a 288 × 49px shot button, four 80px-wide navigation buttons and no horizontal overflow. See PLAYTEST.md and compact-mobile-preview.png. Actual touch and safe-area behaviour on phones remain open.

## Moving York ring (27 September)

Build f7188a9fdfe27b51 checks the ring's swept movement against the head's swept movement. This covers a ring moving across a nearly stationary head as well as a head passing through the ring. Automated cases also reject rim/distant misses and ensure one payout and cleanup. The first-event hint now waits until the loading overlay and any opening dialog are gone; a browser start visibly showed it over York play without errors. The guide explains the blade-eight challenge. Normal York rounds displayed the event, but a live hit remains to be tested; physical-phone gameplay remains open. See PLAYTEST.md and york-ring-hint-preview.png.

The same exact upload folder was opened on a fresh local origin: a full round earned 10 gold and 1/3 first-contract progress, retained after reload. Its Journal then reported Ready to play offline. With the preview server stopped and the connection independently refused, it reopened and landed another chop for 5 gold; a second offline reload retained 15 gold and 2/3 progress. Fog and fading targets also rendered without browser errors. See PLAYTEST.md and exact-export-offline-preview.png. This confirms the current desktop export's basic offline loop, not physical-device installation or performance.

## Offline download feedback (27 September)

Build 224f64dde6d705d7 reports each completed eight-file batch of the 123-file offline download in the Journal and highlights the status in a small card. The service worker treats progress messages as optional, so a closed tab cannot fail installation; failed asset batches still discard the incomplete new cache. Automated tests check counts, invalid and late messages, the open Journal update and cache-failure behaviour. A fresh browser origin showed the card change to Ready to play offline without errors. With the preview server stopped and independently refused, this new export reopened to a playable York scene; the server was restored. A throttled-network browser observation of intermediate counts and real-phone storage pressure remain open. See PLAYTEST.md and offline-ready-preview.png.

## Smaller mobile artwork download (27 September)

Build 7aed28e4f15eded1 ships high-quality JPEG exports for 15 opaque town paintings and three story portraits, while retaining their original PNGs in the source repository and keeping transparent cast/weapon art as PNG. Those 18 paintings total 38.6 MB as PNG and 4.9 MB as JPEG; the full offline package falls from 56.7 MB to 23.0 MB with the same 123 cache entries and 126 upload files. The optional scripts/optimize-art.cjs reproduces the exports. Browser visual checks found the title, York, London, Durham, Oxford and Oswin portrait intact. After the server was stopped and independently refused the Oxford image request, the game travelled from Durham to Oxford, rendered that uncached-in-page image, and reopened in Oxford with progress intact. The server was restored. Real-phone decode/performance and storage behaviour remain open. See PLAYTEST.md and compact-art-offline-preview.png.

## Skip unused mobile canvas menus (27 September)

Build 000efd14433fd81f uses the portrait HTML menus without downloading or building the old canvas workshop, market and travel menus. The original browser menu code and art remain in the source repository. The mobile offline package now has 63 cache entries and 66 upload files, totalling 15.8 MB instead of 23.0 MB in the preceding build. The isolated export passed the full release and HTTP checks. In the browser, the opening story and four mobile menus worked; a restored test save bought a cart upgrade, traded in London, and travelled to Durham. With the preview server stopped and independently refusing connections, the game reopened in Durham, travelled to Oxford with its cached town art, and kept 989 gold. No browser errors were observed. Physical-phone performance and storage behaviour remain open. See PLAYTEST.md and lean-mobile-offline-preview.png.

## Clear old targets between customers (27 September)

Live York play with a blade-eight save reached a twelve-chop streak. Unhit pole targets accumulated until their jesters obscured the character and new targets. Build 42c4c417e99219d1 has those missed jesters leave at the next customer's arrival; birds retain their separate flight window. After five successful rounds on the exact export, the stage showed only the current targets and York ring challenge, with no browser errors. A ring pass now immediately saves its three-fame bonus even if no ordinary target remains, and announces the reward in the mobile HUD. The reward path has a deterministic regression check; a live ring pass and bird collision remain unproven. See PLAYTEST.md and tidy-york-rounds-preview.png.

## Reachable birds from the first blade (28 September)

The old bird lane at game Y=420 was above the highest possible full-power level-one shot: a 500 px/s vertical launch under 400 px/s² gravity rises only 312.5 px from Y=956, reaching Y≈644. Build 8d2e32d3c7e65026 gives early birds a lower lane (Y=724 at blade one) that climbs toward Y=420 as blades improve. It suppresses a spawn if downward wind would make even the best shot miss that lane. Early birds are crows, introducing the bonus before doves can cost fame; only one bird crosses at a time, with a slightly higher appearance chance. Ballistic and swept-hit tests cover all thirty blade levels, the adverse-wind case, and a head crossing the starter bird hitbox. On the exact export, a fresh game opened the updated target guide and completed three successful first-session shots to a ready first contract without browser errors. A low-lane bird hit during live play remains unverified; see PLAYTEST.md.

## Angular direction revision - 2 October

Release ea4bff74b56b387e replaces the earlier painted presentation with original angular art, expressive modular characters, bottom-edge head piles, comic ketchup, layered clouds, animated caravan travel and town-specific challenges. It passes release and native sync checks and contains 64 upload files (about 3.4 MB). See ART_DIRECTION.md for the implementation and remaining playtests. Earlier campaign and native compilation evidence applies to preceding versions; the revised progression needs a new complete playthrough.
