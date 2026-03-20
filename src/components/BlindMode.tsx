import { Volume2, Home, MessageSquare, Phone, HelpCircle } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { motion } from "framer-motion";
import { useEffect } from "react";

const ACTIONS = [
  { label: "Leer pantalla", icon: <Volume2 className="h-8 w-8" />, speech: "Estás en el modo para personas ciegas. Puedes usar los botones grandes para navegar." },
  { label: "Necesito ayuda", icon: <HelpCircle className="h-8 w-8" />, speech: "Necesito ayuda, por favor." },
  { label: "Enviar mensaje", icon: <MessageSquare className="h-8 w-8" />, speech: "Quiero enviar un mensaje." },
  { label: "Llamar", icon: <Phone className="h-8 w-8" />, speech: "Quiero hacer una llamada." },
  { label: "Ir al inicio", icon: <Home className="h-8 w-8" />, speech: "Volviendo al inicio." },
];

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
    <div className="flex flex-col gap-4 px-4 pt-6 pb-28">
      {ACTIONS.map((action, i) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleAction(action)}
          className="flex items-center gap-5 rounded-2xl bg-blind p-6 text-blind-foreground shadow-md touch-target-lg text-accessible-2xl"
          aria-label={action.label}
        >
          {action.icon}
          <span>{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default BlindMode;
