# Android APK (debug)

The workflow **Android APK (debug)** lives at `.github/workflows/android-apk.yml`.

## When it runs

- **Manually:** GitHub → **Actions** → **Android APK (debug)** → **Run workflow** (pick branch; default branch recommended).
- **On push to `master`** when files under `app/` or the workflow file change.
- **On pull requests to `master`** that touch `app/` or the workflow (optional CI signal).

## Get the APK

Open the green workflow run → scroll to **Artifacts** → download **`gigbox-debug-<commit>`** → unzip → **`app-debug.apk`**.

That APK is **debug-signed** (for sideload / QA), not a Play Store release build.

## Local build

```bash
cd app
yarn install --ignore-engines
npx expo prebuild --platform android --no-install
cd android && ./gradlew assembleDebug
```

Output: `app/android/app/build/outputs/apk/debug/app-debug.apk` (needs **JDK 11** + Android SDK for this Expo/RN stack; CI uses JDK 17 only for `sdkmanager`, then JDK 11 for Gradle).

## Troubleshooting

If Gradle fails with **missing `react-native-unimodules/gradle.groovy`**, the managed `expo prebuild` template still expects the **`react-native-unimodules`** package under `app/node_modules/`. This repo lists it as an explicit dependency so CI installs it before `./gradlew`.

If Gradle fails with **missing `:unimodules-*-interface`** projects (for example `:unimodules-font-interface`), `react-native-unimodules` only links native packages that exist under `node_modules/`. This repo adds the interface packages **`unimodules-font-interface`**, **`unimodules-constants-interface`**, **`unimodules-file-system-interface`**, and **`unimodules-image-loader-interface`** so Gradle can resolve them for Expo modules such as `expo-font` and `expo-image-picker`.

**Expo prebuild** may rewrite `app/package.json` (for example changing `react-native-unimodules` or `main`). The **Android APK (debug)** workflow restores **`app/package.json`** and **`app/index.js`** from git immediately after prebuild so CI uses the same dependency pins as the repository.

If Gradle cannot resolve **Facebook Fresco** / **Flipper** artifacts: the RN template pulls **Flipper**’s **Fresco 2.2.0** stack, but **`com.facebook.fresco:fbcore:2.2.0` (and siblings) were never published to Maven Central**—they only ever lived on JCenter ([facebook/fresco#2622](https://github.com/facebook/fresco/issues/2622)). Adding **Maven Central** alone is not enough. The CI workflow therefore **drops the three Flipper `debugImplementation` lines** from `android/app/build.gradle` after `expo prebuild` (Flipper is optional; `MainApplication` loads it by reflection and tolerates it being absent). It still adds **Maven Central** to `android/build.gradle` for other dependencies.

If Gradle cannot resolve **`com.facebook.react:react-native:+`**: the Expo-managed **`react-native` tarball does not ship the prebuilt Maven layout** under `node_modules/react-native/android` that the RN 0.63 template expects. The CI workflow runs **`:ReactAndroid:installArchives`** once (with a temporary `settings.gradle` include) to publish that artifact into `node_modules/react-native/android` before **`assembleDebug`**.

If Gradle cannot resolve **`com.theartofdev.edmodo:android-image-cropper`** (used by **`expo-image-picker`**): that coordinate lived on JCenter. The workflow adds a **`resolutionStrategy`** redirect to **`com.github.ArthurHub:Android-Image-Cropper:2.8.0`** on **JitPack** (the template already lists `jitpack.io`).
