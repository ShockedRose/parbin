import { format } from "date-fns"
import type { ReactNode } from "react"
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
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-[11px] shadow-lg">
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
      className={cn("rounded-xl border border-border bg-card p-5", className)}
    >
      <div className="mb-4">
        <div className="text-[10px] text-primary uppercase">{eyebrow}</div>
        <h3 className="mt-1 font-display text-lg tracking-tight">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function EmptyChart({ label = "NO_DATA" }: { label?: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center border border-border text-[11px] text-muted-foreground">
      {label}
    </div>
  )
}

function hasCounts(items: LabeledCount[]) {
  return items.some((item) => item.count > 0)
}

function formatMonthLabel(month: string) {
  const [year, monthIndex] = month.split("-").map(Number)
  if (!year || !monthIndex) {
    return month
  }
  return format(new Date(year, monthIndex - 1, 1), "MMM yy")
}

function MixLegend({
  items,
  colors,
}: {
  items: LabeledCount[]
  colors: Record<string, string>
}) {
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-3 text-[10px] uppercase">
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
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={108}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
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
            name="Events"
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
  const eventsByMonth = data.eventsByMonth.map((row) => ({
    ...row,
    label: formatMonthLabel(row.month),
  }))
  const suggestionsByMonth = data.suggestionsByMonth.map((row) => ({
    ...row,
    label: formatMonthLabel(row.month),
  }))

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          eyebrow="MODERATION_PIPELINE"
          title="Suggestion status"
          description="Pending queue versus approved and rejected proposals."
        >
          <DonutChart data={data.suggestionStatusMix} colors={STATUS_COLORS} />
        </ChartCard>

        <ChartCard
          eyebrow="INTAKE_ORIGIN"
          title="Catalog source mix"
          description="Published events with an external source URL versus manually entered ones."
        >
          <DonutChart data={data.eventSourceMix} colors={SOURCE_COLORS} />
        </ChartCard>
      </div>

      <ChartCard
        eyebrow="CALENDAR_DENSITY"
        title="Events by start month"
        description={`Meetup volume over the last 12 months in ${data.timezone}.`}
      >
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={eventsByMonth} margin={CHART_MARGIN}>
              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
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
                name="Events"
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard
        eyebrow="REVIEW_THROUGHPUT"
        title="Suggestions submitted"
        description="Monthly intake from the public form and scraper, stacked by review outcome."
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
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
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
                name="Pending"
                stackId="status"
                fill={STATUS_COLORS.Pending}
                maxBarSize={28}
              />
              <Bar
                dataKey="approved"
                name="Approved"
                stackId="status"
                fill={STATUS_COLORS.Approved}
                maxBarSize={28}
              />
              <Bar
                dataKey="rejected"
                name="Rejected"
                stackId="status"
                fill={STATUS_COLORS.Rejected}
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <MixLegend items={data.suggestionStatusMix} colors={STATUS_COLORS} />
      </ChartCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          eyebrow="TOPIC_SIGNAL"
          title="Top event tags"
          description="Most common tags on published meetups."
        >
          <HorizontalBars data={data.topTags} />
        </ChartCard>

        <ChartCard
          eyebrow="GEOGRAPHY"
          title="Top locations"
          description="Where Panama tech meetups are listed as happening."
        >
          <HorizontalBars data={data.topLocations} />
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          eyebrow="SCHEDULE"
          title="Start weekday"
          description="Which days of the week published events typically begin."
        >
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.eventsByWeekday} margin={CHART_MARGIN}>
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
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
                  name="Events"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          eyebrow="SUGGESTION_ORIGIN"
          title="Suggestion source mix"
          description="Proposals with a source event page (scraper or pasted URL) versus community-only submissions."
        >
          <DonutChart data={data.suggestionSourceMix} colors={SOURCE_COLORS} />
        </ChartCard>
      </div>
    </div>
  )
}
