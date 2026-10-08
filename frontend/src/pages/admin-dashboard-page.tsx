import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { RefreshCw, Settings } from "lucide-react"

import { AdminLoginCard } from "@/components/admin-login-card"
import { DashboardCharts } from "@/components/dashboard-charts"
import { PageHeader } from "@/components/page-header"
import { StatePanel } from "@/components/state-panel"
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
    <div className="rounded-2xl border border-border bg-card px-5 py-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 font-serif text-3xl font-semibold tracking-tight">
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
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
    <div>
      <PageHeader
        title="Dashboard"
        description={
          dashboardQuery.data
            ? `Catalog and moderation at a glance · ${dashboardQuery.data.timezone}`
            : "Catalog and moderation at a glance."
        }
        actions={
          mgr.admin ? (
            <>
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl px-4"
                asChild
              >
                <Link to="/admin">
                  <Settings />
                  Admin
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl px-4"
                onClick={() => {
                  void dashboardQuery.refetch()
                }}
                disabled={dashboardQuery.isFetching}
              >
                <RefreshCw
                  className={cn(dashboardQuery.isFetching && "animate-spin")}
                />
                Refresh
              </Button>
            </>
          ) : undefined
        }
      />

      {!mgr.admin ? (
        <AdminLoginCard />
      ) : dashboardQuery.isPending ? (
        <StatePanel>Loading dashboard…</StatePanel>
      ) : dashboardQuery.isError ? (
        <StatePanel tone="error">The dashboard is unavailable.</StatePanel>
      ) : dashboardQuery.data ? (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label="Published events"
              value={dashboardQuery.data.summary.totalEvents}
              hint={`${dashboardQuery.data.summary.upcomingEvents} upcoming · ${dashboardQuery.data.summary.pastEvents} past`}
            />
            <StatCard
              label="Pending review"
              value={dashboardQuery.data.summary.pendingSuggestions}
              hint={`${dashboardQuery.data.summary.totalSuggestions} total suggestions`}
            />
            <StatCard
              label="Approval rate"
              value={formatPercent(dashboardQuery.data.summary.approvalRate)}
              hint={`${dashboardQuery.data.summary.approvedSuggestions} approved · ${dashboardQuery.data.summary.rejectedSuggestions} rejected`}
            />
            <StatCard
              label="Avg. review time"
              value={formatHours(dashboardQuery.data.summary.avgReviewHours)}
              hint="From suggestion to decision"
            />
            <StatCard
              label="With a source link"
              value={dashboardQuery.data.summary.eventsWithSourcePage}
              hint={`${dashboardQuery.data.summary.eventsWithoutSourcePage} added manually`}
            />
          </div>

          <DashboardCharts data={dashboardQuery.data} />
        </div>
      ) : null}
    </div>
  )
}
