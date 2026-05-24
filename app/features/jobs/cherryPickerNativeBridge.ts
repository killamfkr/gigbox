import { NativeModules, Platform } from 'react-native';

/**
 * Optional native Android module (not shipped in this Expo build).
 * When present, it may request overlay permission and run an accessibility
 * driver that reads offer UI and taps accept/decline — see docs.
 */
type GigboxCherryPickerNative = {
    isAvailable?: () => boolean;
    requestOverlayPermission?: () => Promise<boolean>;
    startOverlay?: (rulesJson: string) => Promise<void>;
    stopOverlay?: () => Promise<void>;
};

const native: GigboxCherryPickerNative | undefined = NativeModules.GigboxCherryPicker as
    | GigboxCherryPickerNative
    | undefined;

export function isNativeCherryDriverAvailable(): boolean {
    if (Platform.OS !== 'android' || !native) {
        return false;
    }
    try {
        return native.isAvailable?.() === true;
    } catch {
        return false;
    }
}

export async function requestNativeOverlayPermission(): Promise<boolean> {
    if (!native?.requestOverlayPermission) {
        return false;
    }
    return native.requestOverlayPermission();
}

export async function startNativeOverlay(_rulesJson: string): Promise<void> {
    if (!native?.startOverlay) {
        return;
    }
    await native.startOverlay(_rulesJson);
}

export async function stopNativeOverlay(): Promise<void> {
    if (!native?.stopOverlay) {
        return;
    }
    await native.stopOverlay();
}
