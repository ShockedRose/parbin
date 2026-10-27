/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { useTranslation } from "react-i18next"

import i18n, { DEFAULT_LANGUAGE, isLanguage, type Language } from "@/i18n"

type LanguageProviderState = {
  language: Language
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
}

const LanguageProviderContext = React.createContext<
  LanguageProviderState | undefined
>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { t, i18n: i18nInstance } = useTranslation()
  const language = isLanguage(i18nInstance.resolvedLanguage)
    ? i18nInstance.resolvedLanguage
    : DEFAULT_LANGUAGE

  React.useEffect(() => {
    document.title = t("meta.title")
  }, [language, t])

  const setLanguage = React.useCallback((nextLanguage: Language) => {
    void i18n.changeLanguage(nextLanguage)
  }, [])

  const toggleLanguage = React.useCallback(() => {
    setLanguage(language === "es" ? "en" : "es")
  }, [language, setLanguage])

  const value = React.useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
    }),
    [language, setLanguage, toggleLanguage]
  )

  return (
    <LanguageProviderContext.Provider value={value}>
      {children}
    </LanguageProviderContext.Provider>
  )
}

export function useLanguage() {
  const context = React.useContext(LanguageProviderContext)

  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }

  return context
}
