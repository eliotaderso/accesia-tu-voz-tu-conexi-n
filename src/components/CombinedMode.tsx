import { HelpCircle, Phone, EarOff, MicOff, Eye, Monitor } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { motion } from "framer-motion";

const QUICK_ACTIONS = [
  { label: "Necesito ayuda", icon: <HelpCircle className="h-6 w-6" />, speech: "Necesito ayuda, por favor.", emoji: "🆘" },
  { label: "Llama a un familiar", icon: <Phone className="h-6 w-6" />, speech: "Por favor, llama a un familiar mío.", emoji: "📞" },
  { label: "No puedo oír", icon: <EarOff className="h-6 w-6" />, speech: "No puedo oír. Por favor, escríbeme.", emoji: "🔇" },
  { label: "No puedo hablar", icon: <MicOff className="h-6 w-6" />, speech: "No puedo hablar. Por favor, lee la pantalla.", emoji: "🤐" },
  { label: "Soy ciego/a", icon: <Eye className="h-6 w-6" />, speech: "Soy ciego. Necesito asistencia.", emoji: "👁️" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 400, damping: 28 } },
};

const CombinedMode = () => {
  const { speak, vibrate, setMode, setBigMessage } = useAccessibility();

  const handleAction = (action: typeof QUICK_ACTIONS[number]) => {
    vibrate([200, 100, 200]);
    speak(action.speech);
  };

  const handleShowBigMessage = (text: string) => {
    setBigMessage(text);
    setMode("bigmessage");
  };

  return (
    <div className="flex flex-col px-5 pt-4 pb-32">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-muted-foreground text-sm font-medium mb-3 px-1"
      >
        Toca para hablar · Toca 📺 para mostrar en pantalla
      </motion.p>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-3"
      >
        {QUICK_ACTIONS.map((action) => (
          <motion.div key={action.label} variants={item} className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => handleAction(action)}
              className="flex-1 flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card active:shadow-elevated transition-shadow touch-target-lg"
              aria-label={action.label}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-combined/10 text-xl">
                {action.emoji}
              </div>
              <span className="text-lg font-bold text-left leading-tight">{action.label}</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleShowBigMessage(action.label)}
              className="flex h-auto w-14 items-center justify-center rounded-2xl bg-combined/10 text-combined shadow-card active:bg-combined active:text-combined-foreground transition-colors"
              aria-label={`Mostrar "${action.label}" en pantalla grande`}
            >
              <Monitor className="h-5 w-5" />
            </motion.button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default CombinedMode;
