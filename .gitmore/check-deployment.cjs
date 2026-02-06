/**
 * Deployment Verification Script
 * Checks if the latest dashboard changes are deployed
 */

const https = require('https');

const DEPLOYMENT_URL = 'https://suara-kira.vercel.app';
const EXPECTED_FEATURES = [
  'useCase',
  'netAmount',
  'cashFlow',
  'Balance Today',
  'Net Profit Today',
  'totalIncome',
  'totalSpent'
];

console.log('🔍 Checking SuaraKira Deployment...\n');
console.log(`URL: ${DEPLOYMENT_URL}`);
console.log(`Expected Commit: 4ba8807\n`);

// Check 1: Verify latest commit
console.log('📋 Step 1: Checking Git Status');
const { execSync } = require('child_process');

try {
  const currentCommit = execSync('git rev-parse --short HEAD').toString().trim();
  const latestCommit = execSync('git rev-parse --short origin/main').toString().trim();

  console.log(`   Local HEAD: ${currentCommit}`);
  console.log(`   Remote HEAD: ${latestCommit}`);

  if (currentCommit === latestCommit) {
    console.log('   ✅ Git is in sync\n');
  } else {
    console.log('   ⚠️  Git out of sync - run: git pull\n');
  }
} catch (err) {
  console.log('   ❌ Git check failed:', err.message);
}

// Check 2: Verify build files exist
console.log('📋 Step 2: Checking Local Build');
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

if (fs.existsSync(distPath)) {
  console.log('   ✅ dist/ folder exists');

  if (fs.existsSync(indexPath)) {
    console.log('   ✅ dist/index.html exists');

    const stats = fs.statSync(indexPath);
    const buildTime = new Date(stats.mtime);
    console.log(`   📅 Last built: ${buildTime.toLocaleString()}`);

    // Check if recent (within 1 hour)
    const age = Date.now() - buildTime.getTime();
    const minutesAgo = Math.floor(age / 60000);

    if (minutesAgo < 60) {
      console.log(`   ✅ Build is fresh (${minutesAgo} minutes ago)\n`);
    } else {
      console.log(`   ⚠️  Build is old (${minutesAgo} minutes ago) - consider rebuilding\n`);
    }
  } else {
    console.log('   ❌ dist/index.html missing - run: npm run build\n');
  }
} else {
  console.log('   ❌ dist/ folder missing - run: npm run build\n');
}

// Check 3: Verify source files have new code
console.log('📋 Step 3: Checking Source Code');

const dashboardPath = path.join(__dirname, 'components', 'Dashboard.tsx');
const dbPath = path.join(__dirname, 'services', 'db.ts');
const typesPath = path.join(__dirname, 'types.ts');

const checkFile = (filePath, keywords) => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const found = keywords.filter(kw => content.includes(kw));
    const missing = keywords.filter(kw => !content.includes(kw));

    console.log(`   📄 ${path.basename(filePath)}`);
    console.log(`      ✅ Found: ${found.join(', ')}`);
    if (missing.length > 0) {
      console.log(`      ❌ Missing: ${missing.join(', ')}`);
    }
  } else {
    console.log(`   ❌ File not found: ${filePath}`);
  }
};

checkFile(typesPath, ['UseCase', 'netAmount', 'totalIncome', 'totalSpent']);
checkFile(dbPath, ['getDailyStats', 'useCase', 'netAmount']);
checkFile(dashboardPath, ['useCase', 'netLabel', 'isPersonal', 'cashFlow']);

console.log('');

// Check 4: Deployment status
console.log('📋 Step 4: Checking Vercel Deployment');
console.log('   💡 Visit: https://vercel.com/your-project/deployments');
console.log('   💡 Or run: vercel ls');
console.log('');

// Check 5: Browser cache instructions
console.log('📋 Step 5: Browser Cache Clear Instructions\n');
console.log('   🔄 Hard Refresh:');
console.log('      Windows/Linux: Ctrl + Shift + R');
console.log('      Mac: Cmd + Shift + R\n');
console.log('   🔄 DevTools Method:');
console.log('      1. Press F12 (open DevTools)');
console.log('      2. Right-click the refresh button');
console.log('      3. Select "Empty Cache and Hard Reload"\n');
console.log('   🔄 Incognito Mode:');
console.log('      Open an incognito/private window and test\n');

// Summary
console.log('═══════════════════════════════════════════════════\n');
console.log('📝 DEPLOYMENT CHECKLIST:\n');
console.log('   [ ] Code pushed to GitHub (commit 4ba8807)');
console.log('   [ ] Vercel deployment completed');
console.log('   [ ] Browser cache cleared (hard refresh)');
console.log('   [ ] Dashboard shows new design');
console.log('   [ ] "Net Profit Today" or "Balance Today" visible');
console.log('   [ ] Cash flow breakdown panel visible');
console.log('   [ ] Settings has "Use Case Context" toggle\n');
console.log('═══════════════════════════════════════════════════\n');

console.log('🚀 QUICK TEST:');
console.log(`   1. Open: ${DEPLOYMENT_URL}`);
console.log('   2. Hard refresh (Ctrl+Shift+R)');
console.log('   3. Check dashboard header - should say "Net Profit Today"');
console.log('   4. Open Settings - should have "Use Case Context" section\n');

console.log('💡 If old design still shows:');
console.log('   → Wait 2-3 minutes for Vercel deployment');
console.log('   → Clear browser cache completely');
console.log('   → Try incognito mode');
console.log('   → Check Vercel dashboard for build errors\n');

console.log('✅ Verification script complete!\n');
