import { useState } from 'react'
import { ListSkeleton } from '../../components/common/Skeleton'
import { useAdminReports, useReviewReport } from '../../services/adminApi'

const ACTIONS = [
  { value: 'DISMISS_REPORT', label: 'Dismiss' },
  { value: 'HIDE_ITEM', label: 'Hide item' },
  { value: 'WARN_USER', label: 'Warn user' },
  { value: 'SUSPEND_USER', label: 'Suspend user' },
]

export function AdminReportsPage() {
  const [status, setStatus] = useState('PENDING')
  const { data: reports, isLoading } = useAdminReports(status)
  const review = useReviewReport()

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="PENDING">Pending</option>
          <option value="ACTIONED">Actioned</option>
          <option value="DISMISSED">Dismissed</option>
        </select>
      </div>

      {isLoading && <div className="mt-6"><ListSkeleton /></div>}
      {reports && reports.length === 0 && <p className="mt-6 text-slate-500">Nothing here.</p>}

      <div className="mt-6 space-y-3">
        {!isLoading && reports?.map((report) => (
          <div key={report.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="font-medium text-slate-900">{report.item.title}</p>
            <p className="mt-1 text-sm text-slate-600">
              Reported by {report.reporter.name} — {report.reason}
            </p>
            {report.description && <p className="mt-1 text-sm text-slate-500">{report.description}</p>}
            {status === 'PENDING' && (
              <div className="mt-3 flex flex-wrap gap-2">
                {ACTIONS.map((action) => (
                  <button
                    key={action.value}
                    type="button"
                    onClick={() => review.mutate({ id: report.id, action: action.value })}
                    className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
