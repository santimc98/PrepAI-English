import { useRef, useEffect, useCallback } from 'react';
import { AccessibilityInfo, findNodeHandle } from 'react-native';

export interface UseAccessibilityReturn {
  announceForAccessibility: (message: string) => void;
  setAccessibilityFocus: (ref: any) => void;
  focusRef: React.RefObject<any>;
}

export function useAccessibility(): UseAccessibilityReturn {
  const focusRef = useRef<any>(null);

  const announceForAccessibility = useCallback((message: string) => {
    if (AccessibilityInfo) {
      AccessibilityInfo.announceForAccessibility?.(message);
    }
  }, []);

  const setAccessibilityFocus = useCallback((ref: any) => {
    if (ref && AccessibilityInfo) {
      const node = findNodeHandle(ref);
      if (node) {
        AccessibilityInfo.setAccessibilityFocus?.(node);
      }
    }
  }, []);

  // Auto-focus management for screen readers
  useEffect(() => {
    if (focusRef.current && AccessibilityInfo) {
      const timer = setTimeout(() => {
        setAccessibilityFocus(focusRef.current);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [setAccessibilityFocus]);

  return {
    announceForAccessibility,
    setAccessibilityFocus,
    focusRef,
  };
}