import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { getExam } from "@/lib/exams";
import { useState } from "react";

export default function ExamsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <View className="flex-1">
      <View className="mx-auto w-full max-w-3xl p-4 gap-3">
        <Text className="text-2xl font-semibold text-primary">Simulacros</Text>
        <Text className="text-royal">Genera un simulacro rápido de ejemplo</Text>

        {error ? <Text className="text-red-600">{error}</Text> : null}

        <Pressable
          className="mt-4 rounded-2xl bg-brand-600 px-4 py-3"
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
          disabled={loading}
        >
          <Text className="text-white text-center font-medium">{loading ? 'Generando...' : 'Generar Mock B2'}</Text>
        </Pressable>
      </View>
    </View>
  );
}
