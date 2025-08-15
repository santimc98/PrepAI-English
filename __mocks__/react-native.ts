// Basic mock for react-native used in Jest
export const Platform = {
  OS: 'web' as const,
  select: (obj: any) => obj.web ?? obj.default,
};

export type PlatformOSType = 'ios' | 'android' | 'macos' | 'windows' | 'web';

export default { Platform };
