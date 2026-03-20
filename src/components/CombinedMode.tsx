import { HelpCircle, Phone, EarOff, MicOff, Eye, Monitor } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { motion } from "framer-motion";

const QUICK_ACTIONS = [
  { label: "Necesito ayuda", icon: <HelpCircle className="h-8 w-8" />, speech: "Necesito ayuda, por favor." },
  { label: "Llama a un familiar", icon: <Phone className="h-8 w-8" />, speech: "Por favor, llama a un familiar mío." },
  { label: "No puedo oír", icon: <EarOff className="h-8 w-8" />, speech: "No puedo oír. Por favor, escríbeme." },
  { label: "No puedo hablar", icon: <MicOff className="h-8 w-8" />, speech: "No puedo hablar. Por favor, lee la pantalla." },
  { label: "Soy ciego", icon: <Eye className="h-8 w-8" />, speech: "Soy ciego. Necesito asistencia." },
];

const CombinedMode = () => {
  const { speak, vibrate, setMode, setBigMessage } = useAccessibility();

  const handleAction = (action: typeof QUICK_ACTIONS[number]) => {
    vibrate([200, 100, 200]);
    speak(action.speech);
    setBigMessage(action.label);
  };

  const handleShowBigMessage = (text: string) => {
    setBigMessage(text);
    setMode("bigmessage");
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-28">
      {QUICK_ACTIONS.map((action, i) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleAction(action)}
          className="flex items-center gap-5 rounded-2xl bg-combined p-6 text-combined-foreground shadow-md touch-target-lg text-accessible-2xl"
          aria-label={action.label}
        >
          {action.icon}
          <span className="flex-1">{action.label}</span>
          <button
            onClick={(e) => { e.stopPropagation(); handleShowBigMessage(action.label); }}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20"
            aria-label={`Mostrar "${action.label}" en pantalla grande`}
          >
            <Monitor className="h-6 w-6" />
          </button>
        </motion.button>
      ))}
    </div>
  );
};

export default CombinedMode;
