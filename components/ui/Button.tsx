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
      onPress={onPress}
      style={[tw`rounded-2xl px-4 py-3`, { backgroundColor: '#1d4ed8' }, style]}
    >
      <Text style={[tw`text-white text-center font-semibold`, textStyle]}>
        {title}
      </Text>
    </Pressable>
  );
}


