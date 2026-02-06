import React from "react";
import { MicIcon, CameraIcon, KeyboardIcon, ListIcon, SettingsIcon } from "./Icons";

export type NavItem = "voice" | "scan" | "form" | "list" | "settings";

interface BottomNavProps {
  active: NavItem;
  onNavigate: (item: NavItem) => void;
  hasNewActivity?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ active, onNavigate, hasNewActivity = false }) => {
  const navItems = [
    { id: "voice" as NavItem, icon: MicIcon, label: "Voice", emoji: "🎙️" },
    { id: "scan" as NavItem, icon: CameraIcon, label: "Scan", emoji: "📷" },
    { id: "form" as NavItem, icon: KeyboardIcon, label: "Add", emoji: "➕" },
    { id: "list" as NavItem, icon: ListIcon, label: "List", emoji: "📋", badge: hasNewActivity },
    { id: "settings" as NavItem, icon: SettingsIcon, label: "Settings", emoji: "⚙️" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
      style={{
        background: "transparent",
      }}
    >
      {/* Glassmorphism Background */}
      <div
        className="absolute inset-0 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-t border-white/20 dark:border-slate-700/30"
        style={{
          boxShadow: "0 -4px 24px -8px rgba(0, 0, 0, 0.12), 0 -2px 8px -2px rgba(0, 0, 0, 0.08)",
        }}
      />

      {/* Content */}
      <div className="relative max-w-md mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  relative flex flex-col items-center justify-center gap-1 px-4 py-2.5 rounded-2xl
                  transition-all duration-300 ease-out
                  ${
                    isActive
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-500 dark:to-emerald-600 text-white shadow-lg shadow-emerald-500/50 scale-105"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 active:scale-95"
                  }
                `}
                style={{
                  transform: isActive ? "translateY(-4px)" : "translateY(0)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {/* Badge for notifications */}
                {item.badge && !isActive && (
                  <span
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"
                    style={{
                      boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
                    }}
                  />
                )}

                {/* Icon with subtle glow effect when active */}
                <div className={`relative ${isActive ? "animate-subtle-bounce" : ""}`}>
                  <Icon
                    className={`
                      w-6 h-6 transition-all duration-300
                      ${isActive ? "scale-110 drop-shadow-lg" : "scale-100"}
                    `}
                  />
                  {isActive && (
                    <div
                      className="absolute inset-0 blur-md opacity-40"
                      style={{
                        background: "currentColor",
                      }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    text-[10px] font-semibold tracking-wide transition-all duration-300
                    ${isActive ? "opacity-100 translate-y-0" : "opacity-70 translate-y-0.5"}
                  `}
                  style={{
                    letterSpacing: isActive ? "0.05em" : "0.03em",
                  }}
                >
                  {item.label}
                </span>

                {/* Active indicator pill */}
                {isActive && (
                  <div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-80"
                    style={{
                      boxShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* iOS Safe Area Spacer */}
      <div
        className="h-safe-area-inset-bottom bg-gradient-to-b from-transparent to-white/80 dark:to-slate-900/80"
        style={{
          backdropFilter: "blur(20px)",
        }}
      />

      {/* Subtle animation keyframes */}
      <style jsx>{`
        @keyframes subtle-bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        .animate-subtle-bounce {
          animation: subtle-bounce 2s ease-in-out infinite;
        }

        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }

        .h-safe-area-inset-bottom {
          height: env(safe-area-inset-bottom);
        }

        /* Smooth haptic-style feedback */
        button:active {
          transition: transform 0.1s cubic-bezier(0.4, 0, 0.6, 1);
        }
      `}</style>
    </nav>
  );
};

export default BottomNav;
