import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { RefreshCw, Settings } from "lucide-react"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation()
  const mgr = useEventManagerContext()
  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getAdminDashboard,
    enabled: mgr.admin != null,
  })

  return (
    <div>
      <PageHeader
        title={t("dashboard.title")}
        description={
          dashboardQuery.data
            ? t("dashboard.descriptionWithTimezone", {
                timezone: dashboardQuery.data.timezone,
              })
            : t("dashboard.description")
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
                  {t("dashboard.admin")}
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
                {t("dashboard.refresh")}
              </Button>
            </>
          ) : undefined
        }
      />

      {!mgr.admin ? (
        <AdminLoginCard />
      ) : dashboardQuery.isPending ? (
        <StatePanel>{t("dashboard.loading")}</StatePanel>
      ) : dashboardQuery.isError ? (
        <StatePanel tone="error">{t("dashboard.unavailable")}</StatePanel>
      ) : dashboardQuery.data ? (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label={t("dashboard.publishedEvents")}
              value={dashboardQuery.data.summary.totalEvents}
              hint={t("dashboard.upcomingPastHint", {
                upcoming: dashboardQuery.data.summary.upcomingEvents,
                past: dashboardQuery.data.summary.pastEvents,
              })}
            />
            <StatCard
              label={t("dashboard.pendingReview")}
              value={dashboardQuery.data.summary.pendingSuggestions}
              hint={t("dashboard.totalSuggestions", {
                count: dashboardQuery.data.summary.totalSuggestions,
              })}
            />
            <StatCard
              label={t("dashboard.approvalRate")}
              value={formatPercent(dashboardQuery.data.summary.approvalRate)}
              hint={t("dashboard.approvedRejected", {
                approved: dashboardQuery.data.summary.approvedSuggestions,
                rejected: dashboardQuery.data.summary.rejectedSuggestions,
              })}
            />
            <StatCard
              label={t("dashboard.avgReviewTime")}
              value={formatHours(dashboardQuery.data.summary.avgReviewHours)}
              hint={t("dashboard.fromSuggestionToDecision")}
            />
            <StatCard
              label={t("dashboard.withSourceLink")}
              value={dashboardQuery.data.summary.eventsWithSourcePage}
              hint={t("dashboard.addedManually", {
                count: dashboardQuery.data.summary.eventsWithoutSourcePage,
              })}
            />
          </div>

          <DashboardCharts data={dashboardQuery.data} />
        </div>
      ) : null}
    </div>
  )
}
