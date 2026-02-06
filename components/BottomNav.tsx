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
        <div className="relative max-w-2xl mx-auto px-2 sm:px-6">
          <div className="flex items-end justify-around pt-2 pb-2">
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
                    relative flex flex-col items-center justify-center gap-0.5 px-2 rounded-2xl
                    transition-all duration-300 ease-out group
                    ${isPrimary ? "pb-1.5 pt-2" : "py-1.5"}
                    ${
                      isActive
                        ? isPrimary
                          ? "scale-105 -translate-y-1"
                          : "scale-100"
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
                      relative rounded-2xl p-2 transition-all duration-300
                      ${
                        isActive
                          ? `bg-gradient-to-br ${item.color} shadow-lg`
                          : "bg-transparent group-hover:bg-slate-100/60 dark:group-hover:bg-slate-800/60"
                      }
                      ${isPrimary && isActive ? "shadow-xl scale-105" : ""}
                    `}
                    style={{
                      boxShadow: isActive
                        ? `0 8px 24px -4px ${item.color.includes("emerald") ? "rgba(16, 185, 129, 0.4)" : "rgba(0, 0, 0, 0.2)"}`
                        : undefined,
                    }}
                  >
                    <Icon
                      className={`
                        ${isPrimary ? "w-6 h-6" : "w-5 h-5"}
                        transition-all duration-300
                        ${isActive ? "text-white scale-105" : "text-slate-600 dark:text-slate-400"}
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

                  {/* Label - Hidden on small screens */}
                  <span
                    className={`
                      hidden sm:block text-[9px] font-semibold tracking-wide transition-all duration-300
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

                  {/* Active indicator dot */}
                  {isActive && (
                    <div
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full transition-all duration-300"
                      style={{
                        background: `linear-gradient(90deg, ${item.color.replace("from-", "").replace(" to-", ", ")})`,
                        boxShadow: `0 0 8px ${item.color.includes("emerald") ? "rgba(16, 185, 129, 0.6)" : "rgba(0, 0, 0, 0.3)"}`,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* W3JDEV Branding - Ultra Compact */}
          <div className="flex items-center justify-center pb-1 pt-0.5">
            <a
              href="https://w3jdev.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full opacity-40 hover:opacity-100 transition-opacity duration-300"
            >
              <svg
                className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500"
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
              <span className="text-[8px] font-semibold text-slate-400 dark:text-slate-500 tracking-wide">
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
