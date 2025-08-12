import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import tw from '@/lib/tw';
import { theme } from '@/lib/theme';

export type SheetProps = {
  visible: boolean;
  title?: string;
  onClose?: () => void;
  children?: React.ReactNode;
};

export default function Sheet({ visible, title, onClose, children }: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[tw`flex-1 items-center justify-center`, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>        
        <Pressable style={tw`absolute inset-0`} onPress={onClose} accessibilityRole="button" />
        <View
          style={[
            tw`w-11/12 rounded-2xl`,
            { maxWidth: 520, backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.border },
          ]}
        >
          {title ? (
            <View style={tw`border-b px-5 py-4`}>
              <Text style={[tw`font-semibold`, { color: theme.colors.text }]}>{title}</Text>
            </View>
          ) : null}
          <View style={tw`p-5`}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}
