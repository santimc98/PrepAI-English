// app/_layout.tsx     ← raíz de la carpeta app
import { Slot, useRouter, useSegments, Stack } from "expo-router";
import { View } from "react-native";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";

function RootNavigationGate() {
  const segments = useSegments();
  const router = useRouter();
  const { session, initializing } = useAuth();

  useEffect(() => {
    if (initializing) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login" as any);
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [segments, router, session, initializing]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <View className="flex-1 bg-slate-50">
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <RootNavigationGate />
      </View>
    </AuthProvider>
  );
}
