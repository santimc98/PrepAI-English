// app/_layout.tsx     ← raíz de la carpeta app
import { useRouter, useSegments, Stack, Redirect, usePathname } from "expo-router";
// Cargar estilos web globales (procesado por el bundler web de Expo, no por Babel)
import "./global.css";
import tw from "@/lib/tw";
import { View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { UiThemeContext } from '@/providers/UiTheme';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { ToastProvider } from '@/providers/Toast';
import { PrefsProvider, usePrefs } from '@/providers/PrefsProvider';
import type { ExamLevel } from '@/types/level';

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

  // Effect-only gate to redirect based on auth; do not render another navigator here.
  return null;
}

function LevelGate() {
  const pathname = usePathname();
  const { level, ready } = usePrefs();
  if (!ready) return null;
  const inAuthGroup = pathname?.startsWith('/(auth)');
  const isOnboarding = pathname?.startsWith('/onboarding');
  if (inAuthGroup) return null;
  if (!level && !isOnboarding) return <Redirect href="/onboarding/level" />;
  return null;
}

export default function RootLayout() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_600SemiBold });

  useEffect(() => {
    (async () => {
      try {
        const pref = await AsyncStorage.getItem('ui:theme');
        if (pref === 'dark' || pref === 'light') setColorScheme(pref);
      } catch {}
    })();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={[tw`flex-1 items-center justify-center`, { backgroundColor: colorScheme === 'dark' ? '#0b1220' : '#f8fafc' }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <AuthProvider>
      <UiThemeContext.Provider value={{ colorScheme, setColorScheme }}>
        <ToastProvider>
          <SafeAreaView style={[tw`flex-1`, { backgroundColor: colorScheme === 'dark' ? '#0b1220' : '#f8fafc' }]}>        
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <PrefsProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "transparent" },
                }}
              />
              <RootNavigationGate />
              <LevelGate />
            </PrefsProvider>
          </SafeAreaView>
        </ToastProvider>
      </UiThemeContext.Provider>
    </AuthProvider>
  );
}
