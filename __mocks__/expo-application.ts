// Basic mock for expo-application
export const nativeApplicationVersion = '0.0.0-test';
export const nativeBuildVersion = '0';
export async function getIosIdForVendorAsync(): Promise<string | null> {
  return 'ios-id-test';
}
export function getAndroidId(): string | null {
  return 'android-id-test';
}
export default {
  nativeApplicationVersion,
  nativeBuildVersion,
  getIosIdForVendorAsync,
  getAndroidId,
};
