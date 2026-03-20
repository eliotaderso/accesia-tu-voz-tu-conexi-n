import { AlertTriangle, MapPin, X, Share2, Volume2 } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";

const EmergencyButton = () => {
  const { speak, vibrate, setBigMessage, setMode } = useAccessibility();
  const [expanded, setExpanded] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [locationUrl, setLocationUrl] = useState<string | null>(null);

  const handleEmergency = () => {
    vibrate([300, 100, 300, 100, 300]);
    speak("Emergencia. Necesito ayuda urgente.");
    setExpanded(true);
  };

  const showBigMessage = () => {
    setBigMessage("🆘 NECESITO AYUDA URGENTE");
    setMode("bigmessage");
    setExpanded(false);
  };

  const shareLocation = useCallback(async () => {
    setLocationStatus("Obteniendo ubicación...");
    vibrate(100);

    if (!("geolocation" in navigator)) {
      setLocationStatus("Geolocalización no disponible");
      speak("No se puede obtener la ubicación en este dispositivo.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://maps.google.com/maps?q=${latitude},${longitude}`;
        setLocationUrl(url);
        setLocationStatus(`📍 ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        speak(`Ubicación obtenida. Latitud ${latitude.toFixed(2)}, longitud ${longitude.toFixed(2)}.`);

        // Try native share
        if (navigator.share) {
          navigator.share({
            title: "Mi ubicación - EMERGENCIA",
            text: `🆘 EMERGENCIA - Mi ubicación: ${url}`,
            url: url,
          }).catch(() => {
            // User cancelled or not supported
            navigator.clipboard.writeText(`🆘 EMERGENCIA - Mi ubicación: ${url}`).catch(() => {});
          });
        } else {
          navigator.clipboard.writeText(`🆘 EMERGENCIA - Mi ubicación: ${url}`).catch(() => {});
          setLocationStatus(`📍 Ubicación copiada al portapapeles`);
        }
      },
      (error) => {
        let msg = "No se pudo obtener la ubicación.";
        if (error.code === 1) msg = "Permiso de ubicación denegado.";
        else if (error.code === 2) msg = "Ubicación no disponible.";
        else if (error.code === 3) msg = "Tiempo agotado al obtener ubicación.";
        setLocationStatus(msg);
        speak(msg);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [vibrate, speak]);

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
            className="fixed bottom-0 inset-x-0 z-50 rounded-t-3xl bg-card p-6 shadow-elevated safe-bottom"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-emergency flex items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                Emergencia
              </h2>
              <button
                onClick={() => setExpanded(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={showBigMessage}
                className="flex items-center gap-3 rounded-2xl bg-emergency p-4 text-emergency-foreground font-bold shadow-button"
              >
                <Volume2 className="h-6 w-6" />
                Mostrar mensaje grande en pantalla
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={shareLocation}
                className="flex items-center gap-3 rounded-2xl bg-primary p-4 text-primary-foreground font-bold shadow-button"
              >
                <MapPin className="h-6 w-6" />
                Compartir mi ubicación
              </motion.button>

              {locationStatus && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-xl bg-secondary p-3 text-center"
                >
                  <p className="text-sm font-medium">{locationStatus}</p>
                  {locationUrl && (
                    <a
                      href={locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline mt-1 block"
                    >
                      Ver en Google Maps
                    </a>
                  )}
                </motion.div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { speak("Necesito ayuda urgente. Por favor, llama a emergencias."); vibrate([500, 200, 500]); }}
                className="flex items-center gap-3 rounded-2xl bg-secondary p-4 font-bold shadow-card"
              >
                <Share2 className="h-6 w-6" />
                Pedir ayuda por voz
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      {!expanded && (
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
      )}
    </>
  );
};

export default EmergencyButton;
