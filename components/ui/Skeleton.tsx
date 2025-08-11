import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';

export function Skeleton({ height = 16, width = '100%', style }: { height?: number; width?: number | `${number}%` | 'auto'; style?: ViewStyle }) {
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.6, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        ({
          height,
          width: width as any,
          borderRadius: 10,
          backgroundColor: '#e5e7eb',
          opacity,
        } as any),
        style,
      ]}
    />
  );
}
