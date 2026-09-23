import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, UserPlus, ChevronRight, Users as UsersIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { leadsApi, authApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { PageHeader, EmptyState, Pagination, Spinner } from '../components/Bits';
import { LeadStatusBadge } from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
const SOURCES = ['website', 'referral', 'social', 'email', 'call', 'other'];

const emptyForm = { name: '', email: '', phone: '', company: '', source: 'website', status: 'new', dealValue: 0, notes: '' };

export default function Leads() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null); // { mode: 'create'|'edit'|'assign', lead? }
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [assignTo, setAssignTo] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leadsApi.list({ page, limit: 10, search: search || undefined, status: status || undefined });
      setLeads(res.leads);
      setPagination(res.pagination);
    } catch {
      toast.error('Could not load leads');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (isAdmin) authApi.listUsers().then(setUsers).catch(() => {});
  }, [isAdmin]);

  useEffect(() => {
    const t = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(t);
  }, [search, status]);

  const openCreate = () => {
    setForm(emptyForm);
    setModal({ mode: 'create' });
  };

  const openEdit = (lead) => {
    setForm({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company || '',
      source: lead.source,
      status: lead.status,
      dealValue: lead.dealValue || 0,
      notes: lead.notes || '',
    });
    setModal({ mode: 'edit', lead });
  };

  const openAssign = (lead) => {
    setAssignTo(lead.assignedTo?._id || lead.assignedTo || '');
    setModal({ mode: 'assign', lead });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        await leadsApi.create(form);
        toast.success('Lead created');
      } else {
        await leadsApi.update(modal.lead._id, form);
        toast.success('Lead updated');
      }
      setModal(null);
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const submitAssign = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await leadsApi.assign(modal.lead._id, assignTo || null);
      toast.success('Lead assigned');
      setModal(null);
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not assign lead');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await leadsApi.remove(deleteTarget._id);
      toast.success('Lead deleted');
      setDeleteTarget(null);
      fetchLeads();
    } catch {
      toast.error('Could not delete lead');
    }
  };

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={`${pagination.total || 0} total leads in your pipeline`}
        action={
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> New lead
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30 dark:text-paper/30" />
          <input
            className="input pl-10"
            placeholder="Search by name, email or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input sm:w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="card p-10 flex justify-center text-ink/40 dark:text-paper/40">
          <Spinner size={22} />
        </div>
      ) : leads.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No leads found"
          subtitle="Try a different search, or add your first lead to get started."
          action={
            <button className="btn-primary" onClick={openCreate}>
              <Plus size={16} /> New lead
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink/40 dark:text-paper/40 border-b border-black/5 dark:border-white/5">
                  <th className="py-3 px-5 font-medium">Lead</th>
                  <th className="py-3 px-4 font-medium hidden md:table-cell">Company</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium hidden lg:table-cell">Assigned to</th>
                  <th className="py-3 px-4 font-medium hidden sm:table-cell">Value</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {leads.map((lead) => (
                    <motion.tr
                      key={lead._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-black/[0.015] dark:hover:bg-white/[0.02] group"
                    >
                      <td className="py-3 px-5">
                        <Link to={`/leads/${lead._id}`} className="flex items-center gap-3 min-w-0">
                          <Avatar name={lead.name} size={32} />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{lead.name}</p>
                            <p className="text-xs text-ink/40 dark:text-paper/40 truncate">{lead.email}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell text-ink/60 dark:text-paper/60">
                        {lead.company || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <LeadStatusBadge status={lead.status} />
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell text-ink/60 dark:text-paper/60">
                        {lead.assignedTo?.name || 'Unassigned'}
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell text-ink/60 dark:text-paper/60">
                        ₹{(lead.dealValue || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isAdmin && (
                            <button
                              onClick={() => openAssign(lead)}
                              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                              title="Assign"
                            >
                              <UserPlus size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => openEdit(lead)}
                            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-xs font-medium"
                          >
                            Edit
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setDeleteTarget(lead)}
                              className="p-2 rounded-lg hover:bg-stage-lost/10 text-stage-lost"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          <Link to={`/leads/${lead._id}`} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
                            <ChevronRight size={14} />
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onChange={setPage} />

      <AnimatePresence>
        {modal?.mode === 'create' || modal?.mode === 'edit' ? (
          <Modal title={modal.mode === 'create' ? 'New lead' : 'Edit lead'} onClose={() => setModal(null)}>
            <form onSubmit={submitForm} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Name</label>
                  <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone</label>
                  <input required className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="label">Company</label>
                  <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Source</label>
                  <select className="input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Deal value (₹)</label>
                <input type="number" min="0" className="input" value={form.dealValue} onChange={(e) => setForm({ ...form, dealValue: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea rows={3} className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <Spinner /> : modal.mode === 'create' ? 'Create lead' : 'Save changes'}
                </button>
              </div>
            </form>
          </Modal>
        ) : null}

        {modal?.mode === 'assign' && (
          <Modal title={`Assign ${modal.lead.name}`} onClose={() => setModal(null)}>
            <form onSubmit={submitAssign} className="space-y-4">
              <div>
                <label className="label">Team member</label>
                <select className="input" value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <Spinner /> : 'Assign'}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {deleteTarget && (
          <Modal title="Delete lead?" onClose={() => setDeleteTarget(null)}>
            <p className="text-sm text-ink/60 dark:text-paper/60 mb-5">
              This permanently removes <strong>{deleteTarget.name}</strong> and cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete}>Delete lead</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
