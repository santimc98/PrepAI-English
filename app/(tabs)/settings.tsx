import { View, Text, Pressable } from "react-native";
import { useAuth } from "@/providers/AuthProvider";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  return (
    <View className="flex-1">
      <View className="mx-auto w-full max-w-3xl p-4 gap-3">
        <Text className="text-2xl font-semibold text-primary">Ajustes</Text>
        <Text className="text-royal">{user?.email}</Text>

        <Pressable onPress={signOut} className="mt-4 rounded-2xl bg-accent px-4 py-3">
          <Text className="text-white font-medium text-center">Cerrar sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}
