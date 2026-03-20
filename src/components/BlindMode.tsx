import { Volume2, Home, MessageSquare, Phone, HelpCircle, Hand } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { motion } from "framer-motion";
import { useEffect } from "react";

const ACTIONS = [
  { label: "Leer pantalla", icon: <Volume2 className="h-7 w-7" />, speech: "Estás en el modo para personas ciegas. Puedes usar los botones grandes para navegar.", emoji: "🔊" },
  { label: "Necesito ayuda", icon: <HelpCircle className="h-7 w-7" />, speech: "Necesito ayuda, por favor.", emoji: "🆘" },
  { label: "Enviar mensaje", icon: <MessageSquare className="h-7 w-7" />, speech: "Quiero enviar un mensaje.", emoji: "💬" },
  { label: "Llamar", icon: <Phone className="h-7 w-7" />, speech: "Quiero hacer una llamada.", emoji: "📞" },
  { label: "Ir al inicio", icon: <Home className="h-7 w-7" />, speech: "Volviendo al inicio.", emoji: "🏠" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 400, damping: 28 } },
};

const BlindMode = () => {
  const { speak, vibrate, setMode } = useAccessibility();

  useEffect(() => {
    speak("Modo ciego activado. Usa los botones grandes para navegar.");
  }, [speak]);

  const handleAction = (action: typeof ACTIONS[number]) => {
    vibrate(150);
    speak(action.speech);
    if (action.label === "Ir al inicio") {
      setTimeout(() => setMode("home"), 1500);
    }
  };

  return (
    <div className="flex flex-col px-5 pt-4 pb-32">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-muted-foreground text-sm font-medium mb-3 px-1"
      >
        Toca cualquier botón para escuchar la acción
      </motion.p>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-3"
      >
        {ACTIONS.map((action) => (
          <motion.button
            key={action.label}
            variants={item}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleAction(action)}
            className="flex items-center gap-4 rounded-2xl bg-blind p-5 text-blind-foreground shadow-button touch-target-lg active:shadow-elevated transition-shadow"
            aria-label={action.label}
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl">
              {action.emoji}
            </div>
            <span className="text-accessible-2xl">{action.label}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default BlindMode;
