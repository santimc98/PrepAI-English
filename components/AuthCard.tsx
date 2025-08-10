import { View, Text } from 'react-native';
import { ExternalLink } from '@/components/ExternalLink';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthCard({ title, subtitle, children, footer }: Props) {
  return (
    <View className="w-full max-w-[420px] rounded-2xl border border-[#E5E7EB] bg-white p-8">
      <View className="items-center">
        <Text className="text-primary text-3xl font-extrabold text-center">{title}</Text>
        {subtitle ? <Text className="mt-2 text-royal text-center">{subtitle}</Text> : null}
      </View>
      <View className="mt-6">{children}</View>
      <View className="mt-6 items-center gap-2">
        {footer}
        <View className="flex-row gap-3">
          <ExternalLink href="https://example.com/terms">Términos</ExternalLink>
          <ExternalLink href="https://example.com/privacy">Privacidad</ExternalLink>
        </View>
      </View>
    </View>
  );
}


