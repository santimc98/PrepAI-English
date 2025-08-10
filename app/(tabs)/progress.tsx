import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { getAttempts, type Attempt } from '@/lib/storage';

export default function ProgressScreen() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  useEffect(() => {
    (async () => setAttempts(await getAttempts()))();
  }, []);

  return (
    <ScrollView className="flex-1 bg-light" contentContainerStyle={{ padding: 16 }}>
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
