import { X, Volume2 } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { motion } from "framer-motion";

const BigMessageScreen = () => {
  const { bigMessage, setMode, speak, vibrate } = useAccessibility();

  const handleSpeak = () => {
    if (bigMessage) {
      vibrate(100);
      speak(bigMessage);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex flex-col bg-card"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between p-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMode("home")}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary"
          aria-label="Cerrar mensaje grande"
        >
          <X className="h-5 w-5" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSpeak}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
          aria-label="Leer en voz alta"
        >
          <Volume2 className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Message */}
      <div className="flex-1 flex items-center justify-center px-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center font-extrabold leading-tight"
          style={{ fontSize: "clamp(2.5rem, 12vw, 6rem)" }}
        >
          {bigMessage || "Sin mensaje"}
        </motion.p>
      </div>

      {/* Bottom hint */}
      <div className="safe-bottom px-8 pb-4 text-center">
        <p className="text-sm text-muted-foreground">Muestra este mensaje a la otra persona</p>
      </div>
    </motion.div>
  );
};

export default BigMessageScreen;
