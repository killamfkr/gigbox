# Cherry Picker: overlay and automatic accept or decline

Gigbox’s Cherry Picker helps you compare an offer using **pay + tip**, **dollars per mile**, and **dollars per hour**, and (when you set thresholds) a live **Accept** or **Decline** suggestion based on **your** rules.

## What this repository ships today

- In-app calculator and saved thresholds (persisted with the rest of the app state).
- A clear **Accept / Decline / Needs more info** verdict as you type.
- A small **native bridge** hook (`NativeModules.GigboxCherryPicker`) that is **empty** in the standard Expo build. When a future native module is present, the app can detect it via `isNativeCherryDriverAvailable()`.

It does **not** yet include:

- A **system overlay** window drawn on top of Uber, Lyft, or DoorDash.
- An **AccessibilityService** that reads those apps’ screens or presses Accept or Decline for you.

Those features require **custom Android native code** (and usually a dev client / bare workflow), plus ongoing maintenance every time partner apps change their UI.

## Platform limits

- **iOS:** Third-party apps cannot provide the same “float on top of another app” experience Android allows. Drivers typically use **App Switcher**, **Picture in Picture** (where supported), or a second device.
- **Android:** A true overlay uses `SYSTEM_ALERT_WINDOW` (“Display over other apps”). Combining that with automated taps usually means an **AccessibilityService**. Both are sensitive capabilities; users must enable them explicitly in system settings.

## Terms of service and account risk

Uber, Lyft, and DoorDash driver agreements and product policies often restrict **automation**, **macros**, or **interception** of the driver app. **Automated** accept or decline can risk **deactivation**. Gigbox is designed to give **you** the numbers and a **recommendation**; you remain responsible for the final tap in the partner app unless you choose to use a separate tool you trust and understand.

## Suggested direction for a native companion (out of scope for the JS-only app)

1. **AccessibilityService** (Kotlin) that:
   - Listens for windows from known driver package names.
   - Parses on-screen text (or known node ids when stable) for pay, distance, and time.
   - Compares parsed values to the same rules as `evaluateCherryOffer` in `app/features/jobs/evaluateCherryOffer.ts` (ideally shared logic via duplicated constants or a small JSON contract).
2. **Overlay** `TYPE_APPLICATION_OVERLAY` showing the verdict and large Accept / Decline **hints**, with actual taps still performed carefully and only when the user has opted in.
3. **Bridge** methods exposed as `GigboxCherryPicker` in `NativeModules`, matching `app/features/jobs/cherryPickerNativeBridge.ts`.

Until that ships, **Android split-screen** (Gigbox beside the driver app) is the most reliable way to use Cherry Picker while offers appear.
