import { View, Text, Pressable } from "react-native";
import { useAuth } from "@/providers/AuthProvider";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  return (
    <View className="flex-1 items-center justify-center bg-light px-6">
      <Text className="text-primary text-3xl font-extrabold">Ajustes</Text>
      <Text className="mt-2 text-royal">{user?.email}</Text>

      <Pressable onPress={signOut} className="mt-6 rounded-xl bg-accent px-5 py-3">
        <Text className="text-white font-semibold">Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}
