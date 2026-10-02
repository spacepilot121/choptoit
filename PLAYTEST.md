# Chop To It — release playtest

Build under test: `83239100c0da62ba`. This is a release candidate for testing, not a declaration that launch checks are complete. Test the same release ID on the web, Android and iPhone; update it after a later sync. Record the app's source commit and native bridge hash too, because phone integration can change without changing browser assets.

Record phone model, OS, browser, whether installed on the home screen, and build version with every result. Export any valued save before testing a fresh story. Use a separate test profile when possible.

## First session

Start a fresh story. Follow timing, aim and power instructions without outside explanation. Earn and purchase the first blade upgrade, complete the first contract, and continue toward five target hits. Record minutes to first hit and first purchase, confusing instructions, and controls that feel difficult to reach. A fun opening should make the next action clear and let the player see how a better shot changes the result.

## Complete campaign

Earn all six contracts through ordinary play. Record elapsed playtime, total attempts, successful chops, target hits, upgrades, travel days and purse at each claim. Trade on at least one export-to-demand route. Check that the player can understand why a trip or upgrade helps. Report repetitive stretches, targets that seem unreachable and any point where progress feels stalled. Choose an ending, reopen the game, and confirm the ending and remaining money persist.

## Interruptions and controls

Switch apps during timing, aim and power; return and explicitly resume. Open each menu mid-shot. Check that the stage and calendar stay paused, the shot resumes in its prior phase and no accidental tap fires it. Lock and unlock the phone, rotate it, and test a short screen with browser bars visible. Keep any unfinished backup form open during an interruption and check its contents remain.

On Android, test both the Back button and the Back gesture. During a shot, the first Back should show the pause screen; the next should minimize the app. Reopen and explicitly resume with the same shot phase and saved progress. Back from Workshop, Market, Travel or Journal should return to play; from the guide, cast or backup page it should return to the Journal. Back during startup, a town download or save-conflict recovery should preserve that operation.

## Artwork and feedback

Visit all fifteen towns. Inspect daytime and night visibility. In fog, new targets should fade like existing ones; mist should have soft edges. From blade level 8 in York, check the whole thrown-ring arc stays below the HUD and can be reached. Check the larger illustrated cast, flying heads, weapon swings and target markers remain readable during a busy round. Listen to effects and optional music on the actual device.

## Offline and persistence

Wait for the ledger to report offline readiness while connected. Close the game, turn off connectivity and reopen it. Play a shot, buy or sell goods, then reopen and check purse, inventory and quotes. Reconnect and verify normal play resumes. Test home-screen installation separately on each platform. Record download failures, unusually long startup or device heating.

For the store apps, confirm the Journal says the game is included for offline play and shows no browser-install prompt. Share a save backup to Files/Drive, start a new story, choose the saved JSON in Restore a backup, and verify the old story returns. Switch apps during a shot and return; the game should be paused and require an explicit resume. Repeat after updating a store test build with existing progress.

## Result

For every issue, record the exact action, expected result, actual result and whether it repeats. Attach a short recording when useful. Passing automated checks does not replace these playtests; failed or unperformed checks remain open.

## 2 October — native projects compile

## 2 October — current opening and fog playtest

Release `83239100c0da62ba` opened from a fresh origin at port 4291, 390×844. A perfect chop paid 10 gold; purchasing blade level two spent that 10 and showed 1.06× strength. The workshop preserved the active aim phase. Ordinary controls earned three chops and two target hits; the first contract added 40 gold (22→62) and opened chapter two. Reloading retained chapter two, 62 gold, rank two, blade level two and target progress 2/5. No browser warnings or errors were captured.

Fog appeared during ordinary rounds and remained visible across midnight. The soft mist, fading target markers, painted stage and cast were readable at phone viewport size in daytime and at night. Screenshot: `current-fog-preview.png` outside the repository. These observations cover desktop browser rendering; they do not prove physical-phone performance or a live bird/ring collision. An accelerated button-input sequence was used for some rounds and is not evidence of human difficulty or balance.

### Earlier native compilation

Game release `0b6c0be81083503a`, commit `caa22d3`: GitHub Actions built the Android debug app and unsigned iOS simulator app successfully in run 37037158952. Native copy/config checks, the full web release pipeline and native audio suspension regression check pass. This proves compilation and packaging consistency. No phone installation, native share sheet, file picker or touch test has been performed yet.

## 25 September — opening contract earned in browser

Build 20d183384af9ba54, local port 4186. Played normal controls without changing game state: three successful chops, one flying-target hit (ledger counter 1/5), rank two, first contract claimed for 40 gold, then blade level two purchased for 10. Purse changed from 17 to 57 to 47 as expected. Reloaded and entered again: chapter two, target count 1/5, rank two, 47 gold and blade level two all retained. Verified aim -> power -> launch -> next-customer transitions, third-miss reset, midnight countdown from 360 to 359, and opening a menu during aim pauses/resumes that phase. Left the test profile paused in Workshop on 2 January.

This establishes opening-loop function and earned progress persistence. Remote input latency prevents a reliable human difficulty assessment; it does not establish full campaign balance or actual touch-device performance. No gameplay balance change made solely on delayed remote taps. Remaining next playtest: chapter two targets and travel/trade progression, then complete campaign and real-phone validation.

## 25 September — current release offline reopen verified

Build 20d183384af9ba54, isolated origin http://127.0.0.1:4187/?offline-test=1. Journal displayed Ready to play offline after the full 56.8 MB release installed. Stopped the exact test server process, then independently confirmed ECONNREFUSED from an HTTP fetch. Reloaded the browser with that server still stopped: title screen opened, asset loading completed, saved York session resumed to an enabled CHOP button, and Workshop rendered the new weapon and trading-cart artwork. This closes the current-build desktop-browser offline reopening gate. It does not prove iOS/Android installation, browser storage eviction behaviour, or device performance. The main playtest origin 4186 is separate from this offline test.

## 26 September — earned chapters two and three; menu continuity

Continued the existing normal-play save on port 4186. Five target hits and blade level two completed chapter two; claiming 400 gold changed the purse from 132 to 532. Bought eight Wool for 40 gold plus two Turnips for 2 gold in York, travelled three days to Durham, then sold the Wool for 88 and Turnips for 2. The ledger correctly counted ten goods sold and the Durham visit. Claimed chapter three's 4,000 gold reward: purse 4,580, chapter four unlocked. Reload retained money, town and chapter. No game-state injection used.

In build 6f5b5f1406c80a05, refreshing the same menu retains its scroll position and focused action. When the action becomes disabled (for example, buying the last stock), focus remains on the item card. Verified a Salt purchase retained Buy one focus at scroll position 421, buying remaining stock focused its card, and six successive weapon upgrades retained focus through level eight. Preview was tested at 390 × 844. Saved workshop-playtest.png as visual evidence. Automated gameplay, offline and packaged HTTP checks passed; captured browser warning/error logs were empty.

The preview's semantic pointer clicks intermittently missed their controls while keyboard activation worked, and a coordinate tap activated a different control than expected. This is not established as a game bug; physical-phone touch validation remains open. Current normal-play save: Chester, 12 January, chapter four, rank four, five targets, level-eight blade, six Salt, 4,195 gold. Remaining campaign objectives and human difficulty assessment are still outstanding.

## 26 September — animated birds and visible flight lane

Build c51e3cdd39225bde replaces four pixel bird images with code-drawn crow/dove art using the target palette. Wings flap, sprites face outbound and return travel correctly, and both flight and wing tweens stop on destruction. Bird flight moved from y=160 (behind the mobile HUD) to y=420; the hitbox is centered at 58 × 36. Motion is controlled by the flight tween without a competing physics velocity.

The dedicated development-only scripts/bird-preview.html rendered both species, both directions and full-size/enlarged views with no captured warning/error logs; screenshot bird-art-review.png. Regression checks exercise both directions, hitbox placement and destruction cleanup. npm run release and npm test passed. The packaged game loaded and completed timing, aim, launch and next-customer transitions with blade eight in Chester, increasing the normal ledger target count from five to six. This does not yet verify a bird collision or phone readability during flight. Current normal save is paused in chapter four's ledger with 4,200 gold.

## 27 September — mobile town loading

Build 6b47d2f78646ff0c preloads only the current saved town image on mobile. The fifteen city backgrounds total 31.68 MiB; a Chester start loads 2.19 MiB of these instead of all fifteen, avoiding 29.49 MiB of initial town-image transfers and decoding. All fifteen remain in the 56.7 MB offline package. The travel menu now loads destination artwork before advancing the calendar, changing the market or saving the town. While it loads, travel controls are disabled and the menu reports progress. A failed artwork request restores travel choices and leaves the town/date unchanged.

Packaged browser test: saved Durham profile opened with its background, then travelled to Chester; date advanced five days and Chester background rendered. Fault test served a 404 for Norwich artwork on the same release: the menu showed a retry message and stayed at Chester without spending days or gold. A fresh York profile opened in a separate origin with missing Durham art, but Durham was locked at 1 fame, so that profile was not used to claim fault-path coverage. Automated startup test checks one preloaded saved-town image on mobile, fifteen on legacy desktop, and all fifteen in the mobile offline asset set. npm run release and npm test passed. Saved screenshot travel-mobile-preview.png. Real phone download latency and offline travel still require testing.

## 27 September — current lazy-town release reopened and travelled offline

On release 6b47d2f78646ff0c at local origin 4186/?offline-test=1, the ledger reported Ready to play offline. Stopped the exact preview server; an independent HTTP fetch returned connection refused. Reloaded the browser with the server still stopped and resumed the saved Chester game. Travelled to Norwich, which was not loaded in that page: the menu briefly reported Opening the road, then displayed Norwich artwork and advanced from 4 to 11 December (seven travel days) while keeping 1,051 gold. Reloaded again with the server still stopped: Norwich, 11 December and 1,051 gold persisted. Screenshot offline-norwich-preview.png records the town after offline travel. The local preview server was then restored. This proves desktop-browser offline travel and reopen for the current package; iOS/Android installation and storage eviction remain open.

## 27 September — clean campaign completed in browser

Started a separate, empty browser save on local port 4189. Earned all six contracts through normal timing, aim, power, purchases and travel, without importing progress or changing game state. Bought the level-two blade, traded four Wool and six Turnips from York to Durham, visited Chester and London, upgraded to blade eight and the Royal Horse fame boost, then completed the target contracts. Chapter four finished at 20 targets and rank eight; chapter five finished in London at 40 targets. The fresh-save finale exposed a long repetitive stretch: at 36 successful chops, the other two final goals were already met. Reduced the final requirement from 100 to 50 chops, kept the 60-target and 15-fame goals, rebuilt the package, and resumed the same save. This is a balance adjustment informed by the clean playthrough, not a completed human fun assessment.

On build d010ba3c9eba00cc, the updated save showed 36/50 chops. Fourteen further successful rounds completed the contract. The ledger recorded 50 chops, 83 targets, four towns visited and 18 calendar days. All six rewards were claimed in order. The final purse reached 1,066,588 gold, enough for the 1,000,001-gold ending choice. Chose the reform ending, leaving 66,587 gold; after reloading, the game resumed in free play and the Journal retained the reform epilogue, totals and balance. Screenshot clean-campaign-preview.png shows the reopened ending. The whole normal-play campaign is therefore reachable in a desktop browser; real-phone controls, performance, installation and subjective pacing remain open. `npm run release` and `npm test` passed for the current build.

## 27 September — exact final package reopened offline

On release d010ba3c9eba00cc at local origin 4189/?offline-test=1, the Journal reported Ready to play offline. Stopped the exact release preview server and independently confirmed that an HTTP request was refused. Reloaded with the server still stopped: the title and London scene loaded, the saved reform ending remained in free play, and an offline Perfect chop added 10 gold. Reloaded a second time offline; the purse retained 66,597 gold. Restored the preview server afterward. This checks the exact exported package's offline reopen, gameplay and save path in a desktop browser. Device installation, storage pressure and offline trading on a phone remain open.

## 27 September — final exported build offline smoke

Build a1ccc0f61e1d9f70 differs from the completed-campaign build only by trailing whitespace cleanup. Its fresh York profile at local origin 4191/?offline-test=1 reported Ready to play offline. After the server was stopped and independently refused an HTTP request, the game reloaded, accepted an offline Perfect chop (10 gold, 1/3 first-contract progress), and reloaded again retaining both values. The server was restored. This confirms that export's core offline startup, input and save path; the full earned campaign was played on the immediately preceding functionally identical build.

## 27 September — compact mobile controls and York event

The 1:2 game canvas left narrow controls on short 9:16 phone viewports. The mobile HUD, menus, shot button and navigation now use the full available width at 600px and below, while the canvas retains its gameplay coordinates. At 320 × 520, the shot button measures 288 × 49px, the four navigation buttons each measure 80px wide, and the document has no horizontal overflow. Reduced spacing around the controls below 600px height, keeping the actors above them without moving the bird flight lane. Visually checked the first-story page, gameplay and Market at 320 × 568, gameplay at 320 × 520 and 360 × 640, and the stage at 390 × 844. Screenshot compact-mobile-preview.png records the shortest viewport. A timing/aim/power round completed in this layout. The source browser reported no warnings or errors.

On the completed campaign save in York with blade level eight, normal rounds spawned the moving-ring guard event and several high targets. At 360 × 640 the ring, guards and targets were visible beneath the HUD. The ring collision itself and bird collisions remain to be tested in gameplay; visual appearance alone does not prove reachability. The release pipeline passed for build 1bafe9c9f44ffad4.

## 27 September — moving York ring collision and teaching

The moving-ring hit check now follows both the head and ring between frames, including a ring crossing a head that is nearly stationary at its apex. Deterministic checks cover a head passing through a still ring, the moving-ring crossing case, rim grazes, distant misses, duplicate claims and a single reward/cleanup. Normal York rounds spawned the event without browser errors. The first-event hint was initially hidden behind loading; after deferring it until play is visible, a fresh York start showed “York challenge · send a head through the gold ring” in the gameplay status region. The Targets & tricks guide explains the blade-eight challenge. Screenshot york-ring-hint-preview.png records the hint. `npm run release` and `npm test` pass on f7188a9fdfe27b51. A ring hit by hand during live play, bird collisions and physical-phone testing are still open.

## 27 September — exact f7188a9fdfe27b51 export played offline

Served the isolated upload folder on local port 4193. A new save opened, completed timing/aim/power, earned 10 gold and advanced the first contract to 1/3; reload retained both. A later round displayed fog and fading targets without browser warnings or errors. Enabled the export's offline mode and confirmed the Journal said “Ready to play offline.” Stopped the server and independently confirmed the connection was refused. The game still reopened, retained 10 gold and 1/3 progress, and accepted an offline chop for another 5 gold. After a second offline reload, the purse showed 15 gold and the first contract 2/3. Screenshot exact-export-offline-preview.png records the reopened save. The preview server was restored. This checks startup, input and save persistence for this exact desktop export with no server; real iPhone/Android installation, performance and storage pressure remain unverified.

## 27 September — offline download feedback

Build 224f64dde6d705d7 adds a count after each eight-file offline batch to the Journal's Offline play card; the status settles on Ready to play offline after installation. Unit checks verify every batch reports its completed count, failed batches report none, invalid or late messages cannot replace the ready state, and an open Journal updates immediately. On a fresh local origin at port 4195, the exported build opened the story and showed Ready to play offline without warnings or errors. After its server was stopped and independently returned connection refused, the title and York game loaded from cache and an enabled CHOP button appeared. The server was restored. Screenshot offline-ready-preview.png records the card. Intermediate counts were not directly observed in this fast local browser run; a slow-network and real-phone check remain open.

## 27 September — compact paintings in the exact package

The 15 town and three story PNG masters remain editable in assets/, with quality-90 JPEG exports used by the game. The 18 shipped paintings are 4.9 MB instead of 38.6 MB; the full package is 23.0 MB instead of 56.7 MB. Original dimensions are retained, and the lowest measured pixel PSNR among the 18 exports is 36.9 dB. The packaged HTTP check verified all 126 files, hashes and JPEG content types. In the browser, the title, York game, Oswin opening portrait, London and Durham rendered without errors. A restored late-game test save travelled London to Durham. The Journal reported Ready to play offline. With the preview server stopped and an independent request for the Oxford JPEG refused, the game travelled Durham to Oxford, displayed the new town art and advanced nine days. Reloading with the server still down reopened Oxford with 1,000 gold and the saved date. Screenshot compact-art-offline-preview.png records Oxford after offline travel. The server was restored. This confirms desktop-browser artwork loading and offline travel for the compact export; phone decode quality, performance and storage eviction remain unverified.

## 27 September — lean mobile export

Build 000efd14433fd81f removes hidden legacy canvas menu art from the mobile download while retaining the desktop fallback in source. The offline package fell from 23.0 MB to 15.8 MB, with 63 cache entries and 66 upload files. The opening story and Workshop, Market, Travel and Journal rendered without errors. A restored test save in London spent 10 gold on a cart upgrade, bought one turnip, and travelled to Durham, with the purse correctly moving from 1,000 to 989 gold. The Journal said Ready to play offline. After stopping the preview server and independently confirming a refused connection, an offline reload retained Durham and 989 gold. The game then travelled nine days to Oxford and showed its painted background while still offline. Screenshot lean-mobile-offline-preview.png records that state. The basic shot button reacted, but this short run did not land a successful shot; the earlier complete campaign and exact-export shot checks remain the evidence for the shot loop. Physical iPhone/Android touch and storage-pressure checks remain open.

## 27 September — York streak and target readability

On build 000efd14433fd81f, a restored blade-eight York save earned a twelve-chop streak through normal timing, aim and power controls. The moving gold ring and a crow both appeared beneath the HUD, and high pole targets paid fame on hits. However, unhit pole targets stayed through every new customer, eventually covering the stage with jesters. Build 42c4c417e99219d1 retires those targets as the next customer enters. Five successive successful rounds in the exact exported build left the stage readable with only current pole targets; screenshot tidy-york-rounds-preview.png records the result. The updated ring reward now saves and announces its three-fame bonus even when no ordinary target is cleared. The release and HTTP checks passed without browser errors. The attempted live ring and crow shots did not establish a collision, so those remain explicit playtest items rather than verified hits.

## 28 September — starter bird reachability

The fixed bird lane at game Y=420 could not be reached with the first blade: from a Y=956 launch, maximum vertical speed 500 px/s and gravity 400 px/s² put the highest point near Y=644. The new lane starts at Y=724 and rises with blade upgrades, never above Y=420. A strong downward wind suppresses an otherwise unreachable bird. Starter birds are rewarding crows; doves enter from blade level four, and only one bird flies at once. Regression checks cover levels 1–30, a full-power head crossing the starter bird hitbox, an outside miss, adverse wind, and bird animation cleanup. The exact 8d2e32d3c7e65026 upload folder opened a fresh York story, showed the updated Targets & tricks guide, and completed three normal shots for 35 gold and the first ready contract without browser errors. Random live play did not capture a low-lane bird collision, so bird-hit reward and phone readability still need direct playtesting.

## 28 September — exact release opening, reward and first purchase

Opened build 8d2e32d3c7e65026 on a fresh local browser origin at port 4202. The target guide displayed the updated bird guidance legibly. Ordinary timing, aim and power input earned the first contract; the ledger paid 40 gold, taking the purse from 72 to 112 and opening chapter two. The first blade upgrade cost 10 gold, showed level two and 1.06× strength, and left 102 gold. After a full page reload and return from the title screen, the game retained 102 gold and chapter two's target objective. The workshop screenshot is saved outside the repository as current-release-opening-preview.png. Fog was shown during these rounds and cleared later, but this run did not prove a live bird or ring hit. Physical phone feel, sound and installation remain open.

## 28 September — bird art and reward alignment

A starter-level crow was visibly flying below the HUD in an ordinary York round on build 8d2e32d3c7e65026. The bird's drawn beak extended beyond its old 58 × 36 collision body, so build 3e05ba55de20a3d6 widens that body to 100 × 50 for both flight directions and checks a crossing at either beak position. A full-path regression now runs a flying head through the game's target collision and reward functions: a crow adds one gold, one fame and one contract target exactly once, while a dove removes fame without gold or contract progress. The release pipeline and packaged HTTP check pass. The immediately preceding build f2c03e17a32dd9de opened a fresh York story and accepted a complete timing/aim/power round without browser warnings or errors; delayed remote input missed that shot. A hit by hand in the live game remains unproven.

## 28 September — York ring remains reachable in wind

The ring previously used the full HUD-safe height range, but at the highest placement a level-eight shot could not climb to the ring in strong downward wind. Build 7ef4640225f4cbaa raises the minimum platform Y (lower on screen) using a worst-case wind calculation. At blade level eight, the platform starts no higher than about Y=751 instead of Y=607; stronger blades can still produce higher arcs. Checks cover blade levels 8–30, both vertical and horizontal worst-case wind, HUD clearance and a normal full-power shot reaching the ring before the fastest throw's midpoint. The exact packaged build opened from a restored blade-eight York save, spawned the two guards and a moving gold ring visibly below the HUD, and accepted a normal chop without browser errors. The restored save was for visual testing, not campaign balance. The screenshot is saved outside the repository as ring-reachability-preview.png. A live ring collision remains unverified.

## Angular direction - 2 October

Release ea4bff74b56b387e: desktop browser visual checks at 390 by 844 and 320 by 520 confirmed the angular scene and compact controls without horizontal overflow. An upgraded test fixture completed an eight-day Winchester journey; a later trip arrived in Norwich. No new console errors occurred after correcting the journey clock reference. Screenshots angular-game-preview.png and angular-caravan-preview.png are saved outside the repository. Automated checks cover town distributions, challenge gates, arrival/calendar idempotence, settled head stacking, target combo rewards and journey suspension. These checks do not replace a revised full-campaign playthrough, a long-session visual pile test, live special-event hits or physical-phone testing.

A subsequent normal-control Norwich playtest landed three successive chops. Two launched heads visibly remained along the bottom ketchup edge, the third chop displayed the 3x combo and 30-gold banner, and a target reward completed the fixture's second contract. angular-combo-preview.png records the live banner and retained heads. This confirms the basic visual loop; tens of heads and the full revised campaign remain untested.
