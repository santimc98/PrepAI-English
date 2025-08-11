import { Text, TextProps } from 'react-native';
import tw from '@/lib/tw';

export default function TextMuted({ children, style, ...rest }: TextProps & { children: React.ReactNode }) {
  return (
    <Text style={[tw`text-slate-600`, style]} {...rest}>
      {children}
    </Text>
  );
}
