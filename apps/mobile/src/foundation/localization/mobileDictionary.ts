import type { AppLocale } from "./webCompat";

export type MobileDictionary = {
  [key: string]: any;
  common: {
    back: string;
    close: string;
    continue: string;
    skip: string;
    save: string;
    saved: string;
    remove: string;
    retry: string;
    search: string;
    systemDefault: string;
    language: string;
    appearance: string;
    profile: string;
    loading: string;
    assetUnavailableTitle: string;
    assetUnavailableBody: string;
    noAmenitiesTitle: string;
    noAmenitiesBody: string;
  };
  homeSearch: {
    placeholder: string;
    buy: string;
    rent: string;
    ready: string;
    projects: string;
    topMatchesTitle: string;
    topMatchesSubtitle: string;
    searchTitle: string;
    searchSubtitle: string;
    savedTitle: string;
    savedSubtitle: string;
    viewAll: string;
    emptySavedTitle: string;
    emptySavedBody: string;
    syncingSavedTitle: string;
    syncingSavedBody: string;
  };
  assetCard: {
    topMatch: string;
    verified: string;
    viewDetails: string;
    previousImage: string;
    nextImage: string;
    saveAsset: string;
    removeSavedAsset: string;
    whatsapp: string;
    call: string;
    bed: string;
    bath: string;
    sqft: string;
    asset: string;
    villa: string;
    studio: string;
    forSale: string;
    forRent: string;
  };
  appSettings: {
    languageTitle: string;
    languageSubtitle: string;
    languageHeroTitle: string;
    languageHeroBody: string;
    systemOptionLabel: string;
    systemDescription: string;
    arabicDescription: string;
    englishDescription: string;
    frenchDescription: string;
    appearanceTitle: string;
    appearanceSubtitle: string;
    appearanceHeroTitle: string;
    appearanceHeroBody: string;
    appearanceSystemTitle: string;
    appearanceSystemDescription: string;
    appearanceLightTitle: string;
    appearanceLightDescription: string;
    appearanceDarkTitle: string;
    appearanceDarkDescription: string;
  };
  menu: {
    title: string;
    researchArchive: string;
    workspaceTools: string;
    startConversation: string;
    untitledSearch: string;
    fullHistory: string;
    savedAssets: string;
    favoriteChats: string;
    userSettings: string;
    errorScreens: string;
    syncResearchArchive: string;
    loadConversationsError: string;
    retry: string;
  };
  profile: {
    account: string;
    security: string;
    services: string;
    aiSearchStyle: string;
    loginSecurity: string;
    memoryPrivacy: string;
    subscription: string;
    marketAlerts: string;
    notifications: string;
    notificationsDescription: string;
    logInToSync: string;
    resetSession: string;
    signOut: string;
  };
  notifications: {
    title: string;
    subtitle: string;
    checking: string;
    enabled: string;
    disabled: string;
    deviceToken: string;
    deviceReady: string;
    deviceMissing: string;
    enable: string;
    disable: string;
    defaultsTitle: string;
    defaultsBody: string;
    calendar30: string;
    calendar5: string;
    calendarStart: string;
    task30: string;
    loadFailed: string;
    permissionDeniedTitle: string;
    permissionDeniedBody: string;
    unsupportedTitle: string;
    unsupportedBody: string;
    setupMissingTitle: string;
    setupMissingBody: string;
    enableFailedTitle: string;
    enableFailedBody: string;
    disableFailedTitle: string;
    disableFailedBody: string;
  };
  saved: {
    title: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptyBody: string;
    noMatchesTitle: string;
    noMatchesBody: string;
    removeFavorite: string;
  };
  listing: {
    searchPlaceholder: string;
    filterButton: string;
    mapButton: string;
    listButton: string;
    openAsset: string;
    browseArea: string;
    mapTitle: string;
    mapSubtitle: string;
    mapSelectedLabel: string;
    mapUnavailableTitle: string;
    mapUnavailableBody: string;
    mapTokenMissingTitle: string;
    mapTokenMissingBody: string;
    mapSettingsTitle: string;
    mapTypeTitle: string;
    mapStandard: string;
    mapSatellite: string;
    pointsOfInterestTitle: string;
    schoolsTitle: string;
    schoolsBody: string;
    hospitalsTitle: string;
    hospitalsBody: string;
    retailTitle: string;
    retailBody: string;
    filterTitle: string;
    filterSubtitle: string;
    priceTitle: string;
    minPricePlaceholder: string;
    maxPricePlaceholder: string;
    locationTitle: string;
    assetTypeTitle: string;
    bedroomsTitle: string;
    bathroomsTitle: string;
    anyOption: string;
    resetFilters: string;
    applyFilters: string;
    resultsSummary: string;
    filters: {
      all: string;
      forSale: string;
      forRent: string;
      villas: string;
      assets: string;
      studios: string;
    };
    stillConnectingTitle: string;
    stillConnectingBody: string;
    emptyTitle: string;
    emptyBody: string;
    noResultsTitle: string;
    noResultsBody: string;
  };
  theories: {
    title: string;
    searchPlaceholder: string;
    emptyPrefix: string;
    untitled: string;
    openThreadBody: string;
  };
  auth: {
    wordmark: string;
    landingPhrases: string[];
    legalNotice: string;
    termsOfService: string;
    privacyPolicy: string;
    copyright: string;
    signInUnavailableTitle: string;
    signInUnavailableBody: string;
    continueWithApple: string;
    continueWithGoogle: string;
    continueWithEmail: string;
    emailOptionsTitle: string;
    emailOptionsHeroTitle: string;
    emailOptionsHeroBody: string;
    logIn: string;
    createAccount: string;
    loginHeader: string;
    loginTitle: string;
    loginBodyUpgrade: string;
    loginBodyDefault: string;
    establishSecurity: string;
    signingIn: string;
    forgotPassword: string;
    missingDetailsTitle: string;
    loginMissingDetailsBody: string;
    signInFailedTitle: string;
    tryAgain: string;
    registerHeader: string;
    registerTitle: string;
    registerBodyUpgrade: string;
    registerBodyDefault: string;
    initializeEnvironment: string;
    initializing: string;
    registerFailedTitle: string;
    registerMissingDetailsBody: string;
    forgotHeader: string;
    forgotTitle: string;
    forgotBody: string;
    requestResetLink: string;
    sending: string;
    missingDetailTitle: string;
    missingDetailBody: string;
    resetLinkSentTitle: string;
    resetLinkSentBody: string;
    backToLogin: string;
    resetFailedTitle: string;
    email: string;
    password: string;
    fullName: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    namePlaceholder: string;
    passwordMinPlaceholder: string;
  };
  workspaceAccess: {
    eyebrow: string;
    title: string;
    body: string;
    loading: string;
    errorTitle: string;
    errorBody: string;
    untitledWorkspace: string;
    joinTitle: string;
    joinBody: string;
    joinButton: string;
    invitePlaceholder: string;
    inviteRequired: string;
    createTitle: string;
    createBody: string;
    createButton: string;
    namePlaceholder: string;
    nameRequired: string;
    yourWorkspaces: string;
    setupAccess: string;
    typeBroker: string;
    typeDeveloper: string;
    inviteEyebrow: string;
    signInInviteTitle: string;
    signInInviteBody: string;
    acceptingTitle: string;
    acceptingBody: string;
    acceptedTitle: string;
    acceptedBody: string;
    acceptErrorTitle: string;
    acceptErrorBody: string;
    invitationUnsupported: string;
    chooseWorkspaceButton: string;
    organizationSettingsTitle: string;
    organizationSettingsBody: string;
    activeWorkspace: string;
    createInviteLink: string;
    inviteLinkCreated: string;
    inviteLinkCopied: string;
    switchWorkspace: string;
    continueWorkspace: string;
    useAnotherAccount: string;
  };
  onboarding: {
    locationsTitle: string;
    locationsBody: string;
    budgetTitle: string;
    budgetBody: string;
    typesTitle: string;
    typesBody: string;
    completeJourney: string;
    currency: string;
  };
  errorList: {
    listEyebrow: string;
    listTitle: string;
    listBody: string;
  };
  asset: {
    [key: string]: any;
    locationMap: string;
    locationUnavailable: string;
    openMapView: string;
    listingExpert: string;
    legalAgency: string;
    certifiedAdvisor: string;
    totalInvestment: string;
    description: string;
    amenities: string;
    marketInsight: string;
  };
};

const dictionaries: Record<AppLocale, MobileDictionary> = {
  en: {
    common: {
      back: "Back",
      close: "Close",
      continue: "Continue",
      skip: "Skip",
      save: "Save",
      saved: "Saved",
      remove: "Remove",
      retry: "Retry",
      search: "Search",
      systemDefault: "System default",
      language: "Language",
      appearance: "Appearance",
      profile: "Profile",
      loading: "Loading",
      assetUnavailableTitle: "Asset unavailable",
      assetUnavailableBody: "This asset could not be loaded or is no longer available.",
      noAmenitiesTitle: "No amenities listed",
      noAmenitiesBody: "This asset does not have live amenities data yet.",
    },
    homeSearch: {
      placeholder: "Search areas, compounds, and asset ideas...",
      buy: "BUY",
      rent: "RENT",
      ready: "Ready",
      projects: "Projects",
      topMatchesTitle: "Top matches",
      topMatchesSubtitle: "Ranked for your current preferences.",
      searchTitle: "Explore listings",
      searchSubtitle: "Browse the live market with quick filters.",
      savedTitle: "Saved assets",
      savedSubtitle: "Your shortlist stays ready to revisit.",
      viewAll: "View all",
      emptySavedTitle: "No saved assets yet",
      emptySavedBody: "Save a asset to keep it close for later comparison.",
      syncingSavedTitle: "Refreshing saved homes",
      syncingSavedBody: "Your shortlist is syncing in the background.",
    },
    assetCard: {
      topMatch: "Top Match",
      verified: "Verified",
      viewDetails: "View Details",
      previousImage: "Previous asset image",
      nextImage: "Next asset image",
      saveAsset: "Save asset",
      removeSavedAsset: "Remove asset from favorites",
      whatsapp: "WhatsApp",
      call: "Call",
      bed: "bed",
      bath: "bath",
      sqft: "sqft",
      asset: "Asset",
      villa: "Villa",
      studio: "Studio",
      forSale: "For sale",
      forRent: "For rent",
    },
    appSettings: {
      languageTitle: "Language",
      languageSubtitle: "Choose how the app reads and flows.",
      languageHeroTitle: "Choose your app language",
      languageHeroBody: "Switch copy, formatting, and layout direction across the mobile app.",
      systemOptionLabel: "System default",
      systemDescription: "Follow your phone language automatically.",
      arabicDescription: "Arabic copy with right-to-left layout.",
      englishDescription: "English copy with left-to-right layout.",
      frenchDescription: "French copy with left-to-right layout.",
      appearanceTitle: "Appearance",
      appearanceSubtitle: "System is currently using {mode} mode.",
      appearanceHeroTitle: "Choose your viewing mode",
      appearanceHeroBody: "Apply changes instantly across the app or stay synced with your device setting.",
      appearanceSystemTitle: "System",
      appearanceSystemDescription: "Follow your phone's current appearance.",
      appearanceLightTitle: "Light",
      appearanceLightDescription: "Bright surfaces with clear daytime contrast.",
      appearanceDarkTitle: "Dark",
      appearanceDarkDescription: "Low-glare surfaces for night use.",
    },
    menu: {
      title: "Qentrah",
      researchArchive: "Workspace conversations",
      workspaceTools: "Qentrah Workspace",
      startConversation: "New conversation",
      untitledSearch: "Untitled search",
      fullHistory: "View full history",
      savedAssets: "Saved assets",
      favoriteChats: "Favorite chats",
      userSettings: "Workspace settings",
      errorScreens: "Error screens",
      syncResearchArchive: "Log in to sync your research archive",
      loadConversationsError: "Unable to load conversations",
      retry: "Retry",
    },
    profile: {
      account: "Account",
      security: "Security",
      services: "Services",
      aiSearchStyle: "AI search style",
      loginSecurity: "Login & security",
      memoryPrivacy: "Memory & privacy",
      subscription: "Subscription",
      marketAlerts: "Market alerts",
      notifications: "Notifications",
      notificationsDescription: "Mobile reminders for calendar events, tasks, and AI schedules",
      logInToSync: "Log in to sync research",
      resetSession: "Reset session",
      signOut: "Sign out",
    },
    notifications: {
      title: "Notifications",
      subtitle: "Register this phone for mobile reminders from your workspace calendar, tasks, and AI schedules.",
      checking: "Checking device status",
      enabled: "Mobile push enabled",
      disabled: "Mobile push disabled",
      deviceToken: "Device connected. Token ends {last4}.",
      deviceReady: "This phone is connected to Qentrah reminders.",
      deviceMissing: "Enable notifications to receive reminders on this phone.",
      enable: "Enable notifications",
      disable: "Disable notifications",
      defaultsTitle: "Default reminder timing",
      defaultsBody: "Your workspace sends calendar reminders 30 minutes before, 5 minutes before, and at start. Tasks remind 30 minutes before due time.",
      calendar30: "Calendar 30m",
      calendar5: "Calendar 5m",
      calendarStart: "At start",
      task30: "Task 30m",
      loadFailed: "Unable to load notification status.",
      permissionDeniedTitle: "Permission denied",
      permissionDeniedBody: "Allow notifications in system settings to receive mobile reminders.",
      unsupportedTitle: "Development build required",
      unsupportedBody: "Mobile push registration works on iOS and Android app builds.",
      setupMissingTitle: "Project setup missing",
      setupMissingBody: "Expo project id is required before push tokens can be created.",
      enableFailedTitle: "Could not enable notifications",
      enableFailedBody: "Try again after checking your network connection.",
      disableFailedTitle: "Could not disable notifications",
      disableFailedBody: "Try again after checking your network connection.",
    },
    saved: {
      title: "Favorites",
      searchPlaceholder: "Search favorite chats...",
      emptyTitle: "No favorites yet",
      emptyBody: "Star important AI conversations to keep them close.",
      noMatchesTitle: "No matching favorites",
      noMatchesBody: "Try a different keyword to search your favorite chats.",
      removeFavorite: "Remove chat from favorites",
    },
    listing: {
      searchPlaceholder: "Search areas...",
      filterButton: "Filters",
      mapButton: "Map",
      listButton: "List",
      openAsset: "Open asset",
      browseArea: "Browse area",
      mapTitle: "Explore on the map",
      mapSubtitle: "Tap a pin to preview a listing near that area.",
      mapSelectedLabel: "Selected home",
      mapUnavailableTitle: "Map not available here",
      mapUnavailableBody: "Open this screen on iOS or Android development builds to browse listings on the map.",
      mapTokenMissingTitle: "Mapbox token missing",
      mapTokenMissingBody: "Add EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN to load the listing map in development builds.",
      mapSettingsTitle: "Map Settings",
      mapTypeTitle: "Map type",
      mapStandard: "Standard",
      mapSatellite: "Satellite",
      pointsOfInterestTitle: "Points of interest",
      schoolsTitle: "Schools & Education",
      schoolsBody: "Show nearby educational facilities",
      hospitalsTitle: "Hospitals & Clinics",
      hospitalsBody: "Show medical centers",
      retailTitle: "Retail & Groceries",
      retailBody: "Show shopping centers and markets",
      filterTitle: "Filter listings",
      filterSubtitle: "Narrow by budget, location, and fit before you browse deeper.",
      priceTitle: "Price range",
      minPricePlaceholder: "Min price",
      maxPricePlaceholder: "Max price",
      locationTitle: "Locations",
      assetTypeTitle: "Asset type",
      bedroomsTitle: "Bedrooms",
      bathroomsTitle: "Bathrooms",
      anyOption: "Any",
      resetFilters: "Reset",
      applyFilters: "Show results",
      resultsSummary: "Refine by price, locations, and home details.",
      filters: {
        all: "All",
        forSale: "For sale",
        forRent: "For rent",
        villas: "Villas",
        assets: "Assets",
        studios: "Studios",
      },
      stillConnectingTitle: "Still connecting",
      stillConnectingBody: "We are waiting for your live listings to load.",
      emptyTitle: "No assets yet",
      emptyBody: "Listings will appear here once your live inventory is available.",
      noResultsTitle: "No assets found",
      noResultsBody: "Try a different search or filter to see more homes.",
    },
    theories: {
      title: "Archive",
      searchPlaceholder: "Search conversations...",
      emptyPrefix: "No theories found matching",
      untitled: "Untitled search",
      openThreadBody: "Open this thread to continue the research.",
    },
    auth: {
      wordmark: "QENTRAH",
      landingPhrases: [
        "Your agency runs from chat.",
        "Search, follow up, and close from your phone.",
        "Smarter workspace work, no desk required.",
      ],
      legalNotice: "By continuing, you agree to",
      termsOfService: "Terms",
      privacyPolicy: "Privacy Policy",
      copyright: "© 2026 Qentrah",
      signInUnavailableTitle: "Sign in unavailable",
      signInUnavailableBody: "Unable to start sign in.",
      continueWithApple: "Continue with Apple",
      continueWithGoogle: "Continue with Google",
      continueWithEmail: "Continue with Email",
      emailOptionsTitle: "Account access",
      emailOptionsHeroTitle: "Use email",
      emailOptionsHeroBody: "Sign in or create an account with a secure email password.",
      logIn: "Sign in",
      createAccount: "Create account",
      loginHeader: "Sign in",
      loginTitle: "Welcome back",
      loginBodyUpgrade: "Continue to your workspace and AI conversations.",
      loginBodyDefault: "Enter your email and password.",
      establishSecurity: "Sign in",
      signingIn: "Signing in...",
      forgotPassword: "Forgot password?",
      missingDetailsTitle: "Missing details",
      loginMissingDetailsBody: "Enter your email and password to continue.",
      signInFailedTitle: "Sign in failed",
      tryAgain: "Try again",
      registerHeader: "Create account",
      registerTitle: "Create your account",
      registerBodyUpgrade: "Start with your account, then create or join a workspace.",
      registerBodyDefault: "Start with your account, then create or join a workspace.",
      initializeEnvironment: "Create account",
      initializing: "Creating...",
      registerFailedTitle: "Registration failed",
      registerMissingDetailsBody: "Name, email, and password are all required.",
      forgotHeader: "Recovery",
      forgotTitle: "Restore access",
      forgotBody: "Enter your email to securely recover your identity.",
      requestResetLink: "Request reset link",
      sending: "Sending...",
      missingDetailTitle: "Missing detail",
      missingDetailBody: "Enter your email to request a reset link.",
      resetLinkSentTitle: "Reset link sent",
      resetLinkSentBody: "Check your email and follow the instructions to reset your password.",
      backToLogin: "Back to login",
      resetFailedTitle: "Reset failed",
      email: "Email",
      password: "Password",
      fullName: "Full name",
      emailPlaceholder: "name@example.com",
      passwordPlaceholder: "Your password",
      namePlaceholder: "Ahmed Mansour",
      passwordMinPlaceholder: "At least 8 characters",
    },
    workspaceAccess: {
      eyebrow: "Workspace",
      title: "Workspace",
      body: "Choose, create, or join.",
      loading: "Loading",
      errorTitle: "Workspace unavailable",
      errorBody: "Unable to update workspace access.",
      untitledWorkspace: "Untitled workspace",
      joinTitle: "Join invite",
      joinBody: "Paste a link or code.",
      joinButton: "Join",
      invitePlaceholder: "Invite link or code",
      inviteRequired: "Paste an invite link or code to continue.",
      createTitle: "Create",
      createBody: "Start a workspace.",
      createButton: "Create",
      namePlaceholder: "Workspace name",
      nameRequired: "Enter a workspace name.",
      yourWorkspaces: "Your workspaces",
      setupAccess: "Set up access",
      typeBroker: "Broker",
      typeDeveloper: "Developer",
      inviteEyebrow: "Organization invite",
      signInInviteTitle: "Sign in",
      signInInviteBody: "Then the invite opens here.",
      acceptingTitle: "Joining",
      acceptingBody: "Accepting invite.",
      acceptedTitle: "Joined",
      acceptedBody: "Opening Qentrah.",
      acceptErrorTitle: "Invite unavailable",
      acceptErrorBody: "Unable to accept this invite.",
      invitationUnsupported: "Open the full invite link or paste an invite token.",
      chooseWorkspaceButton: "Choose",
      organizationSettingsTitle: "Organization",
      organizationSettingsBody: "Manage workspace access and invites.",
      activeWorkspace: "Active workspace",
      createInviteLink: "Invite link",
      inviteLinkCreated: "Invite ready",
      inviteLinkCopied: "Link copied.",
      switchWorkspace: "Switch",
      continueWorkspace: "Continue",
      useAnotherAccount: "Use another account",
    },
    onboarding: {
      locationsTitle: "Personalize",
      locationsBody: "Where are you looking to buy or invest? Select all that apply.",
      budgetTitle: "Scope",
      budgetBody: "What is your desired investment budget? Select a baseline.",
      typesTitle: "Architecture",
      typesBody: "Select the asset types that match your architectural taste.",
      completeJourney: "Complete journey",
      currency: "EGP",
    },
    errorList: {
      listEyebrow: "SYSTEM STATES",
      listTitle: "Error screens",
      listBody: "Preview recovery states for broken drafts, crashes, missing routes, network loss, and service windows.",
    },
    asset: {
      locationMap: "LOCATION",
      locationUnavailable: "LOCATION UNAVAILABLE",
      openMapView: "VIEW ON MAP",
      listingExpert: "LISTING EXPERT",
      legalAgency: "LEGAL AGENCY",
      certifiedAdvisor: "CERTIFIED ADVISOR",
      totalInvestment: "TOTAL INVESTMENT",
      description: "DESCRIPTION",
      amenities: "AMENITIES",
      marketInsight: "MARKET INSIGHT",
    },
  },
  ar: {
    common: {
      back: "رجوع",
      close: "إغلاق",
      continue: "متابعة",
      skip: "تخطي",
      save: "حفظ",
      saved: "محفوظ",
      remove: "إزالة",
      retry: "إعادة المحاولة",
      search: "بحث",
      systemDefault: "اتباع النظام",
      language: "اللغة",
      appearance: "المظهر",
      profile: "الملف الشخصي",
      loading: "جارٍ التحميل",
      assetUnavailableTitle: "الأصل غير متاح",
      assetUnavailableBody: "تعذّر تحميل هذا الأصل أو لم يعد متاحًا.",
      noAmenitiesTitle: "لا توجد مرافق مسجلة",
      noAmenitiesBody: "لا توجد بيانات مرافق مباشرة لهذا الأصل حتى الآن.",
    },
    homeSearch: {
      placeholder: "ابحث عن مناطق وكمبوندات وأفكار أصلية...",
      buy: "شراء",
      rent: "إيجار",
      ready: "جاهز",
      projects: "مشروعات",
      topMatchesTitle: "أفضل التطابقات",
      topMatchesSubtitle: "مرتبة حسب تفضيلاتك الحالية.",
      searchTitle: "استكشف الأصول",
      searchSubtitle: "تصفح السوق المباشر مع فلاتر سريعة.",
      savedTitle: "الأصول المحفوظة",
      savedSubtitle: "قائمتك المختصرة جاهزة للرجوع إليها.",
      viewAll: "عرض الكل",
      emptySavedTitle: "لا توجد أصول محفوظة بعد",
      emptySavedBody: "احفظ أي أصل ليبقى قريبًا منك للمقارنة لاحقًا.",
      syncingSavedTitle: "جارٍ تحديث الأصول المحفوظة",
      syncingSavedBody: "قائمتك المختصرة تتم مزامنتها في الخلفية.",
    },
    assetCard: {
      topMatch: "أفضل تطابق",
      verified: "موثّق",
      viewDetails: "عرض التفاصيل",
      previousImage: "الصورة السابقة للأصل",
      nextImage: "الصورة التالية للأصل",
      saveAsset: "حفظ الأصل",
      removeSavedAsset: "إزالة الأصل من المفضلة",
      whatsapp: "واتساب",
      call: "اتصال",
      bed: "غرف",
      bath: "حمام",
      sqft: "قدم²",
      asset: "أصل",
      villa: "فيلا",
      studio: "استوديو",
      forSale: "للبيع",
      forRent: "للإيجار",
    },
    appSettings: {
      languageTitle: "اللغة",
      languageSubtitle: "اختر لغة التطبيق واتجاهه.",
      languageHeroTitle: "اختر لغة التطبيق",
      languageHeroBody: "غيّر النصوص والتنسيقات واتجاه الواجهة في التطبيق بالكامل.",
      systemOptionLabel: "لغة النظام",
      systemDescription: "اتبع لغة الهاتف تلقائيًا.",
      arabicDescription: "واجهة عربية باتجاه من اليمين إلى اليسار.",
      englishDescription: "واجهة إنجليزية باتجاه من اليسار إلى اليمين.",
      frenchDescription: "واجهة فرنسية باتجاه من اليسار إلى اليمين.",
      appearanceTitle: "المظهر",
      appearanceSubtitle: "النظام يستخدم الآن وضع {mode}.",
      appearanceHeroTitle: "اختر نمط العرض",
      appearanceHeroBody: "طبّق التغيير فورًا في التطبيق أو اتركه متزامنًا مع إعدادات جهازك.",
      appearanceSystemTitle: "النظام",
      appearanceSystemDescription: "اتبع مظهر الهاتف تلقائيًا.",
      appearanceLightTitle: "الفاتح",
      appearanceLightDescription: "أسطح واضحة وتباين مناسب للنهار.",
      appearanceDarkTitle: "الداكن",
      appearanceDarkDescription: "أسطح منخفضة الوهج للاستخدام ليلًا.",
    },
    menu: {
      title: "كانترا",
      researchArchive: "محادثات المساحة",
      workspaceTools: "مساحة كانترا",
      startConversation: "محادثة جديدة",
      untitledSearch: "بحث بدون عنوان",
      fullHistory: "عرض السجل الكامل",
      savedAssets: "الأصول المحفوظة",
      favoriteChats: "المحادثات المفضلة",
      userSettings: "إعدادات المساحة",
      errorScreens: "شاشات الأخطاء",
      syncResearchArchive: "سجل الدخول لمزامنة أرشيف البحث",
      loadConversationsError: "تعذر تحميل المحادثات",
      retry: "إعادة المحاولة",
    },
    profile: {
      account: "الحساب",
      security: "الأمان",
      services: "الخدمات",
      aiSearchStyle: "أسلوب البحث بالذكاء الاصطناعي",
      loginSecurity: "تسجيل الدخول والأمان",
      memoryPrivacy: "الذاكرة والخصوصية",
      subscription: "الاشتراك",
      marketAlerts: "تنبيهات السوق",
      notifications: "الإشعارات",
      notificationsDescription: "تذكيرات الجوال لأحداث التقويم والمهام وجداول الذكاء الاصطناعي",
      logInToSync: "سجل الدخول لمزامنة البحث",
      resetSession: "إعادة ضبط الجلسة",
      signOut: "تسجيل الخروج",
    },
    notifications: {
      title: "الإشعارات",
      subtitle: "سجل هذا الهاتف لتلقي تذكيرات الجوال من تقويم مساحة العمل والمهام وجداول الذكاء الاصطناعي.",
      checking: "جار فحص حالة الجهاز",
      enabled: "إشعارات الجوال مفعلة",
      disabled: "إشعارات الجوال معطلة",
      deviceToken: "الجهاز متصل. ينتهي الرمز بـ {last4}.",
      deviceReady: "هذا الهاتف متصل بتذكيرات قنطرة.",
      deviceMissing: "فعّل الإشعارات لتلقي التذكيرات على هذا الهاتف.",
      enable: "تفعيل الإشعارات",
      disable: "تعطيل الإشعارات",
      defaultsTitle: "توقيت التذكير الافتراضي",
      defaultsBody: "ترسل مساحة العمل تذكيرات التقويم قبل 30 دقيقة، وقبل 5 دقائق، وعند البداية. المهام تذكر قبل موعد الاستحقاق بـ 30 دقيقة.",
      calendar30: "تقويم 30د",
      calendar5: "تقويم 5د",
      calendarStart: "عند البداية",
      task30: "مهمة 30د",
      loadFailed: "تعذر تحميل حالة الإشعارات.",
      permissionDeniedTitle: "تم رفض الصلاحية",
      permissionDeniedBody: "اسمح بالإشعارات من إعدادات النظام لتلقي تذكيرات الجوال.",
      unsupportedTitle: "يلزم إصدار تطبيق",
      unsupportedBody: "تسجيل إشعارات الجوال يعمل على إصدارات تطبيق iOS وAndroid.",
      setupMissingTitle: "إعداد المشروع غير مكتمل",
      setupMissingBody: "معرف مشروع Expo مطلوب قبل إنشاء رموز الإشعارات.",
      enableFailedTitle: "تعذر تفعيل الإشعارات",
      enableFailedBody: "أعد المحاولة بعد التحقق من اتصال الشبكة.",
      disableFailedTitle: "تعذر تعطيل الإشعارات",
      disableFailedBody: "أعد المحاولة بعد التحقق من اتصال الشبكة.",
    },
    saved: {
      title: "المفضلة",
      searchPlaceholder: "ابحث داخل المحادثات المفضلة...",
      emptyTitle: "لا توجد مفضلة بعد",
      emptyBody: "ميّز محادثات الذكاء الاصطناعي المهمة بنجمة لتبقى قريبة.",
      noMatchesTitle: "لا توجد نتائج مطابقة",
      noMatchesBody: "جرّب كلمة مختلفة للبحث داخل محادثاتك المفضلة.",
      removeFavorite: "إزالة المحادثة من المفضلة",
    },
    listing: {
      searchPlaceholder: "ابحث عن المناطق...",
      filterButton: "الفلاتر",
      mapButton: "الخريطة",
      listButton: "القائمة",
      openAsset: "فتح الأصل",
      browseArea: "تصفّح المنطقة",
      mapTitle: "استكشف على الخريطة",
      mapSubtitle: "اضغط على أي علامة لمعاينة الأصل في تلك المنطقة.",
      mapSelectedLabel: "الأصل المحدد",
      mapUnavailableTitle: "الخريطة غير متاحة هنا",
      mapUnavailableBody: "افتح هذه الشاشة على نسخة تطوير iOS أو Android لتصفّح الأصول على الخريطة.",
      mapTokenMissingTitle: "رمز Mapbox غير موجود",
      mapTokenMissingBody: "أضف EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN لتشغيل خريطة الأصول في نسخة التطوير.",
      mapSettingsTitle: "إعدادات الخريطة",
      mapTypeTitle: "نوع الخريطة",
      mapStandard: "قياسية",
      mapSatellite: "قمر صناعي",
      pointsOfInterestTitle: "نقاط الاهتمام",
      schoolsTitle: "مدارس وتعليم",
      schoolsBody: "إظهار المرافق التعليمية القريبة",
      hospitalsTitle: "مستشفيات وعيادات",
      hospitalsBody: "إظهار المراكز الطبية",
      retailTitle: "متاجر وبقالة",
      retailBody: "إظهار مراكز التسوق والأسواق",
      filterTitle: "فلترة الأصول",
      filterSubtitle: "حدّد الميزانية والموقع والتفاصيل الأساسية قبل التصفح.",
      priceTitle: "نطاق السعر",
      minPricePlaceholder: "أقل سعر",
      maxPricePlaceholder: "أعلى سعر",
      locationTitle: "المواقع",
      assetTypeTitle: "نوع الأصل",
      bedroomsTitle: "غرف النوم",
      bathroomsTitle: "الحمامات",
      anyOption: "أي عدد",
      resetFilters: "إعادة ضبط",
      applyFilters: "عرض النتائج",
      resultsSummary: "صفِّ النتائج حسب السعر والمواقع وتفاصيل الأصل.",
      filters: {
        all: "الكل",
        forSale: "للبيع",
        forRent: "للإيجار",
        villas: "فلل",
        assets: "أصول",
        studios: "استوديوهات",
      },
      stillConnectingTitle: "ما زلنا نتصل",
      stillConnectingBody: "ننتظر تحميل الأصول المباشرة الخاصة بك.",
      emptyTitle: "لا توجد أصول بعد",
      emptyBody: "ستظهر الأصول هنا عندما تصبح القائمة المباشرة متاحة.",
      noResultsTitle: "لم نجد أصول",
      noResultsBody: "جرّب بحثًا أو فلترًا مختلفًا لرؤية خيارات أكثر.",
    },
    theories: {
      title: "الأرشيف",
      searchPlaceholder: "ابحث في المحادثات...",
      emptyPrefix: "لا توجد نتائج مطابقة لـ",
      untitled: "بحث بدون عنوان",
      openThreadBody: "افتح هذه المحادثة لمتابعة البحث.",
    },
    auth: {
      wordmark: "كانترا",
      landingPhrases: [
        "كل شغلك الأصلي في محادثة واحدة.",
        "ابحث وتابع عملاءك من هاتفك.",
        "كانترا تقرّب القرار وتختصر الطريق.",
      ],
      legalNotice: "بالمتابعة، توافق على",
      termsOfService: "الشروط",
      privacyPolicy: "سياسة الخصوصية",
      copyright: "© 2026 Qentrah",
      signInUnavailableTitle: "تسجيل الدخول غير متاح",
      signInUnavailableBody: "تعذر بدء تسجيل الدخول.",
      continueWithApple: "المتابعة باستخدام Apple",
      continueWithGoogle: "المتابعة باستخدام Google",
      continueWithEmail: "المتابعة بالبريد الإلكتروني",
      emailOptionsTitle: "الوصول إلى الحساب",
      emailOptionsHeroTitle: "استخدم البريد الإلكتروني",
      emailOptionsHeroBody: "سجّل الدخول أو أنشئ حسابًا بكلمة مرور آمنة.",
      logIn: "تسجيل الدخول",
      createAccount: "إنشاء حساب",
      loginHeader: "تسجيل الدخول",
      loginTitle: "أهلًا بعودتك",
      loginBodyUpgrade: "تابع إلى مساحة العمل ومحادثات الذكاء الاصطناعي.",
      loginBodyDefault: "أدخل بريدك الإلكتروني وكلمة المرور.",
      establishSecurity: "تسجيل الدخول",
      signingIn: "جارٍ تسجيل الدخول...",
      forgotPassword: "هل نسيت كلمة المرور؟",
      missingDetailsTitle: "بيانات ناقصة",
      loginMissingDetailsBody: "أدخل بريدك الإلكتروني وكلمة المرور للمتابعة.",
      signInFailedTitle: "فشل تسجيل الدخول",
      tryAgain: "حاول مرة أخرى",
      registerHeader: "إنشاء حساب",
      registerTitle: "أنشئ حسابك",
      registerBodyUpgrade: "ابدأ بحسابك، ثم أنشئ مساحة عمل أو انضم إليها.",
      registerBodyDefault: "ابدأ بحسابك، ثم أنشئ مساحة عمل أو انضم إليها.",
      initializeEnvironment: "إنشاء الحساب",
      initializing: "جارٍ الإنشاء...",
      registerFailedTitle: "فشل إنشاء الحساب",
      registerMissingDetailsBody: "الاسم والبريد الإلكتروني وكلمة المرور كلها مطلوبة.",
      forgotHeader: "الاستعادة",
      forgotTitle: "استعادة الوصول",
      forgotBody: "أدخل بريدك الإلكتروني لاستعادة هويتك بأمان.",
      requestResetLink: "طلب رابط إعادة التعيين",
      sending: "جارٍ الإرسال...",
      missingDetailTitle: "تفصيل ناقص",
      missingDetailBody: "أدخل بريدك الإلكتروني لطلب رابط إعادة التعيين.",
      resetLinkSentTitle: "تم إرسال رابط إعادة التعيين",
      resetLinkSentBody: "تحقق من بريدك الإلكتروني واتبع التعليمات لإعادة تعيين كلمة المرور.",
      backToLogin: "العودة لتسجيل الدخول",
      resetFailedTitle: "فشل إعادة التعيين",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      fullName: "الاسم الكامل",
      emailPlaceholder: "name@example.com",
      passwordPlaceholder: "كلمة المرور",
      namePlaceholder: "أحمد منصور",
      passwordMinPlaceholder: "8 أحرف على الأقل",
    },
    workspaceAccess: {
      eyebrow: "المساحة",
      title: "مساحة العمل",
      body: "اختر أو أنشئ أو انضم",
      loading: "جارٍ التحميل",
      errorTitle: "المساحة غير متاحة",
      errorBody: "تعذر تحديث الوصول إلى المساحة.",
      untitledWorkspace: "مساحة بدون اسم",
      joinTitle: "انضم بدعوة",
      joinBody: "الصق رابطًا أو رمزًا",
      joinButton: "انضم",
      invitePlaceholder: "رابط الدعوة أو الرمز",
      inviteRequired: "الصق رابط الدعوة أو الرمز للمتابعة.",
      createTitle: "إنشاء",
      createBody: "ابدأ مساحة عمل",
      createButton: "إنشاء",
      namePlaceholder: "اسم مساحة العمل",
      nameRequired: "أدخل اسم مساحة العمل.",
      yourWorkspaces: "مساحاتك",
      setupAccess: "إعداد الوصول",
      typeBroker: "وسيط",
      typeDeveloper: "مطوّر",
      inviteEyebrow: "دعوة منظمة",
      signInInviteTitle: "سجّل الدخول",
      signInInviteBody: "بعدها تفتح الدعوة هنا",
      acceptingTitle: "جارٍ الانضمام",
      acceptingBody: "نقبل الدعوة",
      acceptedTitle: "تم الانضمام",
      acceptedBody: "نفتح Qentrah",
      acceptErrorTitle: "الدعوة غير متاحة",
      acceptErrorBody: "تعذر قبول هذه الدعوة.",
      invitationUnsupported: "افتح رابط الدعوة كاملًا أو الصق رمز الدعوة.",
      chooseWorkspaceButton: "اختيار",
      organizationSettingsTitle: "المنظمة",
      organizationSettingsBody: "إدارة الوصول للمساحة والدعوات.",
      activeWorkspace: "المساحة الحالية",
      createInviteLink: "رابط دعوة",
      inviteLinkCreated: "الرابط جاهز",
      inviteLinkCopied: "تم نسخ الرابط",
      switchWorkspace: "تبديل",
      continueWorkspace: "متابعة",
      useAnotherAccount: "استخدام حساب آخر",
    },
    onboarding: {
      locationsTitle: "خصّص تجربتك",
      locationsBody: "أين تبحث للشراء أو الاستثمار؟ اختر كل ما ينطبق.",
      budgetTitle: "الميزانية",
      budgetBody: "ما هي ميزانية الاستثمار المناسبة لك؟ اختر نطاقًا أساسيًا.",
      typesTitle: "نوع الأصل",
      typesBody: "اختر أنواع الأصول التي تناسب ذوقك المعماري.",
      completeJourney: "إكمال الرحلة",
      currency: "جنيه",
    },
    errorList: {
      listEyebrow: "حالات النظام",
      listTitle: "شاشات الأخطاء",
      listBody: "استعرض حالات الاستعادة للمسودات المعطلة والانهيارات والروابط المفقودة وانقطاع الشبكة ونوافذ الخدمة.",
    },
    asset: {
      locationMap: "الموقع",
      locationUnavailable: "الموقع غير متاح",
      openMapView: "عرض على الخريطة",
      listingExpert: "خبير القوائم",
      legalAgency: "الوكالة القانونية",
      certifiedAdvisor: "مستشار معتمد",
      totalInvestment: "إجمالي الاستثمار",
      description: "الوصف",
      amenities: "المرافق",
      marketInsight: "رؤى السوق",
    },
  },
  fr: {
    common: {
      back: "Retour",
      close: "Fermer",
      continue: "Continuer",
      skip: "Passer",
      save: "Enregistrer",
      saved: "Enregistré",
      remove: "Retirer",
      retry: "Réessayer",
      search: "Rechercher",
      systemDefault: "Suivre le système",
      language: "Langue",
      appearance: "Apparence",
      profile: "Profil",
      loading: "Chargement",
      assetUnavailableTitle: "Actif indisponible",
      assetUnavailableBody: "Ce actif n’a pas pu être chargé ou n’est plus disponible.",
      noAmenitiesTitle: "Aucun équipement indiqué",
      noAmenitiesBody: "Ce actif n’a pas encore de données d’équipements en direct.",
    },
    homeSearch: {
      placeholder: "Recherchez des zones, compounds et idées immobilières...",
      buy: "ACHAT",
      rent: "LOCATION",
      ready: "Prêt",
      projects: "Projets",
      topMatchesTitle: "Meilleures correspondances",
      topMatchesSubtitle: "Classées selon vos préférences actuelles.",
      searchTitle: "Explorer les actifs",
      searchSubtitle: "Parcourez le marché en direct avec des filtres rapides.",
      savedTitle: "Actifs enregistrés",
      savedSubtitle: "Votre sélection reste prête à être revisitée.",
      viewAll: "Voir tout",
      emptySavedTitle: "Aucun actif enregistré",
      emptySavedBody: "Enregistrez un actif pour le garder à portée de comparaison.",
      syncingSavedTitle: "Actualisation des actifs enregistrés",
      syncingSavedBody: "Votre sélection se synchronise en arrière-plan.",
    },
    assetCard: {
      topMatch: "Top match",
      verified: "Vérifié",
      viewDetails: "Voir les détails",
      previousImage: "Image précédente du actif",
      nextImage: "Image suivante du actif",
      saveAsset: "Enregistrer le actif",
      removeSavedAsset: "Retirer le actif des favoris",
      whatsapp: "WhatsApp",
      call: "Appeler",
      bed: "ch",
      bath: "sdb",
      sqft: "pi²",
      asset: "Actif",
      villa: "Villa",
      studio: "Studio",
      forSale: "À vendre",
      forRent: "À louer",
    },
    appSettings: {
      languageTitle: "Langue",
      languageSubtitle: "Choisissez la langue et le sens de l’interface.",
      languageHeroTitle: "Choisissez la langue de l’application",
      languageHeroBody: "Modifiez les textes, formats et le sens de lecture dans toute l’application mobile.",
      systemOptionLabel: "Suivre le système",
      systemDescription: "Suivre automatiquement la langue du téléphone.",
      arabicDescription: "Interface arabe de droite à gauche.",
      englishDescription: "Interface anglaise de gauche à droite.",
      frenchDescription: "Interface française de gauche à droite.",
      appearanceTitle: "Apparence",
      appearanceSubtitle: "Le système utilise actuellement le mode {mode}.",
      appearanceHeroTitle: "Choisissez votre mode d’affichage",
      appearanceHeroBody: "Appliquez les changements instantanément ou restez synchronisé avec votre appareil.",
      appearanceSystemTitle: "Système",
      appearanceSystemDescription: "Suit automatiquement l’apparence du téléphone.",
      appearanceLightTitle: "Clair",
      appearanceLightDescription: "Surfaces lumineuses et contraste net.",
      appearanceDarkTitle: "Sombre",
      appearanceDarkDescription: "Surfaces moins lumineuses pour le soir.",
    },
    menu: {
      title: "Qentrah",
      researchArchive: "Conversations de l’espace",
      workspaceTools: "Qentrah Workspace",
      startConversation: "Nouvelle conversation",
      untitledSearch: "Recherche sans titre",
      fullHistory: "Voir tout l’historique",
      savedAssets: "Actifs enregistrés",
      favoriteChats: "Chats favoris",
      userSettings: "Paramètres de l’espace",
      errorScreens: "Écrans d’erreur",
      syncResearchArchive: "Connectez-vous pour synchroniser vos recherches",
      loadConversationsError: "Impossible de charger les conversations",
      retry: "Réessayer",
    },
    profile: {
      account: "Compte",
      security: "Sécurité",
      services: "Services",
      aiSearchStyle: "Style de recherche IA",
      loginSecurity: "Connexion et sécurité",
      memoryPrivacy: "Mémoire et confidentialité",
      subscription: "Abonnement",
      marketAlerts: "Alertes marché",
      notifications: "Notifications",
      notificationsDescription: "Rappels mobiles pour le calendrier, les tâches et les plannings IA",
      logInToSync: "Se connecter pour synchroniser la recherche",
      resetSession: "Réinitialiser la session",
      signOut: "Se déconnecter",
    },
    notifications: {
      title: "Notifications",
      subtitle: "Enregistrez ce téléphone pour recevoir les rappels mobiles du calendrier, des tâches et des plannings IA.",
      checking: "Vérification de l’appareil",
      enabled: "Notifications mobiles activées",
      disabled: "Notifications mobiles désactivées",
      deviceToken: "Appareil connecté. Le jeton se termine par {last4}.",
      deviceReady: "Ce téléphone est connecté aux rappels Qentrah.",
      deviceMissing: "Activez les notifications pour recevoir les rappels sur ce téléphone.",
      enable: "Activer les notifications",
      disable: "Désactiver les notifications",
      defaultsTitle: "Timing par défaut",
      defaultsBody: "L’espace envoie les rappels calendrier 30 minutes avant, 5 minutes avant et au début. Les tâches rappellent 30 minutes avant l’échéance.",
      calendar30: "Calendrier 30m",
      calendar5: "Calendrier 5m",
      calendarStart: "Au début",
      task30: "Tâche 30m",
      loadFailed: "Impossible de charger l’état des notifications.",
      permissionDeniedTitle: "Autorisation refusée",
      permissionDeniedBody: "Autorisez les notifications dans les réglages système pour recevoir les rappels mobiles.",
      unsupportedTitle: "Build d’application requis",
      unsupportedBody: "L’enregistrement push fonctionne sur les builds iOS et Android.",
      setupMissingTitle: "Configuration incomplète",
      setupMissingBody: "L’identifiant de projet Expo est requis pour créer les jetons push.",
      enableFailedTitle: "Impossible d’activer",
      enableFailedBody: "Réessayez après avoir vérifié votre connexion réseau.",
      disableFailedTitle: "Impossible de désactiver",
      disableFailedBody: "Réessayez après avoir vérifié votre connexion réseau.",
    },
    saved: {
      title: "Favoris",
      searchPlaceholder: "Rechercher dans les chats favoris...",
      emptyTitle: "Aucun favori pour l’instant",
      emptyBody: "Ajoutez une étoile aux conversations IA importantes pour les retrouver vite.",
      noMatchesTitle: "Aucun favori correspondant",
      noMatchesBody: "Essayez un autre mot-clé pour vos chats favoris.",
      removeFavorite: "Retirer le chat des favoris",
    },
    listing: {
      searchPlaceholder: "Rechercher des zones...",
      filterButton: "Filtres",
      mapButton: "Carte",
      listButton: "Liste",
      openAsset: "Ouvrir le actif",
      browseArea: "Voir la zone",
      mapTitle: "Explorer sur la carte",
      mapSubtitle: "Touchez un repère pour prévisualiser un actif dans cette zone.",
      mapSelectedLabel: "Actif sélectionné",
      mapUnavailableTitle: "Carte indisponible ici",
      mapUnavailableBody: "Ouvrez cet écran sur une build de développement iOS ou Android pour parcourir les actifs sur la carte.",
      mapTokenMissingTitle: "Jeton Mapbox manquant",
      mapTokenMissingBody: "Ajoutez EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN pour charger la carte des actifs dans les builds de développement.",
      mapSettingsTitle: "Paramètres de carte",
      mapTypeTitle: "Type de carte",
      mapStandard: "Standard",
      mapSatellite: "Satellite",
      pointsOfInterestTitle: "Points d’intérêt",
      schoolsTitle: "Écoles et éducation",
      schoolsBody: "Afficher les établissements scolaires à proximité",
      hospitalsTitle: "Hôpitaux et cliniques",
      hospitalsBody: "Afficher les centres médicaux",
      retailTitle: "Commerces et épiceries",
      retailBody: "Afficher les centres commerciaux et marchés",
      filterTitle: "Filtrer les actifs",
      filterSubtitle: "Affinez par budget, emplacement et besoins avant d’explorer davantage.",
      priceTitle: "Fourchette de prix",
      minPricePlaceholder: "Prix min",
      maxPricePlaceholder: "Prix max",
      locationTitle: "Emplacements",
      assetTypeTitle: "Type de actif",
      bedroomsTitle: "Chambres",
      bathroomsTitle: "Salles de bain",
      anyOption: "Peu importe",
      resetFilters: "Réinitialiser",
      applyFilters: "Afficher les résultats",
      resultsSummary: "Affinez par prix, emplacements et détails du actif.",
      filters: {
        all: "Tout",
        forSale: "À vendre",
        forRent: "À louer",
        villas: "Villas",
        assets: "Actifs",
        studios: "Studios",
      },
      stillConnectingTitle: "Connexion en cours",
      stillConnectingBody: "Nous attendons le chargement de vos annonces en direct.",
      emptyTitle: "Aucun actif pour l’instant",
      emptyBody: "Les actifs apparaîtront ici quand votre inventaire sera disponible.",
      noResultsTitle: "Aucun actif trouvé",
      noResultsBody: "Essayez une autre recherche ou un autre filtre.",
    },
    theories: {
      title: "Archive",
      searchPlaceholder: "Rechercher des conversations...",
      emptyPrefix: "Aucune théorie trouvée pour",
      untitled: "Recherche sans titre",
      openThreadBody: "Ouvrez ce fil pour poursuivre la recherche.",
    },
    auth: {
      wordmark: "QENTRAH",
      landingPhrases: [
        "Votre agence travaille depuis le chat.",
        "Cherchez, suivez et avancez depuis votre téléphone.",
        "Un espace de travail plus intelligent, sans bureau.",
      ],
      legalNotice: "En continuant, vous acceptez les",
      termsOfService: "Conditions",
      privacyPolicy: "Politique de confidentialité",
      copyright: "© 2026 Qentrah",
      signInUnavailableTitle: "Connexion indisponible",
      signInUnavailableBody: "Impossible de démarrer la connexion.",
      continueWithApple: "Continuer avec Apple",
      continueWithGoogle: "Continuer avec Google",
      continueWithEmail: "Continuer avec l’e-mail",
      emailOptionsTitle: "Accès au compte",
      emailOptionsHeroTitle: "Utiliser l’e-mail",
      emailOptionsHeroBody: "Connectez-vous ou créez un compte avec un mot de passe sécurisé.",
      logIn: "Connexion",
      createAccount: "Créer un compte",
      loginHeader: "Connexion",
      loginTitle: "Bon retour",
      loginBodyUpgrade: "Continuez vers votre espace et vos conversations IA.",
      loginBodyDefault: "Entrez votre e-mail et mot de passe.",
      establishSecurity: "Se connecter",
      signingIn: "Connexion...",
      forgotPassword: "Mot de passe oublié ?",
      missingDetailsTitle: "Informations manquantes",
      loginMissingDetailsBody: "Saisissez votre e-mail et mot de passe pour continuer.",
      signInFailedTitle: "Échec de connexion",
      tryAgain: "Réessayer",
      registerHeader: "Créer un compte",
      registerTitle: "Créez votre compte",
      registerBodyUpgrade: "Commencez par votre compte, puis créez ou rejoignez un espace.",
      registerBodyDefault: "Commencez par votre compte, puis créez ou rejoignez un espace.",
      initializeEnvironment: "Créer le compte",
      initializing: "Création...",
      registerFailedTitle: "Échec de création du compte",
      registerMissingDetailsBody: "Le nom, l’e-mail et le mot de passe sont obligatoires.",
      forgotHeader: "Récupération",
      forgotTitle: "Rétablir l’accès",
      forgotBody: "Entrez votre e-mail pour récupérer votre identité en toute sécurité.",
      requestResetLink: "Demander un lien",
      sending: "Envoi...",
      missingDetailTitle: "Information manquante",
      missingDetailBody: "Entrez votre e-mail pour demander un lien de réinitialisation.",
      resetLinkSentTitle: "Lien envoyé",
      resetLinkSentBody: "Vérifiez votre e-mail et suivez les instructions.",
      backToLogin: "Retour à la connexion",
      resetFailedTitle: "Échec de réinitialisation",
      email: "E-mail",
      password: "Mot de passe",
      fullName: "Nom complet",
      emailPlaceholder: "name@example.com",
      passwordPlaceholder: "Votre mot de passe",
      namePlaceholder: "Ahmed Mansour",
      passwordMinPlaceholder: "Au moins 8 caractères",
    },
    workspaceAccess: {
      eyebrow: "Espace",
      title: "Espace",
      body: "Choisir, créer ou rejoindre.",
      loading: "Chargement",
      errorTitle: "Espace indisponible",
      errorBody: "Impossible de mettre à jour l’accès.",
      untitledWorkspace: "Espace sans nom",
      joinTitle: "Rejoindre",
      joinBody: "Collez un lien ou un code.",
      joinButton: "Rejoindre",
      invitePlaceholder: "Lien ou code d’invitation",
      inviteRequired: "Collez un lien ou un code pour continuer.",
      createTitle: "Créer",
      createBody: "Démarrer un espace.",
      createButton: "Créer",
      namePlaceholder: "Nom de l’espace",
      nameRequired: "Entrez le nom de l’espace.",
      yourWorkspaces: "Vos espaces",
      setupAccess: "Configurer l’accès",
      typeBroker: "Courtier",
      typeDeveloper: "Promoteur",
      inviteEyebrow: "Invitation organisation",
      signInInviteTitle: "Connectez-vous",
      signInInviteBody: "L’invitation s’ouvrira ici.",
      acceptingTitle: "Connexion",
      acceptingBody: "Acceptation de l’invitation.",
      acceptedTitle: "Rejoint",
      acceptedBody: "Ouverture de Qentrah.",
      acceptErrorTitle: "Invitation indisponible",
      acceptErrorBody: "Impossible d’accepter cette invitation.",
      invitationUnsupported: "Ouvrez le lien complet ou collez un jeton d’invitation.",
      chooseWorkspaceButton: "Choisir",
      organizationSettingsTitle: "Organisation",
      organizationSettingsBody: "Gérez l’accès et les invitations.",
      activeWorkspace: "Espace actif",
      createInviteLink: "Lien d’invitation",
      inviteLinkCreated: "Lien prêt",
      inviteLinkCopied: "Lien copié.",
      switchWorkspace: "Changer",
      continueWorkspace: "Continuer",
      useAnotherAccount: "Utiliser un autre compte",
    },
    onboarding: {
      locationsTitle: "Personnaliser",
      locationsBody: "Où cherchez-vous à acheter ou investir ? Sélectionnez tout ce qui s’applique.",
      budgetTitle: "Budget",
      budgetBody: "Quel est votre budget d’investissement souhaité ? Choisissez une base.",
      typesTitle: "Architecture",
      typesBody: "Sélectionnez les types de actifs qui correspondent à votre goût.",
      completeJourney: "Terminer le parcours",
      currency: "EGP",
    },
    errorList: {
      listEyebrow: "ÉTATS DU SYSTÈME",
      listTitle: "Écrans d'erreur",
      listBody: "Aperçu des états de récupération pour les brouillons cassés, les plantages, les routes manquantes, les pertes de réseau et les fenêtres de service.",
    },
    asset: {
      locationMap: "LOCALISATION",
      locationUnavailable: "LOCALISATION INDISPONIBLE",
      openMapView: "VOIR SUR LA CARTE",
      listingExpert: "EXPERT EN LISTING",
      legalAgency: "AGENCE LÉGALE",
      certifiedAdvisor: "CONSEILLER CERTIFIÉ",
      totalInvestment: "INVESTISSEMENT TOTAL",
      description: "DESCRIPTION",
      amenities: "ÉQUIPEMENTS",
      marketInsight: "APERÇU DU MARCHÉ",
    },
  },
};

export function getMobileDictionary(locale: AppLocale): MobileDictionary {
  return dictionaries[locale];
}
