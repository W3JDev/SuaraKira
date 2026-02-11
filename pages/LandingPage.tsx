import React from "react";
import { motion } from "framer-motion";
import { MicIcon, WalletIcon, SparklesIcon, CameraIcon } from "../components/Icons";

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white overflow-x-hidden">
      {/* Simple Clean Header */}
      <header className="fixed top-0 w-full z-50 bg-emerald-900/80 backdrop-blur-md border-b border-emerald-700/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-400 rounded-xl flex items-center justify-center">
              <MicIcon className="w-6 h-6 text-emerald-900" />
            </div>
            <span className="text-2xl font-bold">SuaraKira</span>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-2.5 bg-white text-emerald-900 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section - Simple & Clean */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Focus on your food,<br />
            <span className="text-emerald-400">we handle the numbers.</span>
          </motion.h1>

          <motion.p
            className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Transform voice into instant accounting. Built for Malaysian hawkers, powered by AI.
          </motion.p>

          <motion.button
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-emerald-900 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            🚀 Start Free Now
          </motion.button>

          <p className="text-sm text-emerald-300 mt-4">
            No credit card required · Free forever for personal use
          </p>
        </div>
      </section>

      {/* Features - Simple Grid */}
      <section className="py-20 bg-emerald-950/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Malaysian Hawkers Choose Us</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<MicIcon className="w-6 h-6" />}
              title="Voice-First"
              description="Say 'Jual 5 nasi lemak 25rm' and it's saved instantly"
            />
            <FeatureCard 
              icon={<SparklesIcon className="w-6 h-6" />}
              title="AI-Powered"
              description="Understands Manglish, BM, Tamil, Mandarin"
            />
            <FeatureCard 
              icon={<CameraIcon className="w-6 h-6" />}
              title="Receipt Scan"
              description="Snap a photo, AI extracts everything"
            />
            <FeatureCard 
              icon={<WalletIcon className="w-6 h-6" />}
              title="Real-Time Stats"
              description="Daily sales, profits, best sellers—live"
            />
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-20 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join hundreds of Malaysian businesses tracking finances effortlessly.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-emerald-900 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-all"
          >
            Start Your Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-emerald-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <MicIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">SuaraKira</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-emerald-300">
            <span>Made with ❤️ by</span>
            <a
              href="https://w3jdev.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              W3JDEV
            </a>
          </div>
          
          <p className="text-xs text-emerald-400">
            © 2026 SuaraKira · All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

// Simple Feature Card
const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-emerald-900/50 backdrop-blur-sm border border-emerald-700/30 rounded-xl p-6 hover:bg-emerald-900/70 transition-colors">
    <div className="w-12 h-12 rounded-lg bg-emerald-700/50 flex items-center justify-center text-emerald-300 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-sm text-emerald-200">{description}</p>
  </div>
);

export default LandingPage;
