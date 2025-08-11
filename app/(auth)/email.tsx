import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import AuthCard from '@/components/AuthCard';
import { supabase } from '@/lib/supabase';
import tw from '@/lib/tw';

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

export default function EmailAuthScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<Alert>(null);
  const [isRegister, setIsRegister] = useState(false);

  const redirectTo = getRedirectTo();

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const passwordError = useMemo(() => {
    if (!isRegister && !password) return '';
    if (password && password.length < 8) return 'Mínimo 8 caracteres';
    return '';
  }, [password, isRegister]);

  const sendMagicLink = async () => {
    setAlert(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      setAlert({ type: 'success', text: 'Te hemos enviado un enlace mágico. Revisa tu correo.' });
    } catch (e: any) {
      setAlert({ type: 'error', text: e?.message ?? 'Error enviando el enlace' });
    } finally {
      setLoading(false);
    }
  };

  const submitPasswordFlow = async () => {
    setAlert(null);
    setLoading(true);
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });
        if (error) throw error;
        setAlert({ type: 'success', text: 'Cuenta creada. Revisa tu correo para confirmar.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      setAlert({ type: 'error', text: e?.message ?? 'Error de autenticación' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 items-center justify-center bg-light px-4`}>
      <AuthCard title="Acceso con email" subtitle="Recibe un enlace o usa contraseña">
        <View style={tw`w-full gap-3`}>
          <Text style={tw`text-navy`}>Email</Text>
          <TextInput
            inputMode="email"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="ejemplo@mail.com"
            style={tw`rounded-xl border bg-white px-4 py-3`}
            value={email}
            onChangeText={setEmail}
          />
          {!emailValid && email.length > 0 && (
            <Text style={tw`text-accent text-xs mt-1`}>Introduce un email válido</Text>
          )}

          {isRegister && (
            <>
              <Text style={tw`text-navy mt-3`}>Contraseña</Text>
              <TextInput
                secureTextEntry
                placeholder="••••••••"
                style={tw`rounded-xl border bg-white px-4 py-3`}
                value={password}
                onChangeText={setPassword}
              />
              {!!passwordError && (
                <Text style={tw`text-accent text-xs mt-1`}>{passwordError}</Text>
              )}
            </>
          )}

          <Pressable
            disabled={loading || !emailValid}
            onPress={sendMagicLink}
            style={tw`mt-4 items-center rounded-xl bg-royal px-5 py-3`}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={tw`text-white font-semibold`}>Enviar enlace mágico</Text>}
          </Pressable>

          <Pressable
            disabled={loading || !emailValid || (!isRegister && !password) || (!!passwordError)}
            onPress={submitPasswordFlow}
            style={tw`mt-3 items-center rounded-xl bg-accent px-5 py-3`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={tw`text-white font-semibold`}>{isRegister ? 'Crear cuenta' : 'Entrar con contraseña'}</Text>
            )}
          </Pressable>

          <Pressable onPress={() => setIsRegister((v) => !v)} style={tw`mt-2 items-center`}>
            <Text style={tw`text-navy text-sm`}>
              {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Crear una >'}
            </Text>
          </Pressable>

          {alert && (
            <View style={[tw`mt-4 rounded-xl px-4 py-3`, { backgroundColor: alert.type === 'error' ? '#FDECEC' : '#E8F2FF' }]}>
              <Text style={[tw`text-center`, alert.type === 'error' ? tw`text-accent` : tw`text-royal`]}>{alert.text}</Text>
            </View>
          )}
        </View>
      </AuthCard>
    </View>
  );
}


