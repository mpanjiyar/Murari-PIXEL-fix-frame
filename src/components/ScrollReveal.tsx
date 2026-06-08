import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'fade-up' | 'fade-in' | 'scale-up' | 'slide-left' | 'slide-right' | 'reveal-under';
  delay?: number;
  duration?: number;
  once?: boolean;
  threshold?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  variant = 'fade-up',
  delay = 0,
  duration = 0.5,
  once = true,
  threshold = 0.1,
}) => {
  const getVariants = () => {
    switch (variant) {
      case 'fade-in':
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { duration, ease: [0.25, 0.1, 0.25, 1], delay },
          },
        };
      case 'scale-up':
        return {
          hidden: { opacity: 0, scale: 0.95 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: {
              type: 'spring',
              stiffness: 100,
              damping: 15,
              delay,
            },
          },
        };
      case 'slide-left':
        return {
          hidden: { opacity: 0, x: 40 },
          visible: {
            opacity: 1,
            x: 0,
            transition: {
              type: 'spring',
              stiffness: 100,
              damping: 15,
              delay,
            },
          },
        };
      case 'slide-right':
        return {
          hidden: { opacity: 0, x: -40 },
          visible: {
            opacity: 1,
            x: 0,
            transition: {
              type: 'spring',
              stiffness: 100,
              damping: 15,
              delay,
            },
          },
        };
      case 'reveal-under':
        return {
          hidden: { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0.5 },
          visible: {
            clipPath: 'inset(0% 0% 0% 0%)',
            opacity: 1,
            transition: { duration: duration * 1.5, ease: [0.16, 1, 0.3, 1], delay },
          },
        };
      case 'fade-up':
      default:
        return {
          hidden: { opacity: 0, y: 30 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              type: 'spring',
              stiffness: 100,
              damping: 16,
              delay,
            },
          },
        };
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: `-${threshold * 100}%` }}
      variants={getVariants()}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface ScrollRevealTextProps {
  text: string;
  className?: string;
  delay?: number;
  once?: boolean;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export const ScrollRevealText: React.FC<ScrollRevealTextProps> = ({
  text,
  className = '',
  delay = 0,
  once = true,
  tag = 'p',
}) => {
  const words = text.split(' ');

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 15,
      rotateX: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: 'spring',
        stiffness: 120,
        damping: 14,
        duration: 0.45,
      },
    },
  };

  const Tag = tag;

  return (
    <Tag className={`${className} perspective-1000`}>
      <motion.span
        className="inline-flex flex-wrap gap-x-[0.25em]"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: "-10%" }}
      >
        {words.map((word, index) => (
          <span key={index} className="inline-block overflow-hidden py-1">
            <motion.span className="inline-block origin-bottom filter blur-none" variants={wordVariants}>
              {word === '' ? '\u00A0' : word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
};

interface FadeOverlayProps {
  children: React.ReactNode;
}

export const SmoothScrollParallax: React.FC<FadeOverlayProps> = ({ children }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -50]);
  const opacity = useTransform(scrollY, [0, 350], [1, 0.4]);

  return (
    <motion.div style={{ y, opacity }} className="w-full">
      {children}
    </motion.div>
  );
};
