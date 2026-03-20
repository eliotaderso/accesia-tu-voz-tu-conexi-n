import { ArrowLeft, Eye, Sun, Type } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { motion, AnimatePresence } from "framer-motion";
import accesiaLogo from "@/assets/accesia-logo.png";

const MODE_TITLES: Record<string, string> = {
  home: "ACCESIA",
  blind: "Modo Ciego",
  deaf: "Modo Sordo",
  mute: "Modo Mudo",
  combined: "Modo Combinado",
  bigmessage: "Mensaje",
};

const MODE_COLORS: Record<string, string> = {
  blind: "bg-blind/10 text-blind",
  deaf: "bg-deaf/10 text-deaf",
  mute: "bg-mute-mode/10 text-mute-mode",
  combined: "bg-combined/10 text-combined",
};

const AppHeader = () => {
  const { mode, setMode, highContrast, toggleHighContrast, textScale, setTextScale } = useAccessibility();

  const modeColor = MODE_COLORS[mode] || "";

  return (
    <header className="sticky top-0 z-40 glass border-b border-border/50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {mode !== "home" ? (
              <motion.button
                key="back"
                initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.85 }}
                onClick={() => setMode("home")}
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${modeColor || "bg-secondary"} transition-colors`}
                aria-label="Volver al inicio"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
            ) : (
              <motion.div
                key="logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex h-10 w-10 items-center justify-center"
              >
                <img src={accesiaLogo} alt="ACCESIA" className="h-9 w-9 rounded-lg" />
              </motion.div>
            )}
          </AnimatePresence>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none">
              {MODE_TITLES[mode]}
            </h1>
            {mode === "home" && (
              <p className="text-xs text-muted-foreground font-medium">Accesibilidad para todos</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleHighContrast}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
              highContrast ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
            aria-label={highContrast ? "Desactivar alto contraste" : "Activar alto contraste"}
          >
            {highContrast ? <Sun className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setTextScale(textScale >= 1.4 ? 1 : textScale + 0.2)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors"
            aria-label="Cambiar tamaño de texto"
          >
            <Type className="h-[18px] w-[18px]" />
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
