import { View, ViewStyle } from 'react-native';
import tw from '@/lib/tw';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle | ViewStyle[] }) {
  return (
    <View style={[tw`rounded-2xl border border-slate-200 bg-white p-4`, { shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }, style]}>
      {children}
    </View>
  );
}


