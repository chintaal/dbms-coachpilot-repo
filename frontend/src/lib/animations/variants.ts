import { Variants } from 'framer-motion'

// Basic Animations
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
}

// Stagger Animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export const staggerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export const staggerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

// Spring Physics Variants
export const springBounce: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
      mass: 0.5,
    },
  },
}

export const springSmooth: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 25,
    },
  },
}

export const springElastic: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15,
    },
  },
}

// 3D Transform Variants
export const rotate3D: Variants = {
  hidden: { opacity: 0, rotateX: -90, rotateY: 0 },
  visible: {
    opacity: 1,
    rotateX: 0,
    rotateY: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
}

export const flip3D: Variants = {
  hidden: { opacity: 0, rotateY: -180 },
  visible: {
    opacity: 1,
    rotateY: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
}

export const slide3D: Variants = {
  hidden: { opacity: 0, x: -100, rotateY: -45 },
  visible: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 25,
    },
  },
}

// Page Transition Variants
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 25,
      duration: 0.4,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.2,
    },
  },
}

export const pageSlide: Variants = {
  initial: {
    opacity: 0,
    x: 100,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: {
      duration: 0.2,
    },
  },
}

// Parallax Effects
export const parallaxUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  },
}

export const parallaxDown: Variants = {
  hidden: { opacity: 0, y: -50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  },
}

// Magnetic Hover Effects
export const magneticHover = {
  scale: 1.05,
  y: -5,
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 17,
  },
}

export const magneticTap = {
  scale: 0.95,
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 17,
  },
}

// Card Hover Effects
export const cardHover: Variants = {
  rest: {
    scale: 1,
    y: 0,
    rotateY: 0,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  hover: {
    scale: 1.02,
    y: -8,
    rotateY: 5,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
}

export const card3DHover: Variants = {
  rest: {
    scale: 1,
    rotateX: 0,
    rotateY: 0,
    z: 0,
  },
  hover: {
    scale: 1.05,
    rotateX: -5,
    rotateY: 5,
    z: 50,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
}

// Modal/Dialog Variants
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    rotateX: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    rotateX: -10,
    transition: {
      duration: 0.2,
    },
  },
}

// List Item Variants
export const listItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
}

// Reveal Animations
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 60, clipPath: 'inset(100% 0 0 0)' },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: 'inset(0 0 0 0)',
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 25,
    },
  },
}

export const revealDown: Variants = {
  hidden: { opacity: 0, y: -60, clipPath: 'inset(0 0 100% 0)' },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: 'inset(0 0 0 0)',
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 25,
    },
  },
}

// Glow Effects
export const glowPulse: Variants = {
  hidden: { opacity: 0, boxShadow: '0 0 0px rgba(59, 130, 246, 0)' },
  visible: {
    opacity: 1,
    boxShadow: [
      '0 0 20px rgba(59, 130, 246, 0.5)',
      '0 0 40px rgba(59, 130, 246, 0.3)',
      '0 0 20px rgba(59, 130, 246, 0.5)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// Scale with Rotation
export const scaleRotate: Variants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
}
