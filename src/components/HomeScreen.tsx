import { Eye, Ear, MessageCircle, Layers, ChevronRight, Sparkles } from "lucide-react";
import { useAccessibility, AppMode } from "@/context/AccessibilityContext";
import { motion } from "framer-motion";
import accesiaLogo from "@/assets/accesia-logo.png";

const MODES: { id: AppMode; label: string; desc: string; icon: React.ReactNode; bg: string; iconBg: string }[] = [
  {
    id: "blind",
    label: "Visión",
    desc: "Navegación por voz y botones grandes",
    icon: <Eye className="h-7 w-7" />,
    bg: "bg-blind",
    iconBg: "bg-blind/15 text-blind",
  },
  {
    id: "deaf",
    label: "Audición",
    desc: "Convierte voz a texto en tiempo real",
    icon: <Ear className="h-7 w-7" />,
    bg: "bg-deaf",
    iconBg: "bg-deaf/15 text-deaf",
  },
  {
    id: "mute",
    label: "Habla",
    desc: "Escribe y el teléfono habla por ti",
    icon: <MessageCircle className="h-7 w-7" />,
    bg: "bg-mute-mode",
    iconBg: "bg-mute-mode/15 text-mute-mode",
  },
  {
    id: "combined",
    label: "Múltiple",
    desc: "Comunicación rápida y accesible",
    icon: <Layers className="h-7 w-7" />,
    bg: "bg-combined",
    iconBg: "bg-combined/15 text-combined",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 400, damping: 28 } },
};

const HomeScreen = () => {
  const { setMode, speak } = useAccessibility();

  const handleSelect = (m: typeof MODES[number]) => {
    speak(`Modo ${m.label} activado`);
    setMode(m.id);
  };

  return (
    <div className="flex flex-col px-5 pt-4 pb-32">
      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 flex flex-col items-center text-center"
      >
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-card">
          <img src={accesiaLogo} alt="" className="h-12 w-12" />
        </div>
        <h2 className="text-accessible-2xl mb-1">¿Cómo podemos ayudarte?</h2>
        <p className="text-muted-foreground text-accessible-lg max-w-xs">
          Elige el modo que mejor se adapte a tus necesidades
        </p>
      </motion.div>

      {/* Mode cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-3"
      >
        {MODES.map((m) => (
          <motion.button
            key={m.id}
            variants={item}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(m)}
            className="group flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card transition-all active:shadow-elevated"
            aria-label={`Activar modo ${m.label}: ${m.desc}`}
          >
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${m.iconBg} transition-transform group-active:scale-95`}>
              {m.icon}
            </div>
            <div className="flex-1 text-left">
              <span className="text-lg font-bold block leading-tight">{m.label}</span>
              <span className="text-sm text-muted-foreground leading-snug">{m.desc}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/40 transition-transform group-active:translate-x-0.5" />
          </motion.button>
        ))}
      </motion.div>

      {/* Tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex items-center gap-3 rounded-2xl bg-primary/5 p-4"
      >
        <Sparkles className="h-5 w-5 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Consejo:</strong> Usa los controles de la barra superior para ajustar el contraste y tamaño del texto.
        </p>
      </motion.div>
    </div>
  );
};

export default HomeScreen;
