import { AccessibilityProvider, useAccessibility } from "@/context/AccessibilityContext";
import AppHeader from "@/components/AppHeader";
import HomeScreen from "@/components/HomeScreen";
import BlindMode from "@/components/BlindMode";
import DeafMode from "@/components/DeafMode";
import MuteMode from "@/components/MuteMode";
import CombinedMode from "@/components/CombinedMode";
import BigMessageScreen from "@/components/BigMessageScreen";
import EmergencyButton from "@/components/EmergencyButton";

const AppContent = () => {
  const { mode, textScale } = useAccessibility();

  return (
    <div className="min-h-screen bg-background" style={{ fontSize: `${textScale}rem` }}>
      {mode !== "bigmessage" && <AppHeader />}
      {mode === "home" && <HomeScreen />}
      {mode === "blind" && <BlindMode />}
      {mode === "deaf" && <DeafMode />}
      {mode === "mute" && <MuteMode />}
      {mode === "combined" && <CombinedMode />}
      {mode === "bigmessage" && <BigMessageScreen />}
      {mode !== "bigmessage" && <EmergencyButton />}
    </div>
  );
};

const Index = () => (
  <AccessibilityProvider>
    <AppContent />
  </AccessibilityProvider>
);

export default Index;
