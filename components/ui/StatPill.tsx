import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from '@/lib/tw';
import { theme } from '@/lib/theme';

export type StatPillProps = {
  label: string;
  value: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
};

export default function StatPill({ label, value, icon }: StatPillProps) {
  return (
    <View
      style={[
        tw`flex-row items-center gap-2 rounded-full px-3 py-2`,
        { backgroundColor: '#ffffff', borderColor: theme.colors.border, borderWidth: 1 },
      ]}
    >
      {icon ? <Ionicons name={icon} size={14} color={theme.colors.mut} /> : null}
      <Text style={[tw`text-xs`, { color: theme.colors.mut }]}>{label}</Text>
      <Text style={[tw`text-xs font-semibold`, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
}
