import React from 'react';
import { Pressable, ViewStyle, TextStyle, View } from 'react-native';
import tw from '@/lib/tw';
import { AppText } from '@/components/ui/Typography';
import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { theme } from '@/lib/theme';

export interface EnhancedButtonProps {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

interface VariantStyle {
  backgroundColor: string;
  textColor: string;
  pressedColor: string;
  borderColor?: string;
  borderWidth?: number;
}

const variantStyles: Record<NonNullable<EnhancedButtonProps['variant']>, VariantStyle> = {
  primary: {
    backgroundColor: theme.colors.brand[600],
    textColor: '#ffffff',
    pressedColor: '#1e40af',
  },
  secondary: {
    backgroundColor: '#64748b',
    textColor: '#ffffff',
    pressedColor: '#475569',
  },
  outline: {
    backgroundColor: 'transparent',
    textColor: theme.colors.brand[600],
    pressedColor: '#eff6ff',
    borderColor: theme.colors.brand[600],
    borderWidth: 1,
  },
};

const sizeStyles = {
  small: { paddingVertical: 8, paddingHorizontal: 12, fontSize: 14 },
  medium: { paddingVertical: 12, paddingHorizontal: 16, fontSize: 16 },
  large: { paddingVertical: 16, paddingHorizontal: 24, fontSize: 18 },
};

export function EnhancedButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}: EnhancedButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const isDisabled = disabled || loading;
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={isDisabled ? undefined : onPress}
      hitSlop={10}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={(state) => {
        const s = state as any;
        return [
          tw`rounded-2xl items-center justify-center`,
          { minHeight: 44, minWidth: 44 },
          variantStyle.borderWidth && { borderWidth: variantStyle.borderWidth },
          variantStyle.borderColor && { borderColor: variantStyle.borderColor },
          { backgroundColor: variantStyle.backgroundColor },
          sizeStyle,
          (s?.hovered || hovered) && !isDisabled && { opacity: 0.95 },
          state.pressed && !isDisabled && { transform: [{ scale: 0.98 }] },
          (s?.focused || focused) && !isDisabled && ({
            outlineStyle: 'solid',
            outlineWidth: 2,
            outlineColor: theme.colors.brand[600],
            outlineOffset: 2
          } as any),
          isDisabled && { opacity: 0.5 },
          style as any,
        ];
      }}
    >
      <View style={tw`flex-row items-center gap-2`}>
        {loading && (
          <LoadingSpinner
            size="small"
            color={variantStyle.textColor}
            style={tw`mr-1`}
          />
        )}
        <AppText
          weight="semibold"
          style={[
            { color: variantStyle.textColor, fontSize: sizeStyle.fontSize },
            textStyle
          ]}
        >
          {loading ? 'Cargando...' : title}
        </AppText>
      </View>
    </Pressable>
  );
}

export default EnhancedButton;