import { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import AuthCard from '@/components/AuthCard';
import { supabase } from '@/lib/supabase';
import tw from '@/lib/tw';
import { theme } from '@/lib/theme';

function getRedirectTo(): string {
  const url = Linking.createURL('auth/callback');
  if (typeof window !== 'undefined' && !url.startsWith('http')) {
    return `${window.location.origin}/auth/callback`;
  }
  return url;
}

type Alert = { type: 'success' | 'error'; text: string } | null;

export default function SignupScreen() {
  const _router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<Alert>(null);
  const redirectTo = getRedirectTo();

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const canSubmit = emailValid && password.length >= 6 && !loading;

  return (
    <View style={[tw`flex-1 items-center justify-center px-4`, { backgroundColor: theme.colors.bg }]}>
      <AuthCard title="Crear cuenta" subtitle="Te enviaremos un email de confirmación">
        <View style={tw`w-full gap-3`}>
          <Text style={{ color: theme.colors.text }}>Email</Text>
          <TextInput
            inputMode="email"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="ejemplo@mail.com"
            style={tw`rounded-xl border bg-white px-4 py-3`}
            value={email}
            onChangeText={setEmail}
            accessibilityLabel="Email"
            nativeID="email"
            // @ts-ignore
            name="email"
            // @ts-ignore
            autoComplete="email"
            returnKeyType="next"
          />
          {!emailValid && email.length > 0 && (
            <Text style={[tw`text-xs mt-1`, { color: '#dc2626' }]}>Introduce un email válido</Text>
          )}

          <Text style={{ color: theme.colors.text }}>Contraseña</Text>
          <TextInput
            secureTextEntry
            placeholder="••••••"
            style={tw`rounded-xl border bg-white px-4 py-3`}
            value={password}
            onChangeText={setPassword}
            accessibilityLabel="Contraseña"
            nativeID="password"
            // @ts-ignore
            name="password"
            // @ts-ignore
            autoComplete="new-password"
            returnKeyType="go"
            // @ts-ignore
            enterKeyHint="go"
            onSubmitEditing={async () => { if (canSubmit) await submit(); }}
          />

          <Pressable
            disabled={!canSubmit}
            onPress={submit}
            accessibilityRole="button"
            accessibilityLabel="Crear cuenta"
            style={[tw`mt-4 items-center rounded-xl px-5 py-3`, { backgroundColor: '#1d4ed8', opacity: canSubmit ? 1 : 0.6 }]}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={tw`text-white font-semibold`}>Crear cuenta</Text>}
          </Pressable>

          {alert && (
            <View style={[tw`mt-4 rounded-xl px-4 py-3`, { backgroundColor: alert.type === 'error' ? '#FDECEC' : '#E8F2FF' }]}>
              <Text style={[tw`text-center`, { color: alert.type === 'error' ? '#dc2626' : theme.colors.brand[600] }]}>{alert.text}</Text>
            </View>
          )}
        </View>
      </AuthCard>
    </View>
  );

  async function submit() {
    setAlert(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });
      if (error) throw error;
      setAlert({ type: 'success', text: 'Cuenta creada. Revisa tu correo para confirmar.' });
      // Opcional: router.replace('/(auth)/login');
    } catch (e: any) {
      setAlert({ type: 'error', text: e?.message || 'Error creando la cuenta' });
    } finally {
      setLoading(false);
    }
  }
}
