export type Language = "en" | "ms" | "bn" | "ta" | "zh";

export const translations = {
  en: {
    // Header
    appName: "SuaraKira",

    // Dashboard
    totalSales: "Total Sales Today",
    transactions: "Transactions",
    expenses: "Expenses",
    generateReport: "Generate Financial Report",
    aiThinking: "AI CFO is thinking...",
    recentActivity: "Recent Activity",
    tapToView: "Tap to view receipt",
    noTransTitle: "No transactions yet",
    noTransDesc: "Record sales, expenses, or scan receipts!",
    loadDemo: "Tap here to load Demo Data",

    // Insights
    aiReport: "AI CFO Report",
    anomalies: "Detected Anomalies",
    profitAnalysis: "Profit Margin Analysis",
    overallProfit: "Overall Profitability",
    netMargin: "Net Margin",
    bestItem: "Best Item",
    worstItem: "Worst Item",
    cashFlow: "Cash Flow Analysis",
    advice: "Actionable Advice",

    // Input
    listening: "Listening... Release to finish",
    processing: "Processing...",
    manualEntry: "Manual Entry",
    addTransaction: "Add Transaction",
    cancel: "Cancel",
    placeholder: "e.g. 'Sold 2 Nasi Lemak for RM 10'",

    // Settings
    settings: "Settings",
    appearance: "Appearance",
    darkMode: "Dark Mode",
    language: "Language",
    notifications: "Notifications",
    lowStock: "Low Stock Alerts",
    dailySummary: "Daily Summary",
    dataMgmt: "Data Management",
    clearData: "Clear All Transaction History",

    // Analytics
    cashFlowTrend: "Cash Flow Trend (7 Days)",
    incomeVsExpense: "Income vs Expense",
    expenseCat: "Expenses by Category",
    topItems: "Top Items Sold (Qty)",
    priceHistory: "Item Price Tracker",
    selectItem: "Select Item to Track",
    unitPrice: "Unit Price",

    // Alerts
    priceWarning: "Price Alert",
    priceWarningDesc:
      "You paid RM{price} per unit for {item}. This is {percent}% higher than your average of RM{avg}.",
    greatDeal: "Great Price",
    greatDealDesc: "You paid RM{price} per unit for {item}. This is {percent}% lower than usual!",
  },
  ms: {
    // Header
    appName: "SuaraKira",

    // Dashboard
    totalSales: "Jualan Hari Ini",
    transactions: "Transaksi",
    expenses: "Belanja",
    generateReport: "Jana Laporan Kewangan",
    aiThinking: "AI sedang berfikir...",
    recentActivity: "Aktiviti Terkini",
    tapToView: "Tekan untuk lihat resit",
    noTransTitle: "Tiada transaksi",
    noTransDesc: "Rekod jualan, belanja, atau imbas resit!",
    loadDemo: "Tekan sini untuk Data Demo",

    // Insights
    aiReport: "Laporan CFO AI",
    anomalies: "Anomali Dikesan",
    profitAnalysis: "Analisis Margin Untung",
    overallProfit: "Keuntungan Keseluruhan",
    netMargin: "Margin Bersih",
    bestItem: "Barang Terbaik",
    worstItem: "Barang Terburuk",
    cashFlow: "Analisis Aliran Tunai",
    advice: "Nasihat Bisnes",

    // Input
    listening: "Mendengar... Lepas untuk tamat",
    processing: "Sedang Memproses...",
    manualEntry: "Masuk Manual",
    addTransaction: "Tambah Transaksi",
    cancel: "Batal",
    placeholder: "cth. 'Jual 2 Nasi Lemak harga RM 10'",

    // Settings
    settings: "Tetapan",
    appearance: "Rupa",
    darkMode: "Mod Gelap",
    language: "Bahasa",
    notifications: "Notifikasi",
    lowStock: "Amaran Stok Rendah",
    dailySummary: "Rumusan Harian",
    dataMgmt: "Pengurusan Data",
    clearData: "Padam Semua Sejarah",

    // Analytics
    cashFlowTrend: "Aliran Tunai (7 Hari)",
    incomeVsExpense: "Pendapatan vs Perbelanjaan",
    expenseCat: "Perbelanjaan Mengikut Kategori",
    topItems: "Barang Paling Laris (Kuantiti)",
    priceHistory: "Penjejak Harga Barang",
    selectItem: "Pilih Barang",
    unitPrice: "Harga Seunit",

    // Alerts
    priceWarning: "Amaran Harga",
    priceWarningDesc:
      "Anda bayar RM{price}/unit untuk {item}. Ini {percent}% lebih tinggi dari purata RM{avg}.",
    greatDeal: "Harga Murah",
    greatDealDesc:
      "Anda bayar RM{price}/unit untuk {item}. Ini {percent}% lebih rendah dari biasa!",
  },
  bn: {
    // Header (Bangla)
    appName: "সুআরাকিরা",

    // Dashboard
    totalSales: "আজকের মোট বিক্রয়",
    transactions: "লেনদেন",
    expenses: "খরচ",
    generateReport: "আর্থিক প্রতিবেদন তৈরি করুন",
    aiThinking: "এআই চিন্তা করছে...",
    recentActivity: "সাম্প্রতিক কার্যকলাপ",
    tapToView: "রসিদ দেখতে ট্যাপ করুন",
    noTransTitle: "এখনও কোনো লেনদেন নেই",
    noTransDesc: "বিক্রয়, খরচ রেকর্ড করুন বা রসিদ স্ক্যান করুন!",
    loadDemo: "ডেমো ডেটা লোড করতে এখানে ট্যাপ করুন",

    // Insights
    aiReport: "এআই CFO প্রতিবেদন",
    anomalies: "সনাক্তকৃত অসামঞ্জস্য",
    profitAnalysis: "লাভের মার্জিন বিশ্লেষণ",
    overallProfit: "সামগ্রিক লাভজনকতা",
    netMargin: "নিট মার্জিন",
    bestItem: "সেরা আইটেম",
    worstItem: "সবচেয়ে খারাপ আইটেম",
    cashFlow: "নগদ প্রবাহ বিশ্লেষণ",
    advice: "কার্যকর পরামর্শ",

    // Input
    listening: "শুনছি... শেষ করতে ছেড়ে দিন",
    processing: "প্রক্রিয়াকরণ করা হচ্ছে...",
    manualEntry: "ম্যানুয়াল এন্ট্রি",
    addTransaction: "লেনদেন যোগ করুন",
    cancel: "বাতিল",
    placeholder: "উদা. 'RM 10 তে 2টি নাসি লেমাক বিক্রি'",

    // Settings
    settings: "সেটিংস",
    appearance: "চেহারা",
    darkMode: "ডার্ক মোড",
    language: "ভাষা",
    notifications: "বিজ্ঞপ্তি",
    lowStock: "স্বল্প স্টক সতর্কতা",
    dailySummary: "দৈনিক সারসংক্ষেপ",
    dataMgmt: "ডেটা ব্যবস্থাপনা",
    clearData: "সমস্ত লেনদেন ইতিহাস মুছুন",

    // Analytics
    cashFlowTrend: "নগদ প্রবাহের প্রবণতা (7 দিন)",
    incomeVsExpense: "আয় বনাম খরচ",
    expenseCat: "বিভাগ অনুযায়ী খরচ",
    topItems: "সর্বাধিক বিক্রিত আইটেম (পরিমাণ)",
    priceHistory: "আইটেম মূল্য ট্র্যাকার",
    selectItem: "ট্র্যাক করার জন্য আইটেম নির্বাচন করুন",
    unitPrice: "একক মূল্য",

    // Alerts
    priceWarning: "মূল্য সতর্কতা",
    priceWarningDesc:
      "আপনি {item} এর জন্য প্রতি ইউনিট RM{price} পরিশোধ করেছেন। এটি আপনার গড় RM{avg} থেকে {percent}% বেশি।",
    greatDeal: "দুর্দান্ত মূল্য",
    greatDealDesc:
      "আপনি {item} এর জন্য প্রতি ইউনিট RM{price} পরিশোধ করেছেন। এটি স্বাভাবিকের চেয়ে {percent}% কম!",
  },
  ta: {
    // Header (Tamil)
    appName: "சுஆராகிரா",

    // Dashboard
    totalSales: "இன்றைய மொத்த விற்பனை",
    transactions: "பரிவர்த்தனைகள்",
    expenses: "செலவுகள்",
    generateReport: "நிதி அறிக்கையை உருவாக்கவும்",
    aiThinking: "AI சிந்திக்கிறது...",
    recentActivity: "சமீபத்திய செயல்பாடு",
    tapToView: "ரசீதைப் பார்க்க தட்டவும்",
    noTransTitle: "இன்னும் பரிவர்த்தனைகள் இல்லை",
    noTransDesc: "விற்பனை, செலவுகளை பதிவு செய்யவும் அல்லது ரசீதுகளை ஸ்கேன் செய்யவும்!",
    loadDemo: "டெமோ தரவை ஏற்ற இங்கே தட்டவும்",

    // Insights
    aiReport: "AI CFO அறிக்கை",
    anomalies: "கண்டறியப்பட்ட முரண்பாடுகள்",
    profitAnalysis: "லாப விளிம்பு பகுப்பாய்வு",
    overallProfit: "ஒட்டுமொத்த லாபம்",
    netMargin: "நிகர விளிம்பு",
    bestItem: "சிறந்த பொருள்",
    worstItem: "மோசமான பொருள்",
    cashFlow: "பண ஓட்ட பகுப்பாய்வு",
    advice: "செயல்படுத்தக்கூடிய ஆலோசனை",

    // Input
    listening: "கேட்கிறது... முடிக்க விடுவிக்கவும்",
    processing: "செயலாக்குகிறது...",
    manualEntry: "கைமுறை உள்ளீடு",
    addTransaction: "பரிவர்த்தனையைச் சேர்க்கவும்",
    cancel: "ரத்துசெய்",
    placeholder: "எ.கா. 'RM 10க்கு 2 நாசி லெமாக் விற்பனை'",

    // Settings
    settings: "அமைப்புகள்",
    appearance: "தோற்றம்",
    darkMode: "இருண்ட முறை",
    language: "மொழி",
    notifications: "அறிவிப்புகள்",
    lowStock: "குறைந்த இருப்பு எச்சரிக்கைகள்",
    dailySummary: "தினசரி சுருக்கம்",
    dataMgmt: "தரவு மேலாண்மை",
    clearData: "அனைத்து பரிவர்த்தனை வரலாற்றையும் அழிக்கவும்",

    // Analytics
    cashFlowTrend: "பண ஓட்ட போக்கு (7 நாட்கள்)",
    incomeVsExpense: "வருமானம் vs செலவு",
    expenseCat: "வகை வாரியாக செலவுகள்",
    topItems: "அதிகம் விற்பனையான பொருட்கள் (அளவு)",
    priceHistory: "பொருள் விலை கண்காணிப்பான்",
    selectItem: "கண்காணிக்க பொருளைத் தேர்ந்தெடுக்கவும்",
    unitPrice: "அலகு விலை",

    // Alerts
    priceWarning: "விலை எச்சரிக்கை",
    priceWarningDesc:
      "{item}க்கு நீங்கள் ஒரு யூனிட்டுக்கு RM{price} செலுத்தினீர்கள். இது உங்கள் சராசரி RM{avg}ஐ விட {percent}% அதிகம்.",
    greatDeal: "சிறந்த விலை",
    greatDealDesc:
      "{item}க்கு நீங்கள் ஒரு யூனிட்டுக்கு RM{price} செலுத்தினீர்கள். இது வழக்கத்தை விட {percent}% குறைவு!",
  },
  zh: {
    // Header (Chinese)
    appName: "声音记账",

    // Dashboard
    totalSales: "今日总销售额",
    transactions: "交易",
    expenses: "支出",
    generateReport: "生成财务报告",
    aiThinking: "AI正在思考...",
    recentActivity: "最近活动",
    tapToView: "点击查看收据",
    noTransTitle: "还没有交易",
    noTransDesc: "记录销售、支出或扫描收据！",
    loadDemo: "点击这里加载演示数据",

    // Insights
    aiReport: "AI CFO报告",
    anomalies: "检测到的异常",
    profitAnalysis: "利润率分析",
    overallProfit: "整体盈利能力",
    netMargin: "净利润率",
    bestItem: "最佳项目",
    worstItem: "最差项目",
    cashFlow: "现金流分析",
    advice: "可行建议",

    // Input
    listening: "正在听... 松开完成",
    processing: "处理中...",
    manualEntry: "手动输入",
    addTransaction: "添加交易",
    cancel: "取消",
    placeholder: "例如 '以RM 10卖出2份椰浆饭'",

    // Settings
    settings: "设置",
    appearance: "外观",
    darkMode: "深色模式",
    language: "语言",
    notifications: "通知",
    lowStock: "低库存警报",
    dailySummary: "每日摘要",
    dataMgmt: "数据管理",
    clearData: "清除所有交易历史",

    // Analytics
    cashFlowTrend: "现金流趋势（7天）",
    incomeVsExpense: "收入vs支出",
    expenseCat: "按类别划分的支出",
    topItems: "最畅销商品（数量）",
    priceHistory: "商品价格跟踪器",
    selectItem: "选择要跟踪的商品",
    unitPrice: "单价",

    // Alerts
    priceWarning: "价格警报",
    priceWarningDesc: "您为{item}支付了每单位RM{price}。这比您的平均值RM{avg}高{percent}%。",
    greatDeal: "优惠价格",
    greatDealDesc: "您为{item}支付了每单位RM{price}。这比平常低{percent}%！",
  },
};
