import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import AuthCard from '@/components/AuthCard';

export default function LoginScreen() {
  const { signInWithProvider, initializing } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-light px-4">
      <AuthCard title="PrepAI English" subtitle="Accede para continuar">
        <View className="w-full gap-3">
          <Pressable
            accessibilityRole="button"
            disabled={initializing}
            onPress={() => signInWithProvider('google')}
            className="items-center rounded-xl bg-accent px-5 py-3"
          >
            <Text className="text-white font-semibold">Continuar con Google</Text>
          </Pressable>

          <Link
            href="/(auth)/email"
            className="items-center rounded-xl bg-royal px-5 py-3 text-white text-center"
          >
            Acceder con email
          </Link>
        </View>
      </AuthCard>
    </View>
  );
}


