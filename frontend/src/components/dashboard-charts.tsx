import { format } from "date-fns"
import type { TFunction } from "i18next"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  EventsByMonthChart,
  EventsByTagChart,
} from "@/components/tanstack-charts"
import { getDateFnsLocale } from "@/lib/i18n-date"
import { cn } from "@/lib/utils"
import type { AdminDashboard, LabeledCount } from "@/types/dashboard"

const STATUS_COLORS: Record<string, string> = {
  Pending: "var(--primary)",
  Approved: "#34d399",
  Rejected: "var(--accent)",
}

const SOURCE_COLORS: Record<string, string> = {
  Sourced: "var(--primary)",
  Manual: "var(--chart-2)",
  Community: "var(--chart-2)",
}

const DATA_LABEL_KEYS: Record<string, string> = {
  Pending: "status.pending",
  Approved: "status.approved",
  Rejected: "status.rejected",
  Sourced: "charts.sourced",
  Manual: "charts.manual",
  Community: "charts.community",
  Sun: "weekdays.sun",
  Mon: "weekdays.mon",
  Tue: "weekdays.tue",
  Wed: "weekdays.wed",
  Thu: "weekdays.thu",
  Fri: "weekdays.fri",
  Sat: "weekdays.sat",
}

const CHART_MARGIN = { top: 8, right: 8, left: 4, bottom: 4 }

type TooltipItem = {
  name?: string
  value?: number | string
  color?: string
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipItem[]
  label?: string | number
}) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      {label != null && label !== "" ? (
        <div className="mb-1 text-muted-foreground">{String(label)}</div>
      ) : null}
      {payload.map((item) => (
        <div
          key={item.name}
          className="flex items-center gap-2 text-foreground"
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: item.color }}
          />
          <span>{item.name}</span>
          <span className="ml-auto font-medium text-primary">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

function ChartCard({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-5 sm:p-6",
        className
      )}
    >
      <div className="mb-4">
        <div className="text-xs font-semibold text-primary">{eyebrow}</div>
        <h3 className="mt-1 font-serif text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function EmptyChart({ label }: { label?: string }) {
  const { t } = useTranslation()

  return (
    <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
      {label ?? t("charts.noData")}
    </div>
  )
}

function hasCounts(items: LabeledCount[]) {
  return items.some((item) => item.count > 0)
}

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

function localizeCounts(
  items: LabeledCount[],
  translate: TFunction,
  colors?: Record<string, string>
) {
  const data = items.map((item) => {
    const key = DATA_LABEL_KEYS[item.label]
    return {
      ...item,
      label: key ? translate(key) : item.label,
    }
  })

  const localizedColors: Record<string, string> = {}
  if (colors) {
    data.forEach((item, index) => {
      localizedColors[item.label] =
        colors[items[index].label] ?? "var(--primary)"
    })
  }

  return { data, colors: localizedColors }
}

function MixLegend({
  items,
  colors,
}: {
  items: LabeledCount[]
  colors: Record<string, string>
}) {
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: colors[item.label] ?? "var(--primary)" }}
          />
          <span className="text-muted-foreground">{item.label}</span>
          <span className="text-foreground">{item.count}</span>
        </div>
      ))}
    </div>
  )
}

function DonutChart({
  data,
  colors,
}: {
  data: LabeledCount[]
  colors: Record<string, string>
}) {
  if (!hasCounts(data)) {
    return <EmptyChart />
  }

  return (
    <>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={2}
              stroke="var(--card)"
            >
              {data.map((item) => (
                <Cell
                  key={item.label}
                  fill={colors[item.label] ?? "var(--primary)"}
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <MixLegend items={data} colors={colors} />
    </>
  )
}

function HorizontalBars({ data }: { data: LabeledCount[] }) {
  const { t } = useTranslation()

  if (!hasCounts(data)) {
    return <EmptyChart />
  }

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={CHART_MARGIN}>
          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="3 3"
            horizontal={false}
          />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={108}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: string) =>
              value.length > 16 ? `${value.slice(0, 16)}…` : value
            }
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "var(--muted)" }}
          />
          <Bar
            dataKey="count"
            name={t("charts.events")}
            fill="var(--primary)"
            radius={[0, 4, 4, 0]}
            maxBarSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DashboardCharts({ data }: { data: AdminDashboard }) {
  const { t } = useTranslation()
  const dateLocale = getDateFnsLocale()
  const suggestionsByMonth = data.suggestionsByMonth.map((row) => ({
    ...row,
    label: formatMonthLabel(row.month, dateLocale),
  }))
  const statusMix = localizeCounts(data.suggestionStatusMix, t, STATUS_COLORS)
  const eventSourceMix = localizeCounts(data.eventSourceMix, t, SOURCE_COLORS)
  const suggestionSourceMix = localizeCounts(
    data.suggestionSourceMix,
    t,
    SOURCE_COLORS
  )
  const weekdayMix = localizeCounts(data.eventsByWeekday, t)

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          eyebrow={t("charts.moderation")}
          title={t("charts.suggestionStatus")}
          description={t("charts.suggestionStatusDescription")}
        >
          <DonutChart data={statusMix.data} colors={statusMix.colors} />
        </ChartCard>

        <ChartCard
          eyebrow={t("charts.sources")}
          title={t("charts.catalogSourceMix")}
          description={t("charts.catalogSourceMixDescription")}
        >
          <DonutChart
            data={eventSourceMix.data}
            colors={eventSourceMix.colors}
          />
        </ChartCard>
      </div>

      <ChartCard
        eyebrow={t("charts.calendar")}
        title={t("charts.eventsByMonth")}
        description={t("charts.eventsByMonthDescription", {
          timezone: data.timezone,
        })}
      >
        <EventsByMonthChart rows={data.eventsByMonth} />
      </ChartCard>

      <ChartCard
        eyebrow={t("charts.review")}
        title={t("charts.suggestionsSubmitted")}
        description={t("charts.suggestionsSubmittedDescription")}
      >
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={suggestionsByMonth} margin={CHART_MARGIN}>
              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "var(--muted)" }}
              />
              <Bar
                dataKey="pending"
                name={t("status.pending")}
                stackId="status"
                fill={STATUS_COLORS.Pending}
                maxBarSize={28}
              />
              <Bar
                dataKey="approved"
                name={t("status.approved")}
                stackId="status"
                fill={STATUS_COLORS.Approved}
                maxBarSize={28}
              />
              <Bar
                dataKey="rejected"
                name={t("status.rejected")}
                stackId="status"
                fill={STATUS_COLORS.Rejected}
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <MixLegend items={statusMix.data} colors={statusMix.colors} />
      </ChartCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          eyebrow={t("charts.topics")}
          title={t("charts.eventsByTag")}
          description={t("charts.eventsByTagDescription")}
        >
          <EventsByTagChart rows={data.topTags} />
        </ChartCard>

        <ChartCard
          eyebrow={t("charts.places")}
          title={t("charts.topLocations")}
          description={t("charts.topLocationsDescription")}
        >
          <HorizontalBars data={data.topLocations} />
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          eyebrow={t("charts.schedule")}
          title={t("charts.startWeekday")}
          description={t("charts.startWeekdayDescription")}
        >
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayMix.data} margin={CHART_MARGIN}>
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "var(--muted)" }}
                />
                <Bar
                  dataKey="count"
                  name={t("charts.events")}
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          eyebrow={t("charts.sources")}
          title={t("charts.suggestionSourceMix")}
          description={t("charts.suggestionSourceMixDescription")}
        >
          <DonutChart
            data={suggestionSourceMix.data}
            colors={suggestionSourceMix.colors}
          />
        </ChartCard>
      </div>
    </div>
  )
}
