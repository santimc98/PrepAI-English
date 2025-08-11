import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import tw from '@/lib/tw';
import { useUiTheme } from '@/providers/UiTheme';

export type AppTextProps = TextProps & {
  weight?: 'regular' | 'semibold';
};

export function AppText({ style, children, weight = 'regular', ...rest }: AppTextProps) {
  const { colorScheme } = useUiTheme();
  return (
    <RNText
      style={[
        colorScheme === 'dark' ? (tw`text-slate-100` as any) : (tw`text-slate-900` as any),
        { fontFamily: weight === 'semibold' ? 'Inter_600SemiBold' : 'Inter_400Regular' },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}
