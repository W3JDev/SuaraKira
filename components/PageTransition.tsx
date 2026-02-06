import React, { useEffect, useState } from 'react';

// ============================================================================
// PAGE TRANSITION COMPONENT
// ============================================================================

interface PageTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'scale' | 'none';
  duration?: number;
  delay?: number;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  duration = 300,
  delay = 0,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getTransitionClass = () => {
    if (!isVisible) {
      switch (type) {
        case 'fade':
          return 'opacity-0';
        case 'slide-left':
          return 'opacity-0 -translate-x-full';
        case 'slide-right':
          return 'opacity-0 translate-x-full';
        case 'slide-up':
          return 'opacity-0 translate-y-full';
        case 'slide-down':
          return 'opacity-0 -translate-y-full';
        case 'scale':
          return 'opacity-0 scale-95';
        default:
          return '';
      }
    }
    return 'opacity-100 translate-x-0 translate-y-0 scale-100';
  };

  if (type === 'none') {
    return <>{children}</>;
  }

  return (
    <div
      className={`transition-all ${getTransitionClass()} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </div>
  );
};

// ============================================================================
// ROUTE TRANSITION (for page changes)
// ============================================================================

interface RouteTransitionProps {
  children: React.ReactNode;
  routeKey: string;
  type?: 'fade' | 'slide' | 'scale' | 'blur';
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({
  children,
  routeKey,
  type = 'fade',
}) => {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState<'entering' | 'entered' | 'exiting'>('entered');

  useEffect(() => {
    if (routeKey !== (displayChildren as any)?.key) {
      setTransitionStage('exiting');
    }
  }, [routeKey, displayChildren]);

  useEffect(() => {
    if (transitionStage === 'exiting') {
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setTransitionStage('entering');
      }, 300);
      return () => clearTimeout(timer);
    } else if (transitionStage === 'entering') {
      const timer = setTimeout(() => {
        setTransitionStage('entered');
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [transitionStage, children]);

  const getTransitionStyles = () => {
    const baseStyles = 'transition-all duration-300 ease-out';

    switch (type) {
      case 'fade':
        return `${baseStyles} ${transitionStage === 'entered' ? 'opacity-100' : 'opacity-0'}`;
      case 'slide':
        return `${baseStyles} ${transitionStage === 'entered' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`;
      case 'scale':
        return `${baseStyles} ${transitionStage === 'entered' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`;
      case 'blur':
        return `${baseStyles} ${transitionStage === 'entered' ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}`;
      default:
        return baseStyles;
    }
  };

  return <div className={getTransitionStyles()}>{displayChildren}</div>;
};

// ============================================================================
// MODAL TRANSITION (smooth modal animations)
// ============================================================================

interface ModalTransitionProps {
  isOpen: boolean;
  children: React.ReactNode;
  onClose?: () => void;
  position?: 'center' | 'bottom' | 'top' | 'left' | 'right';
}

export const ModalTransition: React.FC<ModalTransitionProps> = ({
  isOpen,
  children,
  onClose,
  position = 'center',
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const getPositionClass = () => {
    const baseClass = 'transition-all duration-300 ease-out';

    if (!isAnimating) {
      switch (position) {
        case 'bottom':
          return `${baseClass} translate-y-full opacity-0`;
        case 'top':
          return `${baseClass} -translate-y-full opacity-0`;
        case 'left':
          return `${baseClass} -translate-x-full opacity-0`;
        case 'right':
          return `${baseClass} translate-x-full opacity-0`;
        default:
          return `${baseClass} scale-95 opacity-0`;
      }
    }

    return `${baseClass} translate-x-0 translate-y-0 scale-100 opacity-100`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal content */}
      <div className={`relative z-10 ${getPositionClass()}`}>{children}</div>
    </div>
  );
};

// ============================================================================
// STAGGER CHILDREN (animate list items)
// ============================================================================

interface StaggerChildrenProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export const StaggerChildren: React.FC<StaggerChildrenProps> = ({
  children,
  staggerDelay = 50,
  className = '',
}) => {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <PageTransition
          key={index}
          type="slide-up"
          delay={index * staggerDelay}
          duration={400}
          className={className}
        >
          {child}
        </PageTransition>
      ))}
    </>
  );
};

// ============================================================================
// SLIDE IN VIEW (animate when element enters viewport)
// ============================================================================

interface SlideInViewProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  threshold?: number;
  className?: string;
}

export const SlideInView: React.FC<SlideInViewProps> = ({
  children,
  direction = 'up',
  threshold = 0.1,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasAnimated(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, hasAnimated]);

  const getTransformClass = () => {
    if (isVisible) {
      return 'opacity-100 translate-x-0 translate-y-0';
    }

    switch (direction) {
      case 'up':
        return 'opacity-0 translate-y-12';
      case 'down':
        return 'opacity-0 -translate-y-12';
      case 'left':
        return 'opacity-0 translate-x-12';
      case 'right':
        return 'opacity-0 -translate-x-12';
      default:
        return 'opacity-0';
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${getTransformClass()} ${className}`}
    >
      {children}
    </div>
  );
};

// ============================================================================
// COLLAPSE TRANSITION (smooth expand/collapse)
// ============================================================================

interface CollapseTransitionProps {
  isOpen: boolean;
  children: React.ReactNode;
  duration?: number;
}

export const CollapseTransition: React.FC<CollapseTransitionProps> = ({
  isOpen,
  children,
  duration = 300,
}) => {
  const [height, setHeight] = useState<number | undefined>(isOpen ? undefined : 0);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (isOpen) {
      const contentHeight = ref.current.scrollHeight;
      setHeight(contentHeight);

      setTimeout(() => {
        setHeight(undefined);
      }, duration);
    } else {
      const contentHeight = ref.current.scrollHeight;
      setHeight(contentHeight);

      setTimeout(() => {
        setHeight(0);
      }, 10);
    }
  }, [isOpen, duration]);

  return (
    <div
      ref={ref}
      style={{
        height,
        overflow: 'hidden',
        transition: `height ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
    >
      {children}
    </div>
  );
};

// ============================================================================
// FADE IN UP (common animation pattern)
// ============================================================================

export const FadeInUp: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  return (
    <PageTransition type="slide-up" delay={delay} duration={500}>
      {children}
    </PageTransition>
  );
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export const PageTransitions = {
  Page: PageTransition,
  Route: RouteTransition,
  Modal: ModalTransition,
  StaggerChildren,
  SlideInView,
  Collapse: CollapseTransition,
  FadeInUp,
};

export default PageTransitions;
