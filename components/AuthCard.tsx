import { View, Text } from 'react-native';
import { ExternalLink } from '@/components/ExternalLink';
import tw from '@/lib/tw';
import { theme } from '@/lib/theme';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthCard({ title, subtitle, children, footer }: Props) {
  return (
    <View style={[tw`w-full rounded-2xl bg-white p-8`, { maxWidth: 420, borderWidth: 1, borderColor: '#E5E7EB' }]}>
      <View style={tw`items-center`}>
        <Text style={[tw`text-3xl font-extrabold text-center`, { color: theme.colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[tw`mt-2 text-center`, { color: theme.colors.brand[600] }]}>{subtitle}</Text> : null}
      </View>
      <View style={tw`mt-6`}>{children}</View>
      <View style={tw`mt-6 items-center gap-2`}>
        {footer}
        <View style={tw`flex-row gap-3`}>
          <ExternalLink href="https://example.com/terms">Términos</ExternalLink>
          <ExternalLink href="https://example.com/privacy">Privacidad</ExternalLink>
        </View>
      </View>
    </View>
  );
}


