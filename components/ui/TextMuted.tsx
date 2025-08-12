import { TextProps } from 'react-native';
import tw from '@/lib/tw';
import { AppText } from '@/components/ui/Typography';

export default function TextMuted({ children, style, ...rest }: TextProps & { children: React.ReactNode }) {
  return (
    <AppText style={[tw`text-slate-600`, style]} {...rest}>
      {children}
    </AppText>
  );
}
