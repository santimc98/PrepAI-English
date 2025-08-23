import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { getAttempts, type Attempt } from '@/lib/storage';
import { useAuth } from '@/providers/AuthProvider';
import { listMyAttempts } from '@/lib/db';
import tw from '@/lib/tw';
import Container from '@/components/layout/Container';
import Heading from '@/components/ui/Heading';
import TextMuted from '@/components/ui/TextMuted';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'expo-router';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/providers/Toast';
import Sparkline from '@/components/ui/Sparkline';
import StatPill from '@/components/ui/StatPill';
import BadgeCard from '@/components/ui/BadgeCard';
import { computePointsFromAttempts, levelFromPoints } from '@/lib/gamify';

export default function ProgressScreen() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const router = useRouter();
  
  const loadAttempts = async () => {
    try {
      if (session?.user && process.env.EXPO_PUBLIC_USE_SUPABASE === 'true') {
        // Intentar cargar desde nube
        const cloudAttempts = await listMyAttempts();
        // Convertir formato de nube a local para compatibilidad
        const convertedAttempts: Attempt[] = cloudAttempts.map(a => ({
          id: a.id,
          examId: a.exam_id || undefined,
          title: (a.exam_snapshot as any)?.title || 'Examen',
          level: (a.exam_snapshot as any)?.level || 'N/A',
          createdAt: new Date(a.started_at).getTime(),
          finishedAt: a.finished_at ? new Date(a.finished_at).getTime() : undefined,
          score: a.score ? Number(a.score) : undefined,
        }));
        setAttempts(convertedAttempts);
      } else {
        // Fallback a local
        const localAttempts = await getAttempts();
        setAttempts(localAttempts);
      }
    } catch (e) {
      console.warn('[Progress] Failed to load cloud attempts, falling back to local:', e);
      try { toast.error('No se pudo cargar desde la nube'); } catch {}
      const localAttempts = await getAttempts();
      setAttempts(localAttempts);
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    loadAttempts();
  }, [session]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAttempts();
    setRefreshing(false);
  };

  const summary = useMemo(() => {
    const scores = attempts.map(a => (typeof a.score === 'number' ? a.score : null)).filter((x): x is number => x != null);
    const lastScores = scores.slice(-12);
    const points = computePointsFromAttempts(attempts);
    const level = levelFromPoints(points);
    const badges: { icon: any; title: string; earned: boolean }[] = [
      { icon: 'star', title: 'Primer simulacro', earned: attempts.length >= 1 },
      { icon: 'trophy', title: '5 simulacros', earned: attempts.length >= 5 },
      { icon: 'ribbon', title: 'Media ≥ 60%', earned: scores.length ? (scores.reduce((s, v) => s + v, 0) / scores.length) >= 60 : false },
    ];
    return { lastScores, points, level, badges };
  }, [attempts]);

  return (
    <ScrollView
      style={tw`flex-1`}
      contentContainerStyle={tw`p-4`}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Container>
        <Heading>Progreso</Heading>
        {isLoading ? (
          <View style={tw`mt-3`}> 
            <Card style={tw`mt-2`}><Skeleton height={18} /></Card>
            <Card style={tw`mt-2`}><Skeleton height={18} /></Card>
            <Card style={tw`mt-2`}><Skeleton height={18} /></Card>
          </View>
        ) : attempts.length === 0 ? (
          <Card style={tw`mt-3`}>
            <TextMuted>Aún no hay intentos. Empieza un mock desde Exams.</TextMuted>
          </Card>
        ) : (
          <>
            <Card style={tw`mt-3 p-4`}>
              <Text style={tw`font-semibold`}>Evolución</Text>
              <View style={tw`mt-3`}>
                <Sparkline data={summary.lastScores} />
              </View>
              <View style={tw`mt-3 flex-row flex-wrap gap-2`}>
                <StatPill label="Puntos" value={String(summary.points)} icon="trophy" />
                <StatPill label="Nivel" value={summary.level} icon="ribbon" />
              </View>
            </Card>

            <View style={tw`mt-3`}>
              <Text style={tw`font-semibold`}>Insignias</Text>
              <View style={tw`mt-2 gap-2`}>
                {summary.badges.map((b, i) => (
                  <BadgeCard key={i} icon={b.icon as any} title={`${b.title}${b.earned ? ' ✅' : ''}`} />
                ))}
              </View>
            </View>

            {attempts.map((a) => (
              <Pressable key={a.id} onPress={() => router.push({ pathname: '/exam/[id]/review' as any, params: { id: a.id } } as any)}>
                <Card style={tw`mt-4`}>
                  <Text style={tw`font-semibold`}>{a.title} • {a.level}</Text>
                  <Text style={tw`mt-1`}>
                    Puntuación: <Text style={tw`font-semibold text-slate-700`}>{a.score ?? '-'}%</Text>
                  </Text>
                  <Text style={tw`text-xs mt-1 text-slate-600`}>{new Date(a.createdAt).toLocaleString()}</Text>
                </Card>
              </Pressable>
            ))}
          </>
        )}
      </Container>
    </ScrollView>
  );
}
