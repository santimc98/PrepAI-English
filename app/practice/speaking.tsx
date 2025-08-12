import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Speech from 'expo-speech';
import tw from '@/lib/tw';

export default function SpeakingPractice() {
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    Speech.speak('Describe your favorite holiday and explain why you enjoyed it.', {
      language: 'en-GB',
    });
  }, []);

  return (
    <View style={tw`flex-1 items-center justify-center bg-light px-6`}>
      <Text style={tw`text-primary text-2xl font-semibold`}>Speaking</Text>
      <Text style={tw`mt-2 text-center`}>
        Habla durante 60 segundos respondiendo a la pregunta.
      </Text>

      <Pressable
        onPress={() => setRecording((r) => !r)}
        style={tw`mt-6 rounded-xl bg-primary px-5 py-3`}
      >
        <Text style={tw`text-white font-semibold`}>
          {recording ? 'Detener' : 'Comenzar'} grabación
        </Text>
      </Pressable>

      <Text style={tw`mt-3 text-xs`}>
        (Micrófono real y STT se integrarán más adelante)
      </Text>
    </View>
  );
}


