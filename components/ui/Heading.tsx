import { Text, TextProps } from 'react-native';
import tw from '@/lib/tw';

export default function Heading({ children, style, ...rest }: TextProps & { children: React.ReactNode }) {
  return (
    <Text style={[tw`text-2xl font-semibold`, style]} {...rest}>
      {children}
    </Text>
  );
}
