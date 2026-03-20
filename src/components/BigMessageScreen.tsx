import { ArrowLeft } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { motion } from "framer-motion";

const BigMessageScreen = () => {
  const { bigMessage, setMode } = useAccessibility();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-card p-8"
    >
      <button
        onClick={() => setMode("home")}
        className="absolute top-6 left-6 touch-target flex items-center justify-center rounded-xl bg-secondary p-3"
        aria-label="Cerrar mensaje grande"
      >
        <ArrowLeft className="h-7 w-7" />
      </button>
      <p className="text-accessible-3xl text-center max-w-lg" style={{ fontSize: "clamp(2rem, 10vw, 5rem)" }}>
        {bigMessage || "Sin mensaje"}
      </p>
    </motion.div>
  );
};

export default BigMessageScreen;
