import { motion } from "framer-motion";

// Wrapper component pour gérer les cas où motion pourrait ne pas être disponible
const MotionWrapper = ({ children, ...props }) => {
    // En développement, utiliser motion normalement
    if (import.meta.env.DEV) {
        return motion.div({ ...props, children });
    }

    // En production, vérifier si motion est disponible
    try {
        if (typeof motion !== 'undefined' && motion.div) {
            return motion.div({ ...props, children });
        }
    } catch {
        console.warn('framer-motion not available, using regular div');
    }

    // Fallback vers un div normal
    return <div {...props}>{children}</div>;
};

export default MotionWrapper;