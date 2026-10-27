import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import { en } from "@/i18n/locales/en"
import { es } from "@/i18n/locales/es"

export const DEFAULT_LANGUAGE = "es"
export const SUPPORTED_LANGUAGES = ["es", "en"] as const
export const LANGUAGE_STORAGE_KEY = "parbin.language"

export type Language = (typeof SUPPORTED_LANGUAGES)[number]

export function isLanguage(value: unknown): value is Language {
  return (
    typeof value === "string" && SUPPORTED_LANGUAGES.includes(value as Language)
  )
}

function readStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return isLanguage(stored) ? stored : DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: readStoredLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: [...SUPPORTED_LANGUAGES],
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
})

i18n.on("languageChanged", (language) => {
  if (!isLanguage(language)) {
    return
  }

  document.documentElement.lang = language

  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    /* storage can be unavailable in private browsing */
  }
})

document.documentElement.lang = i18n.language

export default i18n
