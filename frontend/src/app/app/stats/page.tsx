import { getUserStats, getRecentActivity } from '@/lib/db/stats'
import { OverviewCards } from '@/components/stats/OverviewCards'
import { ActivityChart } from '@/components/stats/ActivityChart'
import { HeatmapCalendar } from '@/components/stats/HeatmapCalendar'
import { EmptyState } from '@/components/ui/EmptyState'
import { BarChart3 } from 'lucide-react'

export default async function StatsPage() {
  let stats = null
  let activity = []
  let heatmapData = []

  try {
    stats = await getUserStats()
    activity = await getRecentActivity(30)
    heatmapData = await getRecentActivity(365)
  } catch (error) {
    console.error('Failed to load stats:', error)
  }

  if (!stats) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-8">Statistics</h1>
        <EmptyState
          icon={<BarChart3 className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
          title="No statistics yet"
          description="Start reviewing cards to see your progress and statistics here."
        />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-8">Statistics</h1>
      <div className="space-y-6">
        <OverviewCards stats={stats} />
        <ActivityChart data={activity} />
        <HeatmapCalendar data={heatmapData} />
      </div>
    </div>
  )
}
