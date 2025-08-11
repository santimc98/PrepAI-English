import { Pressable, Text } from 'react-native';

export function Button({ title, onPress, className = '' }: { title: string; onPress?: () => void; className?: string }) {
  return (
    <Pressable onPress={onPress} className={`rounded-2xl px-4 py-3 bg-brand-600 active:opacity-90 ${className}`}>
      <Text className="text-white text-center font-medium">{title}</Text>
    </Pressable>
  );
}


