import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getExam } from '@/lib/exams';
import { useToast } from '@/providers/Toast';
import type { ExamSection, Exam } from '@/types/exam';
import type { ExamLevel } from '@/types/level';

export interface ExamGenerationOptions {
  sections: ExamSection[];
  level: ExamLevel;
}

export interface ExamGenerationState {
  loading: boolean;
  error: string | null;
  retryCount: number;
  lastGeneratedExam: Exam | null;
}

export interface UseExamGenerationReturn {
  generateExam: (options: ExamGenerationOptions) => Promise<void>;
  state: ExamGenerationState;
  resetError: () => void;
  canRetry: boolean;
  clearCache: () => Promise<void>;
}

const MAX_RETRY_ATTEMPTS = 3;

export function useExamGeneration(): UseExamGenerationReturn {
  const router = useRouter();
  const toast = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const [state, setState] = useState<ExamGenerationState>({
    loading: false,
    error: null,
    retryCount: 0,
    lastGeneratedExam: null,
  });

  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load cached exam on mount
  useEffect(() => {
    const loadCachedExam = async () => {
      try {
        const cachedExam = await AsyncStorage.getItem('lastGeneratedExam');
        if (cachedExam) {
          const exam: Exam = JSON.parse(cachedExam);
          setState(prev => ({ ...prev, lastGeneratedExam: exam }));
        }
      } catch (error) {
        console.warn('Error loading cached exam:', error);
      }
    };

    loadCachedExam();
  }, []);

  const generateExam = useCallback(async (options: ExamGenerationOptions) => {
    // Prevent multiple simultaneous requests
    if (state.loading) return;

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const exam = await getExam({
        sections: options.sections,
        level: options.level,
      });

      // Check if request was cancelled
      if (abortController.signal.aborted) return;

      // Cache the generated exam
      try {
        await AsyncStorage.setItem('lastGeneratedExam', JSON.stringify(exam));
        setState(prev => ({ ...prev, lastGeneratedExam: exam }));
      } catch (cacheError) {
        console.warn('Error caching exam:', cacheError);
      }

      // Success - show toast and navigate
      try {
        toast.success('Examen generado exitosamente');
      } catch (toastError) {
        console.warn('Toast error:', toastError);
      }

      router.push({
        pathname: '/exam/[id]' as any,
        params: { id: exam.id, data: JSON.stringify(exam) },
      } as any);

      // Reset retry count on success
      setState(prev => ({ ...prev, retryCount: 0 }));

    } catch (error: any) {
      // Check if request was cancelled
      if (abortController.signal.aborted) return;

      const errorMessage = error?.message || 'Error desconocido al generar el examen';

      setState(prev => ({
        ...prev,
        error: errorMessage,
        retryCount: prev.retryCount + 1,
      }));

      // Show error toast
      try {
        toast.error('Error al generar el examen');
      } catch (toastError) {
        console.warn('Toast error:', toastError);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setState(prev => ({ ...prev, loading: false }));
      }
    }
  }, [state.loading, router, toast]);

  const canRetry = state.error !== null && state.retryCount < MAX_RETRY_ATTEMPTS;

  const clearCache = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('lastGeneratedExam');
      setState(prev => ({ ...prev, lastGeneratedExam: null }));
    } catch (error) {
      console.warn('Error clearing exam cache:', error);
    }
  }, []);

  return {
    generateExam,
    state,
    resetError,
    canRetry,
    clearCache,
  };
}