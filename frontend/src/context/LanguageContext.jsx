import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    newsletterTitle: "BE PART OF THE 7777 COMMUNITY",
    newsletterDesc: "Subscribe for early access, runway previews, and exclusive offers.",
    emailPlaceholder: "Your email",
    subscribeBtn: "SUBSCRIBE",
    aboutTitle: "ABOUT 7777",
    contactUs: "CONTACT US",
    termsConditions: "TERMS & CONDITIONS",
    privacyPolicy: "PRIVACY POLICY",
    returnsExchanges: "RETURNS & EXCHANGES",
    shippingPolicy: "SHIPPING POLICY",
    clientServicesTitle: "CLIENT SERVICES",
    onlineReturn: "ONLINE RETURN",
    storeLocator: "STORE LOCATOR",
    trackOrder: "TRACK ORDER",
    eGiftCard: "E GIFT CARD",
    faq: "FAQ",
    copyright: "© 2026 7777 fashion.",
    alertMessage: "Thanks for joining the 7777 community!"
  },
  ar: {
    newsletterTitle: "كن جزءاً من مجتمع 7777",
    newsletterDesc: "اشترك للحصول على وصول مبكر وعروض حصرية ومعاينة لأحدث التصاميم.",
    emailPlaceholder: "بريدك الإلكتروني",
    subscribeBtn: "اشترك",
    aboutTitle: "عن 7777",
    contactUs: "اتصل بنا",
    termsConditions: "الشروط والأحكام",
    privacyPolicy: "سياسة الخصوصية",
    returnsExchanges: "الإرجاع والاستبدال",
    shippingPolicy: "سياسة الشحن",
    clientServicesTitle: "خدمات العملاء",
    onlineReturn: "الإرجاع عبر الإنترنت",
    storeLocator: "فروعنا",
    trackOrder: "تتبع طلبك",
    eGiftCard: "بطاقة هدايا إلكترونية",
    faq: "الأسئلة الشائعة",
    copyright: "© 2026 7777 أزياء.",
    alertMessage: "شكراً لانضمامك إلى مجتمع 7777!"
  }
};

export const LanguageProvider = ({ children }) => {
  // Default to English as per user request
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = (lang) => {
    setLanguage(lang);
    // Update the document direction based on language
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    // Set initial direction
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
