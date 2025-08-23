import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import tw from '@/lib/tw';
import Container from '@/components/layout/Container';
import Heading from '@/components/ui/Heading';
import TextMuted from '@/components/ui/TextMuted';
import { getAttemptById, type Attempt } from '@/lib/storage';
import { getAttemptWithAnswers } from '@/lib/db';
import { useToast } from '@/providers/Toast';

// Ítem normalizado: sirve para snapshot con "items" o con "questions"
type NormalizedItem = {
  id: string;
  prompt: string;
  answer?: unknown;
  section?: string | null;
  explanation?: string | null;
};

// Normaliza el snapshot sin importar su forma
function toItems(snapshot: any): NormalizedItem[] {
  if (!snapshot) return [];
  // Nuevo formato
  if (Array.isArray(snapshot.items)) {
    return snapshot.items.map((it: any) => ({
      id: String(it?.id ?? ''),
      prompt: String(it?.prompt ?? ''),
      answer: it?.answer,
      section: it?.section ?? null,
      explanation: it?.explanation ?? null,
    }));
  }
  // Formato antiguo
  if (Array.isArray(snapshot.questions)) {
    return snapshot.questions.map((q: any) => ({
      id: String(q?.id ?? ''),
      prompt: String(q?.prompt ?? ''),
      answer: q?.answer,
      section: q?.section ?? null,
      explanation: q?.explanation ?? null,
    }));
  }
  return [];
}

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [snapshot, setSnapshot] = useState<any | null>(null);
  const [answers, setAnswers] = useState<
    Array<{ questionId: string; answer: any; correct?: boolean | null; points?: number | null }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        // Cloud primero (si está activado)
        if (process.env.EXPO_PUBLIC_USE_SUPABASE === 'true') {
          try {
            const { attempt: cloudAttempt, answers: cloudAnswers } = await getAttemptWithAnswers(String(id));
            const snap = (cloudAttempt?.exam_snapshot as any) ?? null;
            if (cloudAttempt && snap) {
              setAttempt({
                id: cloudAttempt.id,
                examId: cloudAttempt.exam_id || undefined,
                title: (snap as any)?.title || 'Examen',
                level: (snap as any)?.level,
                createdAt: new Date(cloudAttempt.started_at).getTime(),
                finishedAt: cloudAttempt.finished_at ? new Date(cloudAttempt.finished_at).getTime() : undefined,
                score: cloudAttempt.score ? Number(cloudAttempt.score) : undefined,
                examSnapshot: snap,
                answers: (cloudAnswers || []).map((a: any) => ({
                  questionId: a.question_id,
                  answer: a.answer,
                  correct: a.correct,
                  points: a.points,
                })),
                source: 'cloud',
              });
              setSnapshot(snap);
              setAnswers(
                (cloudAnswers || []).map((a: any) => ({
                  questionId: a.question_id,
                  answer: a.answer,
                  correct: a.correct,
                  points: a.points,
                }))
              );
              setLoading(false);
              return;
            }
          } catch {
            // sigue al fallback local
          }
        }

        // Local fallback
        const localAttempt = await getAttemptById(String(id));
        if (!localAttempt) throw new Error('Intento no encontrado');
        setAttempt(localAttempt);
        setSnapshot((localAttempt.examSnapshot || null) as any);
        setAnswers(localAttempt.answers || []);
      } catch (e: any) {
        setError(e?.message || 'No se pudo cargar el intento');
        try {
          toast.error('No se pudo cargar el intento');
        } catch {}
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const items = useMemo(() => toItems(snapshot), [snapshot]);

  const computed = useMemo(() => {
    const bySection: Record<string, { total: number; correct: number }> = {};
    let total = 0;
    let correct = 0;

    for (const q of items) {
      total += 1;
      const sec = (q.section || 'general') as string;
      if (!bySection[sec]) bySection[sec] = { total: 0, correct: 0 };
      bySection[sec].total += 1;

      const a = answers.find((x) => x.questionId === q.id);
      const isCorrect =
        a?.correct ??
        (typeof a?.answer === 'string' &&
          typeof q.answer === 'string' &&
          a!.answer.trim().toLowerCase() === q.answer.trim().toLowerCase());

      if (isCorrect) {
        correct += 1;
        bySection[sec].correct += 1;
      }
    }

    return { total, correct, bySection };
  }, [items, answers]);

  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center`}>
        <Text>Cargando revisión…</Text>
      </View>
    );
  }
  if (error || !attempt) {
    return (
      <View style={tw`flex-1 items-center justify-center`}>
        <Text>{error ?? 'No se encontró el intento'}</Text>
      </View>
    );
  }

  const scorePct = computed.total
    ? Math.round((computed.correct / computed.total) * 100)
    : (attempt.score ?? 0);

  return (
    <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-4`}>
      <Container>
        <Heading>Revisión: {attempt.title}</Heading>
        <TextMuted>Fecha: {new Date(attempt.createdAt).toLocaleString()}</TextMuted>

        <View style={tw`mt-3`}>
          <Text style={tw`font-semibold`}>Puntuación: {scorePct}%</Text>
          <View style={tw`mt-2`}>
            {Object.entries(computed.bySection).map(([sec, v]) => (
              <Text key={sec} style={tw`text-sm`}>
                {sec}: {v.total ? Math.round((v.correct / v.total) * 100) : 0}% ({v.correct}/{v.total})
              </Text>
            ))}
          </View>
        </View>

        {items.map((q: NormalizedItem, idx: number) => {
          const a = answers.find((x) => x.questionId === q.id);
          const isCorrect =
            a?.correct ??
            (typeof a?.answer === 'string' &&
              typeof q.answer === 'string' &&
              a!.answer.trim().toLowerCase() === q.answer.trim().toLowerCase());

          return (
            <View key={q.id} style={tw`mt-4 rounded-xl bg-white p-4`}>
              <Text style={tw`font-semibold`}>{idx + 1}. {q.prompt}</Text>
              <Text style={[tw`mt-2`, { color: isCorrect ? '#16a34a' : '#dc2626' }]}>
                Tu respuesta: <Text style={tw`font-semibold`}>{a?.answer ?? '-'}</Text> • {isCorrect ? 'Correcta' : 'Incorrecta'}
              </Text>
              {q.answer != null ? (
                <Text style={tw`mt-1`}>
                  Correcta: <Text style={tw`font-semibold`}>{String(q.answer)}</Text>
                </Text>
              ) : null}
              {q.explanation ? <TextMuted>Explicación: {q.explanation}</TextMuted> : null}
            </View>
          );
        })}

        <View style={tw`mt-6 flex-row gap-3`}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/(tabs)/exams')}
            style={tw`rounded-xl bg-accent px-4 py-3`}
          >
            <Text style={tw`text-white font-semibold`}>Reintentar sección</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/(tabs)/progress')}
            style={tw`rounded-xl bg-slate-700 px-4 py-3`}
          >
            <Text style={tw`text-white font-semibold`}>Volver a Progress</Text>
          </Pressable>
        </View>
      </Container>
    </ScrollView>
  );
}
