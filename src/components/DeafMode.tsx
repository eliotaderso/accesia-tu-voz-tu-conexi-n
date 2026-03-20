import { Mic, MicOff, Trash2 } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";

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
        setHistory((prev) => [final, ...prev].slice(0, 10));
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
    <div className="flex flex-col px-4 pt-6 pb-28" style={{ fontSize: `${textScale}rem` }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-4 min-h-[120px] rounded-2xl bg-card p-6 shadow-inner border-2 border-border"
      >
        <p className="text-accessible-2xl text-center">
          {currentText || (isListening ? "Escuchando..." : "Pulsa el micrófono para empezar")}
        </p>
      </motion.div>

      <div className="flex justify-center gap-4 mb-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={isListening ? stopListening : startListening}
          className={`touch-target-lg flex items-center gap-3 rounded-2xl px-8 py-5 text-accessible-xl font-bold shadow-md ${
            isListening ? "bg-destructive text-destructive-foreground" : "bg-deaf text-deaf-foreground"
          }`}
          aria-label={isListening ? "Detener escucha" : "Empezar a escuchar"}
        >
          {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
          {isListening ? "Parar" : "Escuchar"}
        </motion.button>

        {history.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setHistory([]); vibrate(100); }}
            className="touch-target flex items-center justify-center rounded-2xl bg-secondary p-4"
            aria-label="Borrar historial"
          >
            <Trash2 className="h-6 w-6" />
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {history.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <h2 className="text-lg font-semibold text-muted-foreground mb-2">Historial</h2>
            {history.map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-secondary p-4"
              >
                <p className="text-accessible-xl">{text}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeafMode;
