import { View, ViewProps } from 'react-native';
import tw from '@/lib/tw';

export default function Container({ children, style, ...rest }: ViewProps & { children: React.ReactNode }) {
  return (
    <View style={tw`flex-1`} {...rest}>
      <View style={tw`w-full max-w-3xl mx-auto p-4 gap-4`}>{children}</View>
    </View>
  );
}
