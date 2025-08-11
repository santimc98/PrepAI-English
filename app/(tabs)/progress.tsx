import { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { getAttempts, type Attempt } from '@/lib/storage';
import { useAuth } from '@/providers/AuthProvider';
import { listMyAttempts } from '@/lib/db';
import tw from '@/lib/tw';
import Container from '@/components/layout/Container';
import Heading from '@/components/ui/Heading';
import TextMuted from '@/components/ui/TextMuted';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'expo-router';

export default function ProgressScreen() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { session } = useAuth();
  
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
      const localAttempts = await getAttempts();
      setAttempts(localAttempts);
    }
  };
  
  useEffect(() => {
    loadAttempts();
  }, [session]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAttempts();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={tw`flex-1`}
      contentContainerStyle={tw`p-4`}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Container>
        <Heading>Progreso</Heading>
        {attempts.length === 0 ? (
          <Card style={tw`mt-3`}>
            <TextMuted>Aún no hay intentos. Empieza un mock desde Exams.</TextMuted>
          </Card>
        ) : (
          attempts.map((a) => (
            <Card key={a.id} style={tw`mt-4`}>
              <Text style={tw`font-semibold`}>{a.title} • {a.level}</Text>
              <Text style={tw`mt-1`}>
                Puntuación: <Text style={tw`font-semibold text-slate-700`}>{a.score ?? '-'}%</Text>
              </Text>
              <Text style={tw`text-xs mt-1 text-slate-600`}>{new Date(a.createdAt).toLocaleString()}</Text>
            </Card>
          ))
        )}
      </Container>
    </ScrollView>
  );
}
