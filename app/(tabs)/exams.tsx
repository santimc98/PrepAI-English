import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { createSimpleMock } from "@/lib/exams";

export default function ExamsScreen() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center bg-light px-6">
      <Text className="text-primary text-3xl font-extrabold">Simulacros</Text>
      <Text className="mt-2 text-royal">Genera un simulacro rápido de ejemplo</Text>

      <Pressable
        className="mt-6 rounded-xl bg-accent px-5 py-3"
        onPress={() => {
          const mock = createSimpleMock("B2");
          router.push({ pathname: "/exam/[id]" as any, params: { id: mock.id, data: JSON.stringify(mock) } } as any);
        }}
      >
        <Text className="text-white font-semibold">Generar Mock B2</Text>
      </Pressable>
    </View>
  );
}
