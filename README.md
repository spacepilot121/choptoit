# Chop To It!

A portrait arcade adventure built with Phaser. Stop the timing marker, set your aim, choose the power, and send your shot through the town's targets. Earn gold, improve your weapon and cart, trade between towns, and uncover the royal debt office's other ledger.

## Development status

The mobile edition is in development. It includes touch controls, pause-safe menus, six story contracts, a one-year campaign with three endings, local saves and recovery, and an offline web package. All fifteen towns and the main stage cast have illustrated artwork. Campaign balance, remaining visual polish and physical phone testing still need work. See [LAUNCH_PLAN.md](LAUNCH_PLAN.md) for evidence and outstanding release checks. This is not yet a tested app-store release.

## Prepare an upload folder

Run `npm run release` to build, check and copy the current web game into `releases/<version>/site/`. Upload the contents of that site folder together when the release is approved. It includes the service worker, offline manifest and Phaser license. A sibling `integrity.json` records every file's SHA-256 and size; it is for verification and does not need uploading. Existing release files are verified rather than silently replaced. This command does not publish anything.

## Run locally

To preview an exported package in PowerShell, set `$env:CHOP_RELEASE` to its version identifier before running `npm start`. The server then serves only that release's `site` folder. Remove the environment variable to return to development mode. `npm run release` also checks every packaged file over local HTTP, including its content type and SHA-256. This verifies serving, not browser rendering or offline installation.

Requires Node.js. No package installation is needed.

```sh
npm start
```

Open `http://127.0.0.1:4173/`. Tap **Enter the kingdom** to start. Use the large action button for timing, aim, and power; Space is also supported. Workshop, Market, Travel, and Journal pause the game, including the calendar. Moving the browser to the background also pauses it. The calendar runs while playing; it does not advance while the game is closed.

## Saves

Progress stays in this browser under `choptoit-save`, with a previous valid recovery copy. The journal exports and restores JSON backups. Version 1 saves are supported; version 2 also stores the current town, time, campaign and market. Reloading starts a fresh shot and preserves long-term progress. If both copies are unreadable, automatic saving stops until the player restores a backup or explicitly starts a new story. Clearing browser storage can remove progress, so export before changing devices.

## Build and offline testing

```sh
npm run build
```

This runs focused checks and regenerates `offline-assets.js` from the app and assets. Deploy the complete project with the updated manifest to a static HTTPS host. Phaser is bundled locally; the mobile edition does not require API keys or a visitor-counter service.

`npm test` also rejects an outdated offline manifest. Rebuild after changing game code or artwork before running the release checks.

Offline downloading begins on a hosted page. The Journal reports when the package is ready. A first download currently contains about 40 MB of assets. The list follows the mobile preload, excluding obsolete travel animation scenery while retaining all character heads and upgrades. Updates wait until existing game tabs close; an interrupted download keeps the previous release intact.

Local previews normally skip service-worker registration. Add `?offline-test=1` to deliberately test it. Once registered, that origin can remain controlled by the cached release: close all game tabs to activate a downloaded update, or clear that origin's service worker through browser developer tools before ordinary development. Do not assume a reload alone proves that new files are being tested.

Browser testing has loaded and resumed the cached game with the local server stopped. Add-to-home-screen behavior, storage limits, audio and interruption handling still need physical iOS and Android testing.

Startup displays download progress. Missing artwork prevents gameplay from starting and offers a retry; a missing engine shows a retry on the title screen. To test failure locally without an existing offline cache, set `CHOP_PORT` to a separate port and `CHOP_MISSING_ASSET` to a project-relative asset path when starting the development server. Restart without that variable to test recovery.

## Artwork and release checks

Generated artwork prompts and source locations are recorded in [assets/ART_NOTES.md](assets/ART_NOTES.md). The original assets remain in the repository. Phaser's license is in `vendor/PHASER-LICENSE.md`.

The legacy optional Git hook changes the version string in `index.html`. If using it, regenerate the offline manifest after any version change so the release hash matches the deployed files.

Audio: the journal has independent Effects and Music switches. Music defaults off. Original synthesized cues cover aim, launch, chops, shields, targets and rewards, with no extra audio downloads. Audio starts after interaction and suspends when the page is hidden.


The mobile workshop includes three fame boosts alongside weapon and cart upgrades. Only the strongest owned boost applies, persists across saves, and increases target rewards without increasing fame penalties.


Towns now have named exports and demand goods. Buy local exports and carry them to a town that wants them; the market and travel screens show route hints. Daily prices vary, and travel still advances the calendar. Existing saved prices refresh on the next market day or trip.


When another tab changes the saved game, an outdated copy pauses and offers Load latest progress. It can export its own snapshot as a separate backup, but stops autosaving over the newer game.


A compact tracker above the play area shows your next contract objective and remaining days. Tap it to open the ledger; it highlights when a reward or ending choice is ready.


Market batch buttons show their quantity and total price before trading. Buy batches fit your remaining cart space, purse and available stock; sell batches count every item toward trading contracts.


During power selection, eight dots preview the start of the flight using your aim, weapon strength and weather. The guide does not predict collisions, bounces or moving targets.


The day/night sky includes visible sun, a transparent crescent moon and fading stars. A blue night wash and darker night clouds keep the painted towns readable while gameplay targets remain clear.


The main stage cast now uses illustrated face and costume atlases, including guards and clergy. See assets/CAST_ART_NOTES.md for the source prompts and frame-export notes. High York targets appear from blade level 8, when stronger launches can reach them.
