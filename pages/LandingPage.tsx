import React from "react";
import { Link } from "react-router-dom";

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎙️</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                SuaraKira
              </span>
            </div>
            <button
              onClick={onGetStarted}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              Transform
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Voice{" "}
              </span>
              Into Instant Accounting
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              AI-powered financial tracking for Malaysian businesses. Just speak, and SuaraKira
              handles the rest—in English, Malay, Tamil, or Mandarin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-2xl hover:shadow-3xl transition-all text-lg"
              >
                🚀 Start Free Now
              </button>
              <a
                href="#demo"
                className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-gray-900 dark:text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-lg"
              >
                📺 Watch Demo
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
            {[
              { value: "3 sec", label: "Entry Time" },
              { value: "4 Languages", label: "Supported" },
              { value: "24/7", label: "AI Available" },
              { value: "100%", label: "Data Secure" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Built for Malaysian Businesses
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to track sales and expenses—effortlessly
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🎙️",
                title: "Voice-First Entry",
                desc: "Say 'Jual 5 nasi lemak 25 ringgit' and watch it auto-save. No forms, no typing.",
              },
              {
                icon: "🤖",
                title: "AI-Powered Smart",
                desc: "Gemini AI understands Malaysian context—from mamak to grab rides.",
              },
              {
                icon: "🌐",
                title: "Multi-Language",
                desc: "English, Malay, Tamil, Mandarin, and Manglish—we speak your language.",
              },
              {
                icon: "📸",
                title: "Receipt Scanning",
                desc: "Snap a photo, AI extracts everything. No manual data entry needed.",
              },
              {
                icon: "👥",
                title: "Team Management",
                desc: "Add staff with role-based access. Admins see all, staff see their own.",
              },
              {
                icon: "📊",
                title: "Real-Time Analytics",
                desc: "Daily stats, best sellers, profit margins—updated instantly.",
              },
              {
                icon: "🔒",
                title: "Bank-Level Security",
                desc: "Row-level security, encrypted data, complete organization isolation.",
              },
              {
                icon: "💬",
                title: "AI Chat Assistant",
                desc: "Ask 'How much did I earn today?' and get instant answers.",
              },
              {
                icon: "🌙",
                title: "Dark Mode",
                desc: "Easy on the eyes during late-night bookkeeping sessions.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple As 1-2-3
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Get started in under 60 seconds
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Sign Up",
                desc: "Create account, choose personal or organization setup.",
              },
              {
                step: "02",
                title: "Speak or Type",
                desc: "Say 'I spend 20rm in mamak' or snap a receipt photo.",
              },
              {
                step: "03",
                title: "Done!",
                desc: "AI saves transaction instantly. View analytics anytime.",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-indigo-100 dark:text-indigo-900 absolute -top-4 -left-2">
                  {item.step}
                </div>
                <div className="relative bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo" className="py-20 bg-white dark:bg-gray-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            See SuaraKira in Action
          </h2>
          <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl shadow-2xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-gray-600 dark:text-gray-300">Demo video coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Start free, upgrade when you grow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Personal",
                price: "Free",
                period: "Forever",
                features: [
                  "Unlimited transactions",
                  "Voice & text entry",
                  "AI chat assistant",
                  "Real-time analytics",
                  "Receipt scanning",
                  "4 languages",
                ],
                cta: "Start Free",
                highlighted: false,
              },
              {
                name: "Team",
                price: "RM 99",
                period: "/month",
                features: [
                  "Everything in Personal",
                  "Up to 10 team members",
                  "Role-based access",
                  "Team analytics",
                  "Priority support",
                  "API access",
                ],
                cta: "Coming Soon",
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "Contact us",
                features: [
                  "Everything in Team",
                  "Unlimited members",
                  "Dedicated support",
                  "Custom integrations",
                  "On-premise option",
                  "SLA guarantee",
                ],
                cta: "Contact Sales",
                highlighted: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`p-8 rounded-2xl ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl scale-105"
                    : "bg-white dark:bg-gray-800 shadow-lg"
                }`}
              >
                {plan.highlighted && (
                  <div className="text-center mb-4">
                    <span className="px-4 py-1 bg-white/20 rounded-full text-sm font-semibold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <h3
                  className={`text-2xl font-bold mb-2 ${plan.highlighted ? "text-white" : "text-gray-900 dark:text-white"}`}
                >
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span
                    className={`text-lg ${plan.highlighted ? "text-white/80" : "text-gray-600 dark:text-gray-400"}`}
                  >
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <span className={plan.highlighted ? "text-white" : "text-indigo-600"}>
                        ✓
                      </span>
                      <span
                        className={
                          plan.highlighted ? "text-white/90" : "text-gray-600 dark:text-gray-300"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGetStarted}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.highlighted
                      ? "bg-white text-indigo-600 hover:bg-gray-100"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join hundreds of Malaysian businesses using SuaraKira to track finances effortlessly.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-indigo-600 hover:bg-gray-100 rounded-xl font-semibold shadow-2xl hover:shadow-3xl transition-all text-lg"
          >
            🚀 Start Your Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎙️</span>
                </div>
                <span className="text-2xl font-bold">SuaraKira</span>
              </div>
              <p className="text-gray-400 mb-4">
                AI-powered financial tracking for Malaysian businesses. Voice-first, multilingual,
                and built for operators who value precision.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Made with ❤️ by</span>
                <a
                  href="https://w3jdev.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  W3JDEV
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#demo" className="hover:text-white transition-colors">
                    Demo
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="https://w3jdev.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>© 2026 SuaraKira. Built by W3J LLC. All rights reserved.</p>
            <p className="mt-2">
              Architecting industrial-grade AI solutions for global operators.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
