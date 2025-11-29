import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.findHelpers": "Find Helpers",
    "nav.postJob": "Post a Job",
    "nav.pricing": "Pricing",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "nav.dashboard": "Dashboard",
    "nav.logout": "Logout",
    "nav.becomeAgent": "Become an Agent",
    "nav.about": "About Us",
    "nav.contact": "Contact",
    "hero.title": "Find Trusted Helpers in Jaipur",
    "hero.subtitle": "Connect with verified maids, drivers, carpenters, factory workers, and more. KYC verified profiles you can trust.",
    "hero.searchPlaceholder": "Search by skill or job type...",
    "hero.findHelpers": "Find Helpers",
    "hero.postJob": "Post a Job",
    "hero.verifiedWorkers": "Verified Workers",
    "hero.happyEmployers": "Happy Employers",
    "hero.policeVerified": "Police Verified Options",
    "categories.title": "Popular Categories",
    "categories.viewAll": "View All Categories",
    "areas.title": "Popular Areas in Jaipur",
    "areas.viewAll": "View All Areas",
    "search.filters": "Filters",
    "search.category": "Category",
    "search.area": "Area",
    "search.experience": "Experience",
    "search.salary": "Salary Range",
    "search.gender": "Gender",
    "search.workType": "Work Type",
    "search.applyFilters": "Apply Filters",
    "search.clearFilters": "Clear Filters",
    "search.results": "results found",
    "search.noResults": "No workers found matching your criteria",
    "worker.viewContact": "View Contact",
    "worker.experience": "years experience",
    "worker.perMonth": "/month",
    "worker.perDay": "/day",
    "worker.verified": "Verified",
    "worker.policeVerified": "Police Verified",
    "worker.premium": "Premium",
    "worker.save": "Save",
    "worker.saved": "Saved",
    "worker.contactLocked": "Subscribe to view contact details",
    "subscription.title": "Choose Your Plan",
    "subscription.free": "Free",
    "subscription.basic": "Basic",
    "subscription.premium": "Premium",
    "subscription.business": "Business",
    "subscription.mostPopular": "Most Popular",
    "subscription.perMonth": "/month",
    "subscription.contacts": "contact views",
    "subscription.unlimited": "Unlimited",
    "subscription.jobPosts": "job posts",
    "subscription.whatsapp": "WhatsApp access",
    "subscription.multiUser": "multi-user access",
    "subscription.subscribe": "Subscribe Now",
    "subscription.currentPlan": "Current Plan",
    "job.postTitle": "Post a Job",
    "job.title": "Job Title",
    "job.description": "Job Description",
    "job.category": "Category",
    "job.area": "Area",
    "job.workersNeeded": "Workers Needed",
    "job.salaryRange": "Salary Range",
    "job.requirements": "Requirements",
    "job.submit": "Post Job",
    "dashboard.title": "Dashboard",
    "dashboard.savedWorkers": "Saved Workers",
    "dashboard.contactHistory": "Contact History",
    "dashboard.myJobs": "My Jobs",
    "dashboard.subscription": "Subscription",
    "agent.title": "Agent Dashboard",
    "agent.addWorker": "Add Worker",
    "agent.myWorkers": "My Workers",
    "agent.pendingApproval": "Pending Approval",
    "agent.performance": "Performance",
    "admin.title": "Admin Dashboard",
    "admin.overview": "Overview",
    "admin.workers": "Workers",
    "admin.agents": "Agents",
    "admin.subscriptions": "Subscriptions",
    "admin.approvals": "Approvals",
    "admin.analytics": "Analytics",
    "footer.tagline": "Connecting trusted helpers with employers in Jaipur",
    "footer.quickLinks": "Quick Links",
    "footer.forWorkers": "For Workers",
    "footer.support": "Support",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.faq": "FAQs",
    "common.loading": "Loading...",
    "common.error": "Something went wrong",
    "common.retry": "Retry",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.submit": "Submit",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.approve": "Approve",
    "common.reject": "Reject",
    "common.pending": "Pending",
    "common.active": "Active",
    "common.closed": "Closed",
  },
  hi: {
    "nav.home": "होम",
    "nav.findHelpers": "हेल्पर खोजें",
    "nav.postJob": "नौकरी पोस्ट करें",
    "nav.pricing": "प्राइसिंग",
    "nav.login": "लॉग इन",
    "nav.signup": "साइन अप",
    "nav.dashboard": "डैशबोर्ड",
    "nav.logout": "लॉग आउट",
    "nav.becomeAgent": "एजेंट बनें",
    "nav.about": "हमारे बारे में",
    "nav.contact": "संपर्क करें",
    "hero.title": "जयपुर में विश्वसनीय हेल्पर खोजें",
    "hero.subtitle": "वेरिफाइड मेड, ड्राइवर, कारपेंटर, फैक्ट्री वर्कर और अन्य से जुड़ें। KYC वेरिफाइड प्रोफाइल जिन पर आप भरोसा कर सकते हैं।",
    "hero.searchPlaceholder": "स्किल या जॉब टाइप से खोजें...",
    "hero.findHelpers": "हेल्पर खोजें",
    "hero.postJob": "नौकरी पोस्ट करें",
    "hero.verifiedWorkers": "वेरिफाइड वर्कर्स",
    "hero.happyEmployers": "खुश नियोक्ता",
    "hero.policeVerified": "पुलिस वेरिफाइड विकल्प",
    "categories.title": "लोकप्रिय श्रेणियां",
    "categories.viewAll": "सभी श्रेणियां देखें",
    "areas.title": "जयपुर के लोकप्रिय क्षेत्र",
    "areas.viewAll": "सभी क्षेत्र देखें",
    "search.filters": "फ़िल्टर",
    "search.category": "श्रेणी",
    "search.area": "क्षेत्र",
    "search.experience": "अनुभव",
    "search.salary": "वेतन सीमा",
    "search.gender": "लिंग",
    "search.workType": "कार्य प्रकार",
    "search.applyFilters": "फ़िल्टर लागू करें",
    "search.clearFilters": "फ़िल्टर साफ़ करें",
    "search.results": "परिणाम मिले",
    "search.noResults": "आपके मापदंड से मेल खाने वाले कोई वर्कर नहीं मिले",
    "worker.viewContact": "संपर्क देखें",
    "worker.experience": "वर्ष अनुभव",
    "worker.perMonth": "/महीना",
    "worker.perDay": "/दिन",
    "worker.verified": "वेरिफाइड",
    "worker.policeVerified": "पुलिस वेरिफाइड",
    "worker.premium": "प्रीमियम",
    "worker.save": "सेव करें",
    "worker.saved": "सेव किया",
    "worker.contactLocked": "संपर्क विवरण देखने के लिए सब्सक्राइब करें",
    "subscription.title": "अपना प्लान चुनें",
    "subscription.free": "फ्री",
    "subscription.basic": "बेसिक",
    "subscription.premium": "प्रीमियम",
    "subscription.business": "बिजनेस",
    "subscription.mostPopular": "सबसे लोकप्रिय",
    "subscription.perMonth": "/महीना",
    "subscription.contacts": "कॉन्टैक्ट व्यू",
    "subscription.unlimited": "असीमित",
    "subscription.jobPosts": "जॉब पोस्ट",
    "subscription.whatsapp": "व्हाट्सएप एक्सेस",
    "subscription.multiUser": "मल्टी-यूजर एक्सेस",
    "subscription.subscribe": "अभी सब्सक्राइब करें",
    "subscription.currentPlan": "वर्तमान प्लान",
    "job.postTitle": "नौकरी पोस्ट करें",
    "job.title": "नौकरी का शीर्षक",
    "job.description": "नौकरी का विवरण",
    "job.category": "श्रेणी",
    "job.area": "क्षेत्र",
    "job.workersNeeded": "आवश्यक वर्कर्स",
    "job.salaryRange": "वेतन सीमा",
    "job.requirements": "आवश्यकताएं",
    "job.submit": "जॉब पोस्ट करें",
    "dashboard.title": "डैशबोर्ड",
    "dashboard.savedWorkers": "सेव किए गए वर्कर्स",
    "dashboard.contactHistory": "कॉन्टैक्ट हिस्ट्री",
    "dashboard.myJobs": "मेरी नौकरियां",
    "dashboard.subscription": "सब्सक्रिप्शन",
    "agent.title": "एजेंट डैशबोर्ड",
    "agent.addWorker": "वर्कर जोड़ें",
    "agent.myWorkers": "मेरे वर्कर्स",
    "agent.pendingApproval": "स्वीकृति लंबित",
    "agent.performance": "प्रदर्शन",
    "admin.title": "एडमिन डैशबोर्ड",
    "admin.overview": "अवलोकन",
    "admin.workers": "वर्कर्स",
    "admin.agents": "एजेंट्स",
    "admin.subscriptions": "सब्सक्रिप्शन",
    "admin.approvals": "स्वीकृतियां",
    "admin.analytics": "एनालिटिक्स",
    "footer.tagline": "जयपुर में विश्वसनीय हेल्परों को नियोक्ताओं से जोड़ना",
    "footer.quickLinks": "त्वरित लिंक",
    "footer.forWorkers": "वर्कर्स के लिए",
    "footer.support": "सहायता",
    "footer.privacy": "गोपनीयता नीति",
    "footer.terms": "सेवा की शर्तें",
    "footer.faq": "अक्सर पूछे जाने वाले प्रश्न",
    "common.loading": "लोड हो रहा है...",
    "common.error": "कुछ गलत हो गया",
    "common.retry": "पुनः प्रयास करें",
    "common.cancel": "रद्द करें",
    "common.save": "सेव करें",
    "common.submit": "सबमिट करें",
    "common.edit": "संपादित करें",
    "common.delete": "हटाएं",
    "common.approve": "स्वीकृत करें",
    "common.reject": "अस्वीकार करें",
    "common.pending": "लंबित",
    "common.active": "सक्रिय",
    "common.closed": "बंद",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language");
      return (saved === "hi" ? "hi" : "en") as Language;
    }
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
