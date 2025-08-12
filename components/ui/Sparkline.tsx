import React from 'react';
import { View } from 'react-native';
import { Svg, Polyline } from 'react-native-svg';
import { theme } from '@/lib/theme';

export type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
};

export default function Sparkline({ data, width = 280, height = 64, color = theme.colors.brand[600] }: SparklineProps) {
  if (!Array.isArray(data) || data.length === 0) {
    // Fallback tiny bars with Views
    return (
      <View style={{ width, height, flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
        {new Array(8).fill(0).map((_, i) => (
          <View key={i} style={{ width: Math.max(2, width / 20), height: Math.max(4, (i + 2) * 3), backgroundColor: color, borderRadius: 2 }} />
        ))}
      </View>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / Math.max(1, data.length - 1);

  const points = data
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <Polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}
