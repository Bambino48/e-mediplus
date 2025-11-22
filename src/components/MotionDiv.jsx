import { useMotion } from '../hooks/useMotion';

const MotionDiv = ({ children, ...props }) => {
    const { motion, isLoading } = useMotion();

    if (isLoading) {
        // Pendant le chargement, afficher un div normal
        return <div {...props}>{children}</div>;
    }

    if (motion && motion.div) {
        // Utiliser motion.div si disponible
        const MotionComponent = motion.div;
        return <MotionComponent {...props}>{children}</MotionComponent>;
    }

    // Fallback vers div normal
    return <div {...props}>{children}</div>;
};

export default MotionDiv;