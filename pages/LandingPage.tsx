import React from "react";
import { motion } from "framer-motion";
import { SparklesIcon, CameraIcon, TrendingUpIcon, ReceiptIcon } from "../components/Icons";

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white overflow-x-hidden">
      {/* Clean Modern Header */}
      <header className="fixed top-0 w-full z-50 bg-emerald-900/80 backdrop-blur-md border-b border-emerald-700/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-6 h-6 text-emerald-900" />
            </div>
            <div>
              <span className="text-2xl font-bold">SuaraKira</span>
              <p className="text-[10px] text-emerald-300 tracking-wide">AI-Native Finance Tracker</p>
            </div>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-2.5 bg-white text-emerald-900 rounded-lg font-semibold hover:bg-emerald-50 transition-all hover:scale-105"
          >
            Get Started Free
          </button>
        </div>
      </header>

      {/* Hero Section - Powerful & Clear */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            className="inline-block px-4 py-2 bg-emerald-800/50 backdrop-blur-sm rounded-full border border-emerald-600/30 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm font-semibold text-emerald-300">⚡ Track any transaction in under 10 seconds</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Your AI Finance Assistant.<br />
            <span className="bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
              Just Type. Speak. Snap.
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-emerald-100 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            The smartest way to track personal and business finances. 
            No accounting knowledge needed—our AI understands natural language in <span className="text-emerald-300 font-semibold">Malay, English, Tamil, Mandarin, and Manglish</span>.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-white text-emerald-900 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-2xl hover:shadow-emerald-500/50 hover:scale-105"
            >
              🚀 Start Free Today
            </button>
            <button
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
            >
              See How It Works
            </button>
          </motion.div>

          <motion.p
            className="text-sm text-emerald-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            ✓ No credit card required · ✓ Free forever for personal use · ✓ 5-minute setup
          </motion.p>
        </div>
      </section>

      {/* Social Proof / Stats Section */}
      <section className="py-12 bg-emerald-950/50 border-y border-emerald-700/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatCard number="<10s" label="Per Transaction" />
            <StatCard number="4" label="Languages Supported" />
            <StatCard number="100%" label="AI-Powered" />
            <StatCard number="Free" label="Forever Plan" />
          </div>
        </div>
      </section>

      {/* Key Features - Problem/Solution Format */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Accounting Shouldn't Be Hard</h2>
            <p className="text-xl text-emerald-200 max-w-2xl mx-auto">
              Whether you're a freelancer, small business owner, or managing personal finances—SuaraKira makes bookkeeping effortless.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <FeatureCard 
              icon={<SparklesIcon className="w-7 h-7" />}
              title="Natural Language AI"
              description="Type or speak naturally: 'Spent 50rm grab food' or 'Jual 10 kopi sejuk 30 ringgit'. AI instantly categorizes and records everything."
              highlight="NLP-Powered"
            />
            <FeatureCard 
              icon={<ReceiptIcon className="w-7 h-7" />}
              title="Under 10 Seconds"
              description="From thought to recorded transaction in less than 10 seconds. No forms, no menus, no friction. Just fast, accurate accounting."
              highlight="Lightning Fast"
            />
            <FeatureCard 
              icon={<CameraIcon className="w-7 h-7" />}
              title="Smart Receipt Scanning"
              description="Snap a photo of any receipt. AI extracts date, amount, items, merchant—everything. Works with handwritten receipts too."
              highlight="OCR + AI"
            />
            <FeatureCard 
              icon={<TrendingUpIcon className="w-7 h-7" />}
              title="Intelligent Insights"
              description="AI analyzes your spending patterns, suggests budgets, identifies savings opportunities, and predicts cash flow—automatically."
              highlight="Auto Analytics"
            />
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-emerald-950/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Perfect For Everyone</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <UseCaseCard 
              emoji="👤"
              title="Personal Finance"
              examples={[
                "Track daily expenses",
                "Budget management",
                "Savings goals",
                "Tax preparation"
              ]}
            />
            <UseCaseCard 
              emoji="🍜"
              title="Small Business"
              examples={[
                "Hawker stalls & cafes",
                "Retail shops",
                "Service providers",
                "Market vendors"
              ]}
            />
            <UseCaseCard 
              emoji="💼"
              title="Freelancers"
              examples={[
                "Invoice tracking",
                "Client expenses",
                "Project budgets",
                "Tax deductions"
              ]}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard 
              number="1"
              title="Input Naturally"
              description="Type, speak, or scan. Use your own words in any supported language. No training needed."
            />
            <StepCard 
              number="2"
              title="AI Processes"
              description="Gemini AI understands context, categorizes transactions, extracts details, and saves everything instantly."
            />
            <StepCard 
              number="3"
              title="Get Insights"
              description="View real-time dashboards, AI-generated reports, spending trends, and financial recommendations."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-800 to-teal-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to Simplify Your Finances?</h2>
          <p className="text-2xl text-emerald-100 mb-10">
            Join thousands managing personal and business finances the smart way.
          </p>
          <button
            onClick={onGetStarted}
            className="px-10 py-5 bg-white text-emerald-900 rounded-2xl font-bold text-xl hover:bg-emerald-50 transition-all shadow-2xl hover:scale-105"
          >
            Start Free Account Now →
          </button>
          <p className="text-sm text-emerald-200 mt-6">
            No credit card · No commitment · Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-emerald-800 py-10 bg-emerald-950">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">SuaraKira</span>
                <p className="text-xs text-emerald-400">AI-Native Finance Tracker</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-emerald-300">
              <span>Crafted with ❤️ by</span>
              <a
                href="https://w3jdev.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
              >
                W3JDEV
              </a>
            </div>
          </div>
          
          <div className="text-center text-xs text-emerald-400 border-t border-emerald-800 pt-6">
            <p>© 2026 SuaraKira by W3JDEV · Made in Malaysia 🇲🇾 · All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Stats Card Component
const StatCard: React.FC<{ number: string; label: string }> = ({ number, label }) => (
  <div>
    <p className="text-4xl font-bold text-emerald-300 mb-2">{number}</p>
    <p className="text-sm text-emerald-200">{label}</p>
  </div>
);

// Enhanced Feature Card
const FeatureCard: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  highlight: string;
}> = ({ icon, title, description, highlight }) => (
  <div className="group bg-emerald-900/40 backdrop-blur-sm border border-emerald-700/30 rounded-2xl p-8 hover:bg-emerald-900/60 hover:border-emerald-600/50 transition-all hover:scale-105">
    <div className="flex items-start justify-between mb-4">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-xs font-bold text-emerald-400 bg-emerald-900/50 px-3 py-1 rounded-full">
        {highlight}
      </span>
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-sm text-emerald-200 leading-relaxed">{description}</p>
  </div>
);

// Use Case Card
const UseCaseCard: React.FC<{
  emoji: string;
  title: string;
  examples: string[];
}> = ({ emoji, title, examples }) => (
  <div className="bg-emerald-900/40 backdrop-blur-sm border border-emerald-700/30 rounded-2xl p-6 hover:bg-emerald-900/60 transition-all">
    <div className="text-5xl mb-4">{emoji}</div>
    <h3 className="text-xl font-bold mb-4">{title}</h3>
    <ul className="space-y-2">
      {examples.map((example, idx) => (
        <li key={idx} className="text-sm text-emerald-200 flex items-center gap-2">
          <span className="text-emerald-400">✓</span> {example}
        </li>
      ))}
    </ul>
  </div>
);

// Step Card
const StepCard: React.FC<{
  number: string;
  title: string;
  description: string;
}> = ({ number, title, description }) => (
  <div className="text-center">
    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4 shadow-xl">
      {number}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-sm text-emerald-200 leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;
