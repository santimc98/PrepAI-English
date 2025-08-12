import { View, Text, Switch } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import tw from '@/lib/tw';
import { Button } from '@/components/ui/Button';
import Container from '@/components/layout/Container';
import Heading from '@/components/ui/Heading';
import TextMuted from '@/components/ui/TextMuted';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [dark, setDark] = useState(false);
  const [useCloud, setUseCloud] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const pref = await AsyncStorage.getItem('ui:theme');
        setDark(pref === 'dark');
        const cloud = await AsyncStorage.getItem('dev:cloudExam');
        setUseCloud(cloud == null ? true : cloud === 'true');
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
      await AsyncStorage.setItem('dev:cloudExam', next ? 'true' : 'false');
    } catch {}
  };

  return (
    <Container>
      <Heading>Ajustes</Heading>
      <TextMuted>{user?.email}</TextMuted>

      <Card style={tw`mt-4 p-4`}>
        <Text style={tw`font-semibold`}>Apariencia</Text>
        <View style={tw`mt-3 flex-row items-center justify-between`}>
          <View style={tw`flex-1 pr-3`}>
            <Text style={tw`font-medium`}>Modo oscuro (beta)</Text>
            <TextMuted>Interfaz con fondo oscuro. Puede requerir recargar.</TextMuted>
          </View>
          <Switch value={dark} onValueChange={toggleTheme} />
        </View>
      </Card>

      {process.env.EXPO_PUBLIC_USE_SUPABASE === 'true' ? (
        <Card style={tw`mt-4 p-4`}>
          <Text style={tw`font-semibold`}>Desarrollo</Text>
          <View style={tw`mt-3 flex-row items-center justify-between`}>
            <View style={tw`flex-1 pr-3`}>
              <Text style={tw`font-medium`}>Usar nube para generar exámenes</Text>
              <TextMuted>Requiere .env EXPO_PUBLIC_USE_SUPABASE=true</TextMuted>
            </View>
            <Switch value={useCloud} onValueChange={toggleCloud} />
          </View>
        </Card>
      ) : null}

      <Card style={tw`mt-4 p-4`}>
        <Text style={tw`font-semibold`}>Cuenta</Text>
        <Button title="Cerrar sesión" onPress={signOut} style={[tw`mt-3`, { backgroundColor: '#ef4444' }]} />
      </Card>
    </Container>
  );
}
