import { Volume2, Plus, X, Send, Monitor } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const MuteMode = () => {
  const { speak, vibrate, customPhrases, setCustomPhrases, setMode, setBigMessage } = useAccessibility();
  const [inputText, setInputText] = useState("");
  const [showAddPhrase, setShowAddPhrase] = useState(false);
  const [newPhrase, setNewPhrase] = useState("");

  const handleSpeak = (text: string) => {
    if (!text.trim()) return;
    vibrate(100);
    speak(text);
  };

  const handleSendInput = () => {
    if (!inputText.trim()) return;
    handleSpeak(inputText);
    setInputText("");
  };

  const handleShowBig = (text: string) => {
    setBigMessage(text || inputText);
    setMode("bigmessage");
  };

  const addPhrase = () => {
    if (newPhrase.trim()) {
      setCustomPhrases([...customPhrases, newPhrase.trim()]);
      setNewPhrase("");
      setShowAddPhrase(false);
      vibrate(100);
    }
  };

  const removePhrase = (index: number) => {
    setCustomPhrases(customPhrases.filter((_, i) => i !== index));
    vibrate(50);
  };

  return (
    <div className="flex flex-col px-4 pt-6 pb-28">
      {/* Text input */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendInput()}
          placeholder="Escribe tu mensaje..."
          className="flex-1 rounded-2xl border-2 border-border bg-card px-5 py-4 text-accessible-xl focus:border-mute-mode focus:outline-none"
          aria-label="Escribir mensaje para convertir a voz"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSendInput}
          className="touch-target flex items-center justify-center rounded-2xl bg-mute-mode p-4 text-mute-mode-foreground"
          aria-label="Hablar mensaje"
        >
          <Volume2 className="h-7 w-7" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleShowBig(inputText)}
          className="touch-target flex items-center justify-center rounded-2xl bg-secondary p-4"
          aria-label="Mostrar mensaje grande"
        >
          <Monitor className="h-7 w-7" />
        </motion.button>
      </div>

      {/* Quick phrases */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-muted-foreground">Frases rápidas</h2>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAddPhrase(!showAddPhrase)}
          className="touch-target flex items-center justify-center rounded-xl bg-secondary p-2"
          aria-label="Añadir frase"
        >
          <Plus className="h-5 w-5" />
        </motion.button>
      </div>

      <AnimatePresence>
        {showAddPhrase && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-3 flex gap-2 overflow-hidden"
          >
            <input
              type="text"
              value={newPhrase}
              onChange={(e) => setNewPhrase(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPhrase()}
              placeholder="Nueva frase..."
              className="flex-1 rounded-xl border-2 border-border bg-card px-4 py-3 text-lg focus:border-mute-mode focus:outline-none"
            />
            <button onClick={addPhrase} className="rounded-xl bg-mute-mode px-4 py-3 text-mute-mode-foreground font-bold">
              Añadir
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3">
        {customPhrases.map((phrase, i) => (
          <motion.div
            key={`${phrase}-${i}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <button
              onClick={() => handleSpeak(phrase)}
              className="w-full rounded-2xl bg-secondary p-4 text-left text-accessible-xl shadow-sm touch-target-lg hover:shadow-md transition-shadow"
              aria-label={`Decir: ${phrase}`}
            >
              {phrase}
            </button>
            <button
              onClick={() => removePhrase(i)}
              className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
              aria-label={`Eliminar frase: ${phrase}`}
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MuteMode;
