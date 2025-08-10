// app/_layout.tsx     ← raíz de la carpeta app
import { Slot, useRouter, useSegments } from "expo-router";
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
      <RootNavigationGate />
    </AuthProvider>
  );
}
