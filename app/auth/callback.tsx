import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import tw from '@/lib/tw';
import { theme } from '@/lib/theme';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const url = Linking.useURL();
  useEffect(() => {
    (async () => {
      if (!url) return;
      const { queryParams } = Linking.parse(url);
      const code =
        (queryParams?.code as string) ||
        (queryParams?.['code'] as string) ||
        '';
      try {
        if (code) {
          await supabase.auth.exchangeCodeForSession(code as any);
        }
      } catch (e) {
        console.warn('[auth/callback] exchangeCodeForSession error', e);
      }
      router.replace('/(tabs)');
    })();
  }, [router, url]);

  return (
    <View style={[tw`flex-1 items-center justify-center`, { backgroundColor: theme.colors.bg }]}>
      <ActivityIndicator color={theme.colors.brand[600]} />
      <Text style={[tw`mt-3 text-xl font-semibold`, { color: theme.colors.text }]}>Autenticando…</Text>
    </View>
  );
}


