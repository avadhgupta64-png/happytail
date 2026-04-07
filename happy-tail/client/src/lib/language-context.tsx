import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type LangCode, getTranslation, LANGUAGES } from "./translations";

type LanguageContextType = {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: ReturnType<typeof getTranslation>;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: getTranslation("en"),
});

const STORAGE_KEY = "happytail_language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGUAGES.some(l => l.code === saved)) return saved as LangCode;
    }
    return "en";
  });

  const setLang = (newLang: LangCode) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  };

  const t = getTranslation(lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
