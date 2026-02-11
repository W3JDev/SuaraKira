import React, { useRef } from "react";
import { CameraIcon, KeyboardIcon, ListIcon, SettingsIcon, SparklesIcon } from "./Icons";
import { motion } from 'framer-motion';
import IOSDesign from '../utils/iosDesignSystem';

export type NavItem = "voice" | "scan" | "form" | "list" | "settings";

interface BottomNavProps {
  active: NavItem;
  onNavigate: (item: NavItem) => void;
  hasNewActivity?: boolean;
  isDarkMode?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({
  active,
  onNavigate,
  hasNewActivity = false,
  isDarkMode = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const navItems = [
    { 
      id: "scan" as NavItem, 
      icon: CameraIcon, 
      label: "Scan",
    },
    {
      id: "form" as NavItem,
      icon: KeyboardIcon,
      label: "Form",
    },
    {
      id: "voice" as NavItem,
      icon: SparklesIcon,
      label: "AI Chat",
      isPrimary: true,
    },
    {
      id: "list" as NavItem,
      icon: ListIcon,
      label: "List",
      badge: hasNewActivity,
    },
    {
      id: "settings" as NavItem,
      icon: SettingsIcon,
      label: "Settings",
    },
  ];

  return (
    <>
      {/* Hidden file input for scan functionality */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onNavigate("scan");
          }
          e.target.value = "";
        }}
      />

      {/* iOS-style Tab Bar */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="max-w-2xl mx-auto px-2 sm:px-4">
          {/* 3D Glassmorphism Tab Bar - Premium Transparent */}
          <div
            className="pointer-events-auto rounded-t-3xl overflow-hidden transition-all duration-300"
            style={{
              // TRUE glassmorphism - transparent with blur
              background: isDarkMode
                ? 'rgba(15, 23, 42, 0.4)' // 40% opacity - very transparent
                : 'rgba(248, 250, 252, 0.5)', // 50% opacity
              backdropFilter: 'blur(60px) saturate(200%)', // Stronger blur
              WebkitBackdropFilter: 'blur(60px) saturate(200%)',
              // Glowing border
              border: isDarkMode
                ? '1px solid rgba(52, 199, 89, 0.15)' // Green glow border
                : '1px solid rgba(52, 199, 89, 0.1)',
              borderBottom: 'none',
              // 3D Premium depth with green glow
              boxShadow: isDarkMode
                ? `
                  0 -2px 16px rgba(0, 0, 0, 0.8),
                  0 -8px 32px rgba(0, 0, 0, 0.6),
                  0 -16px 64px rgba(0, 0, 0, 0.4),
                  0 0 40px rgba(52, 199, 89, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1),
                  inset 0 -1px 0 rgba(52, 199, 89, 0.05)
                `
                : `
                  0 -2px 12px rgba(0, 0, 0, 0.15),
                  0 -6px 24px rgba(0, 0, 0, 0.1),
                  0 -12px 48px rgba(0, 0, 0, 0.08),
                  0 0 30px rgba(52, 199, 89, 0.05),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8)
                `,
            }}
          >
            {/* Tab Items Container - Ultra Compact iOS Design (Icon Only) */}
            <div className="flex items-center justify-around px-2 py-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                const isPrimary = item.isPrimary;

                // Premium opacity system:
                // - Active: 100% opacity (fully visible)
                // - Inactive: 55% opacity (semi-transparent, iOS standard)
                const getIconOpacity = () => isActive ? 1.0 : 0.55;
                
                // Color system matching app theme:
                // - Active: Emerald green (#34C759) - matches app's primary action color
                // - Inactive: White (dark mode) / Dark gray (light mode)
                const getIconColor = () => {
                  if (isActive) {
                    return '#FFFFFF'; // Pure white for active tabs (sharp contrast on dark green)
                  }
                  // Inactive color based on theme
                  return isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(30, 41, 59, 0.5)'; // 50% opacity
                };

                return (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.88 }}
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: isDarkMode 
                        ? 'rgba(52, 199, 89, 0.05)' 
                        : 'rgba(52, 199, 89, 0.03)',
                    }}
                    onClick={() => {
                      IOSDesign.haptics.medium();
                      if (item.id === "scan") {
                        handleScanClick();
                      } else {
                        onNavigate(item.id);
                      }
                    }}
                    className="relative flex items-center justify-center p-2.5 rounded-xl"
                    style={{
                      minWidth: '44px',
                      minHeight: '44px',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      // Dark gradient background for active tabs
                      background: isActive 
                        ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' // Dark emerald gradient
                        : 'transparent',
                      boxShadow: isActive
                        ? '0 4px 12px rgba(5, 150, 105, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        : 'none',
                    }}
                  >
                    {/* Badge for notifications */}
                    {item.badge && !isActive && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1 right-1 w-2 h-2 rounded-full"
                        style={{
                          background: IOSDesign.colors.light.error,
                          // Ring matches slate background
                          boxShadow: isDarkMode
                            ? `
                              0 0 0 1.5px rgba(15, 23, 42, 0.95),
                              0 1px 4px rgba(255, 59, 48, 0.6)
                            `
                            : `
                              0 0 0 1.5px rgba(248, 250, 252, 0.95),
                              0 1px 4px rgba(255, 59, 48, 0.4)
                            `,
                        }}
                      />
                    )}

                    {/* Icon Container with premium treatment */}
                    <motion.div
                      className="relative flex items-center justify-center"
                      animate={{
                        scale: isActive ? 1.08 : 1,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                      }}
                      style={{
                        color: getIconColor(),
                        opacity: 1, // Always 100% opacity for sharp icons
                        // White glow on active icons for HD sharp look
                        filter: isActive 
                          ? `drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))` 
                          : 'none',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <Icon className="w-6 h-6" />
                    </motion.div>


                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;

