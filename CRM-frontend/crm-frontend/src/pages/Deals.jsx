import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, IndianRupee, User2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { dealsApi, leadsApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { PageHeader, Spinner, EmptyState } from '../components/Bits';
import Modal from '../components/Modal';

const STAGES = [
  { key: 'discovery', label: 'Discovery', color: '#7C8CF8' },
  { key: 'proposal', label: 'Proposal', color: '#E8B24E' },
  { key: 'negotiation', label: 'Negotiation', color: '#F08A5D' },
  { key: 'closed_won', label: 'Closed Won', color: '#4FAE7E' },
  { key: 'closed_lost', label: 'Closed Lost', color: '#E1615E' },
];

const emptyForm = { lead: '', title: '', value: 0, stage: 'discovery', expectedCloseDate: '', notes: '' };

export default function Deals() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const canEdit = isAdmin || user?.role === 'sales';

  const [deals, setDeals] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dealsApi.list({ limit: 200 });
      setDeals(res.deals);
    } catch {
      toast.error('Could not load deals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
    leadsApi.list({ limit: 200 }).then((r) => setLeads(r.leads)).catch(() => {});
  }, [fetchDeals]);

  const grouped = STAGES.reduce((acc, s) => {
    acc[s.key] = deals.filter((d) => d.stage === s.key);
    return acc;
  }, {});

  const totalByStage = (key) => grouped[key].reduce((sum, d) => sum + (d.value || 0), 0);

  const onDrop = async (stage) => {
    setDragOverStage(null);
    if (!dragging || dragging.stage === stage) return setDragging(null);
    const deal = dragging;
    setDragging(null);
    setDeals((prev) => prev.map((d) => (d._id === deal._id ? { ...d, stage } : d)));
    try {
      await dealsApi.updateStage(deal._id, stage);
      toast.success(`Moved to ${STAGES.find((s) => s.key === stage)?.label}`);
    } catch {
      toast.error('Could not update stage');
      fetchDeals();
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dealsApi.create({ ...form, expectedCloseDate: form.expectedCloseDate || null });
      toast.success('Deal created');
      setModalOpen(false);
      setForm(emptyForm);
      fetchDeals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create deal');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await dealsApi.remove(deleteTarget._id);
      toast.success('Deal deleted');
      setDeleteTarget(null);
      fetchDeals();
    } catch {
      toast.error('Could not delete deal');
    }
  };

  if (loading) {
    return (
      <div className="card p-10 flex justify-center text-ink/40 dark:text-paper/40">
        <Spinner size={22} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Deals"
        subtitle="Drag a card to move it through the pipeline."
        action={
          canEdit && (
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              <Plus size={16} /> New deal
            </button>
          )
        }
      />

      {deals.length === 0 ? (
        <EmptyState title="No deals yet" subtitle="Create your first deal from a lead." />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
          {STAGES.map((stage) => (
            <div
              key={stage.key}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStage(stage.key);
              }}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={() => onDrop(stage.key)}
              className={`w-72 shrink-0 rounded-xl2 border-2 border-dashed transition-colors p-3 ${
                dragOverStage === stage.key
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-400/5'
                  : 'border-transparent bg-black/[0.02] dark:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                  <span className="text-sm font-semibold">{stage.label}</span>
                  <span className="text-xs text-ink/40 dark:text-paper/40">({grouped[stage.key].length})</span>
                </div>
              </div>
              <p className="text-xs text-ink/40 dark:text-paper/40 px-1 mb-3">
                ₹{totalByStage(stage.key).toLocaleString()}
              </p>

              <div className="space-y-2.5 min-h-[60px]">
                <AnimatePresence>
                  {grouped[stage.key].map((deal) => (
                    <motion.div
                      key={deal._id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      draggable={canEdit}
                      onDragStart={() => setDragging(deal)}
                      onDragEnd={() => setDragging(null)}
                      className={`card p-3.5 group ${canEdit ? 'cursor-grab active:cursor-grabbing' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-snug">{deal.title}</p>
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteTarget(deal)}
                            className="opacity-0 group-hover:opacity-100 text-ink/30 hover:text-stage-lost transition-all shrink-0"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-ink/40 dark:text-paper/40 mt-0.5 truncate">{deal.lead?.name}</p>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                          <IndianRupee size={11} /> {(deal.value || 0).toLocaleString()}
                        </span>
                        {deal.assignedTo && (
                          <span className="flex items-center gap-1 text-xs text-ink/40 dark:text-paper/40">
                            <User2 size={11} /> {deal.assignedTo.name}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <Modal title="New deal" onClose={() => setModalOpen(false)}>
            <form onSubmit={submitForm} className="space-y-4">
              <div>
                <label className="label">Lead</label>
                <select required className="input" value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })}>
                  <option value="">Select a lead</option>
                  {leads.map((l) => (
                    <option key={l._id} value={l._id}>{l.name} — {l.company || l.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Deal title</label>
                <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Value (₹)</label>
                  <input required type="number" min="0" className="input" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label">Stage</label>
                  <select className="input" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Expected close date</label>
                <input type="date" className="input" value={form.expectedCloseDate} onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })} />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea rows={3} className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <Spinner /> : 'Create deal'}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {deleteTarget && (
          <Modal title="Delete deal?" onClose={() => setDeleteTarget(null)}>
            <p className="text-sm text-ink/60 dark:text-paper/60 mb-5">
              This permanently removes <strong>{deleteTarget.title}</strong>.
            </p>
            <div className="flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete}>Delete deal</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
