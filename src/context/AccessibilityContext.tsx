import React, { createContext, useContext, useState, useCallback } from "react";

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

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<AppMode>("home");
  const [highContrast, setHighContrast] = useState(false);
  const [textScale, setTextScale] = useState(1);
  const [customPhrases, setCustomPhrases] = useState<string[]>(DEFAULT_PHRASES);
  const [bigMessage, setBigMessage] = useState("");

  const toggleHighContrast = useCallback(() => {
    setHighContrast((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("high-contrast");
      } else {
        document.documentElement.classList.remove("high-contrast");
      }
      return next;
    });
  }, []);

  const speak = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.rate = 0.9;
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
        textScale, setTextScale,
        speak, vibrate,
        customPhrases, setCustomPhrases,
        bigMessage, setBigMessage,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};
