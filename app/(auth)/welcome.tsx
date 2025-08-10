// app/welcome.tsx  ←  ruta = “/welcome”
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function Welcome() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center bg-light px-6">
      <Text className="text-primary text-4xl font-extrabold">PrepAI English</Text>
      <Text className="text-royal mt-2">Bienvenido</Text>

      <Pressable
        onPress={() => router.push('/(auth)/login' as any)}
        className="mt-8 px-6 py-3 rounded-xl bg-accent"
      >
        <Text className="text-white font-semibold">Iniciar sesión</Text>
      </Pressable>
    </View>
  );
}
