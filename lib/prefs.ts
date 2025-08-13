import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ExamLevel } from '@/types/level';

const KEY = 'pref:defaultExamLevel';

export async function getDefaultLevel(): Promise<ExamLevel | null> {
  const v = await AsyncStorage.getItem(KEY);
  return (v === 'B1' || v === 'B2' || v === 'C1' || v === 'C2') ? (v as ExamLevel) : null;
}
export async function setDefaultLevel(level: ExamLevel) {
  await AsyncStorage.setItem(KEY, level);
}
