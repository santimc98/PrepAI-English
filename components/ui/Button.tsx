import { Pressable, ViewStyle, TextStyle } from 'react-native';
import tw from '@/lib/tw';
import { AppText } from '@/components/ui/Typography';
import { useState } from 'react';

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
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={(state) => {
        const s = state as any;
        return [
          tw`rounded-2xl px-4 py-3`,
          { minHeight: 44, minWidth: 44, justifyContent: 'center', backgroundColor: '#1d4ed8' },
          (s?.hovered || hovered) ? { opacity: 0.95 } : null,
          state.pressed ? { transform: [{ scale: 0.98 }] } : null,
          (s?.focused || focused) ? ({ outlineStyle: 'solid', outlineWidth: 2, outlineColor: '#1d4ed8', outlineOffset: 2 } as any) : null,
          style as any,
        ];
      }}
    >
      <AppText weight="semibold" style={[tw`text-white text-center`, textStyle]}>{title}</AppText>
    </Pressable>
  );
}


