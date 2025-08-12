import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from '@/lib/tw';
import { theme } from '@/lib/theme';

export type ActionCardProps = {
  title: string;
  subtitle?: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
  tone?: 'primary' | 'success' | 'info' | 'neutral';
  small?: boolean;
};

const tones: Record<NonNullable<ActionCardProps['tone']>, { bg: string; fg: string }> = {
  primary: { bg: theme.colors.brand[600], fg: '#ffffff' }, // #1d4ed8
  success: { bg: '#16a34a', fg: '#ffffff' },
  info: { bg: theme.colors.brand[500], fg: '#ffffff' }, // #2563eb
  neutral: { bg: '#64748b', fg: '#ffffff' },
};

export function ActionCard({ title, subtitle, icon, onPress, tone = 'neutral', small }: ActionCardProps) {
  const c = tones[tone];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        tw`w-full rounded-2xl`,
        { minHeight: small ? 56 : 72, outlineStyle: 'auto' as any },
        { backgroundColor: '#ffffff', borderColor: theme.colors.border, borderWidth: 1 },
        { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
        pressed ? { opacity: 0.9 } : null,
      ]}
    >
      <View style={tw`flex-row items-center gap-4 p-4`}>
        <View
          style={[tw`items-center justify-center rounded-2xl`, { width: small ? 36 : 44, height: small ? 36 : 44, backgroundColor: c.bg }]}
        >
          <Ionicons name={icon} size={small ? 18 : 22} color={c.fg} />
        </View>
        <View style={tw`flex-1`}>
          <Text style={[tw`font-semibold`, { fontSize: small ? 16 : 18, color: theme.colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[tw`mt-1`, { color: theme.colors.mut, fontSize: small ? 12 : 13 }]}>{subtitle}</Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.mut} />
      </View>
    </Pressable>
  );
}

export default ActionCard;
