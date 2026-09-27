# Chop To It — release playtest

Build under test: 1bafe9c9f44ffad4. This is a release candidate for testing, not a declaration that launch checks are complete.

Record phone model, OS, browser, whether installed on the home screen, and build version with every result. Export any valued save before testing a fresh story. Use a separate test profile when possible.

## First session

Start a fresh story. Follow timing, aim and power instructions without outside explanation. Earn and purchase the first blade upgrade, complete the first contract, and continue toward five target hits. Record minutes to first hit and first purchase, confusing instructions, and controls that feel difficult to reach. A fun opening should make the next action clear and let the player see how a better shot changes the result.

## Complete campaign

Earn all six contracts through ordinary play. Record elapsed playtime, total attempts, successful chops, target hits, upgrades, travel days and purse at each claim. Trade on at least one export-to-demand route. Check that the player can understand why a trip or upgrade helps. Report repetitive stretches, targets that seem unreachable and any point where progress feels stalled. Choose an ending, reopen the game, and confirm the ending and remaining money persist.

## Interruptions and controls

Switch apps during timing, aim and power; return and explicitly resume. Open each menu mid-shot. Check that the stage and calendar stay paused, the shot resumes in its prior phase and no accidental tap fires it. Lock and unlock the phone, rotate it, and test a short screen with browser bars visible. Keep any unfinished backup form open during an interruption and check its contents remain.

## Artwork and feedback

Visit all fifteen towns. Inspect daytime and night visibility. In fog, new targets should fade like existing ones; mist should have soft edges. From blade level 8 in York, check the whole thrown-ring arc stays below the HUD and can be reached. Check the larger illustrated cast, flying heads, weapon swings and target markers remain readable during a busy round. Listen to effects and optional music on the actual device.

## Offline and persistence

Wait for the ledger to report offline readiness while connected. Close the game, turn off connectivity and reopen it. Play a shot, buy or sell goods, then reopen and check purse, inventory and quotes. Reconnect and verify normal play resumes. Test home-screen installation separately on each platform. Record download failures, unusually long startup or device heating.

## Result

For every issue, record the exact action, expected result, actual result and whether it repeats. Attach a short recording when useful. Passing automated checks does not replace these playtests; failed or unperformed checks remain open.

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
