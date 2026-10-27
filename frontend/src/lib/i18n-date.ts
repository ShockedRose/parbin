import { enUS, es as esLocale, type Locale } from "date-fns/locale"

import i18n from "@/i18n"

export function getIntlLocale(): string {
  return i18n.resolvedLanguage === "en" ? "en-US" : "es-PA"
}

export function getDateFnsLocale(): Locale {
  return i18n.resolvedLanguage === "en" ? enUS : esLocale
}
