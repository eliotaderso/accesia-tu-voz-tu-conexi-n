import { Volume2, Plus, X, Monitor, Send } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const MuteMode = () => {
  const { speak, vibrate, customPhrases, setCustomPhrases, setMode, setBigMessage } = useAccessibility();
  const [inputText, setInputText] = useState("");
  const [showAddPhrase, setShowAddPhrase] = useState(false);
  const [newPhrase, setNewPhrase] = useState("");
  const [lastSpoken, setLastSpoken] = useState("");

  const handleSpeak = (text: string) => {
    if (!text.trim()) return;
    vibrate(100);
    speak(text);
    setLastSpoken(text);
    setTimeout(() => setLastSpoken(""), 2000);
  };

  const handleSendInput = () => {
    if (!inputText.trim()) return;
    handleSpeak(inputText);
    setInputText("");
  };

  const handleShowBig = (text: string) => {
    const msg = text || inputText;
    if (!msg.trim()) return;
    setBigMessage(msg);
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
    <div className="flex flex-col px-5 pt-4 pb-32">
      {/* Input area */}
      <div className="mb-5 rounded-2xl bg-card p-4 shadow-card">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendInput(); }}}
          placeholder="Escribe lo que quieres decir..."
          rows={3}
          className="w-full resize-none rounded-xl border-2 border-border bg-background px-4 py-3 text-accessible-lg focus:border-mute-mode focus:outline-none transition-colors"
          aria-label="Escribir mensaje para convertir a voz"
        />
        <div className="mt-3 flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSendInput}
            disabled={!inputText.trim()}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-mute-mode py-3.5 text-mute-mode-foreground font-bold shadow-button disabled:opacity-40 transition-opacity"
            aria-label="Hablar mensaje"
          >
            <Volume2 className="h-5 w-5" />
            Hablar
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleShowBig(inputText)}
            disabled={!inputText.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3.5 font-bold shadow-card disabled:opacity-40 transition-opacity"
            aria-label="Mostrar mensaje grande"
          >
            <Monitor className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* Spoken feedback */}
      <AnimatePresence>
        {lastSpoken && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="flex items-center gap-2 rounded-xl bg-mute-mode/10 px-4 py-3">
              <Volume2 className="h-4 w-4 text-mute-mode shrink-0" />
              <p className="text-sm text-mute-mode font-medium truncate">Diciendo: "{lastSpoken}"</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick phrases header */}
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Frases rápidas</h2>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAddPhrase(!showAddPhrase)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            showAddPhrase ? "bg-mute-mode text-mute-mode-foreground" : "bg-secondary"
          }`}
          aria-label="Añadir frase"
        >
          <Plus className={`h-4 w-4 transition-transform ${showAddPhrase ? "rotate-45" : ""}`} />
        </motion.button>
      </div>

      <AnimatePresence>
        {showAddPhrase && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="flex gap-2 rounded-2xl bg-card p-3 shadow-card">
              <input
                type="text"
                value={newPhrase}
                onChange={(e) => setNewPhrase(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPhrase()}
                placeholder="Nueva frase..."
                className="flex-1 rounded-xl border-2 border-border bg-background px-4 py-2.5 text-base focus:border-mute-mode focus:outline-none"
                autoFocus
              />
              <button
                onClick={addPhrase}
                disabled={!newPhrase.trim()}
                className="rounded-xl bg-mute-mode px-4 py-2.5 text-mute-mode-foreground font-bold text-sm disabled:opacity-40"
              >
                Añadir
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-2.5">
        {customPhrases.map((phrase, i) => (
          <motion.div
            key={`${phrase}-${i}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className="relative group"
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSpeak(phrase)}
              className="w-full rounded-xl bg-card p-3.5 text-left text-base font-medium shadow-card touch-target active:shadow-elevated transition-shadow leading-snug"
              aria-label={`Decir: ${phrase}`}
            >
              {phrase}
            </motion.button>
            <button
              onClick={() => removePhrase(i)}
              className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity"
              aria-label={`Eliminar frase: ${phrase}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MuteMode;
