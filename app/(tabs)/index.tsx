import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import * as Speech from 'expo-speech';
import tw from '@/lib/tw';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Container from '@/components/layout/Container';
import Heading from '@/components/ui/Heading';
import TextMuted from '@/components/ui/TextMuted';

export default function Home() {
  const router = useRouter();
  return (
    <Container>
      <Heading>PrepAI English</Heading>
      <TextMuted>Mock exams powered by AI</TextMuted>

      <Button title="Empezar un simulacro" onPress={() => router.push('/(tabs)/exams' as any)} style={tw`mt-2`} />

      <Button
        title="Probar Listening (TTS)"
        onPress={() =>
          Speech.speak('Welcome to PrepAI English. This is a sample listening prompt.', { language: 'en-US' })
        }
        style={[tw`mt-3`, { backgroundColor: '#3646ff' }]}
      />

      <Button title="Ir a Speaking" onPress={() => router.push('/practice/speaking' as any)} style={[tw`mt-3`, { backgroundColor: '#000' }]} />
    </Container>
  );
}
