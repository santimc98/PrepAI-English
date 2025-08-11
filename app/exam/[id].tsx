import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import type { ExamMock } from '@/types/exam';
import { useMemo, useState } from 'react';
import { saveAttempt } from '@/lib/storage';
import { useAuth } from '@/providers/AuthProvider';
import { createAttempt, finishAttempt, saveAnswer } from '@/lib/db';
import tw from '@/lib/tw';

export default function ExamRunner() {
  const params = useLocalSearchParams<{ id: string; data?: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const [cloudAttemptId, setCloudAttemptId] = useState<string | null>(null);
  
  const mock: ExamMock | null = useMemo(() => {
    try {
      return params.data ? (JSON.parse(params.data as string) as ExamMock) : null;
    } catch {
      return null;
    }
  }, [params.data]);

  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Crear attempt en nube si hay sesión y USE_SUPABASE está habilitado
  useMemo(async () => {
    if (mock && session?.user && process.env.EXPO_PUBLIC_USE_SUPABASE === 'true') {
      try {
        const attempt = await createAttempt({
          userId: session.user.id,
          examId: mock.id,
          examSnapshot: mock,
        });
        setCloudAttemptId(attempt.id);
      } catch (e) {
        console.warn('[ExamRunner] Failed to create cloud attempt:', e);
      }
    }
  }, [mock, session]);

  if (!mock) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-light`}>
        <Text style={tw`text-primary`}>No hay datos del examen</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-light`}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={tw`text-primary text-3xl font-extrabold`}>{mock.title}</Text>
        <Text style={tw`mt-1 text-royal`}>Nivel: {mock.level}</Text>
        {mock.questions.map((q, idx) => (
          <View key={q.id} style={tw`mt-6 rounded-xl bg-white p-4`}>
            <Text style={tw`font-semibold text-navy`}>{idx + 1}. {q.prompt}</Text>
            {q.choices ? (
              <View style={tw`mt-3 gap-2`}>
                {q.choices.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => setAnswers((a) => ({ ...a, [q.id]: c.text }))}
                    style={[
                      tw`rounded-lg border px-3 py-2`,
                      answers[q.id] === c.text ? tw`bg-primary` : tw`bg-white`,
                    ]}
                  >
                    <Text style={answers[q.id] === c.text ? tw`text-white` : undefined}>{c.text}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <TextInput
                placeholder="Escribe tu respuesta"
                style={tw`mt-3 rounded-lg border bg-white px-3 py-2`}
                value={answers[q.id] ?? ''}
                onChangeText={(t) => setAnswers((a) => ({ ...a, [q.id]: t }))}
              />
            )}
          </View>
        ))}

        <Pressable
          style={tw`mt-8 items-center rounded-xl bg-accent px-5 py-3`}
          onPress={async () => {
            const total = mock.questions.length;
            const correct = mock.questions.reduce((acc, q) => {
              const given = answers[q.id];
              return acc + (q.answer && given && given.trim().toLowerCase() === q.answer.trim().toLowerCase() ? 1 : 0);
            }, 0);
            const score = total ? Math.round((correct / total) * 100) : undefined;
            
            // Guardar en nube si hay attemptId, si no en local
            if (cloudAttemptId && process.env.EXPO_PUBLIC_USE_SUPABASE === 'true') {
              try {
                // Guardar respuestas individuales
                for (const [questionId, answer] of Object.entries(answers)) {
                  const question = mock.questions.find(q => q.id === questionId);
                  const isCorrect = question?.answer && answer.trim().toLowerCase() === question.answer.trim().toLowerCase();
                  await saveAnswer({
                    attemptId: cloudAttemptId,
                    questionId,
                    answer,
                    correct: isCorrect || null,
                    points: isCorrect ? 1 : 0,
                  });
                }
                
                // Finalizar attempt
                await finishAttempt(cloudAttemptId, score);
              } catch (e) {
                console.warn('[ExamRunner] Failed to save to cloud, falling back to local:', e);
                // Fallback a local
                await saveAttempt({
                  id: String(Date.now()),
                  examId: mock.id,
                  title: mock.title,
                  level: mock.level,
                  createdAt: Date.now(),
                  finishedAt: Date.now(),
                  score,
                });
              }
            } else {
              // Solo local
              await saveAttempt({
                id: String(Date.now()),
                examId: mock.id,
                title: mock.title,
                level: mock.level,
                createdAt: Date.now(),
                finishedAt: Date.now(),
                score,
              });
            }
            
            router.replace('/(tabs)/progress');
          }}
        >
          <Text style={tw`text-white font-semibold`}>Terminar y guardar</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}


