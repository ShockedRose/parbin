import { barX, barY, defineChart } from "@tanstack/charts"
import { Chart } from "@tanstack/charts/react"
import { scaleBand } from "@tanstack/charts/scales/band"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"
import { format } from "date-fns"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { getDateFnsLocale } from "@/lib/i18n-date"
import type { LabeledCount, MonthCount } from "@/types/dashboard"

const CHART_FILL = "var(--primary)"
const CHART_THEME = {
  foreground: "var(--foreground)",
  muted: "var(--muted-foreground)",
  grid: "var(--border)",
  background: "transparent",
} as const

function formatMonthLabel(
  month: string,
  locale: ReturnType<typeof getDateFnsLocale>
) {
  const [year, monthIndex] = month.split("-").map(Number)
  if (!year || !monthIndex) {
    return month
  }
  return format(new Date(year, monthIndex - 1, 1), "MMM yy", { locale })
}

function truncateLabel(value: string, max = 16) {
  return value.length > max ? `${value.slice(0, max)}…` : value
}

function integerTick(value: unknown) {
  return String(Math.round(Number(value)))
}

export function EventsByTagChart({ rows }: { rows: LabeledCount[] }) {
  const { t } = useTranslation()
  const eventsLabel = t("charts.events")
  const definition = useMemo(() => {
    const maxCount = Math.max(0, ...rows.map((row) => row.count))

    return defineChart({
      marks: [
        barX(rows, {
          x: "count",
          y: "label",
          fill: CHART_FILL,
          radius: 4,
          maxThickness: 18,
        }),
      ],
      x: {
        scale: () => scaleLinear().domain([0, Math.max(maxCount, 1)]),
        nice: true,
        grid: true,
        axis: {
          label: eventsLabel,
          ticks: { format: integerTick },
        },
      },
      y: {
        scale: () => scaleBand<string>().padding(0.18),
        axis: {
          ticks: { format: (value) => truncateLabel(String(value)) },
        },
      },
      theme: CHART_THEME,
      tooltip: {
        use: tooltip,
        className: "parbin-ts-tooltip",
        format: (point) => `${point.datum.label}: ${point.datum.count}`,
      },
    })
  }, [eventsLabel, rows])

  if (!rows.some((row) => row.count > 0)) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        {t("charts.noData")}
      </div>
    )
  }

  return (
    <Chart
      definition={definition}
      height={280}
      className="parbin-ts-chart w-full"
      ariaLabel={t("charts.eventsByTagAria")}
    />
  )
}

export function EventsByMonthChart({ rows }: { rows: MonthCount[] }) {
  const { t } = useTranslation()
  const dateLocale = getDateFnsLocale()
  const data = useMemo(
    () =>
      rows.map((row) => ({
        label: formatMonthLabel(row.month, dateLocale),
        count: row.count,
      })),
    [dateLocale, rows]
  )

  const definition = useMemo(() => {
    const maxCount = Math.max(0, ...data.map((row) => row.count))

    return defineChart({
      marks: [
        barY(data, {
          x: "label",
          y: "count",
          fill: CHART_FILL,
          radius: 4,
          maxThickness: 28,
        }),
      ],
      x: {
        scale: () => scaleBand<string>().padding(0.18),
      },
      y: {
        scale: () => scaleLinear().domain([0, Math.max(maxCount, 1)]),
        nice: true,
        grid: true,
        axis: {
          ticks: { format: integerTick },
        },
      },
      theme: CHART_THEME,
      tooltip: {
        use: tooltip,
        className: "parbin-ts-tooltip",
        format: (point) => `${point.datum.label}: ${point.datum.count}`,
      },
    })
  }, [data])

  return (
    <Chart
      definition={definition}
      height={280}
      className="parbin-ts-chart w-full"
      ariaLabel={t("charts.eventsByMonthAria")}
    />
  )
}
