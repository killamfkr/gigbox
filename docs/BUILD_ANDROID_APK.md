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
