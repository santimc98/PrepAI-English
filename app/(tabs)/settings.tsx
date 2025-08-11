import { View, Text, Pressable, Switch } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const FORCE_CLOUD_KEY = 'dev:forceCloudGen';

export async function getForceCloud(): Promise<boolean> {
  const v = await AsyncStorage.getItem(FORCE_CLOUD_KEY);
  return v === 'true';
}
export async function setForceCloud(v: boolean) {
  await AsyncStorage.setItem(FORCE_CLOUD_KEY, v ? 'true' : 'false');
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [forceCloud, setForceCloudState] = useState(false);
  const [initialEnv, setInitialEnv] = useState(process.env.EXPO_PUBLIC_USE_SUPABASE === 'true');

  useEffect(() => {
    getForceCloud().then(setForceCloudState).catch(() => setForceCloudState(false));
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-light px-6">
      <Text className="text-primary text-3xl font-extrabold">Ajustes</Text>
      <Text className="mt-2 text-royal">{user?.email}</Text>

      <View className="mt-6 w-full max-w-md rounded-xl bg-white p-4">
        <Text className="font-semibold text-navy">Generación de exámenes</Text>
        <Text className="text-royal mt-1">Flag de entorno: {String(initialEnv)}</Text>
        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-navy">Forzar usar cloud (dev)</Text>
          <Switch
            value={forceCloud}
            onValueChange={async (v) => {
              setForceCloudState(v);
              await setForceCloud(v);
            }}
          />
        </View>
      </View>

      <Pressable onPress={signOut} className="mt-6 rounded-xl bg-accent px-5 py-3">
        <Text className="text-white font-semibold">Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}
