// Composant CSS pur pour remplacer div
const CSSMotionDiv = ({
    children,
    whileHover,
    transition = { duration: 0.25 },
    className = '',
    ...props
}) => {
    // Générer les classes CSS statiques
    const getHoverClasses = () => {
        if (!whileHover) return '';

        const classes = [];
        if (whileHover.scale === 1.04) {
            classes.push('hover:scale-105'); // Approximation de 1.04
        }
        if (whileHover.translateY === -4) {
            classes.push('hover:-translate-y-1'); // Approximation
        }
        if (whileHover.scale === 1.02) {
            classes.push('hover:scale-105');
        }

        return classes.join(' ');
    };

    const transitionClass = transition?.duration
        ? `transition-all duration-${Math.round(transition.duration * 1000)}`
        : 'transition-all duration-250';

    return (
        <div
            {...props}
            className={`${className} ${transitionClass} ${getHoverClasses()}`.trim()}
        >
            {children}
        </div>
    );
};

export default CSSMotionDiv;
