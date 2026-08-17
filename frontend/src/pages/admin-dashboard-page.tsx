import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { BarChart3, RefreshCw, Terminal } from "lucide-react"

import { AdminLoginCard } from "@/components/admin-login-card"
import { DashboardCharts } from "@/components/dashboard-charts"
import { Button } from "@/components/ui/button"
import { useEventManagerContext } from "@/event-manager-context"
import { getAdminDashboard } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import { cn } from "@/lib/utils"

function formatPercent(value: number | null) {
  if (value == null) {
    return "—"
  }
  return `${Math.round(value * 100)}%`
}

function formatHours(value: number | null) {
  if (value == null) {
    return "—"
  }
  return `${value.toFixed(1)}h`
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4">
      <div className="text-[10px] text-primary uppercase">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold tracking-tight">
        {value}
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground">{hint}</div>
    </div>
  )
}

export function AdminDashboardPage() {
  const mgr = useEventManagerContext()
  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getAdminDashboard,
    enabled: mgr.admin != null,
  })

  return (
    <div className="space-y-8">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 text-[10px] text-muted-foreground">
            ▸ ADMIN_CONSOLE // TELEMETRY
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            <span className="text-foreground">DATA_</span>
            <span className="text-primary">DASHBOARD</span>
          </h2>
        </div>

        {mgr.admin ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="text-[10px] uppercase" asChild>
              <Link to="/admin">
                <Terminal className="mr-2 h-3 w-3" />
                CONTROL_PANEL
              </Link>
            </Button>
            <Button
              variant="outline"
              className="text-[10px] uppercase"
              onClick={() => {
                void dashboardQuery.refetch()
              }}
              disabled={dashboardQuery.isFetching}
            >
              <RefreshCw
                className={cn(
                  "mr-2 h-3 w-3",
                  dashboardQuery.isFetching && "animate-spin"
                )}
              />
              REFRESH
            </Button>
          </div>
        ) : null}
      </div>

      {!mgr.admin ? (
        <AdminLoginCard />
      ) : dashboardQuery.isPending ? (
        <div className="rounded-xl border border-border bg-card px-6 py-12 text-center text-xs text-primary">
          LOADING_DASHBOARD...
        </div>
      ) : dashboardQuery.isError ? (
        <div className="rounded-xl border border-border bg-card px-6 py-12 text-center text-xs text-accent">
          DASHBOARD_UNAVAILABLE
        </div>
      ) : dashboardQuery.data ? (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label="PUBLISHED_EVENTS"
              value={dashboardQuery.data.summary.totalEvents}
              hint={`${dashboardQuery.data.summary.upcomingEvents} upcoming · ${dashboardQuery.data.summary.pastEvents} past`}
            />
            <StatCard
              label="PENDING_QUEUE"
              value={dashboardQuery.data.summary.pendingSuggestions}
              hint={`${dashboardQuery.data.summary.totalSuggestions} total suggestions`}
            />
            <StatCard
              label="APPROVAL_RATE"
              value={formatPercent(dashboardQuery.data.summary.approvalRate)}
              hint={`${dashboardQuery.data.summary.approvedSuggestions} approved · ${dashboardQuery.data.summary.rejectedSuggestions} rejected`}
            />
            <StatCard
              label="AVG_REVIEW_TIME"
              value={formatHours(dashboardQuery.data.summary.avgReviewHours)}
              hint="Hours from suggestion to approve/reject"
            />
            <StatCard
              label="SOURCED_CATALOG"
              value={dashboardQuery.data.summary.eventsWithSourcePage}
              hint={`${dashboardQuery.data.summary.eventsWithoutSourcePage} manual entries`}
            />
          </div>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
            Timezone {dashboardQuery.data.timezone}
          </div>

          <DashboardCharts data={dashboardQuery.data} />
        </div>
      ) : null}
    </div>
  )
}
