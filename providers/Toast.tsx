import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Text, View, Platform } from 'react-native';
import tw from '@/lib/tw';

export type ToastApi = {
  success: (msg: string) => void;
  error: (msg: string) => void;
};

const ToastContext = createContext<ToastApi>({ success: () => {}, error: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const [message, setMessage] = useState<string>('');
  const [variant, setVariant] = useState<'success' | 'error'>('success');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const show = useCallback((text: string, v: 'success' | 'error') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVariant(v);
    setMessage(text);
    const useDriver = Platform.OS !== 'web';
    Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: useDriver, easing: Easing.out(Easing.cubic) }).start();
    timeoutRef.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: useDriver, easing: Easing.in(Easing.cubic) }).start();
    }, 1800);
  }, [opacity]);

  const api = useMemo<ToastApi>(() => ({
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error'),
  }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 24,
            alignItems: 'center',
          },
          { opacity },
        ]}
      >
        {message ? (
          <View
            style={[
              tw`px-4 py-3 rounded-2xl`,
              {
                backgroundColor: variant === 'success' ? '#16a34a' : '#dc2626',
                maxWidth: '90%',
              },
            ]}
          >
            <Text style={tw`text-white font-semibold`}>{message}</Text>
          </View>
        ) : null}
      </Animated.View>
    </ToastContext.Provider>
  );
}
