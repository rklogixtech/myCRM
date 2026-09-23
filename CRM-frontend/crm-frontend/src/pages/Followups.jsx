import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, Circle, CalendarClock } from 'lucide-react';
import toast from 'react-hot-toast';
import { followupsApi, leadsApi } from '../api/services';
import { PageHeader, EmptyState, Pagination, Spinner } from '../components/Bits';
import Modal from '../components/Modal';

const TYPES = ['call', 'email', 'meeting', 'task'];

const emptyForm = { lead: '', type: 'call', title: '', description: '', dueDate: '' };

export default function Followups() {
  const [followups, setFollowups] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('pending'); // pending | completed | all
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filter === 'pending') params.completed = 'false';
      if (filter === 'completed') params.completed = 'true';
      const res = await followupsApi.list(params);
      setFollowups(res.followups);
      setPagination(res.pagination);
    } catch {
      toast.error('Could not load follow-ups');
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    leadsApi.list({ limit: 200 }).then((r) => setLeads(r.leads)).catch(() => {});
  }, []);

  const complete = async (id) => {
    try {
      await followupsApi.complete(id);
      toast.success('Marked as done');
      fetchData();
    } catch {
      toast.error('Could not update follow-up');
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await followupsApi.create(form);
      toast.success('Follow-up scheduled');
      setModalOpen(false);
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not schedule follow-up');
    } finally {
      setSaving(false);
    }
  };

  const isOverdue = (f) => !f.completed && new Date(f.dueDate) < new Date();

  return (
    <div>
      <PageHeader
        title="Follow-ups"
        subtitle={`${pagination.total || 0} scheduled`}
        action={
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} /> New follow-up
          </button>
        }
      />

      <div className="flex gap-2 mb-5">
        {[
          { key: 'pending', label: 'Pending' },
          { key: 'completed', label: 'Completed' },
          { key: 'all', label: 'All' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setFilter(t.key);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === t.key
                ? 'bg-ink text-paper dark:bg-amber-400 dark:text-ink'
                : 'bg-black/5 dark:bg-white/5 text-ink/60 dark:text-paper/60 hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-10 flex justify-center text-ink/40 dark:text-paper/40">
          <Spinner size={22} />
        </div>
      ) : followups.length === 0 ? (
        <EmptyState icon={CalendarClock} title="Nothing here" subtitle="You're all caught up." />
      ) : (
        <div className="card divide-y divide-black/5 dark:divide-white/5 overflow-hidden">
          <AnimatePresence initial={false}>
            {followups.map((f) => (
              <motion.div
                key={f._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-4 px-5 py-4"
              >
                <button onClick={() => !f.completed && complete(f._id)} disabled={f.completed} className="shrink-0">
                  {f.completed ? (
                    <CheckCircle2 size={20} className="text-stage-won" />
                  ) : (
                    <Circle size={20} className="text-ink/25 dark:text-paper/25 hover:text-amber-500 transition-colors" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-medium ${f.completed ? 'line-through text-ink/40 dark:text-paper/40' : ''}`}>
                      {f.title}
                    </p>
                    <span className="badge bg-black/5 dark:bg-white/10 text-ink/50 dark:text-paper/50 capitalize">{f.type}</span>
                    {isOverdue(f) && <span className="badge bg-stage-lost/10 text-stage-lost">Overdue</span>}
                  </div>
                  {f.lead && (
                    <Link to={`/leads/${f.lead._id}`} className="text-xs text-amber-600 dark:text-amber-400 hover:underline">
                      {f.lead.name}
                    </Link>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-ink/40 dark:text-paper/40">
                    {new Date(f.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  {f.assignedTo && <p className="text-xs text-ink/30 dark:text-paper/30">{f.assignedTo.name}</p>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onChange={setPage} />

      <AnimatePresence>
        {modalOpen && (
          <Modal title="New follow-up" onClose={() => setModalOpen(false)}>
            <form onSubmit={submitForm} className="space-y-4">
              <div>
                <label className="label">Lead</label>
                <select required className="input" value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })}>
                  <option value="">Select a lead</option>
                  {leads.map((l) => (
                    <option key={l._id} value={l._id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Type</label>
                  <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Due date</label>
                  <input required type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Title</label>
                <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <Spinner /> : 'Schedule'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
