import { Phone } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { motion } from "framer-motion";

const EmergencyButton = () => {
  const { speak, vibrate } = useAccessibility();

  const handleEmergency = () => {
    vibrate([300, 100, 300]);
    speak("Emergencia. Necesito ayuda urgente.");
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleEmergency}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-emergency px-6 py-4 text-emergency-foreground shadow-lg touch-target-lg font-bold text-lg"
      aria-label="Botón de emergencia"
    >
      <Phone className="h-7 w-7" />
      <span>SOS</span>
    </motion.button>
  );
};

export default EmergencyButton;
