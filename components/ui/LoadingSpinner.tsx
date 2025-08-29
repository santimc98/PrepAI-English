import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import tw from '@/lib/tw';
import { theme } from '@/lib/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  style?: any;
}

export function LoadingSpinner({
  size = 'small',
  color = theme.colors.brand[600],
  style
}: LoadingSpinnerProps) {
  return (
    <View style={[tw`justify-center items-center`, style]}>
      <ActivityIndicator
        size={size}
        color={color}
        accessibilityLabel="Cargando"
        accessibilityRole="progressbar"
      />
    </View>
  );
}

export default LoadingSpinner;