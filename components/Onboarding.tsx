import React, { useState } from 'react';
import { MicIcon, CameraIcon, SparklesIcon, XIcon } from './Icons';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    title: "Welcome to SuaraKira",
    description: "The smartest AI accountant for Malaysian hawkers. Let's show you around.",
    icon: <div className="text-4xl">👋</div>,
    action: "Let's Go"
  },
  {
    title: "Record with Voice",
    description: "Just tap the mic and speak naturally. 'Boss, one nasi lemak 12 ringgit'. We handle the rest.",
    icon: <MicIcon className="w-12 h-12 text-white" />,
    color: "bg-emerald-500"
  },
  {
    title: "Scan Receipts",
    description: "Tap the camera to snap a photo of a receipt or product. AI extracts the details instantly.",
    icon: <CameraIcon className="w-12 h-12 text-white" />,
    color: "bg-blue-500"
  },
  {
    title: "Get CFO Insights",
    description: "Tap 'Generate Report' to get profit margins, best sellers, and business advice.",
    icon: <SparklesIcon className="w-12 h-12 text-white" />,
    color: "bg-violet-600"
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(c => c + 1);
    } else {
      onComplete();
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden relative border border-white/10">
        <button onClick={onComplete} className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 z-10">
          <XIcon className="w-6 h-6" />
        </button>

        <div className={`h-48 ${step.color || 'bg-slate-100 dark:bg-slate-800'} flex items-center justify-center transition-colors duration-500`}>
          <div className={`p-6 rounded-full ${step.color ? 'bg-white/20' : 'bg-white dark:bg-slate-700'} shadow-xl transform scale-125`}>
            {step.icon}
          </div>
        </div>

        <div className="p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{step.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm h-16">{step.description}</p>
          
          <div className="flex justify-center gap-1.5 pt-4 pb-2">
            {steps.map((_, i) => (
              <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-slate-900 dark:bg-white' : 'w-2 bg-slate-200 dark:bg-slate-700'}`} />
            ))}
          </div>

          <div className="space-y-3 mt-4">
            <button 
              onClick={handleNext}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:bg-slate-800 dark:hover:bg-slate-200 active:scale-95 transition-all"
            >
              {step.action || (currentStep === steps.length - 1 ? "Start Accounting" : "Next")}
            </button>
            
            {currentStep < steps.length - 1 && (
              <button 
                onClick={onComplete}
                className="w-full py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-medium transition-colors"
              >
                Skip Tutorial
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;