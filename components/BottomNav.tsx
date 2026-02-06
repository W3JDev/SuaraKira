import React, { useRef } from "react";
import { MicIcon, CameraIcon, KeyboardIcon, ListIcon, SettingsIcon, SparklesIcon } from "./Icons";

export type NavItem = "voice" | "scan" | "form" | "list" | "settings";

interface BottomNavProps {
  active: NavItem;
  onNavigate: (item: NavItem) => void;
  hasNewActivity?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ active, onNavigate, hasNewActivity = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const navItems = [
    { id: "scan" as NavItem, icon: CameraIcon, label: "Scan", color: "from-blue-500 to-blue-600" },
    {
      id: "form" as NavItem,
      icon: KeyboardIcon,
      label: "Form",
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "voice" as NavItem,
      icon: SparklesIcon,
      label: "AI Chat",
      color: "from-emerald-500 to-emerald-600",
      isPrimary: true,
    },
    {
      id: "list" as NavItem,
      icon: ListIcon,
      label: "List",
      color: "from-indigo-500 to-indigo-600",
      badge: hasNewActivity,
    },
    {
      id: "settings" as NavItem,
      icon: SettingsIcon,
      label: "Settings",
      color: "from-slate-500 to-slate-600",
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
            // Trigger the scan handler through onNavigate with file data
            onNavigate("scan");
          }
          e.target.value = "";
        }}
      />

      <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
        {/* Glassmorphism Background with Premium Shadow */}
        <div
          className="absolute inset-0 backdrop-blur-2xl bg-white/70 dark:bg-slate-900/70 border-t border-white/30 dark:border-slate-700/30"
          style={{
            boxShadow: "0 -8px 32px -4px rgba(0, 0, 0, 0.1), 0 -2px 8px -2px rgba(0, 0, 0, 0.06)",
          }}
        />

        {/* Content Container */}
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-around pt-3 pb-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              const isPrimary = item.isPrimary;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === "scan") {
                      handleScanClick();
                    } else {
                      onNavigate(item.id);
                    }
                  }}
                  className={`
                    relative flex flex-col items-center justify-center gap-1.5 px-3 rounded-2xl
                    transition-all duration-300 ease-out group
                    ${isPrimary ? "pb-2 pt-3" : "py-2"}
                    ${
                      isActive
                        ? isPrimary
                          ? "scale-110 -translate-y-2"
                          : "scale-105"
                        : "scale-100 hover:scale-105 active:scale-95"
                    }
                  `}
                  style={{
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {/* Badge for notifications */}
                  {item.badge && !isActive && (
                    <span
                      className="absolute top-1 right-2 w-2 h-2 bg-gradient-to-br from-red-500 to-red-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"
                      style={{
                        boxShadow: "0 2px 8px rgba(239, 68, 68, 0.5)",
                      }}
                    />
                  )}

                  {/* Icon Container with Gradient Background when Active */}
                  <div
                    className={`
                      relative rounded-2xl p-3 transition-all duration-300
                      ${
                        isActive
                          ? `bg-gradient-to-br ${item.color} shadow-lg`
                          : "bg-transparent group-hover:bg-slate-100/60 dark:group-hover:bg-slate-800/60"
                      }
                      ${isPrimary && isActive ? "shadow-2xl scale-110" : ""}
                    `}
                    style={{
                      boxShadow: isActive
                        ? `0 8px 24px -4px ${item.color.includes("emerald") ? "rgba(16, 185, 129, 0.4)" : "rgba(0, 0, 0, 0.2)"}`
                        : undefined,
                    }}
                  >
                    <Icon
                      className={`
                        ${isPrimary ? "w-7 h-7" : "w-6 h-6"}
                        transition-all duration-300
                        ${isActive ? "text-white scale-110" : "text-slate-600 dark:text-slate-400"}
                      `}
                    />
                    {/* Glow effect when active */}
                    {isActive && (
                      <div
                        className="absolute inset-0 blur-xl opacity-30 rounded-2xl"
                        style={{
                          background: `linear-gradient(135deg, ${item.color.replace("from-", "").replace(" to-", ", ")})`,
                        }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`
                      text-[10px] font-semibold tracking-wide transition-all duration-300
                      ${
                        isActive
                          ? "text-slate-900 dark:text-white opacity-100"
                          : "text-slate-500 dark:text-slate-400 opacity-80"
                      }
                      ${isPrimary && isActive ? "font-bold" : ""}
                    `}
                    style={{
                      letterSpacing: isActive ? "0.06em" : "0.04em",
                    }}
                  >
                    {item.label}
                  </span>

                  {/* Active indicator line */}
                  {isActive && (
                    <div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 rounded-full transition-all duration-300"
                      style={{
                        width: isPrimary ? "60%" : "50%",
                        background: `linear-gradient(90deg, ${item.color.replace("from-", "").replace(" to-", ", ")})`,
                        boxShadow: `0 0 12px ${item.color.includes("emerald") ? "rgba(16, 185, 129, 0.6)" : "rgba(0, 0, 0, 0.3)"}`,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* W3JDEV Branding - Subtle and Professional */}
          <div className="flex items-center justify-center pb-2 pt-1">
            <a
              href="https://w3jdev.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-slate-100/60 to-slate-200/60 dark:from-slate-800/60 dark:to-slate-700/60 hover:from-indigo-100/80 hover:to-purple-100/80 dark:hover:from-indigo-900/40 dark:hover:to-purple-900/40 backdrop-blur-sm transition-all duration-300 group border border-slate-200/50 dark:border-slate-600/30"
            >
              <svg
                className="w-3 h-3 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 tracking-wider group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 dark:group-hover:from-indigo-400 dark:group-hover:to-purple-400 transition-all duration-300">
                W3JDEV
              </span>
            </a>
          </div>
        </div>

        {/* iOS Safe Area Spacer */}
        <div
          className="h-safe-area-inset-bottom bg-gradient-to-b from-transparent to-white/70 dark:to-slate-900/70"
          style={{
            backdropFilter: "blur(20px)",
          }}
        />

        {/* Animation Styles */}
        <style>{`
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

          /* Reduced motion support */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}</style>
      </nav>
    </>
  );
};

export default BottomNav;
