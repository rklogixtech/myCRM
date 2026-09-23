import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ScrollText } from 'lucide-react';
import toast from 'react-hot-toast';
import { auditApi } from '../api/services';
import { PageHeader, EmptyState, Pagination, Spinner } from '../components/Bits';

const ACTION_COLORS = {
  create: '#4FAE7E',
  update: '#E8B24E',
  delete: '#E1615E',
  assign: '#7C8CF8',
  stage_update: '#F08A5D',
  complete: '#4FAE7E',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [resource, setResource] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditApi.list({ page, limit: 20, resource: resource || undefined });
      setLogs(res.logs);
      setPagination(res.pagination);
    } catch {
      toast.error('Could not load audit logs');
    } finally {
      setLoading(false);
    }
  }, [page, resource]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div>
      <PageHeader title="Audit log" subtitle="Every write action across the CRM, who did it and when." />

      <div className="flex gap-2 mb-5 flex-wrap">
        {['', 'lead', 'deal', 'followup', 'activity'].map((r) => (
          <button
            key={r || 'all'}
            onClick={() => {
              setResource(r);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              resource === r
                ? 'bg-ink text-paper dark:bg-amber-400 dark:text-ink'
                : 'bg-black/5 dark:bg-white/5 text-ink/60 dark:text-paper/60 hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            {r || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-10 flex justify-center text-ink/40 dark:text-paper/40">
          <Spinner size={22} />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState icon={ScrollText} title="No activity recorded" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink/40 dark:text-paper/40 border-b border-black/5 dark:border-white/5">
                  <th className="py-3 px-5 font-medium">User</th>
                  <th className="py-3 px-4 font-medium">Action</th>
                  <th className="py-3 px-4 font-medium">Resource</th>
                  <th className="py-3 px-4 font-medium hidden md:table-cell">IP</th>
                  <th className="py-3 px-4 font-medium text-right">When</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <motion.tr
                    key={log._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-black/5 dark:border-white/5 last:border-0"
                  >
                    <td className="py-3 px-5">{log.user?.name || 'System'}</td>
                    <td className="py-3 px-4">
                      <span
                        className="badge capitalize"
                        style={{
                          backgroundColor: `${ACTION_COLORS[log.action] || '#999'}1A`,
                          color: ACTION_COLORS[log.action] || '#999',
                        }}
                      >
                        {log.action?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize text-ink/60 dark:text-paper/60">{log.resource}</td>
                    <td className="py-3 px-4 hidden md:table-cell text-ink/40 dark:text-paper/40">{log.ip}</td>
                    <td className="py-3 px-4 text-right text-ink/40 dark:text-paper/40">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onChange={setPage} />
    </div>
  );
}
