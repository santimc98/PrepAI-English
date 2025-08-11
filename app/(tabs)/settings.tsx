import { View, Text } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import tw from '@/lib/tw';
import { Button } from '@/components/ui/Button';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  return (
    <View style={tw`flex-1`}>
      <View style={tw`w-full max-w-3xl mx-auto p-4 gap-3`}>
        <Text style={tw`text-2xl font-semibold`}>Ajustes</Text>
        <Text style={tw`text-slate-600`}>{user?.email}</Text>

        <Button title="Cerrar sesión" onPress={signOut} style={[tw`mt-4`, { backgroundColor: '#ef4444' }]} />
      </View>
    </View>
  );
}
