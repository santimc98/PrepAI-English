import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from '@/lib/tw';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './Typography';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  canRetry?: boolean;
  style?: any;
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  canRetry = false,
  style
}: ErrorDisplayProps) {
  return (
    <View
      style={[
        tw`rounded-xl p-4 mb-4`,
        { backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1 },
        style
      ]}
      accessibilityRole="alert"
      accessibilityLabel={`Error: ${error}`}
    >
      <View style={tw`flex-row items-start gap-3`}>
        <Ionicons
          name="alert-circle"
          size={20}
          color="#dc2626"
          style={tw`mt-0.5 flex-shrink-0`}
        />
        <View style={tw`flex-1`}>
          <AppText
            weight="semibold"
            style={[tw`text-sm mb-1`, { color: '#dc2626' }]}
          >
            Error
          </AppText>
          <Text style={[tw`text-sm leading-5`, { color: '#991b1b' }]}>
            {error}
          </Text>
          {(onRetry || onDismiss) && (
            <View style={tw`flex-row gap-3 mt-3`}>
              {canRetry && onRetry && (
                <Pressable
                  onPress={onRetry}
                  style={({ pressed }) => [
                    tw`flex-row items-center gap-1 px-3 py-2 rounded-lg`,
                    { backgroundColor: pressed ? '#fee2e2' : 'transparent' }
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Reintentar"
                  accessibilityHint="Intenta generar el examen nuevamente"
                >
                  <Ionicons name="refresh" size={16} color="#dc2626" />
                  <AppText style={[tw`text-sm font-medium`, { color: '#dc2626' }]}>
                    Reintentar
                  </AppText>
                </Pressable>
              )}
              {onDismiss && (
                <Pressable
                  onPress={onDismiss}
                  style={({ pressed }) => [
                    tw`px-3 py-2 rounded-lg`,
                    { backgroundColor: pressed ? '#fee2e2' : 'transparent' }
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar error"
                >
                  <AppText style={[tw`text-sm font-medium`, { color: '#dc2626' }]}>
                    Cerrar
                  </AppText>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export default ErrorDisplay;