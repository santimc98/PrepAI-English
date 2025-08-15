import { useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import { Link, useRouter } from 'expo-router';
import AuthCard from '@/components/AuthCard';
import { supabase } from '@/lib/supabase';
import tw from '@/lib/tw';
import { theme } from '@/lib/theme';

function getRedirectTo(): string {
  // Usa deep link en nativo y URL absoluta en web
  const url = Linking.createURL('auth/callback');
  // En web, createURL devuelve relativo; aseguramos absoluto
  if (typeof window !== 'undefined' && !url.startsWith('http')) {
    return `${window.location.origin}/auth/callback`;
  }
  return url;
}

type Alert = { type: 'success' | 'error'; text: string } | null;

function mapAuthError(e: any): string {
  const msg: string = e?.message || '';
  if (msg.includes('Invalid login credentials')) return 'Credenciales incorrectas';
  if (msg.includes('Email not confirmed')) return 'Verifica tu email para continuar';
  return msg || 'Error de autenticación';
}

export default function EmailAuthScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<Alert>(null);
  const [show, setShow] = useState(false);
  const passwordRef = useRef<TextInput | null>(null);

  const _redirectTo = getRedirectTo();

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);

  const submitPasswordFlow = async () => {
    setAlert(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace('/(tabs)');
    } catch (e: any) {
      setAlert({ type: 'error', text: mapAuthError(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[tw`flex-1 items-center justify-center px-4`, { backgroundColor: theme.colors.bg }]}>
      <AuthCard title="Acceso con email" subtitle="Introduce tu email y contraseña">
        <View style={tw`w-full gap-3`}>
          <Text style={[tw``, { color: theme.colors.text }]}>Email</Text>
          <TextInput
            inputMode="email"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="ejemplo@mail.com"
            style={tw`rounded-xl border bg-white px-4 py-3`}
            value={email}
            onChangeText={setEmail}
            returnKeyType={'next'}
            onSubmitEditing={() => {
              passwordRef.current?.focus();
            }}
            accessibilityLabel="Campo de email"
            nativeID="email"
            // @ts-ignore web-only attributes
            name="email"
            // @ts-ignore web-only attributes
            autoComplete="email"
          />
          {!emailValid && email.length > 0 && (
            <Text style={[tw`text-xs mt-1`, { color: '#dc2626' }]}>Introduce un email válido</Text>
          )}
          <Text style={[tw`mt-3`, { color: theme.colors.text }]}>Contraseña</Text>
          <View style={tw`relative`}>
            <TextInput
              secureTextEntry={!show}
              placeholder="••••••"
              style={tw`rounded-xl border bg-white px-4 py-3 pr-16`}
              value={password}
              onChangeText={setPassword}
              ref={passwordRef}
              returnKeyType="go"
              onSubmitEditing={() => {
                if (emailValid && password.length >= 6 && !loading) submitPasswordFlow();
              }}
              accessibilityLabel="Campo de contraseña"
              nativeID="password"
              // @ts-ignore web-only attributes
              name="password"
              // @ts-ignore web-only attributes
              autoComplete="current-password"
              // @ts-ignore web-only attributes
              enterKeyHint="go"
            />
            <Pressable
              onPress={() => setShow((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              style={[tw`absolute right-3 top-1/2`, { transform: [{ translateY: -12 }] }]}
            >
              <Text style={{ color: theme.colors.brand[600], fontWeight: '600' }}>{show ? 'Ocultar' : 'Mostrar'}</Text>
            </Pressable>
          </View>

          <Pressable
            disabled={loading || !emailValid || password.length < 6}
            onPress={submitPasswordFlow}
            accessibilityRole="button"
            accessibilityLabel={'Entrar con contraseña'}
            style={[tw`mt-4 items-center rounded-xl px-5 py-3`, {
              backgroundColor: '#1d4ed8',
              opacity: loading || !emailValid || password.length < 6 ? 0.6 : 1,
            }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={tw`text-white font-semibold`}>Entrar con contraseña</Text>
            )}
          </Pressable>

          <View style={tw`mt-3 items-center gap-2`}>
            <Link href="/(auth)/signup" asChild>
              <Pressable accessibilityRole="link">
                <Text style={[tw`text-sm`, { color: theme.colors.mut }]}>¿No tienes cuenta? Crear una &gt;</Text>
              </Pressable>
            </Link>
            <Link href="/(auth)/reset" asChild>
              <Pressable accessibilityRole="link">
                <Text style={[tw`text-sm`, { color: theme.colors.mut }]}>¿Has olvidado la contraseña?</Text>
              </Pressable>
            </Link>
          </View>

          {alert && (
            <View style={[tw`mt-4 rounded-xl px-4 py-3`, { backgroundColor: alert.type === 'error' ? '#FDECEC' : '#E8F2FF' }]}>
              <Text style={[tw`text-center`, { color: alert.type === 'error' ? '#dc2626' : theme.colors.brand[600] }]}>{alert.text}</Text>
            </View>
          )}
        </View>
      </AuthCard>
    </View>
  );
}


