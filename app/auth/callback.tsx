import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const url = Linking.useURL();
  useEffect(() => {
    (async () => {
      if (!url) return;
      const { queryParams } = Linking.parse(url);
      const code = (queryParams?.code as string) || '';
      if (code) await supabase.auth.exchangeCodeForSession(code as any);
      router.replace('/(tabs)');
    })();
  }, [router, url]);

  return (
    <View className="flex-1 items-center justify-center bg-light">
      <Text className="text-primary text-xl font-semibold">Autenticando…</Text>
    </View>
  );
}


