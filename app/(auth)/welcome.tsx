// app/welcome.tsx  ←  ruta = “/welcome”
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import tw from '@/lib/tw';
import { theme } from '@/lib/theme';

export default function Welcome() {
  const router = useRouter();
  return (
    <View style={[tw`flex-1 items-center justify-center px-6`, { backgroundColor: theme.colors.bg }]}>
      <Text style={[tw`text-4xl font-extrabold`, { color: theme.colors.text }]}>PrepAI English</Text>
      <Text style={[tw`mt-2`, { color: theme.colors.brand[600] }]}>Bienvenido</Text>

      <Pressable
        onPress={() => router.push('/(auth)/login' as any)}
        style={[tw`mt-8 px-6 py-3 rounded-xl`, { backgroundColor: theme.colors.brand[500] }]}
      >
        <Text style={tw`text-white font-semibold`}>Iniciar sesión</Text>
      </Pressable>
    </View>
  );
}
