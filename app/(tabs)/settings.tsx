import { View, Text, Switch } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import tw from '@/lib/tw';
import { Button } from '@/components/ui/Button';
import Container from '@/components/layout/Container';
import Heading from '@/components/ui/Heading';
import TextMuted from '@/components/ui/TextMuted';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [dark, setDark] = useState(false);
  const [useCloud, setUseCloud] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const pref = await AsyncStorage.getItem('ui:theme');
        setDark(pref === 'dark');
        const cloud = await AsyncStorage.getItem('ui:useCloud');
        setUseCloud(cloud === 'true');
      } catch {}
    })();
  }, []);

  const toggleTheme = async () => {
    const next = !dark;
    setDark(next);
    try {
      await AsyncStorage.setItem('ui:theme', next ? 'dark' : 'light');
    } catch {}
  };

  const toggleCloud = async () => {
    const next = !useCloud;
    setUseCloud(next);
    try {
      await AsyncStorage.setItem('ui:useCloud', next ? 'true' : 'false');
    } catch {}
  };

  return (
    <Container>
      <Heading>Ajustes</Heading>
      <TextMuted>{user?.email}</TextMuted>

      <View style={tw`mt-4 flex-row items-center justify-between`}>
        <Text style={tw`font-medium`}>Modo oscuro (beta)</Text>
        <Switch value={dark} onValueChange={toggleTheme} />
      </View>

      {process.env.EXPO_PUBLIC_USE_SUPABASE === 'true' ? (
        <View style={tw`mt-4 flex-row items-center justify-between`}>
          <Text style={tw`font-medium`}>Usar nube (Edge/Supabase)</Text>
          <Switch value={useCloud} onValueChange={toggleCloud} />
        </View>
      ) : null}

      <Button title="Cerrar sesión" onPress={signOut} style={[tw`mt-6`, { backgroundColor: '#ef4444' }]} />
    </Container>
  );
}
