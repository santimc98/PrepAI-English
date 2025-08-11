import { Pressable, Text, ViewStyle, TextStyle } from 'react-native';
import tw from '@/lib/tw';

export function Button({
  title,
  onPress,
  style,
  textStyle,
}: {
  title: string;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={(state) => {
        const s = state as any;
        return [
          tw`rounded-2xl px-4 py-3`,
          { minHeight: 44, justifyContent: 'center', backgroundColor: '#1d4ed8' },
          s?.hovered ? { opacity: 0.95 } : null,
          state.pressed ? { transform: [{ scale: 0.98 }] } : null,
          s?.focused ? ({ outlineStyle: 'solid', outlineWidth: 2, outlineColor: '#93c5fd' } as any) : null,
          style as any,
        ];
      }}
    >
      <Text style={[tw`text-white text-center font-semibold`, textStyle]}>{title}</Text>
    </Pressable>
  );
}


