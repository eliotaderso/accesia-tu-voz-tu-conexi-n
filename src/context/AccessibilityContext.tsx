import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type AppMode = "home" | "blind" | "deaf" | "mute" | "combined" | "bigmessage";

interface AccessibilityState {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  textScale: number;
  setTextScale: (scale: number) => void;
  speak: (text: string) => void;
  vibrate: (pattern?: number | number[]) => void;
  customPhrases: string[];
  setCustomPhrases: (phrases: string[]) => void;
  bigMessage: string;
  setBigMessage: (msg: string) => void;
}

const AccessibilityContext = createContext<AccessibilityState | null>(null);

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used inside AccessibilityProvider");
  return ctx;
};

const STORAGE_KEY_PHRASES = "accesia_phrases";
const STORAGE_KEY_CONTRAST = "accesia_high_contrast";
const STORAGE_KEY_SCALE = "accesia_text_scale";

const DEFAULT_PHRASES = [
  "Hola, ¿cómo estás?",
  "Necesito ayuda",
  "Sí",
  "No",
  "Gracias",
  "Por favor",
  "No entiendo",
  "¿Puedes repetir?",
  "Me llamo...",
  "Adiós",
];

const loadPhrases = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PHRASES);
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_PHRASES;
};

const loadContrast = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY_CONTRAST) === "true";
  } catch {}
  return false;
};

const loadScale = (): number => {
  try {
    const s = localStorage.getItem(STORAGE_KEY_SCALE);
    if (s) return parseFloat(s);
  } catch {}
  return 1;
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<AppMode>("home");
  const [highContrast, setHighContrast] = useState(loadContrast);
  const [textScale, setTextScale] = useState(loadScale);
  const [customPhrases, setCustomPhrasesState] = useState<string[]>(loadPhrases);
  const [bigMessage, setBigMessage] = useState("");

  // Apply high contrast on mount
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    }
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("high-contrast");
      } else {
        document.documentElement.classList.remove("high-contrast");
      }
      localStorage.setItem(STORAGE_KEY_CONTRAST, String(next));
      return next;
    });
  }, []);

  const setCustomPhrases = useCallback((phrases: string[]) => {
    setCustomPhrasesState(phrases);
    localStorage.setItem(STORAGE_KEY_PHRASES, JSON.stringify(phrases));
  }, []);

  const handleSetTextScale = useCallback((scale: number) => {
    setTextScale(scale);
    localStorage.setItem(STORAGE_KEY_SCALE, String(scale));
  }, []);

  const speak = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      // Try to find a Spanish voice for more natural sound
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(v => v.lang.startsWith("es") && v.localService) 
        || voices.find(v => v.lang.startsWith("es"));
      if (spanishVoice) utterance.voice = spanishVoice;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const vibrate = useCallback((pattern: number | number[] = 200) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        mode, setMode,
        highContrast, toggleHighContrast,
        textScale, setTextScale: handleSetTextScale,
        speak, vibrate,
        customPhrases, setCustomPhrases,
        bigMessage, setBigMessage,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};
