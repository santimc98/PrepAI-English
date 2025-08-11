import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { getExam } from "@/lib/exams";
import { useState } from "react";

export default function ExamsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const exam = await getExam({ level: "B2", sections: ["Reading", "Use of English"] });
      router.push({ pathname: "/exam/[id]" as any, params: { id: exam.id, data: JSON.stringify(exam) } } as any);
    } catch (e: any) {
      setError(e?.message || "No se pudo generar el examen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-light px-6">
      <Text className="text-primary text-3xl font-extrabold">Simulacros</Text>
      <Text className="mt-2 text-royal">Genera un simulacro rápido</Text>

      {error ? <Text className="mt-3 text-red-600">{error}</Text> : null}

      <Pressable
        className="mt-6 rounded-xl bg-accent px-5 py-3"
        onPress={handleGenerate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold">Generar Mock B2</Text>
        )}
      </Pressable>
    </View>
  );
}
