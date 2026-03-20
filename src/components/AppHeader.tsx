import { ArrowLeft, Settings, Eye, Sun } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { motion } from "framer-motion";

const MODE_TITLES: Record<string, string> = {
  home: "ACCESIA",
  blind: "Modo Ciego",
  deaf: "Modo Sordo",
  mute: "Modo Mudo",
  combined: "Modo Combinado",
  bigmessage: "Mensaje Grande",
};

const AppHeader = () => {
  const { mode, setMode, highContrast, toggleHighContrast, textScale, setTextScale } = useAccessibility();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-card/95 backdrop-blur px-4 py-3 border-b border-border">
      <div className="flex items-center gap-2">
        {mode !== "home" && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setMode("home")}
            className="touch-target flex items-center justify-center rounded-xl bg-secondary p-3"
            aria-label="Volver al inicio"
          >
            <ArrowLeft className="h-6 w-6" />
          </motion.button>
        )}
        <h1 className="text-xl font-bold tracking-tight">{MODE_TITLES[mode]}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleHighContrast}
          className="touch-target flex items-center justify-center rounded-xl bg-secondary p-3"
          aria-label={highContrast ? "Desactivar alto contraste" : "Activar alto contraste"}
        >
          {highContrast ? <Sun className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
        <button
          onClick={() => setTextScale(textScale >= 1.4 ? 1 : textScale + 0.2)}
          className="touch-target flex items-center justify-center rounded-xl bg-secondary p-3 font-bold text-sm"
          aria-label="Cambiar tamaño de texto"
        >
          A{textScale > 1 ? "+" : ""}
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
