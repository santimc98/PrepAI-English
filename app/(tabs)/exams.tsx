import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { getExam } from "@/lib/exams";
import { useState } from "react";
import tw from '@/lib/tw';
import { Button } from '@/components/ui/Button';
import Container from '@/components/layout/Container';
import Heading from '@/components/ui/Heading';
import TextMuted from '@/components/ui/TextMuted';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/providers/Toast';

export default function ExamsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
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

      <Button
        title={loading ? 'Generando...' : 'Generar Mock B2'}
        onPress={async () => {
          setLoading(true);
          setError(null);
          try {
            const exam = await getExam({ level: 'B2', sections: ['Reading', 'Use of English'] });
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
