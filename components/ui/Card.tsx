import { Platform, View, ViewStyle } from 'react-native';
import tw from '@/lib/tw';
import { theme } from '@/lib/theme';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle | ViewStyle[] }) {
  return (
    <View
      style={[
        tw`rounded-2xl p-4`,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 },
        Platform.select({
          ios: { shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
          android: { elevation: 2 },
          default: { shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
        }) as any,
        style,
      ]}
    >
      {children}
    </View>
  );
}


