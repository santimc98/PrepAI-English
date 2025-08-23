import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import tw from '@/lib/tw';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/Toast';
import { createAttempt, finishAttempt, saveAnswer } from '@/lib/db';
import { saveAttempt as saveAttemptLocal } from '@/lib/storage';

import type { Exam } from '@/types/exam';

type Item = Exam['items'][number];

function isCorrect(q: Item, given: string | number | undefined): boolean {
  if (given == null) return false;
  // MCQ: correcta es índice numérico en q.answer
  if (q.type === 'mcq') {
    return typeof q.answer === 'number' && typeof given === 'number' && given === q.answer;
  }
  // GAP/TEXTO: comparar strings normalizados
  if (typeof q.answer === 'string' && typeof given === 'string') {
    return given.trim().toLowerCase() === q.answer.trim().toLowerCase();
  }
  return false;
}

export default function ExamRunner() {
  const params = useLocalSearchParams<{ id: string; data?: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const toast = useToast();

  // Parseo del examen recibido por params
  const exam: Exam | null = useMemo(() => {
    try {
      return params.data ? (JSON.parse(String(params.data)) as Exam) : null;
    } catch {
      return null;
    }
  }, [params.data]);

  // Respuestas del usuario por id de ítem:
  // - mcq: índice (number)
  // - gap: string
  const [answers, setAnswers] = useState<Record<string, string | number>>({});

  // attempt en nube (si hay sesión + bandera)
  const [cloudAttemptId, setCloudAttemptId] = useState<string | null>(null);

  // Crear attempt en la nube (efecto, no useMemo)
  useEffect(() => {
    (async () => {
      if (!exam || !session?.user) return;
      if (process.env.EXPO_PUBLIC_USE_SUPABASE !== 'true') return;
      try {
        const attempt = await createAttempt({
          userId: session.user.id,
          examId: exam.id,
          examSnapshot: exam,
        });
        setCloudAttemptId(attempt.id);
      } catch (e) {
        console.warn('[ExamRunner] Failed to create cloud attempt:', e);
      }
    })();
  }, [exam, session?.user?.id]);

  if (!exam) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-light`}>
        <Text style={tw`text-primary`}>No hay datos del examen</Text>
      </View>
    );
  }

  const handleFinish = async () => {
    const total = exam.items.length;
    const correct = exam.items.reduce((acc, q) => {
      const given = answers[q.id];
      return acc + (isCorrect(q, given) ? 1 : 0);
    }, 0);
    const score = total ? Math.round((correct / total) * 100) : undefined;

    // Preferir nube si hay attemptId y bandera
    if (cloudAttemptId && process.env.EXPO_PUBLIC_USE_SUPABASE === 'true') {
      try {
        // Guardar respuestas individuales
        for (const [questionId, answer] of Object.entries(answers)) {
          const q = exam.items.find((x) => x.id === questionId);
          const ok = q ? isCorrect(q, answer as any) : false;
          await saveAnswer({
            attemptId: cloudAttemptId,
            questionId,
            answer,
            correct: ok || null,
            points: ok ? 1 : 0,
          });
        }
        // Finalizar attempt
        await finishAttempt(cloudAttemptId, score);
        try {
          toast.success('Intento guardado');
        } catch {}
      } catch (e) {
        console.warn('[ExamRunner] Failed to save to cloud, falling back to local:', e);
        try {
          toast.error('Error al guardar en la nube');
        } catch {}
        // Fallback local
        await saveAttemptLocal({
          id: String(Date.now()),
          examId: exam.id,
          title: exam.title,
          level: exam.level,
          createdAt: Date.now(),
          finishedAt: Date.now(),
          score,
          examSnapshot: exam,
          answers: Object.entries(answers).map(([questionId, answer]) => {
            const q = exam.items.find((x) => x.id === questionId);
            const ok = q ? isCorrect(q, answer as any) : false;
            return { questionId, answer, correct: ok, points: ok ? 1 : 0 };
          }),
          source: 'local',
        });
      }
    } else {
      // Solo local
      await saveAttemptLocal({
        id: String(Date.now()),
        examId: exam.id,
        title: exam.title,
        level: exam.level,
        createdAt: Date.now(),
        finishedAt: Date.now(),
        score,
        examSnapshot: exam,
        answers: Object.entries(answers).map(([questionId, answer]) => {
          const q = exam.items.find((x) => x.id === questionId);
          const ok = q ? isCorrect(q, answer as any) : false;
          return { questionId, answer, correct: ok, points: ok ? 1 : 0 };
        }),
        source: 'local',
      });
    }

    router.replace('/(tabs)/progress');
  };

  return (
    <View style={tw`flex-1 bg-light`}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={tw`text-primary text-3xl font-extrabold`}>{exam.title}</Text>
        <Text style={tw`mt-1 text-royal`}>Nivel: {exam.level}</Text>

        {exam.items.map((q: Item, idx: number) => (
          <View key={q.id} style={tw`mt-6 rounded-xl bg-white p-4`}>
            <Text style={tw`font-semibold text-navy`}>
              {idx + 1}. {q.prompt}
            </Text>

            {q.type === 'mcq' ? (
              <View style={tw`mt-3 gap-2`}>
                {(q.options ?? []).map((opt: string, i: number) => {
                  const selected = answers[q.id] === i;
                  return (
                    <Pressable
                      key={`${q.id}-${i}`}
                      onPress={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                      style={[
                        tw`rounded-lg border px-3 py-2`,
                        selected ? tw`bg-primary` : tw`bg-white`,
                      ]}
                    >
                      <Text style={selected ? tw`text-white` : undefined}>
                        {String.fromCharCode(65 + i)}. {opt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <TextInput
                placeholder="Escribe tu respuesta"
                style={tw`mt-3 rounded-lg border bg-white px-3 py-2`}
                value={(answers[q.id] as string) ?? ''}
                onChangeText={(t) => setAnswers((a) => ({ ...a, [q.id]: t }))}
                autoCapitalize="none"
              />
            )}
          </View>
        ))}

        <Pressable style={tw`mt-8 items-center rounded-xl bg-accent px-5 py-3`} onPress={handleFinish}>
          <Text style={tw`text-white font-semibold`}>Terminar y guardar</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
