import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import type { ExamMock } from '@/types/exam';
import { useMemo, useState } from 'react';

export default function ExamRunner() {
  const params = useLocalSearchParams<{ id: string; data?: string }>();
  const router = useRouter();
  const mock: ExamMock | null = useMemo(() => {
    try {
      return params.data ? (JSON.parse(params.data as string) as ExamMock) : null;
    } catch {
      return null;
    }
  }, [params.data]);

  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (!mock) {
    return (
      <View className="flex-1 items-center justify-center bg-light">
        <Text className="text-primary">No hay datos del examen</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-light">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-primary text-3xl font-extrabold">{mock.title}</Text>
        <Text className="mt-1 text-royal">Nivel: {mock.level}</Text>
        {mock.questions.map((q, idx) => (
          <View key={q.id} className="mt-6 rounded-xl bg-white p-4">
            <Text className="font-semibold text-navy">{idx + 1}. {q.prompt}</Text>
            {q.choices ? (
              <View className="mt-3 gap-2">
                {q.choices.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => setAnswers((a) => ({ ...a, [q.id]: c.text }))}
                    className={`rounded-lg border px-3 py-2 ${answers[q.id] === c.text ? 'bg-primary' : 'bg-white'}`}
                  >
                    <Text className={`${answers[q.id] === c.text ? 'text-white' : ''}`}>{c.text}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <TextInput
                placeholder="Escribe tu respuesta"
                className="mt-3 rounded-lg border bg-white px-3 py-2"
                value={answers[q.id] ?? ''}
                onChangeText={(t) => setAnswers((a) => ({ ...a, [q.id]: t }))}
              />
            )}
          </View>
        ))}

        <Pressable
          className="mt-8 items-center rounded-xl bg-accent px-5 py-3"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Terminar</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}


