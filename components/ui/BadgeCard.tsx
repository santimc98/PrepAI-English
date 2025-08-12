import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from '@/lib/tw';
import { theme } from '@/lib/theme';

export type BadgeCardProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
};

export default function BadgeCard({ icon, title }: BadgeCardProps) {
  return (
    <View style={[tw`flex-row items-center gap-3 rounded-2xl p-4`, { backgroundColor: '#fff', borderColor: theme.colors.border, borderWidth: 1 }]}>
      <View style={[tw`items-center justify-center rounded-xl`, { width: 36, height: 36, backgroundColor: theme.colors.brand[500] }]}>
        <Ionicons name={icon} size={18} color="#fff" />
      </View>
      <Text style={[tw`font-semibold`, { color: theme.colors.text }]}>{title}</Text>
    </View>
  );
}
