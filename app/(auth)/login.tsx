import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import AuthCard from '@/components/AuthCard';
import tw from '@/lib/tw';
import { Button } from '@/components/ui/Button';

export default function LoginScreen() {
  const { signInWithProvider, initializing } = useAuth();

  return (
    <View style={[tw`flex-1 justify-center`, { alignItems: 'center' }]}>
      <AuthCard title="PrepAI English" subtitle="Accede para continuar">
        <View style={tw`w-full gap-3`}>
          <Button
            title="Continuar con Google"
            onPress={() => signInWithProvider('google')}
            style={[tw`w-full`, { backgroundColor: '#22c55e' }]}
            textStyle={tw`font-semibold`}
          />

          <Link
            href="/(auth)/email"
            style={[tw`items-center rounded-xl px-5 py-3`, { backgroundColor: '#3646ff' }] as any}
          >
            <Text style={tw`text-white font-semibold text-center`}>Acceder con email</Text>
          </Link>
        </View>
      </AuthCard>
    </View>
  );
}


