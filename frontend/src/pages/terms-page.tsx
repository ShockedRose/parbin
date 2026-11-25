import { useTranslation } from "react-i18next"

import { LegalPage } from "@/components/legal-page"
import { readLegalSections } from "@/lib/legal"

const SECTION_ORDER = [
  "what",
  "info",
  "suggestions",
  "use",
  "thirdParty",
  "intellectualProperty",
  "availability",
  "liability",
  "law",
  "changes",
] as const

export function TermsPage() {
  const { t } = useTranslation()
  const sections = readLegalSections(t, "legal.terms.sections", SECTION_ORDER)

  return (
    <LegalPage
      title={t("legal.terms.title")}
      description={t("legal.terms.description")}
      sections={sections}
    />
  )
}
