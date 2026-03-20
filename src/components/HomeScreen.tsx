import { Eye, Ear, MessageCircle, Layers } from "lucide-react";
import { useAccessibility, AppMode } from "@/context/AccessibilityContext";
import { motion } from "framer-motion";

const MODES: { id: AppMode; label: string; desc: string; icon: React.ReactNode; colorClass: string }[] = [
  {
    id: "blind",
    label: "Ciego",
    desc: "Lectura en voz alta y navegación simplificada",
    icon: <Eye className="h-10 w-10" />,
    colorClass: "bg-blind text-blind-foreground",
  },
  {
    id: "deaf",
    label: "Sordo",
    desc: "Voz a texto en tiempo real",
    icon: <Ear className="h-10 w-10" />,
    colorClass: "bg-deaf text-deaf-foreground",
  },
  {
    id: "mute",
    label: "Mudo",
    desc: "Texto a voz y frases rápidas",
    icon: <MessageCircle className="h-10 w-10" />,
    colorClass: "bg-mute-mode text-mute-mode-foreground",
  },
  {
    id: "combined",
    label: "Combinado",
    desc: "Comunicación accesible múltiple",
    icon: <Layers className="h-10 w-10" />,
    colorClass: "bg-combined text-combined-foreground",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const HomeScreen = () => {
  const { setMode, speak } = useAccessibility();

  const handleSelect = (m: typeof MODES[number]) => {
    speak(`Modo ${m.label} activado`);
    setMode(m.id);
  };

  return (
    <div className="flex flex-col items-center px-4 pt-8 pb-28">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <p className="text-accessible-xl text-muted-foreground">
          Selecciona tu modo de accesibilidad
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid w-full max-w-md grid-cols-1 gap-4"
      >
        {MODES.map((m) => (
          <motion.button
            key={m.id}
            variants={item}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelect(m)}
            className={`${m.colorClass} flex items-center gap-5 rounded-2xl p-6 text-left shadow-md touch-target-lg transition-shadow hover:shadow-lg`}
            aria-label={`Activar modo ${m.label}: ${m.desc}`}
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/20">
              {m.icon}
            </div>
            <div>
              <span className="text-accessible-2xl block">{m.label}</span>
              <span className="text-sm opacity-90">{m.desc}</span>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default HomeScreen;
