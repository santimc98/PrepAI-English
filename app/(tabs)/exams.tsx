import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { getExam } from "@/lib/exams";
import { useState } from "react";
import tw from '@/lib/tw';
import { Button } from '@/components/ui/Button';

export default function ExamsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <View style={tw`flex-1`}>
      <View style={tw`w-full max-w-3xl mx-auto p-4 gap-3`}>
        <Text style={tw`text-2xl font-semibold`}>Simulacros</Text>
        <Text style={tw`text-slate-600`}>Genera un simulacro rápido de ejemplo</Text>

        {error ? <Text style={{ color: '#dc2626' }}>{error}</Text> : null}

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
            } finally {
              setLoading(false);
            }
          }}
          style={tw`mt-4`}
        />
      </View>
    </View>
  );
}
