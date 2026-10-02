# Chop To It! — coordinated web, iPhone and Android release

The game uses one verified web release for the website and both store apps. `npm run native:sync` runs the browser tests, creates the upload folder, copies that release into each native app, adds the native save-sharing bridge, and refreshes the game icon and launch screens. `npm run native:check` verifies both copies match the release. The `releases/` and `native-web/` folders are generated and are intentionally not committed.

`native-build.json` records the web release, app ID and SHA-256 hash of the bundled phone integration. Native checks reject mismatched integration or metadata in either platform, not just stale game files. Record this metadata and the source commit when testing an app. A deliberate stale Android bridge was rejected, then the restored package passed verification.

Development ID: `io.github.spacepilot121.choptoit`. Confirm the permanent ID with the owner before creating store listings, signing or uploading a build. Store IDs are hard to change once released. Native project version numbers currently start at 1.0 / build 1 and must be increased for later store submissions.

## Android

Use Android Studio with Android SDK API 36. Run `npm ci`, then `npm run native:sync`. Open `android/` in Android Studio, install the app on real Android phones, and run the scenarios in `PLAYTEST.md`. The generated project targets API 36 and supports Android API 24 and newer. After the owner supplies the Play Console account and signing key, create a signed release app bundle (`.aab`) and test it through an internal Play track. Keep the signing key out of Git.

## iPhone

The owner currently has neither a Mac nor an Apple Developer membership. Hosted Mac builds already compile the project, so buying a Mac is not a prerequisite for continuing development. TestFlight and App Store distribution require membership and signing setup under the owner's account; see [Apple's distribution guidance](https://developer.apple.com/tutorials/develop-in-swift/welcome-to-app-distribution). Signed hosted builds still need to be configured and verified after that setup. Browser testing on iPhone is useful but does not replace testing the native app.

Use a Mac with Xcode 26 or newer. Run `npm ci`, then `npm run native:sync`. Open `ios/App/App.xcodeproj` in Xcode, set the owner's Apple development team, install on real iPhones, and run the scenarios in `PLAYTEST.md`. Archive and upload a signed build to TestFlight after device checks. The repository includes a privacy manifest entry for the file-sharing plugin; confirm the final App Store privacy answers with the owner before submission.

## Coordinated launch gates

- Settle the permanent app ID, store name, ownership, age rating, privacy answers, screenshots and support contact.
- Test a fresh installation and an update with an existing save on physical iPhone and Android devices. Verify startup, portrait safe areas, touch latency, audio, app switching, offline reopening, markets, travel, ending, save backup sharing and restoration.
- Produce signed candidate builds from the same commit and release ID; record that ID with each test result.
- Submit both store builds for review before publishing the matching web release. Make the public release date dependent on both approvals, since their review times are outside this project.

This Windows workspace has no Android Studio, Android SDK, JDK or Xcode, so native compilation and device installation must happen on equipped machines. The generated native projects and copied content have been checked here; that is not a substitute for installing signed builds on phones.

The pull request also starts unsigned Android and iOS simulator builds in GitHub Actions. A passing result confirms that both projects compile; it still does not prove touch feel, audio, storage or store signing on physical phones.

## Compilation evidence — 2 October

[Run 37039832841](https://github.com/spacepilot121/choptoit/actions/runs/37039832841) passed both platform builds for commit `0d08145`, including exact native bridge and app-identity verification. Game release remains `83239100c0da62ba`.

[Run 37039105893](https://github.com/spacepilot121/choptoit/actions/runs/37039105893) passed Android and iOS compilation for commit `2b9a6b4`, including the softened sky in game release `2aa0123062ebf4bb`.

[Run 37039549661](https://github.com/spacepilot121/choptoit/actions/runs/37039549661) passed both builds for commit `01a08c9`, game release `83239100c0da62ba`, with Android Back navigation. Its downloaded APK's 66 game files and bundled native bridge matched the current local native package byte for byte. The test APK is `releases/choptoit-android-83239100c0da62ba.apk`. It has not been installed on a physical phone. The subsequent packaging-verification change adds app ID and bridge hash to build metadata; this earlier APK's metadata does not contain those new fields.

Commit `caa22d3` passed both native jobs in [run 37037158952](https://github.com/spacepilot121/choptoit/actions/runs/37037158952): Android `assembleDebug` with Java 21 and an unsigned iOS simulator build on macOS. Both use game release `0b6c0be81083503a`. The Android job now also exports a downloadable test APK in later workflow runs. Native audio suspension is explicitly tested even when the browser visibility state does not change. Signed release builds, store uploads and physical phone validation remain open.

[Run 37037340394](https://github.com/spacepilot121/choptoit/actions/runs/37037340394) also passed both builds and exported `choptoit-android-test`. Its APK was downloaded and all 66 bundled game files matched the local native package byte for byte. Source line endings are now fixed to LF to keep the web release ID identical on Windows, Android builders and macOS. The downloadable APK is a development build for testing, not a Play Store release bundle.

## Angular content revision - 2 October

Current local native content is game release ea4bff74b56b387e. Both platform projects pass content sync and exact-package checks. Previously downloaded APK 83239100c0da62ba has the older artwork. A new platform compilation is required for the angular revision; physical-device testing and signed store builds remain open.

Both platform jobs passed for commit 91461a4 in run 37045057786 (https://github.com/spacepilot121/choptoit/actions/runs/37045057786). The Android development APK is releases/choptoit-android-ea4bff74b56b387e.apk. Every one of its 64 game files, native bridge and build metadata matched the local verified package byte for byte. This confirms compilation and packaging; physical installation, touch feel and store signing remain unverified.
