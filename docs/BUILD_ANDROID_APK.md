# Android APK (debug)

This app is an **Expo SDK 41** project. You can produce an **Android APK** in two ways.

## GitHub Actions (recommended)

1. Merge the workflow at `.github/workflows/android-apk.yml` (or use a branch that includes it).
2. In GitHub: **Actions** → **Android APK (debug)** → **Run workflow** (or push to `master` with changes under `app/`).
3. Download the workflow **artifact**; it contains `app-debug.apk`.

The build uses **Expo prebuild** (generates `app/android/` in CI only) and **`assembleDebug`**. It is signed with the **debug** keystore (fine for testing; Play Store needs a release keystore / AAB).

## Local machine

From the repo root:

```bash
cd app
yarn install --ignore-engines
npx expo prebuild --platform android --no-install
cd android && ./gradlew assembleDebug
```

APK path: `app/android/app/build/outputs/apk/debug/app-debug.apk`.

You need **JDK 11** and the **Android SDK** (Android Studio or `sdkmanager`) installed and `ANDROID_HOME` set.

## Caveats

- First **prebuild** / Gradle run can take a long time and needs network for dependencies.
- **`GOOGLE_API_KEY`** in `app.config.js` may be empty in CI; maps can still build but may need a key at runtime.
- **Release** builds for production need signing configuration in Gradle (not covered here).
