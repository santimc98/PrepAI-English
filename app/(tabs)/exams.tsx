import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { getExam } from "@/lib/exams";
import { useEffect, useMemo, useState } from "react";
import tw from '@/lib/tw';
import { Button } from '@/components/ui/Button';
import Container from '@/components/layout/Container';
import Heading from '@/components/ui/Heading';
import TextMuted from '@/components/ui/TextMuted';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/providers/Toast';
import ActionCard from '@/components/ui/ActionCard';
import Sheet from '@/components/ui/Sheet';
import { getDefaultLevel } from '@/lib/prefs';
import type { ExamLevel } from '@/types/level';

export default function ExamsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pending, setPending] = useState<null | { title: string; sections: string[] }>(null);
  const [level, setLevel] = useState<ExamLevel>('B2');

  useEffect(() => {
    getDefaultLevel().then((v) => setLevel((v ?? 'B2') as ExamLevel)).catch(() => {});
  }, []);

  const options = useMemo(() => ([
    { title: `Mock ${level} completo`, icon: 'document-text' as const, sections: ['Reading', 'Use of English', 'Listening'] },
    { title: 'Solo Listening', icon: 'volume-high' as const, sections: ['Listening'] },
    { title: 'Solo Reading', icon: 'book' as const, sections: ['Reading', 'Use of English'] },
  ]), [level]);

  return (
    <Container>
      <Heading>Simulacros</Heading>
      <TextMuted>Genera un simulacro rápido de ejemplo</TextMuted>

      {error ? <Text style={{ color: '#dc2626' }}>{error}</Text> : null}

      {loading ? (
        <View style={tw`mt-3`}>
          <Skeleton height={18} />
          <View style={tw`mt-2`}><Skeleton height={18} /></View>
        </View>
      ) : null}

      <View style={tw`mt-4 flex-row flex-wrap gap-3`}>
        {options.map((opt) => (
          <View key={opt.title} style={{ flexBasis: '100%', maxWidth: '100%' }}>
            <ActionCard
              small
              title={opt.title}
              icon={opt.icon}
              tone="primary"
              onPress={() => { setPending({ title: opt.title, sections: opt.sections }); setSheetOpen(true); }}
            />
          </View>
        ))}
      </View>

      <Sheet visible={sheetOpen} title={pending?.title} onClose={() => setSheetOpen(false)}>
        <Text style={tw`mb-2`}>Descripción breve del mock:</Text>
        <TextMuted>Duración estimada: 45–60 min • Secciones: {pending?.sections.join(', ')}</TextMuted>
        <View style={tw`mt-4 flex-row gap-3`}>
          <Button
            title={loading ? 'Generando...' : 'Comenzar'}
            onPress={async () => {
              if (!pending) return;
              setLoading(true); setError(null);
              try {
                const exam = await getExam({ sections: pending.sections });
                try { toast.success('Examen generado'); } catch {}
                setSheetOpen(false);
                router.push({ pathname: "/exam/[id]" as any, params: { id: exam.id, data: JSON.stringify(exam) } } as any);
              } catch (e: any) {
                setError(e?.message || 'No se pudo generar el examen');
                try { toast.error('No se pudo generar el examen'); } catch {}
              } finally {
                setLoading(false);
              }
            }}
          />
          <Button title="Cancelar" onPress={() => setSheetOpen(false)} />
        </View>
      </Sheet>

      <Button
        title={loading ? 'Generando...' : `Generar Mock ${level}`}
        onPress={async () => {
          setLoading(true);
          setError(null);
          try {
            const exam = await getExam({ sections: ['Reading', 'Use of English', 'Listening'] });
            try { toast.success('Examen generado'); } catch {}
            router.push({ pathname: "/exam/[id]" as any, params: { id: exam.id, data: JSON.stringify(exam) } } as any);
          } catch (e: any) {
            setError(e?.message || 'No se pudo generar el examen');
            try { toast.error('No se pudo generar el examen'); } catch {}
          } finally {
            setLoading(false);
          }
        }}
        style={tw`mt-4`}
      />
    </Container>
  );
}
