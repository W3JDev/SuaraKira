/**
 * 🎬 iOS Animation Utilities
 * Framer Motion variants and utilities for iOS-style animations
 */

import { Variants } from 'framer-motion';
import { IOSAnimations } from './iosDesignSystem';

// ==================== BUTTON ANIMATIONS ====================

export const buttonTapVariants: Variants = {
  rest: { scale: 1 },
  tap: { scale: 0.95 },
};

export const buttonPressVariants: Variants = {
  rest: { 
    scale: 1,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
  },
  tap: { 
    scale: 0.92,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
  },
};

// ==================== CARD ANIMATIONS ====================

export const cardHoverVariants: Variants = {
  rest: { 
    scale: 1,
    y: 0,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
  },
  hover: { 
    scale: 1.02,
    y: -4,
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.16), 0 8px 16px rgba(0, 0, 0, 0.12)',
  },
};

export const cardTapVariants: Variants = {
  rest: { scale: 1 },
  tap: { scale: 0.98 },
};

// ==================== MODAL/SHEET ANIMATIONS ====================

export const modalVariants: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: IOSAnimations.springGentle,
  },
  exit: { 
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

export const bottomSheetVariants: Variants = {
  hidden: { 
    y: '100%',
    opacity: 0,
  },
  visible: { 
    y: 0,
    opacity: 1,
    transition: IOSAnimations.spring,
  },
  exit: { 
    y: '100%',
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// ==================== LIST ANIMATIONS ====================

export const listItemVariants: Variants = {
  hidden: { 
    opacity: 0,
    x: -20,
    scale: 0.95,
  },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      ...IOSAnimations.spring,
      delay: i * 0.05, // Stagger effect
    },
  }),
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

export const swipeToDeleteVariants: Variants = {
  rest: { x: 0 },
  swipeLeft: { x: -80 },
  swipeRight: { x: 80 },
};

// ==================== TOAST/NOTIFICATION ANIMATIONS ====================

export const toastVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: -50,
    scale: 0.9,
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: IOSAnimations.springBounce,
  },
  exit: { 
    opacity: 0,
    y: -30,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// ==================== INPUT ANIMATIONS ====================

export const inputFocusVariants: Variants = {
  rest: { 
    scale: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  focus: { 
    scale: 1.02,
    borderColor: '#007AFF',
    transition: IOSAnimations.spring,
  },
};

// ==================== TOGGLE/SWITCH ANIMATIONS ====================

export const toggleVariants: Variants = {
  off: { 
    x: 0,
    backgroundColor: '#E5E5EA',
  },
  on: { 
    x: 20,
    backgroundColor: '#34C759',
    transition: IOSAnimations.spring,
  },
};

// ==================== LOADING ANIMATIONS ====================

export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const shimmerVariants: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ==================== NUMBER COUNTER ANIMATION ====================

export const createCounterAnimation = (from: number, to: number, duration: number = 1000) => {
  return {
    initial: { value: from },
    animate: { 
      value: to,
      transition: {
        duration: duration / 1000,
        ease: 'easeOut',
      },
    },
  };
};

// ==================== PAGE TRANSITION ANIMATIONS ====================

export const pageTransitionVariants: Variants = {
  initial: { 
    opacity: 0,
    x: 20,
  },
  animate: { 
    opacity: 1,
    x: 0,
    transition: IOSAnimations.spring,
  },
  exit: { 
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
};

export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// ==================== SCROLL ANIMATIONS ====================

export const scrollRevealVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 50,
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: IOSAnimations.spring,
  },
};

// ==================== FLOATING ANIMATIONS ====================

export const floatingVariants: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ==================== CHAT BUBBLE ANIMATIONS ====================

export const chatBubbleVariants: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: IOSAnimations.springBounce,
  },
};

export const typingIndicatorVariants: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Create stagger children animation
 */
export const staggerChildren = (staggerDelay: number = 0.05) => ({
  animate: {
    transition: {
      staggerChildren: staggerDelay,
    },
  },
});

/**
 * Create drag constraints
 */
export const createDragConstraints = (axis: 'x' | 'y' | 'both' = 'both') => {
  const constraints: any = {
    dragElastic: 0.2,
    dragMomentum: true,
  };
  
  if (axis === 'x') {
    constraints.drag = 'x';
  } else if (axis === 'y') {
    constraints.drag = 'y';
  }
  
  return constraints;
};

/**
 * Create rubber band effect (iOS overscroll)
 */
export const rubberBandEffect = {
  dragElastic: 0.2,
  dragConstraints: { top: 0, bottom: 0 },
  dragTransition: { 
    bounceStiffness: 300, 
    bounceDamping: 20 
  },
};

// ==================== EXPORTS ====================

export default {
  button: {
    tap: buttonTapVariants,
    press: buttonPressVariants,
  },
  card: {
    hover: cardHoverVariants,
    tap: cardTapVariants,
  },
  modal: {
    modal: modalVariants,
    bottomSheet: bottomSheetVariants,
    backdrop: backdropVariants,
  },
  list: {
    item: listItemVariants,
    swipeToDelete: swipeToDeleteVariants,
  },
  toast: toastVariants,
  input: {
    focus: inputFocusVariants,
  },
  toggle: toggleVariants,
  loading: {
    spinner: spinnerVariants,
    pulse: pulseVariants,
    shimmer: shimmerVariants,
  },
  page: {
    transition: pageTransitionVariants,
    fade: fadeVariants,
  },
  scroll: {
    reveal: scrollRevealVariants,
  },
  floating: floatingVariants,
  chat: {
    bubble: chatBubbleVariants,
    typing: typingIndicatorVariants,
  },
  
  // Helper functions
  staggerChildren,
  createDragConstraints,
  rubberBandEffect,
  createCounterAnimation,
};
