// app/welcome.tsx  ←  ruta = “/welcome”
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import tw from '@/lib/tw';

export default function Welcome() {
  const router = useRouter();
  return (
    <View style={tw`flex-1 items-center justify-center bg-light px-6`}>
      <Text style={tw`text-primary text-4xl font-extrabold`}>PrepAI English</Text>
      <Text style={tw`text-royal mt-2`}>Bienvenido</Text>

      <Pressable
        onPress={() => router.push('/(auth)/login' as any)}
        style={tw`mt-8 px-6 py-3 rounded-xl bg-accent`}
      >
        <Text style={tw`text-white font-semibold`}>Iniciar sesión</Text>
      </Pressable>
    </View>
  );
}
