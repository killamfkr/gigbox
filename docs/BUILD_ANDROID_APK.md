# Android APK builds

## GitHub Actions

1. Open **Actions** in the GitHub UI.
2. Select **Android APK (debug)**.
3. Click **Run workflow** (choose branch if needed), or push a change under `app/` to `master` to trigger it.
4. When the job finishes, download the **artifact** `gigbox-debug-<sha>`. It contains **`app-debug.apk`** (debug-signed; fine for sideloading, not for Play Store release).

The workflow runs `yarn install`, `npx expo prebuild --platform android`, and `./gradlew assembleDebug`. The `app/android/` folder is generated in CI only (not committed).

## Local build

Requires JDK 11 and Android SDK (`ANDROID_HOME`).

```bash
cd app
yarn install --ignore-engines
npx expo prebuild --platform android --no-install
cd android && ./gradlew assembleDebug
```

APK: `app/android/app/build/outputs/apk/debug/app-debug.apk`.
