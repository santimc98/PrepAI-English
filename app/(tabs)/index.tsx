import { View, Text, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import * as Speech from 'expo-speech';

export default function Home() {
  const router = useRouter();
  return (
    <View className="flex-1">
      <View className="mx-auto w-full max-w-3xl p-4 gap-3">
        <Text className="text-2xl font-semibold text-primary">PrepAI English</Text>
        <Text className="text-royal">Mock exams powered by AI</Text>

        <Link
          href="/(tabs)/exams"
          className="mt-4 px-4 py-3 rounded-2xl bg-brand-600 text-white text-center"
        >
          Empezar un simulacro
        </Link>

        <Pressable
          className="mt-4 px-4 py-3 rounded-2xl bg-royal"
          onPress={() => Speech.speak('Welcome to PrepAI English. This is a sample listening prompt.', { language: 'en-US' })}
        >
          <Text className="text-white font-semibold text-center">Probar Listening (TTS)</Text>
        </Pressable>

        <Pressable
          className="mt-3 px-4 py-3 rounded-2xl bg-black"
          onPress={() => router.push('/practice/speaking') }
        >
          <Text className="text-white font-semibold text-center">Ir a Speaking</Text>
        </Pressable>
      </View>
    </View>
  );
}
