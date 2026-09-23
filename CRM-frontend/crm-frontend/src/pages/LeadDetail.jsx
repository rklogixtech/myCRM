import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  MessageSquare,
  Phone as PhoneIcon,
  Calendar,
  Tag,
  Plus,
  Handshake,
  CalendarClock,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { leadsApi, activitiesApi, followupsApi, dealsApi } from '../api/services';
import { LeadStatusBadge, DealStageBadge } from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import { Spinner, EmptyState } from '../components/Bits';
import Modal from '../components/Modal';

const ACTIVITY_ICONS = {
  note: MessageSquare,
  call: PhoneIcon,
  email: Mail,
  meeting: Calendar,
  status_change: Tag,
  assignment: Tag,
  deal_update: Handshake,
};

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityModal, setActivityModal] = useState(false);
  const [activityForm, setActivityForm] = useState({ type: 'note', description: '' });
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [leadData, activityRes, followupRes, dealRes] = await Promise.all([
        leadsApi.get(id),
        activitiesApi.timeline(id, { limit: 30 }),
        followupsApi.list({ lead: id, limit: 20 }),
        dealsApi.list({ limit: 100 }),
      ]);
      setLead(leadData);
      setActivities(activityRes.activities);
      setFollowups(followupRes.followups);
      setDeals(dealRes.deals.filter((d) => (d.lead?._id || d.lead) === id));
    } catch {
      toast.error('Could not load lead');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const submitActivity = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      await activitiesApi.create({ lead: id, ...activityForm });
      toast.success('Activity logged');
      setActivityModal(false);
      setActivityForm({ type: 'note', description: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not log activity');
    } finally {
      setPosting(false);
    }
  };

  const completeFollowup = async (followupId) => {
    try {
      await followupsApi.complete(followupId);
      toast.success('Marked as done');
      load();
    } catch {
      toast.error('Could not update follow-up');
    }
  };

  if (loading) {
    return (
      <div className="card p-10 flex justify-center text-ink/40 dark:text-paper/40">
        <Spinner size={22} />
      </div>
    );
  }

  if (!lead) return <EmptyState title="Lead not found" />;

  return (
    <div>
      <button
        onClick={() => navigate('/leads')}
        className="flex items-center gap-1.5 text-sm text-ink/50 dark:text-paper/50 hover:text-ink dark:hover:text-paper mb-5 transition-colors"
      >
        <ArrowLeft size={15} /> Back to leads
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: lead card */}
        <div className="lg:col-span-1 space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={lead.name} size={48} />
              <div>
                <p className="font-display font-semibold text-lg">{lead.name}</p>
                <LeadStatusBadge status={lead.status} />
              </div>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5 text-ink/70 dark:text-paper/70">
                <Mail size={14} className="text-ink/30 dark:text-paper/30" /> {lead.email}
              </div>
              <div className="flex items-center gap-2.5 text-ink/70 dark:text-paper/70">
                <Phone size={14} className="text-ink/30 dark:text-paper/30" /> {lead.phone}
              </div>
              {lead.company && (
                <div className="flex items-center gap-2.5 text-ink/70 dark:text-paper/70">
                  <Building2 size={14} className="text-ink/30 dark:text-paper/30" /> {lead.company}
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-ink/40 dark:text-paper/40 mb-0.5">Source</p>
                <p className="capitalize">{lead.source}</p>
              </div>
              <div>
                <p className="text-xs text-ink/40 dark:text-paper/40 mb-0.5">Deal value</p>
                <p>₹{(lead.dealValue || 0).toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-ink/40 dark:text-paper/40 mb-0.5">Assigned to</p>
                <p>{lead.assignedTo?.name || 'Unassigned'}</p>
              </div>
            </div>
            {lead.notes && (
              <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                <p className="text-xs text-ink/40 dark:text-paper/40 mb-1">Notes</p>
                <p className="text-sm text-ink/70 dark:text-paper/70 whitespace-pre-wrap">{lead.notes}</p>
              </div>
            )}
          </motion.div>

          {/* Deals for this lead */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-5">
            <p className="font-display font-semibold mb-3 flex items-center gap-2">
              <Handshake size={15} /> Deals
            </p>
            {deals.length === 0 ? (
              <p className="text-sm text-ink/40 dark:text-paper/40">No deals linked to this lead.</p>
            ) : (
              <div className="space-y-2">
                {deals.map((deal) => (
                  <div key={deal._id} className="flex items-center justify-between text-sm py-1.5">
                    <span className="truncate pr-2">{deal.title}</span>
                    <DealStageBadge stage={deal.stage} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Followups for this lead */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5">
            <p className="font-display font-semibold mb-3 flex items-center gap-2">
              <CalendarClock size={15} /> Follow-ups
            </p>
            {followups.length === 0 ? (
              <p className="text-sm text-ink/40 dark:text-paper/40">No follow-ups scheduled.</p>
            ) : (
              <div className="space-y-2">
                {followups.map((f) => (
                  <div key={f._id} className="flex items-start justify-between gap-2 text-sm py-1.5">
                    <div className="min-w-0">
                      <p className={f.completed ? 'line-through text-ink/40 dark:text-paper/40' : ''}>{f.title}</p>
                      <p className="text-xs text-ink/40 dark:text-paper/40">
                        {new Date(f.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    {!f.completed && (
                      <button onClick={() => completeFollowup(f._id)} className="shrink-0 text-amber-600 dark:text-amber-400">
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right: activity timeline */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="font-display font-semibold text-lg">Activity timeline</p>
            <button className="btn-primary !py-2 !px-3.5 text-sm" onClick={() => setActivityModal(true)}>
              <Plus size={15} /> Log activity
            </button>
          </div>

          {activities.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No activity yet" subtitle="Log a call, email or note to start the timeline." />
          ) : (
            <div className="space-y-5">
              {activities.map((a, i) => {
                const Icon = ACTIVITY_ICONS[a.type] || MessageSquare;
                return (
                  <motion.div
                    key={a._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex gap-3"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Icon size={14} />
                      </div>
                      {i !== activities.length - 1 && <div className="w-px flex-1 bg-black/5 dark:bg-white/10 mt-1" />}
                    </div>
                    <div className="pb-5">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-sm font-medium capitalize">{a.type.replace('_', ' ')}</span>
                        <span className="text-xs text-ink/40 dark:text-paper/40">
                          by {a.user?.name || 'Unknown'} · {new Date(a.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-ink/70 dark:text-paper/70">{a.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {activityModal && (
          <Modal title="Log activity" onClose={() => setActivityModal(false)}>
            <form onSubmit={submitActivity} className="space-y-4">
              <div>
                <label className="label">Type</label>
                <select
                  className="input"
                  value={activityForm.type}
                  onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                >
                  {['note', 'call', 'email', 'meeting'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  required
                  rows={4}
                  className="input"
                  placeholder="What happened?"
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setActivityModal(false)}>Cancel</button>
                <button type="submit" disabled={posting} className="btn-primary">
                  {posting ? <Spinner /> : 'Log activity'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
