import { Mic, MicOff, Trash2, Copy, Check } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";

const STORAGE_KEY_HISTORY = "accesia_deaf_history";

interface TranscriptEntry {
  text: string;
  timestamp: number;
}

const ListeningIndicator = () => (
  <div className="flex items-end gap-1 h-6">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="w-1 rounded-full bg-deaf listening-bar" style={{ height: "100%" }} />
    ))}
  </div>
);

const formatTime = (ts: number): string => {
  const diff = Math.round((Date.now() - ts) / 1000);
  if (diff < 60) return "Ahora mismo";
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  return new Date(ts).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
};

const DeafMode = () => {
  const { vibrate, textScale } = useAccessibility();
  const [isListening, setIsListening] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [history, setHistory] = useState<TranscriptEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const [, forceUpdate] = useState(0);

  // Update timestamps every 30s
  useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history.slice(0, 50)));
  }, [history]);

  // Auto-start mic on mount
  useEffect(() => {
    const timer = setTimeout(() => startListening(), 500);
    return () => {
      clearTimeout(timer);
      recognitionRef.current?.stop();
    };
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setCurrentText("Tu navegador no soporta reconocimiento de voz.");
      return;
    }
    // Stop existing
    recognitionRef.current?.stop();

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      if (final) {
        const entry: TranscriptEntry = { text: final.trim(), timestamp: Date.now() };
        setHistory((prev) => [entry, ...prev].slice(0, 50));
        setCurrentText("");
        vibrate(100);
      } else {
        setCurrentText(interim);
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error !== "no-speech" && e.error !== "aborted") {
        setIsListening(false);
      }
    };

    // Auto-restart on end to keep continuous listening
    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        try { recognition.start(); } catch { setIsListening(false); }
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    vibrate(200);
  }, [vibrate]);

  const stopListening = useCallback(() => {
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    rec?.stop();
    setIsListening(false);
  }, []);

  const copyText = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedIndex(index);
    vibrate(50);
    setTimeout(() => setCopiedIndex(null), 1500);
  }, [vibrate]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    vibrate(100);
  }, [vibrate]);

  return (
    <div className="flex flex-col px-5 pt-4 pb-32 scroll-smooth" style={{ fontSize: `${textScale}rem` }}>
      {/* Live transcription area */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative mb-5 min-h-[140px] rounded-2xl p-6 shadow-card transition-all ${
          isListening ? "bg-deaf/5 border-2 border-deaf/30" : "bg-card border-2 border-border"
        }`}
      >
        {isListening && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="text-xs font-semibold text-deaf uppercase tracking-wider">En vivo</span>
            <ListeningIndicator />
          </div>
        )}
        <p className={`text-accessible-2xl text-center mt-4 ${!currentText && !isListening ? "text-muted-foreground" : ""}`}>
          {currentText || (isListening ? "Escuchando..." : "Micrófono apagado")}
        </p>
        {isListening && !currentText && (
          <p className="text-center text-sm text-muted-foreground mt-2">
            Habla cerca del micrófono para ver la transcripción
          </p>
        )}
      </motion.div>

      {/* Controls */}
      <div className="flex justify-center gap-3 mb-6">
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={isListening ? stopListening : startListening}
          className={`touch-target-lg flex items-center gap-3 rounded-full px-8 py-4 font-bold text-lg shadow-button transition-all ${
            isListening
              ? "bg-destructive text-destructive-foreground"
              : "bg-deaf text-deaf-foreground"
          }`}
          aria-label={isListening ? "Detener escucha" : "Empezar a escuchar"}
        >
          {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          {isListening ? "Detener" : "Escuchar"}
        </motion.button>

        <AnimatePresence>
          {history.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearHistory}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary shadow-card"
              aria-label="Borrar historial"
            >
              <Trash2 className="h-5 w-5 text-muted-foreground" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* History */}
      <AnimatePresence>
        {history.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1 uppercase tracking-wider">
              Historial ({history.length})
            </h2>
            {history.map((entry, i) => (
              <motion.div
                key={`${entry.timestamp}-${i}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="group rounded-2xl bg-card p-4 shadow-card"
              >
                <p className="text-accessible-lg">{entry.text}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {formatTime(entry.timestamp)}
                  </span>
                  <button
                    onClick={() => copyText(entry.text, i)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Copiar texto"
                  >
                    {copiedIndex === i ? (
                      <><Check className="h-3.5 w-3.5 text-accent" /> Copiado</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5" /> Copiar</>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeafMode;
