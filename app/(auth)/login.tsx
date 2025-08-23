import { View, Text, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import AuthCard from '@/components/AuthCard';
import tw from '@/lib/tw';
import { Button } from '@/components/ui/Button';
import Container from '@/components/layout/Container';
import { useToast } from '@/providers/Toast';

export default function LoginScreen() {
  const { signInWithProvider, initializing: _initializing } = useAuth();
  const toast = useToast();

  return (
    <Container>
      <View style={[tw`w-full self-center`, { maxWidth: 480 }] }>
        <AuthCard title="PrepAI English" subtitle="Accede para continuar">
          <View style={tw`w-full gap-3`}>
            <Button
              title="Continuar con Google"
              onPress={async () => {
                try {
                  await signInWithProvider('google');
                } catch (e) {
                  try { toast.error('No se pudo iniciar sesión'); } catch {}
                }
              }}
              style={[tw`w-full`, { backgroundColor: '#22c55e' }]}
              textStyle={tw`font-semibold`}
            />

            <Pressable
              accessibilityRole="link"
              onPress={() => {
                if (Platform.OS === 'web') console.log('[nav] go /email clicked');
                router.push('/email');
              }}
              style={[tw`items-center rounded-xl px-5 py-3`, { backgroundColor: '#1d4ed8' }]}
            >
              <Text style={tw`text-white font-semibold text-center`}>Acceder con email</Text>
            </Pressable>
          </View>
        </AuthCard>
      </View>
    </Container>
  );
}


