import { Phone, AlertTriangle } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { motion } from "framer-motion";

const EmergencyButton = () => {
  const { speak, vibrate } = useAccessibility();

  const handleEmergency = () => {
    vibrate([300, 100, 300, 100, 300]);
    speak("Emergencia. Necesito ayuda urgente.");
  };

  return (
    <motion.button
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: "spring" as const, stiffness: 300, damping: 25 }}
      whileTap={{ scale: 0.92 }}
      onClick={handleEmergency}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full bg-emergency px-7 py-4 text-emergency-foreground shadow-elevated emergency-pulse safe-bottom"
      aria-label="Botón de emergencia"
    >
      <AlertTriangle className="h-6 w-6" />
      <span className="font-bold text-base tracking-wide">EMERGENCIA</span>
    </motion.button>
  );
};

export default EmergencyButton;
