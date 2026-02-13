import React from "react";

const BrandedFooter: React.FC = () => {
  return (
    <div className="w-full bg-transparent py-2 px-4">
      <div className="max-w-md mx-auto flex items-center justify-center gap-1.5 text-xs">
        <span className="text-slate-400 dark:text-slate-500">Crafted with ❤️ by</span>
        <a
          href="https://w3jdev.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-md font-semibold transition-all text-xs pointer-events-auto"
        >
          <svg
            className="w-3 h-3"
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
          <span className="font-bold tracking-wide">W3JDEV</span>
        </a>
      </div>
    </div>
  );
};

export default BrandedFooter;
