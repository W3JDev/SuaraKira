import React from 'react';
import { MicIcon, CameraIcon, KeyboardIcon, ListIcon, SettingsIcon } from './Icons';

export type NavItem = 'voice' | 'scan' | 'form' | 'list' | 'settings';

interface BottomNavProps {
  active: NavItem;
  onNavigate: (item: NavItem) => void;
  hasNewActivity?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ active, onNavigate, hasNewActivity = false }) => {
  const navItems = [
    { id: 'voice' as NavItem, icon: MicIcon, label: 'Voice', emoji: '🎙️' },
    { id: 'scan' as NavItem, icon: CameraIcon, label: 'Scan', emoji: '📷' },
    { id: 'form' as NavItem, icon: KeyboardIcon, label: 'Add', emoji: '➕' },
    { id: 'list' as NavItem, icon: ListIcon, label: 'List', emoji: '📋', badge: hasNewActivity },
    { id: 'settings' as NavItem, icon: SettingsIcon, label: 'Settings', emoji: '⚙️' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 safe-area-bottom">
      <div className="max-w-md mx-auto px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 active:bg-slate-100 dark:active:bg-slate-800'
                }`}
              >
                {/* Badge for notifications */}
                {item.badge && !isActive && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                )}

                {/* Icon */}
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />

                {/* Label */}
                <span
                  className={`text-xs font-medium ${
                    isActive ? 'font-semibold' : ''
                  } transition-all`}
                >
                  {item.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Safe area spacer for iOS */}
      <div className="h-safe-area-inset-bottom bg-white dark:bg-slate-900"></div>
    </nav>
  );
};

export default BottomNav;
