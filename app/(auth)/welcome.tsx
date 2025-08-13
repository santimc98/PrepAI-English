// app/welcome.tsx  ←  ruta = "/welcome"
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import tw from '@/lib/tw';
import { theme } from '@/lib/theme';

export default function Welcome() {
  const router = useRouter();
  return (
    <View style={[tw`flex-1 items-center justify-center px-6`, { backgroundColor: theme.colors.bg }]}>
      <Text style={[tw`text-4xl font-extrabold`, { color: theme.colors.text }]}>PrepAI English</Text>
      <Text style={[tw`mt-2 mb-8`, { color: theme.colors.brand[600] }]}>Bienvenido</Text>

      <View style={tw`w-full max-w-xs gap-4`}>
        <Pressable
          onPress={() => router.push('/(auth)/login' as any)}
          style={[tw`px-6 py-3 rounded-xl`, { backgroundColor: theme.colors.brand[500] }]}
        >
          <Text style={tw`text-white font-semibold text-center`}>Iniciar sesión</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(auth)/email' as any)}
          style={[tw`px-6 py-3 rounded-xl border`, { 
            borderColor: theme.colors.brand[500],
            backgroundColor: 'transparent'
          }]}
        >
          <Text style={[tw`font-semibold text-center`, { color: theme.colors.brand[500] }]}>
            Acceder con email
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
