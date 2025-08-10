import { View, Text, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import * as Speech from 'expo-speech';

export default function Home() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center bg-light px-6">
      <Text className="text-primary text-4xl font-extrabold">PrepAI English</Text>
      <Text className="text-royal mt-2">Mock exams powered by AI</Text>

      <Link
        href="/(tabs)/exams"
        className="mt-8 px-5 py-3 rounded-xl bg-accent text-white font-semibold"
      >
        Empezar un simulacro
      </Link>

      <Pressable
        className="mt-4 px-5 py-3 rounded-xl bg-royal"
        onPress={() => Speech.speak('Welcome to PrepAI English. This is a sample listening prompt.', { language: 'en-US' })}
      >
        <Text className="text-white font-semibold">Probar Listening (TTS)</Text>
      </Pressable>

      <Pressable
        className="mt-3 px-5 py-3 rounded-xl bg-black"
        onPress={() => router.push('/practice/speaking') }
      >
        <Text className="text-white font-semibold">Ir a Speaking</Text>
      </Pressable>
    </View>
  );
}
