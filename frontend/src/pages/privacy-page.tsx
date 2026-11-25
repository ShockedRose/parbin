import { useTranslation } from "react-i18next"

import { LegalPage } from "@/components/legal-page"
import { readLegalSections } from "@/lib/legal"

const SECTION_ORDER = [
  "overview",
  "data",
  "purposes",
  "cookies",
  "sharing",
  "retention",
  "rights",
  "changes",
] as const

export function PrivacyPage() {
  const { t } = useTranslation()
  const sections = readLegalSections(t, "legal.privacy.sections", SECTION_ORDER)

  return (
    <LegalPage
      title={t("legal.privacy.title")}
      description={t("legal.privacy.description")}
      sections={sections}
    />
  )
}
