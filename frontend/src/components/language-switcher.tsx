import { useTranslation } from "react-i18next"
import { Languages } from "lucide-react"

import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { isLanguage } from "@/i18n"
import { cn } from "@/lib/utils"

export function LanguageSwitcher({ className }: { className?: string }) {
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className={cn("rounded-xl px-3", className)}
          aria-label={t("common.changeLanguage")}
        >
          <Languages />
          <span className="text-xs font-semibold uppercase">{language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44!">
        <DropdownMenuLabel>{t("common.language")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={language}
          onValueChange={(value) => {
            if (isLanguage(value)) {
              setLanguage(value)
            }
          }}
        >
          <DropdownMenuRadioItem value="es">
            {t("common.spanish")}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="en">
            {t("common.english")}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
