import { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { getAttempts, type Attempt } from '@/lib/storage';
import { useAuth } from '@/providers/AuthProvider';
import { listMyAttempts } from '@/lib/db';

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
      className="flex-1 bg-light" 
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text className="text-primary text-3xl font-extrabold">Progreso</Text>
      {attempts.length === 0 ? (
        <Text className="mt-3 text-royal">Aún no hay intentos guardados.</Text>
      ) : (
        attempts.map((a) => (
          <View key={a.id} className="mt-4 rounded-xl bg-white p-4">
            <Text className="font-semibold text-navy">{a.title} • {a.level}</Text>
            <Text className="mt-1">Puntuación: <Text className="font-semibold text-royal">{a.score ?? '-'}%</Text></Text>
            <Text className="text-xs mt-1">{new Date(a.createdAt).toLocaleString()}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
