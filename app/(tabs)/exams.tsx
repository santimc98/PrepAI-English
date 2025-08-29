// app/(tabs)/exams.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import tw from '@/lib/tw';
import Container from '@/components/layout/Container';
import Heading from '@/components/ui/Heading';
import TextMuted from '@/components/ui/TextMuted';
import EnhancedButton from '@/components/ui/EnhancedButton';
import { Skeleton } from '@/components/ui/Skeleton';
import ActionCard from '@/components/ui/ActionCard';
import Sheet from '@/components/ui/Sheet';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useExamGeneration } from '@/hooks/useExamGeneration';
import { useAccessibility } from '@/hooks/useAccessibility';
import { EXAM_OPTIONS, DEFAULT_SECTIONS } from '@/constants/examOptions';
import type { ExamLevel } from '@/types/level';
import type { ExamSection } from '@/types/exam';

interface PendingExam {
  id: string;
  title: string;
  sections: ExamSection[];
  description: string;
  estimatedDuration: string;
}

export default function ExamsScreen() {
  const { announceForAccessibility } = useAccessibility();

  // User preferences with proper typing
  const { certificationLevel } = useUserPreferences();
  const examLevel: ExamLevel = useMemo(() => {
    return certificationLevel === 'A2' ? 'B1' : (certificationLevel as ExamLevel);
  }, [certificationLevel]);

  // State management
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pending, setPending] = useState<PendingExam | null>(null);

  // Exam generation hook
  const { generateExam, state, resetError, canRetry } = useExamGeneration();

  // Memoized options with proper typing
  const options = useMemo(() =>
    EXAM_OPTIONS.map((option: typeof EXAM_OPTIONS[0]) => ({
      ...option,
      title: option.id === 'complete' ? `Mock ${examLevel} ${option.title.toLowerCase()}` : option.title,
    })), [examLevel]
  );

  // Event handlers
  const handleOptionPress = useCallback((option: typeof options[0]) => {
    const pendingExam: PendingExam = {
      id: option.id,
      title: option.title,
      sections: option.sections,
      description: option.description,
      estimatedDuration: option.estimatedDuration,
    };
    setPending(pendingExam);
    setSheetOpen(true);
    announceForAccessibility(`Seleccionaste ${option.title}`);
  }, [announceForAccessibility]);

  const handleStartExam = useCallback(async () => {
    if (!pending) return;

    await generateExam({
      sections: pending.sections,
      level: examLevel,
    });

    setSheetOpen(false);
    setPending(null);
  }, [pending, examLevel, generateExam]);

  const handleQuickGenerate = useCallback(async () => {
    await generateExam({
      sections: DEFAULT_SECTIONS,
      level: examLevel,
    });
  }, [examLevel, generateExam]);

  const handleSheetClose = useCallback(() => {
    setSheetOpen(false);
    setPending(null);
  }, []);

  const handleRetry = useCallback(async () => {
    if (pending) {
      await handleStartExam();
    } else {
      await handleQuickGenerate();
    }
  }, [pending, handleStartExam, handleQuickGenerate]);

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Heading>Simulacros</Heading>
        <TextMuted>Genera un simulacro rápido de ejemplo</TextMuted>

        {/* Error Display */}
        {state.error && (
          <ErrorDisplay
            error={state.error}
            onRetry={canRetry ? handleRetry : undefined}
            onDismiss={resetError}
            canRetry={canRetry}
          />
        )}

        {/* Loading Skeleton */}
        {state.loading && (
          <View style={tw`mt-4`}>
            <Skeleton height={56} style={tw`mb-3`} />
            <Skeleton height={56} style={tw`mb-3`} />
            <Skeleton height={56} />
          </View>
        )}

        {/* Exam Options */}
        {!state.loading && (
          <View style={tw`mt-6 gap-3`}>
            {options.map((option) => (
              <ActionCard
                small
                title={option.title}
                subtitle={option.description}
                icon={option.icon as any}
                tone="primary"
                onPress={() => handleOptionPress(option)}
                key={option.id}
              />
            ))}
          </View>
        )}

        {/* Quick Generate Button */}
        {!state.loading && (
          <View style={tw`mt-6`}>
            <EnhancedButton
              title={`Generar Mock ${examLevel} Completo`}
              onPress={handleQuickGenerate}
              loading={state.loading}
              variant="secondary"
              size="large"
              accessibilityLabel={`Generar examen completo nivel ${examLevel}`}
              accessibilityHint="Genera un examen con todas las secciones"
            />
          </View>
        )}

        {/* Confirmation Sheet */}
        <Sheet
          visible={sheetOpen}
          title={pending?.title || 'Confirmar Examen'}
          onClose={handleSheetClose}
        >
          {pending && (
            <View>
              <Text style={tw`mb-3 text-base leading-6`}>
                {pending.description}
              </Text>
              <TextMuted style={tw`mb-4`}>
                Duración estimada: {pending.estimatedDuration} • Secciones: {pending.sections.join(', ')}
              </TextMuted>

              <View style={tw`flex-row gap-3`}>
                <EnhancedButton
                  title="Comenzar"
                  onPress={handleStartExam}
                  loading={state.loading}
                  variant="primary"
                  style={tw`flex-1`}
                  accessibilityLabel="Comenzar examen"
                  accessibilityHint="Inicia el examen seleccionado"
                />
                <EnhancedButton
                  title="Cancelar"
                  onPress={handleSheetClose}
                  variant="outline"
                  disabled={state.loading}
                  style={tw`flex-1`}
                  accessibilityLabel="Cancelar y cerrar"
                />
              </View>
            </View>
          )}
        </Sheet>
      </ScrollView>
    </Container>
  );
}
