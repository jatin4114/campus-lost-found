import { TableRowsSkeleton } from '../../components/common/Skeleton'
import { formatRelativeTime } from '../../lib/dateUtils'
import { useAuditLogs } from '../../services/adminApi'

export function AdminAuditLogsPage() {
  const { data: logs, isLoading } = useAuditLogs()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Audit logs</h1>
      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">Actor</th>
              <th className="p-3">Action</th>
              <th className="p-3">Entity</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <TableRowsSkeleton columns={4} />}
            {logs?.map((log) => (
              <tr key={log.id} className="border-b border-slate-100 last:border-0">
                <td className="p-3 text-slate-500" title={new Date(log.createdAt).toLocaleString()}>
                  {formatRelativeTime(log.createdAt)}
                </td>
                <td className="p-3">{log.actor?.name ?? 'System'}</td>
                <td className="p-3 font-mono text-xs">{log.action}</td>
                <td className="p-3 text-slate-500" title={log.entityId}>
                  {log.entityType} · {log.entityId.slice(0, 8)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
