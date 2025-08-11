import { View } from 'react-native';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <View className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>{children}</View>;
}


