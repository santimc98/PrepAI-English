import { TextProps } from 'react-native';
import tw from '@/lib/tw';
import { AppText } from '@/components/ui/Typography';

export default function Heading({ children, style, ...rest }: TextProps & { children: React.ReactNode }) {
  return (
    <AppText weight="semibold" style={[tw`text-2xl`, style]} {...rest}>
      {children}
    </AppText>
  );
}
