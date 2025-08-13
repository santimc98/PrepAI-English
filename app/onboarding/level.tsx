import React, { useMemo } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import tw from '@/lib/tw';
import Container from '@/components/layout/Container';
import Heading from '@/components/ui/Heading';
import TextMuted from '@/components/ui/TextMuted';
import ActionCard from '@/components/ui/ActionCard';
import { LEVELS, type ExamLevel } from '@/types/level';
import { setDefaultLevel } from '@/lib/prefs';
import { updateDefaultLevel } from '@/lib/db';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/Toast';

const DESCRIPTIONS: Record<ExamLevel, { title: string; desc: string; icon: any }> = {
  B1: { title: 'B1', desc: 'Intermedio. Pensado para tareas cotidianas. Aprobado típico: ~60–70%.', icon: 'school' },
  B2: { title: 'B2', desc: 'Intermedio-alto. Comprensión de textos complejos. Aprobado típico: ~60–70%.', icon: 'book' },
  C1: { title: 'C1', desc: 'Avanzado. Uso flexible del idioma en contextos académicos/profesionales.', icon: 'trophy' },
  C2: { title: 'C2', desc: 'Dominio. Comprensión total de matices y precisión.', icon: 'medal' },
};

export default function OnboardingLevel() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { session } = useAuth();
  const toast = useToast();
  const cards = useMemo(() => LEVELS.map(l => DESCRIPTIONS[l]), []);

  const selectLevel = async (level: ExamLevel) => {
    const apply = async () => {
      try {
        await setDefaultLevel(level);
        if (session && process.env.EXPO_PUBLIC_USE_SUPABASE === 'true') {
          try { await updateDefaultLevel(level); } catch {}
        }
        try { toast.success('Nivel guardado'); } catch {}
      } catch {}
      router.replace('/(tabs)');
    };
    const rawEdit = (params as any)?.edit as string | string[] | undefined;
    const isEdit = Array.isArray(rawEdit) ? rawEdit.includes('true') : rawEdit === 'true';
    if (isEdit) {
      Alert.alert(
        'Cambiar nivel',
        'Cambiar el nivel afectará a los simulacros que se generen y a las recomendaciones.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', style: 'destructive', onPress: apply },
        ]
      );
      return;
    }
    await apply();
  };

  return (
    <Container>
      <Heading>Selecciona tu nivel</Heading>
      <TextMuted>Podrás cambiarlo en Ajustes</TextMuted>

      <View style={tw`mt-4 gap-3`}>
        {cards.map((c) => (
          <ActionCard
            key={c.title}
            title={c.title}
            subtitle={c.desc}
            icon={c.icon}
            tone="primary"
            onPress={() => selectLevel(c.title as ExamLevel)}
          />
        ))}
      </View>

      <Pressable onPress={() => router.replace('/(tabs)')} accessibilityRole="button" style={tw`mt-5`}>
        <Text style={tw`text-center underline`}>Podrás cambiarlo en Ajustes</Text>
      </Pressable>
    </Container>
  );
}
