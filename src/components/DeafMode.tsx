import { Mic, MicOff, Trash2 } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";

const ListeningIndicator = () => (
  <div className="flex items-end gap-1 h-6">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="w-1 rounded-full bg-deaf listening-bar"
        style={{ height: "100%" }}
      />
    ))}
  </div>
);

const DeafMode = () => {
  const { vibrate, textScale } = useAccessibility();
  const [isListening, setIsListening] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setCurrentText("Tu navegador no soporta reconocimiento de voz.");
      return;
    }
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
        setHistory((prev) => [final, ...prev].slice(0, 20));
        setCurrentText("");
        vibrate(100);
      } else {
        setCurrentText(interim);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    vibrate(200);
  }, [vibrate]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  useEffect(() => () => recognitionRef.current?.stop(), []);

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
          <div className="absolute top-4 right-4">
            <ListeningIndicator />
          </div>
        )}
        <p className={`text-accessible-2xl text-center ${!currentText && !isListening ? "text-muted-foreground" : ""}`}>
          {currentText || (isListening ? "Escuchando..." : "Pulsa el micrófono para empezar")}
        </p>
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
              onClick={() => { setHistory([]); vibrate(100); }}
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
              Historial de transcripción
            </h2>
            {history.map((text, i) => (
              <motion.div
                key={`${text}-${i}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-card p-4 shadow-card"
              >
                <p className="text-accessible-lg">{text}</p>
                <span className="text-xs text-muted-foreground mt-1 block">
                  Hace un momento
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeafMode;
