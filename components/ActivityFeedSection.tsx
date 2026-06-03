"use client"

import { useState } from "react"
import ActivityDiscussModal from "./ActivityDiscussModal"

interface Activity {
  id: string
  actor_name: string
  description: string
  entity_name: string | null
  created_at: string
  comment_count: number
}

interface ActivityFeedSectionProps {
  activities: Activity[]
}

const ActivityFeedSection = ({ activities }: ActivityFeedSectionProps) => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  if (!activities || activities.length === 0) {
    return (
      <section className="px-6 py-4">
        <h2 className="font-cormorant text-lg text-dzan-earth mb-4">
          Recent Activity
        </h2>
        <div className="bg-white rounded-sm p-6 text-center border border-dzan-stone/20">
          <p className="text-xs text-dzan-stone italic">
            Belum ada aktivitas — mulai bekerja untuk lihat history di sini
          </p>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="px-6 py-4">
        <h2 className="font-cormorant text-lg text-dzan-earth mb-4">
          Recent Activity
        </h2>

        <div className="space-y-3">
          {activities.map((act) => (
            <button
              key={act.id}
              onClick={() => setSelectedActivity(act)}
              className="w-full text-left bg-white rounded-sm p-4 border-l-2 border-dzan-amber hover:bg-dzan-cream transition-colors"
            >
              <p className="text-xs text-dzan-stone">
                {new Date(act.created_at).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Jakarta",
                })}
              </p>
              <p className="text-sm text-dzan-earth mt-1">
                <span className="font-semibold">{act.actor_name}</span>{" "}
                {act.description}
              </p>
              {act.entity_name && (
                <p className="text-xs text-dzan-stone mt-1 italic">
                  {act.entity_name}
                </p>
              )}
              {act.comment_count > 0 && (
                <p className="text-xs text-dzan-amber mt-2">
                  💬 {act.comment_count} komentar
                </p>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Modal */}
      <ActivityDiscussModal
        activityId={selectedActivity?.id || null}
        activityDescription={selectedActivity?.description || ""}
        activityActor={selectedActivity?.actor_name || ""}
        onClose={() => setSelectedActivity(null)}
      />
    </>
  )
}

export default ActivityFeedSection