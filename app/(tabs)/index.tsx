import { View, Text, Pressable } from "react-native";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from "expo-router";
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from '@/lib/tw';
import Container from '@/components/layout/Container';
import Heading from '@/components/ui/Heading';
import TextMuted from '@/components/ui/TextMuted';
import ActionCard from '@/components/ui/ActionCard';
import StatPill from '@/components/ui/StatPill';
import { useAuth } from '@/providers/AuthProvider';
import { listMyAttempts } from '@/lib/db';
import { getAttempts, type Attempt } from '@/lib/storage';
import { computePointsFromAttempts, levelFromPoints } from '@/lib/gamify';

export default function Home() {
  const router = useRouter();
  const { session } = useAuth();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [challengeDone, setChallengeDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (session?.user && process.env.EXPO_PUBLIC_USE_SUPABASE === 'true') {
          const cloud = await listMyAttempts();
          const converted: Attempt[] = cloud.map(a => ({
            id: a.id,
            examId: a.exam_id || undefined,
            title: (a.exam_snapshot as any)?.title || 'Examen',
            level: (a.exam_snapshot as any)?.level || 'N/A',
            createdAt: new Date(a.started_at).getTime(),
            finishedAt: a.finished_at ? new Date(a.finished_at).getTime() : undefined,
            score: a.score ? Number(a.score) : undefined,
          }));
          setAttempts(converted);
        } else {
          setAttempts(await getAttempts());
        }
      } catch {
        setAttempts(await getAttempts());
      }
      const today = new Date().toISOString().slice(0,10);
      const chk = await AsyncStorage.getItem(`challenge:${today}`);
      setChallengeDone(chk === 'true');
    })();
  }, [session]);

  const stats = useMemo(() => {
    const total = attempts.length;
    const scores = attempts.map(a => a.score ?? null).filter((x): x is number => typeof x === 'number');
    const avg = scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : null;
    const last = scores.length ? scores[scores.length - 1] : null;
    const points = computePointsFromAttempts(attempts);
    const level = levelFromPoints(points);
    return { total, avg, last, points, level };
  }, [attempts]);

  return (
    <Container>
      <Heading>PrepAI English</Heading>
      <TextMuted>Mejora tu nivel con simulacros y práctica guiada</TextMuted>

      <View style={tw`mt-4 gap-4`}>
        <ActionCard
          title="Empezar simulacro"
          subtitle="Simulacro de examen completo (B2). Pon a prueba tu nivel ahora"
          icon="school"
          tone="primary"
          onPress={() => router.push('/(tabs)/exams' as any)}
        />
        <ActionCard
          title="Probar Listening (TTS)"
          icon="volume-high"
          tone="info"
          onPress={() => Speech.speak('Welcome to PrepAI English. This is a sample listening prompt.', { language: 'en-US' })}
        />
        <ActionCard
          title="Practicar Speaking"
          icon="mic"
          tone="success"
          onPress={() => router.push('/practice/speaking' as any)}
        />
      </View>

      <View style={tw`mt-5 flex-row flex-wrap gap-2`}>
        <StatPill label="Has completado" value={String(stats.total)} icon="checkmark-done" />
        <StatPill label="Media" value={stats.avg != null ? `${stats.avg}%` : '—'} icon="trending-up" />
        <StatPill label="Último" value={stats.last != null ? `${stats.last}%` : '—'} icon="speedometer" />
        <StatPill label="Tus puntos" value={String(stats.points)} icon="trophy" />
        <StatPill label="Nivel" value={stats.level} icon="ribbon" />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={async () => {
          const today = new Date().toISOString().slice(0,10);
          await AsyncStorage.setItem(`challenge:${today}`, 'true');
          setChallengeDone(true);
        }}
        style={tw`mt-5 rounded-2xl border px-4 py-3`}
      >
        <Text style={tw`font-semibold`}>Reto de hoy: Completa un Listening</Text>
        <TextMuted>{challengeDone ? '¡Completado! ✅' : 'Marca como completado cuando lo termines.'}</TextMuted>
      </Pressable>
    </Container>
  );
}
