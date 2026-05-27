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
    propertyUnavailableTitle: string;
    propertyUnavailableBody: string;
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
  propertyCard: {
    topMatch: string;
    verified: string;
    viewDetails: string;
    previousImage: string;
    nextImage: string;
    saveProperty: string;
    removeSavedProperty: string;
    whatsapp: string;
    call: string;
    bed: string;
    bath: string;
    sqft: string;
    apartment: string;
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
    savedProperties: string;
    favoriteChats: string;
    userSettings: string;
    errorScreens: string;
    syncResearchArchive: string;
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
    logInToSync: string;
    resetSession: string;
    signOut: string;
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
    openProperty: string;
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
    propertyTypeTitle: string;
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
      apartments: string;
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
  property: {
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
      propertyUnavailableTitle: "Property unavailable",
      propertyUnavailableBody: "This property could not be loaded or is no longer available.",
      noAmenitiesTitle: "No amenities listed",
      noAmenitiesBody: "This property does not have live amenities data yet.",
    },
    homeSearch: {
      placeholder: "Search areas, compounds, and property ideas...",
      buy: "BUY",
      rent: "RENT",
      ready: "Ready",
      projects: "Projects",
      topMatchesTitle: "Top matches",
      topMatchesSubtitle: "Ranked for your current preferences.",
      searchTitle: "Explore listings",
      searchSubtitle: "Browse the live market with quick filters.",
      savedTitle: "Saved properties",
      savedSubtitle: "Your shortlist stays ready to revisit.",
      viewAll: "View all",
      emptySavedTitle: "No saved properties yet",
      emptySavedBody: "Save a property to keep it close for later comparison.",
      syncingSavedTitle: "Refreshing saved homes",
      syncingSavedBody: "Your shortlist is syncing in the background.",
    },
    propertyCard: {
      topMatch: "Top Match",
      verified: "Verified",
      viewDetails: "View Details",
      previousImage: "Previous property image",
      nextImage: "Next property image",
      saveProperty: "Save property",
      removeSavedProperty: "Remove property from favorites",
      whatsapp: "WhatsApp",
      call: "Call",
      bed: "bed",
      bath: "bath",
      sqft: "sqft",
      apartment: "Apartment",
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
      title: "Menu",
      researchArchive: "Research archive",
      workspaceTools: "Workspace tools",
      startConversation: "Start new conversation",
      untitledSearch: "Untitled search",
      fullHistory: "View full history",
      savedProperties: "Saved properties",
      favoriteChats: "Favorite chats",
      userSettings: "User settings",
      errorScreens: "Error screens",
      syncResearchArchive: "Log in to sync your research archive",
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
      logInToSync: "Log in to sync research",
      resetSession: "Reset session",
      signOut: "Sign out",
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
      openProperty: "Open property",
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
      propertyTypeTitle: "Property type",
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
        apartments: "Apartments",
        studios: "Studios",
      },
      stillConnectingTitle: "Still connecting",
      stillConnectingBody: "We are waiting for your live listings to load.",
      emptyTitle: "No properties yet",
      emptyBody: "Listings will appear here once your live inventory is available.",
      noResultsTitle: "No properties found",
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
        "Smarter real estate work, no desk required.",
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
      typesBody: "Select the property types that match your architectural taste.",
      completeJourney: "Complete journey",
      currency: "EGP",
    },
    errorList: {
      listEyebrow: "SYSTEM STATES",
      listTitle: "Error screens",
      listBody: "Preview recovery states for broken drafts, crashes, missing routes, network loss, and service windows.",
    },
    property: {
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
      propertyUnavailableTitle: "العقار غير متاح",
      propertyUnavailableBody: "تعذّر تحميل هذا العقار أو لم يعد متاحًا.",
      noAmenitiesTitle: "لا توجد مرافق مسجلة",
      noAmenitiesBody: "لا توجد بيانات مرافق مباشرة لهذا العقار حتى الآن.",
    },
    homeSearch: {
      placeholder: "ابحث عن مناطق وكمبوندات وأفكار عقارية...",
      buy: "شراء",
      rent: "إيجار",
      ready: "جاهز",
      projects: "مشروعات",
      topMatchesTitle: "أفضل التطابقات",
      topMatchesSubtitle: "مرتبة حسب تفضيلاتك الحالية.",
      searchTitle: "استكشف العقارات",
      searchSubtitle: "تصفح السوق المباشر مع فلاتر سريعة.",
      savedTitle: "العقارات المحفوظة",
      savedSubtitle: "قائمتك المختصرة جاهزة للرجوع إليها.",
      viewAll: "عرض الكل",
      emptySavedTitle: "لا توجد عقارات محفوظة بعد",
      emptySavedBody: "احفظ أي عقار ليبقى قريبًا منك للمقارنة لاحقًا.",
      syncingSavedTitle: "جارٍ تحديث العقارات المحفوظة",
      syncingSavedBody: "قائمتك المختصرة تتم مزامنتها في الخلفية.",
    },
    propertyCard: {
      topMatch: "أفضل تطابق",
      verified: "موثّق",
      viewDetails: "عرض التفاصيل",
      previousImage: "الصورة السابقة للعقار",
      nextImage: "الصورة التالية للعقار",
      saveProperty: "حفظ العقار",
      removeSavedProperty: "إزالة العقار من المفضلة",
      whatsapp: "واتساب",
      call: "اتصال",
      bed: "غرف",
      bath: "حمام",
      sqft: "قدم²",
      apartment: "شقة",
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
      title: "القائمة",
      researchArchive: "أرشيف البحث",
      workspaceTools: "أدوات المساحة",
      startConversation: "ابدأ محادثة جديدة",
      untitledSearch: "بحث بدون عنوان",
      fullHistory: "عرض السجل الكامل",
      savedProperties: "العقارات المحفوظة",
      favoriteChats: "المحادثات المفضلة",
      userSettings: "إعدادات المستخدم",
      errorScreens: "شاشات الأخطاء",
      syncResearchArchive: "سجل الدخول لمزامنة أرشيف البحث",
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
      logInToSync: "سجل الدخول لمزامنة البحث",
      resetSession: "إعادة ضبط الجلسة",
      signOut: "تسجيل الخروج",
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
      openProperty: "فتح العقار",
      browseArea: "تصفّح المنطقة",
      mapTitle: "استكشف على الخريطة",
      mapSubtitle: "اضغط على أي علامة لمعاينة العقار في تلك المنطقة.",
      mapSelectedLabel: "العقار المحدد",
      mapUnavailableTitle: "الخريطة غير متاحة هنا",
      mapUnavailableBody: "افتح هذه الشاشة على نسخة تطوير iOS أو Android لتصفّح العقارات على الخريطة.",
      mapTokenMissingTitle: "رمز Mapbox غير موجود",
      mapTokenMissingBody: "أضف EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN لتشغيل خريطة العقارات في نسخة التطوير.",
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
      filterTitle: "فلترة العقارات",
      filterSubtitle: "حدّد الميزانية والموقع والتفاصيل الأساسية قبل التصفح.",
      priceTitle: "نطاق السعر",
      minPricePlaceholder: "أقل سعر",
      maxPricePlaceholder: "أعلى سعر",
      locationTitle: "المواقع",
      propertyTypeTitle: "نوع العقار",
      bedroomsTitle: "غرف النوم",
      bathroomsTitle: "الحمامات",
      anyOption: "أي عدد",
      resetFilters: "إعادة ضبط",
      applyFilters: "عرض النتائج",
      resultsSummary: "صفِّ النتائج حسب السعر والمواقع وتفاصيل العقار.",
      filters: {
        all: "الكل",
        forSale: "للبيع",
        forRent: "للإيجار",
        villas: "فلل",
        apartments: "شقق",
        studios: "استوديوهات",
      },
      stillConnectingTitle: "ما زلنا نتصل",
      stillConnectingBody: "ننتظر تحميل العقارات المباشرة الخاصة بك.",
      emptyTitle: "لا توجد عقارات بعد",
      emptyBody: "ستظهر العقارات هنا عندما تصبح القائمة المباشرة متاحة.",
      noResultsTitle: "لم نجد عقارات",
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
        "كل شغلك العقاري في محادثة واحدة.",
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
      typesTitle: "نوع العقار",
      typesBody: "اختر أنواع العقارات التي تناسب ذوقك المعماري.",
      completeJourney: "إكمال الرحلة",
      currency: "جنيه",
    },
    errorList: {
      listEyebrow: "حالات النظام",
      listTitle: "شاشات الأخطاء",
      listBody: "استعرض حالات الاستعادة للمسودات المعطلة والانهيارات والروابط المفقودة وانقطاع الشبكة ونوافذ الخدمة.",
    },
    property: {
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
      propertyUnavailableTitle: "Bien indisponible",
      propertyUnavailableBody: "Ce bien n’a pas pu être chargé ou n’est plus disponible.",
      noAmenitiesTitle: "Aucun équipement indiqué",
      noAmenitiesBody: "Ce bien n’a pas encore de données d’équipements en direct.",
    },
    homeSearch: {
      placeholder: "Recherchez des zones, compounds et idées immobilières...",
      buy: "ACHAT",
      rent: "LOCATION",
      ready: "Prêt",
      projects: "Projets",
      topMatchesTitle: "Meilleures correspondances",
      topMatchesSubtitle: "Classées selon vos préférences actuelles.",
      searchTitle: "Explorer les biens",
      searchSubtitle: "Parcourez le marché en direct avec des filtres rapides.",
      savedTitle: "Biens enregistrés",
      savedSubtitle: "Votre sélection reste prête à être revisitée.",
      viewAll: "Voir tout",
      emptySavedTitle: "Aucun bien enregistré",
      emptySavedBody: "Enregistrez un bien pour le garder à portée de comparaison.",
      syncingSavedTitle: "Actualisation des biens enregistrés",
      syncingSavedBody: "Votre sélection se synchronise en arrière-plan.",
    },
    propertyCard: {
      topMatch: "Top match",
      verified: "Vérifié",
      viewDetails: "Voir les détails",
      previousImage: "Image précédente du bien",
      nextImage: "Image suivante du bien",
      saveProperty: "Enregistrer le bien",
      removeSavedProperty: "Retirer le bien des favoris",
      whatsapp: "WhatsApp",
      call: "Appeler",
      bed: "ch",
      bath: "sdb",
      sqft: "pi²",
      apartment: "Appartement",
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
      title: "Menu",
      researchArchive: "Archive de recherche",
      workspaceTools: "Outils de l’espace",
      startConversation: "Nouvelle conversation",
      untitledSearch: "Recherche sans titre",
      fullHistory: "Voir tout l’historique",
      savedProperties: "Biens enregistrés",
      favoriteChats: "Chats favoris",
      userSettings: "Paramètres utilisateur",
      errorScreens: "Écrans d’erreur",
      syncResearchArchive: "Connectez-vous pour synchroniser vos recherches",
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
      logInToSync: "Se connecter pour synchroniser la recherche",
      resetSession: "Réinitialiser la session",
      signOut: "Se déconnecter",
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
      openProperty: "Ouvrir le bien",
      browseArea: "Voir la zone",
      mapTitle: "Explorer sur la carte",
      mapSubtitle: "Touchez un repère pour prévisualiser un bien dans cette zone.",
      mapSelectedLabel: "Bien sélectionné",
      mapUnavailableTitle: "Carte indisponible ici",
      mapUnavailableBody: "Ouvrez cet écran sur une build de développement iOS ou Android pour parcourir les biens sur la carte.",
      mapTokenMissingTitle: "Jeton Mapbox manquant",
      mapTokenMissingBody: "Ajoutez EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN pour charger la carte des biens dans les builds de développement.",
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
      filterTitle: "Filtrer les biens",
      filterSubtitle: "Affinez par budget, emplacement et besoins avant d’explorer davantage.",
      priceTitle: "Fourchette de prix",
      minPricePlaceholder: "Prix min",
      maxPricePlaceholder: "Prix max",
      locationTitle: "Emplacements",
      propertyTypeTitle: "Type de bien",
      bedroomsTitle: "Chambres",
      bathroomsTitle: "Salles de bain",
      anyOption: "Peu importe",
      resetFilters: "Réinitialiser",
      applyFilters: "Afficher les résultats",
      resultsSummary: "Affinez par prix, emplacements et détails du bien.",
      filters: {
        all: "Tout",
        forSale: "À vendre",
        forRent: "À louer",
        villas: "Villas",
        apartments: "Appartements",
        studios: "Studios",
      },
      stillConnectingTitle: "Connexion en cours",
      stillConnectingBody: "Nous attendons le chargement de vos annonces en direct.",
      emptyTitle: "Aucun bien pour l’instant",
      emptyBody: "Les biens apparaîtront ici quand votre inventaire sera disponible.",
      noResultsTitle: "Aucun bien trouvé",
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
        "Un immobilier plus intelligent, sans bureau.",
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
      typesBody: "Sélectionnez les types de biens qui correspondent à votre goût.",
      completeJourney: "Terminer le parcours",
      currency: "EGP",
    },
    errorList: {
      listEyebrow: "ÉTATS DU SYSTÈME",
      listTitle: "Écrans d'erreur",
      listBody: "Aperçu des états de récupération pour les brouillons cassés, les plantages, les routes manquantes, les pertes de réseau et les fenêtres de service.",
    },
    property: {
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
