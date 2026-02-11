/**
 * 🍎 iOS 18 Enterprise Design System
 * Premium design tokens inspired by Apple's latest design language
 */

// ==================== COLORS ====================

export const IOSColors = {
  // iOS System Colors (Light Mode)
  light: {
    primary: '#007AFF',        // iOS Blue
    success: '#34C759',        // iOS Green
    warning: '#FF9500',        // iOS Orange
    error: '#FF3B30',          // iOS Red
    purple: '#AF52DE',         // iOS Purple
    teal: '#5AC8FA',           // iOS Teal
    indigo: '#5856D6',         // iOS Indigo
    pink: '#FF2D55',           // iOS Pink
    
    // Background Hierarchy
    background: '#F2F2F7',     // iOS Gray 6
    backgroundSecondary: '#FFFFFF',
    backgroundTertiary: '#FAFAFA',
    
    // Surface Elevations
    surface: '#FFFFFF',
    surfaceElevated: 'rgba(255, 255, 255, 0.8)',
    surfaceGlass: 'rgba(255, 255, 255, 0.7)',
    
    // Text Hierarchy
    textPrimary: '#000000',
    textSecondary: '#3C3C43',  // iOS Label Secondary
    textTertiary: '#8E8E93',   // iOS Label Tertiary
    textQuaternary: '#C7C7CC', // iOS Label Quaternary
    
    // Borders & Separators
    separator: 'rgba(60, 60, 67, 0.29)',
    separatorOpaque: '#C6C6C8',
    border: 'rgba(0, 0, 0, 0.1)',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.4)',
    overlayLight: 'rgba(0, 0, 0, 0.2)',
  },
  
  // iOS Dark Mode Colors
  dark: {
    primary: '#0A84FF',        // iOS Blue (Dark)
    success: '#30D158',        // iOS Green (Dark)
    warning: '#FF9F0A',        // iOS Orange (Dark)
    error: '#FF453A',          // iOS Red (Dark)
    purple: '#BF5AF2',         // iOS Purple (Dark)
    teal: '#64D2FF',           // iOS Teal (Dark)
    indigo: '#5E5CE6',         // iOS Indigo (Dark)
    pink: '#FF375F',           // iOS Pink (Dark)
    
    // Background Hierarchy
    background: '#000000',     // True Black
    backgroundSecondary: '#1C1C1E', // iOS Gray 5 (Dark)
    backgroundTertiary: '#2C2C2E',  // iOS Gray 4 (Dark)
    
    // Surface Elevations
    surface: '#1C1C1E',
    surfaceElevated: 'rgba(28, 28, 30, 0.8)',
    surfaceGlass: 'rgba(28, 28, 30, 0.7)',
    
    // Text Hierarchy
    textPrimary: '#FFFFFF',
    textSecondary: '#EBEBF5',  // iOS Label Secondary (Dark)
    textTertiary: '#EBEBF599', // iOS Label Tertiary (Dark)
    textQuaternary: '#EBEBF54D', // iOS Label Quaternary (Dark)
    
    // Borders & Separators
    separator: 'rgba(84, 84, 88, 0.65)',
    separatorOpaque: '#38383A',
    border: 'rgba(255, 255, 255, 0.1)',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.6)',
    overlayLight: 'rgba(0, 0, 0, 0.4)',
  },
};

// ==================== TYPOGRAPHY ====================

export const IOSTypography = {
  // Font Families
  fontFamily: {
    system: "-apple-system, 'SF Pro Display', 'SF Pro Text', system-ui, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    rounded: "-apple-system, 'SF Pro Rounded', system-ui, sans-serif",
    mono: "'SF Mono', 'Courier New', monospace",
  },
  
  // Font Sizes (iOS Standard)
  fontSize: {
    caption2: '11px',   // 11pt
    caption1: '12px',   // 12pt
    footnote: '13px',   // 13pt
    subhead: '15px',    // 15pt (iOS body text)
    callout: '16px',    // 16pt
    body: '17px',       // 17pt (iOS default)
    headline: '17px',   // 17pt semibold
    title3: '20px',     // 20pt
    title2: '22px',     // 22pt
    title1: '28px',     // 28pt (iOS Large Title)
    largeTitle: '34px', // 34pt (iOS Hero)
  },
  
  // Font Weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
  
  // Line Heights (iOS optimized)
  lineHeight: {
    tight: '1.2',
    snug: '1.3',
    normal: '1.4',
    relaxed: '1.5',
  },
  
  // Letter Spacing
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.01em',
    normal: '0',
    wide: '0.01em',
    wider: '0.05em',
  },
};

// ==================== SPACING ====================

export const IOSSpacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  base: '16px',
  lg: '20px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '40px',
  '4xl': '48px',
  '5xl': '64px',
};

// ==================== BORDER RADIUS ====================

export const IOSBorderRadius = {
  none: '0',
  sm: '6px',
  md: '10px',
  base: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '28px',
  card: '24px',      // iOS Card Standard
  button: '12px',    // iOS Button Standard
  pill: '9999px',    // Full rounded
};

// ==================== SHADOWS ====================

export const IOSShadows = {
  // iOS Multi-Layer Shadow System
  xs: {
    ambient: '0 1px 3px rgba(0, 0, 0, 0.06)',
    direct: '0 1px 2px rgba(0, 0, 0, 0.04)',
  },
  sm: {
    ambient: '0 4px 12px rgba(0, 0, 0, 0.08)',
    direct: '0 2px 4px rgba(0, 0, 0, 0.06)',
  },
  md: {
    ambient: '0 8px 24px rgba(0, 0, 0, 0.12)',
    direct: '0 4px 8px rgba(0, 0, 0, 0.08)',
  },
  lg: {
    ambient: '0 16px 48px rgba(0, 0, 0, 0.16)',
    direct: '0 8px 16px rgba(0, 0, 0, 0.12)',
  },
  xl: {
    ambient: '0 24px 64px rgba(0, 0, 0, 0.20)',
    direct: '0 12px 24px rgba(0, 0, 0, 0.16)',
  },
};

// Helper to combine ambient + direct shadows (iOS style)
export const getCombinedShadow = (size: keyof typeof IOSShadows) => {
  const shadow = IOSShadows[size];
  return `${shadow.ambient}, ${shadow.direct}`;
};

// ==================== GLASSMORPHISM ====================

export const IOSGlassmorphism = {
  light: {
    thin: {
      background: 'rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    regular: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(40px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
    },
    thick: {
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(60px) saturate(200%)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
    },
  },
  dark: {
    thin: {
      background: 'rgba(28, 28, 30, 0.5)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    regular: {
      background: 'rgba(28, 28, 30, 0.7)',
      backdropFilter: 'blur(40px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
    },
    thick: {
      background: 'rgba(28, 28, 30, 0.85)',
      backdropFilter: 'blur(60px) saturate(200%)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
  },
};

// ==================== ANIMATIONS ====================

export const IOSAnimations = {
  // Spring Physics (iOS-like)
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  },
  
  springBounce: {
    type: 'spring',
    stiffness: 200,
    damping: 20,
    mass: 1.2,
  },
  
  springGentle: {
    type: 'spring',
    stiffness: 150,
    damping: 25,
    mass: 1.0,
  },
  
  // Duration-based (for transitions)
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 800,
  },
  
  // Easing Functions (iOS curves)
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
    easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
};

// ==================== HAPTIC FEEDBACK ====================

export const IOSHaptics = {
  // iOS Haptic Patterns using Vibration API
  light: () => {
    if (navigator.vibrate) navigator.vibrate(10);
  },
  
  medium: () => {
    if (navigator.vibrate) navigator.vibrate(20);
  },
  
  heavy: () => {
    if (navigator.vibrate) navigator.vibrate(30);
  },
  
  success: () => {
    if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
  },
  
  error: () => {
    if (navigator.vibrate) navigator.vibrate([30, 50, 30, 50, 30]);
  },
  
  warning: () => {
    if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
  },
  
  selection: () => {
    if (navigator.vibrate) navigator.vibrate(5);
  },
  
  impact: () => {
    if (navigator.vibrate) navigator.vibrate(15);
  },
};

// ==================== Z-INDEX LAYERS ====================

export const IOSZIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  toast: 60,
  tooltip: 70,
};

// ==================== GRADIENTS ====================

export const IOSGradients = {
  // iOS System Gradients
  blue: 'linear-gradient(135deg, #007AFF 0%, #0055CC 100%)',
  green: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
  orange: 'linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)',
  red: 'linear-gradient(135deg, #FF3B30 0%, #D70015 100%)',
  purple: 'linear-gradient(135deg, #AF52DE 0%, #8E3FBF 100%)',
  pink: 'linear-gradient(135deg, #FF2D55 0%, #FF0844 100%)',
  teal: 'linear-gradient(135deg, #5AC8FA 0%, #00A9E0 100%)',
  
  // Premium Gradients
  premium: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ocean: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)',
  forest: 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)',
  
  // Glass Gradients (with transparency)
  glassLight: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
  glassDark: 'linear-gradient(135deg, rgba(28,28,30,0.8) 0%, rgba(28,28,30,0.4) 100%)',
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get glassmorphism CSS properties
 */
export const getGlassMorphismStyle = (theme: 'light' | 'dark', intensity: 'thin' | 'regular' | 'thick' = 'regular') => {
  const glass = IOSGlassmorphism[theme][intensity];
  return {
    background: glass.background,
    backdropFilter: glass.backdropFilter,
    WebkitBackdropFilter: glass.backdropFilter,
    border: glass.border,
  };
};

/**
 * Get iOS shadow CSS string
 */
export const getIOSShadow = (size: keyof typeof IOSShadows) => {
  return getCombinedShadow(size);
};

/**
 * Get responsive font size
 */
export const getResponsiveFontSize = (base: keyof typeof IOSTypography.fontSize) => {
  return `clamp(${IOSTypography.fontSize.caption1}, ${IOSTypography.fontSize[base]}, ${IOSTypography.fontSize.largeTitle})`;
};

/**
 * Trigger haptic feedback with fallback
 */
export const triggerHaptic = (type: keyof typeof IOSHaptics) => {
  try {
    IOSHaptics[type]();
  } catch (e) {
    console.warn('Haptic feedback not supported');
  }
};

// ==================== EXPORTS ====================

export default {
  colors: IOSColors,
  typography: IOSTypography,
  spacing: IOSSpacing,
  borderRadius: IOSBorderRadius,
  shadows: IOSShadows,
  glassmorphism: IOSGlassmorphism,
  animations: IOSAnimations,
  haptics: IOSHaptics,
  zIndex: IOSZIndex,
  gradients: IOSGradients,
  
  // Helper functions
  getGlassMorphismStyle,
  getIOSShadow,
  getResponsiveFontSize,
  triggerHaptic,
  getCombinedShadow,
};
