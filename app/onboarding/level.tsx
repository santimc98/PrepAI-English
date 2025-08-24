import { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import Container from "@/components/layout/Container";
import Heading from "@/components/ui/Heading";
import TextMuted from "@/components/ui/TextMuted";
import tw from "@/lib/tw";
import { useToast } from "@/providers/Toast";

import { useUserPreferences } from "@/hooks/useUserPreferences";

// Niveles soportados para exámenes
type Level = "B1" | "B2" | "C1" | "C2";
const LEVELS: Level[] = ["B1", "B2", "C1", "C2"];

const DESCRIPTIONS: Record<
  Level,
  { title: Level; desc: string; icon: string }
> = {
  B1: {
    title: "B1",
    desc: "Intermedio. Pensado para tareas cotidianas. Aprobado típico: ~60–70%.",
    icon: "🎓",
  },
  B2: {
    title: "B2",
    desc:
      "Intermedio-alto. Comprensión de textos complejos. Aprobado típico: ~60–70%.",
    icon: "📘",
  },
  C1: {
    title: "C1",
    desc:
      "Avanzado. Uso flexible del idioma en contextos académicos/profesionales.",
    icon: "🏆",
  },
  C2: {
    title: "C2",
    desc: "Dominio. Comprensión total de matices y precisión.",
    icon: "🥇",
  },
};

export default function OnboardingLevel() {
  const router = useRouter();
  const toast = useToast();

  const { setCertificationLevel, isReady } = useUserPreferences();

  const cards = useMemo(() => LEVELS.map((l) => DESCRIPTIONS[l]), []);

  async function handleLevelSelect(level: Level) {
    try {
      await setCertificationLevel(level, { persist: true, syncServer: true });
      toast.success("Nivel guardado");
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Failed to save level:", error);
      toast.error("Error al guardar el nivel");
    }
  }

  return (
    <Container>
      <Heading>Selecciona tu nivel</Heading>
      <TextMuted>Podrás cambiarlo en Ajustes</TextMuted>

      <View style={tw`mt-4 gap-3`}>
        {!isReady ? (
          <View style={tw`items-center justify-center py-8`}>
            <Text style={tw`text-slate-600`}>Cargando niveles...</Text>
          </View>
        ) : (
          cards.map((c) => (
            <Pressable
              key={c.title}
              onPress={() => handleLevelSelect(c.title)}
              accessibilityRole="button"
              style={({ pressed }) => [
                tw`rounded-2xl px-4 py-4`,
                {
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: "rgb(226,232,240)",
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View style={tw`flex-row items-center gap-3`}>
                <Text style={tw`text-2xl`}>{c.icon}</Text>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-xl font-semibold`}>{c.title}</Text>
                  <Text style={tw`text-base text-slate-600`}>{c.desc}</Text>
                </View>
                <Text style={tw`text-2xl`}>›</Text>
              </View>
            </Pressable>
          ))
        )}
      </View>

      <Link href="/(tabs)" replace asChild>
        <Pressable accessibilityRole="link" style={tw`mt-5`}>
          <Text style={tw`text-center underline`}>Podrás cambiarlo en Ajustes</Text>
        </Pressable>
      </Link>
    </Container>
  );
}
