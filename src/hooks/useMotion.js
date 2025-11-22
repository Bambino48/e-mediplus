import { useEffect, useState } from "react";

// Hook personnalisé pour charger framer-motion de manière asynchrone
export const useMotion = () => {
  const [motion, setMotion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMotion = async () => {
      try {
        const { motion: motionModule } = await import("framer-motion");
        setMotion(() => motionModule);
      } catch (error) {
        console.warn("Failed to load framer-motion:", error);
        // Fallback: créer un composant de substitution
        setMotion(() => ({ div: "div" }));
      } finally {
        setIsLoading(false);
      }
    };

    loadMotion();
  }, []);

  return { motion, isLoading };
};
