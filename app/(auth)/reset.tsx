import { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Platform } from 'react-native';
import AuthCard from '@/components/AuthCard';
import { supabase } from '@/lib/supabase';
import tw from '@/lib/tw';
import { theme } from '@/lib/theme';
import { getRedirectTo } from '@/lib/auth';

type Alert = { type: 'success' | 'error'; text: string } | null;

export default function ResetScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<Alert>(null);
  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);

  return (
    <View style={[tw`flex-1 items-center justify-center px-4`, { backgroundColor: theme.colors.bg }]}>
      <AuthCard title="Restablecer contraseña" subtitle="Te enviaremos un enlace para restablecerla">
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
            returnKeyType="go"
            // @ts-ignore
            enterKeyHint="go"
            onSubmitEditing={async () => { if (emailValid && !loading) await submit(); }}
          />

          <Pressable
            disabled={!emailValid || loading}
            onPress={submit}
            accessibilityRole="button"
            accessibilityLabel="Enviar email de restablecimiento"
            style={[tw`mt-4 items-center rounded-xl px-5 py-3`, { backgroundColor: '#1d4ed8', opacity: (!emailValid || loading) ? 0.6 : 1 }]}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={tw`text-white font-semibold`}>Enviar</Text>}
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
      await supabase.auth.resetPasswordForEmail(email, { redirectTo: getRedirectTo() });
      setAlert({ type: 'success', text: 'Te hemos enviado un email para restablecer tu contraseña' });
    } catch (e: any) {
      setAlert({ type: 'error', text: e?.message || 'No se pudo enviar el email' });
    } finally {
      setLoading(false);
    }
  }
}
