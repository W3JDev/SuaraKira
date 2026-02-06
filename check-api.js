#!/usr/bin/env node

/**
 * SuaraKira API Configuration Checker
 * Run this to diagnose NLP/Gemini API issues
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔍 SuaraKira API Configuration Checker\n");
console.log("=".repeat(60));

// Check 1: .env.local exists
console.log("\n📁 Checking .env.local file...");
const envPath = path.join(__dirname, ".env.local");
const envExamplePath = path.join(__dirname, ".env.example");

if (!fs.existsSync(envPath)) {
  console.log("❌ .env.local NOT FOUND!");
  console.log("   👉 You need to create this file in the project root.");

  if (fs.existsSync(envExamplePath)) {
    console.log("   💡 Copy .env.example to .env.local:");
    console.log("      cp .env.example .env.local");
  }
  process.exit(1);
} else {
  console.log("✅ .env.local exists");
}

// Check 2: Read and validate API keys
console.log("\n🔑 Checking API Keys...");
const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};

envContent.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const [key, ...valueParts] = trimmed.split("=");
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join("=").trim().replace(/['"]/g, "");
    }
  }
});

// Check Gemini API Key
const geminiKey = envVars.VITE_GEMINI_API_KEY || envVars.GEMINI_API_KEY;
if (!geminiKey) {
  console.log("❌ VITE_GEMINI_API_KEY is MISSING!");
  console.log("   👉 Add this to your .env.local:");
  console.log("      VITE_GEMINI_API_KEY=AIzaSy...");
  console.log("");
  console.log("   🔗 Get your API key from:");
  console.log("      https://aistudio.google.com/app/apikey");
} else {
  console.log("✅ VITE_GEMINI_API_KEY found");
  console.log(
    `   Key: ${geminiKey.substring(0, 10)}...${geminiKey.substring(geminiKey.length - 4)}`,
  );
  console.log(`   Length: ${geminiKey.length} chars (should be ~39)`);

  if (geminiKey.length < 30) {
    console.log("   ⚠️  WARNING: Key seems too short!");
  }

  if (!geminiKey.startsWith("AIza")) {
    console.log('   ⚠️  WARNING: Gemini keys usually start with "AIza"');
  }
}

// Check Supabase keys
console.log("\n🗄️  Checking Supabase Configuration...");
const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.log("❌ VITE_SUPABASE_URL is missing");
} else {
  console.log("✅ VITE_SUPABASE_URL found");
  console.log(`   URL: ${supabaseUrl}`);
}

if (!supabaseKey) {
  console.log("❌ VITE_SUPABASE_ANON_KEY is missing");
} else {
  console.log("✅ VITE_SUPABASE_ANON_KEY found");
  console.log(
    `   Key: ${supabaseKey.substring(0, 10)}...${supabaseKey.substring(supabaseKey.length - 4)}`,
  );
}

// Check 3: Vite config
console.log("\n⚙️  Checking vite.config.ts...");
const viteConfigPath = path.join(__dirname, "vite.config.ts");
if (fs.existsSync(viteConfigPath)) {
  const viteConfig = fs.readFileSync(viteConfigPath, "utf8");

  if (viteConfig.includes("process.env.API_KEY") || viteConfig.includes("VITE_GEMINI_API_KEY")) {
    console.log("✅ Vite config has API key mapping");
  } else {
    console.log("⚠️  Vite config might be missing API key definition");
  }
} else {
  console.log("⚠️  vite.config.ts not found");
}

// Check 4: Package dependencies
console.log("\n📦 Checking dependencies...");
const packageJsonPath = path.join(__dirname, "package.json");
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  if (packageJson.dependencies["@google/genai"]) {
    console.log("✅ @google/genai is installed");
    console.log(`   Version: ${packageJson.dependencies["@google/genai"]}`);
  } else {
    console.log("❌ @google/genai is NOT installed!");
    console.log("   Run: npm install @google/genai");
  }

  if (packageJson.dependencies["@supabase/supabase-js"]) {
    console.log("✅ @supabase/supabase-js is installed");
  } else {
    console.log("❌ @supabase/supabase-js is NOT installed!");
  }
}

// Summary
console.log("\n" + "=".repeat(60));
console.log("📋 SUMMARY\n");

const issues = [];

if (!geminiKey) {
  issues.push("Missing VITE_GEMINI_API_KEY");
}
if (!supabaseUrl) {
  issues.push("Missing VITE_SUPABASE_URL");
}
if (!supabaseKey) {
  issues.push("Missing VITE_SUPABASE_ANON_KEY");
}

if (issues.length === 0) {
  console.log("✅ All checks passed!");
  console.log('\nIf you\'re still seeing "lost connection" errors:');
  console.log("1. Restart your dev server (Ctrl+C then npm run dev)");
  console.log("2. Clear browser cache and reload");
  console.log("3. Check browser console for detailed errors (F12)");
  console.log("4. Verify your Gemini API key is active at:");
  console.log("   https://aistudio.google.com/app/apikey");
  console.log("5. Check API quota limits (free tier has restrictions)");
} else {
  console.log("❌ Issues found:\n");
  issues.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${issue}`);
  });
  console.log("\n💡 Fix these issues in your .env.local file");
}

console.log("\n🔗 Helpful Links:");
console.log("   • Get Gemini API Key: https://aistudio.google.com/app/apikey");
console.log("   • Supabase Dashboard: https://supabase.com/dashboard");
console.log("   • Documentation: See QUICK_START.md in this folder");

console.log("\n" + "=".repeat(60));
console.log("✨ Done!\n");
