import { Camera, Volume2, Home, HelpCircle, Eye, X, Loader2 } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 400, damping: 28 } },
};

const BlindMode = () => {
  const { speak, vibrate, setMode, setBigMessage } = useAccessibility();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  useEffect(() => {
    speak("Modo visión activado. Puedes usar la cámara para capturar imágenes.");
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setCapturedImage(null);
      setAnalysisResult(null);
      vibrate(100);
      speak("Cámara activada. Pulsa capturar para tomar una foto.");
    } catch (err) {
      speak("No se pudo acceder a la cámara. Comprueba los permisos.");
    }
  }, [speak, vibrate]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(dataUrl);
    stopCamera();
    vibrate(150);
    speak("Foto capturada. Analizando imagen...");
    analyzeImage(dataUrl);
  }, [speak, vibrate, stopCamera]);

  const analyzeImage = useCallback(async (dataUrl: string) => {
    setAnalyzing(true);
    // Without Cloud/AI backend, we do basic client-side analysis
    // We can detect colors and rough content using canvas
    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("No canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No context");

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imgData.data;
      let totalR = 0, totalG = 0, totalB = 0;
      let brightPixels = 0;
      const sampleSize = Math.min(pixels.length / 4, 10000);
      const step = Math.floor(pixels.length / 4 / sampleSize);

      for (let i = 0; i < pixels.length; i += step * 4) {
        totalR += pixels[i];
        totalG += pixels[i + 1];
        totalB += pixels[i + 2];
        const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        if (brightness > 180) brightPixels++;
      }

      const samples = Math.floor(pixels.length / 4 / step);
      const avgR = Math.round(totalR / samples);
      const avgG = Math.round(totalG / samples);
      const avgB = Math.round(totalB / samples);
      const brightPercent = Math.round((brightPixels / samples) * 100);

      // Determine dominant color
      let dominantColor = "neutro";
      if (avgR > avgG + 30 && avgR > avgB + 30) dominantColor = "rojo";
      else if (avgG > avgR + 30 && avgG > avgB + 30) dominantColor = "verde";
      else if (avgB > avgR + 30 && avgB > avgG + 30) dominantColor = "azul";
      else if (avgR > 200 && avgG > 200 && avgB < 100) dominantColor = "amarillo";
      else if (avgR > 200 && avgG > 100 && avgB < 80) dominantColor = "naranja";

      // Determine brightness
      let brightnessDesc = "iluminación normal";
      if (brightPercent > 70) brightnessDesc = "muy luminosa, probablemente al aire libre o con luz fuerte";
      else if (brightPercent > 40) brightnessDesc = "buena iluminación";
      else if (brightPercent < 15) brightnessDesc = "oscura, poca luz";

      const description = `La imagen tiene un tono predominantemente ${dominantColor} con ${brightnessDesc}. El ${brightPercent}% de la imagen es brillante. Resolución: ${canvas.width} por ${canvas.height} píxeles.`;

      const tip = "\n\nPara obtener descripciones detalladas con inteligencia artificial (reconocer objetos, leer texto, etc.), activa Lovable Cloud en la configuración del proyecto.";

      setAnalysisResult(description + tip);
      speak(description);
    } catch {
      const fallback = "Foto capturada correctamente. Para analizarla con IA, activa Lovable Cloud.";
      setAnalysisResult(fallback);
      speak(fallback);
    }
    setAnalyzing(false);
  }, [speak]);

  const handleShowResult = () => {
    if (analysisResult) {
      setBigMessage(analysisResult.split("\n\n")[0]);
      setMode("bigmessage");
    }
  };

  return (
    <div className="flex flex-col px-5 pt-4 pb-32">
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera view */}
      <AnimatePresence mode="wait">
        {cameraActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative mb-4 overflow-hidden rounded-2xl bg-black shadow-elevated"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-[4/3] object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 flex justify-center gap-3 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={capturePhoto}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-elevated"
                aria-label="Capturar foto"
              >
                <div className="h-12 w-12 rounded-full border-4 border-foreground/20" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={stopCamera}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white self-center"
                aria-label="Cerrar cámara"
              >
                <X className="h-6 w-6" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {capturedImage && !cameraActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4"
          >
            <img
              src={capturedImage}
              alt="Foto capturada"
              className="w-full rounded-2xl shadow-card aspect-[4/3] object-cover"
            />
            {analyzing && (
              <div className="mt-3 flex items-center justify-center gap-2 text-primary">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-medium">Analizando imagen...</span>
              </div>
            )}
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 rounded-2xl bg-card p-4 shadow-card"
              >
                <p className="text-accessible-lg leading-relaxed whitespace-pre-line">{analysisResult}</p>
                <div className="mt-3 flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => speak(analysisResult.split("\n\n")[0])}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blind py-3 text-blind-foreground font-bold shadow-button"
                  >
                    <Volume2 className="h-5 w-5" />
                    Repetir
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShowResult}
                    className="flex items-center justify-center rounded-xl bg-secondary px-4 py-3 font-bold shadow-card"
                  >
                    <Eye className="h-5 w-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-3"
      >
        {!cameraActive && (
          <motion.button
            variants={item}
            whileTap={{ scale: 0.97 }}
            onClick={startCamera}
            className="flex items-center gap-4 rounded-2xl bg-blind p-5 text-blind-foreground shadow-button touch-target-lg active:shadow-elevated transition-shadow"
            aria-label="Activar cámara"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl">
              📷
            </div>
            <div className="text-left">
              <span className="text-accessible-2xl block">Activar cámara</span>
              <span className="text-sm opacity-80">Captura y analiza imágenes</span>
            </div>
          </motion.button>
        )}

        <motion.button
          variants={item}
          whileTap={{ scale: 0.97 }}
          onClick={() => { vibrate(150); speak("Estás en el modo visión. Puedes activar la cámara para capturar y analizar imágenes."); }}
          className="flex items-center gap-4 rounded-2xl bg-blind p-5 text-blind-foreground shadow-button touch-target-lg active:shadow-elevated transition-shadow"
          aria-label="Leer pantalla"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl">🔊</div>
          <span className="text-accessible-2xl">Leer pantalla</span>
        </motion.button>

        <motion.button
          variants={item}
          whileTap={{ scale: 0.97 }}
          onClick={() => { vibrate(150); speak("Necesito ayuda, por favor."); }}
          className="flex items-center gap-4 rounded-2xl bg-blind p-5 text-blind-foreground shadow-button touch-target-lg active:shadow-elevated transition-shadow"
          aria-label="Necesito ayuda"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl">🆘</div>
          <span className="text-accessible-2xl">Necesito ayuda</span>
        </motion.button>

        <motion.button
          variants={item}
          whileTap={{ scale: 0.97 }}
          onClick={() => { vibrate(150); speak("Volviendo al inicio."); setTimeout(() => setMode("home"), 1500); }}
          className="flex items-center gap-4 rounded-2xl bg-blind p-5 text-blind-foreground shadow-button touch-target-lg active:shadow-elevated transition-shadow"
          aria-label="Ir al inicio"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl">🏠</div>
          <span className="text-accessible-2xl">Ir al inicio</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default BlindMode;
