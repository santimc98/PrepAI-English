// components/layout/Container.tsx
import { View, type ViewProps, type ViewStyle } from 'react-native';
import { type ReactNode } from 'react';
import tw from '@/lib/tw';

type Props = ViewProps & {
  children: ReactNode;
  style?: ViewStyle;
};

function Container({ children, style, ...rest }: Props) {
  return (
    <View {...rest} style={[tw`px-4 py-6 max-w-3xl self-center w-full`, style]}>
      {children}
    </View>
  );
}

export default Container;   // ✅ para los imports "default"
export { Container };       // (opcional) por si en algún sitio lo importas nombrado

