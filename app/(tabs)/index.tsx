import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import * as Speech from 'expo-speech';
import tw from '@/lib/tw';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Home() {
  const router = useRouter();
  return (
    <View style={tw`flex-1`}>
      <View style={tw`w-full max-w-3xl mx-auto p-4 gap-3`}>
        <Text style={tw`text-2xl font-semibold`}>PrepAI English</Text>
        <Text style={tw`text-slate-600`}>Mock exams powered by AI</Text>

        <Button title="Empezar un simulacro" onPress={() => router.push('/(tabs)/exams' as any)} style={tw`mt-4`} />

        <Button
          title="Probar Listening (TTS)"
          onPress={() =>
            Speech.speak('Welcome to PrepAI English. This is a sample listening prompt.', { language: 'en-US' })
          }
          style={[tw`mt-4`, { backgroundColor: '#3646ff' }]}
        />

        <Button title="Ir a Speaking" onPress={() => router.push('/practice/speaking' as any)} style={[tw`mt-3`, { backgroundColor: '#000' }]} />
      </View>
    </View>
  );
}
