// app/_layout.tsx     ← raíz de la carpeta app
import { Slot, useRouter, useSegments, Stack } from "expo-router";
// Cargar estilos web globales (procesado por el bundler web de Expo, no por Babel)
import "./global.css";
import tw from "@/lib/tw";
import { View } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    (async () => {
      try {
        const pref = await AsyncStorage.getItem('ui:theme');
        if (pref === 'dark' || pref === 'light') setColorScheme(pref);
      } catch {}
    })();
  }, []);

  return (
    <AuthProvider>
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colorScheme === 'dark' ? '#0b1220' : '#f8fafc' }]}>        
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <RootNavigationGate />
      </SafeAreaView>
    </AuthProvider>
  );
}
