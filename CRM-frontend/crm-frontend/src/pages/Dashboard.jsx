import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Users, Handshake, IndianRupee, Clock3, Database, ArrowUpRight } from 'lucide-react';
import { dashboardApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StatCard from '../components/StatCard';
import { PageHeader, EmptyState } from '../components/Bits';
import { LeadStatusBadge } from '../components/StatusBadge';
import Avatar from '../components/Avatar';

const LEAD_ORDER = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
const DEAL_ORDER = ['discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
const DEAL_COLORS = ['#7C8CF8', '#E8B24E', '#F08A5D', '#4FAE7E', '#E1615E'];

export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let mounted = true;
    dashboardApi
      .stats()
      .then((data) => mounted && setStats(data))
      .catch(() => mounted && setErr('Could not load dashboard stats'))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card h-[104px] animate-pulse bg-black/[0.02] dark:bg-white/[0.02]" />
        ))}
      </div>
    );
  }

  if (err) return <EmptyState icon={Database} title={err} subtitle="Check that the backend API is running and reachable." />;

  const leadsBarData = LEAD_ORDER.map((k) => ({
    status: k,
    count: stats.leadsByStatus?.[k] || 0,
  }));
  const dealsPieData = DEAL_ORDER.map((k) => ({
    name: k.replace('_', ' '),
    value: stats.dealsByStage?.[k] || 0,
  })).filter((d) => d.value > 0);

  const axisColor = theme === 'dark' ? '#FAF9F5' : '#14151A';

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}`}
        subtitle="Here's how your pipeline looks right now."
        action={
          stats.cached ? (
            <span className="badge bg-amber-100 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 gap-1.5">
              <Database size={12} /> Served from Redis cache
            </span>
          ) : (
            <span className="badge bg-black/5 dark:bg-white/5 text-ink/50 dark:text-paper/50 gap-1.5">
              <Database size={12} /> Fresh from database
            </span>
          )
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Total leads" value={stats.totalLeads} accent="#7C8CF8" delay={0} />
        <StatCard icon={Handshake} label="Total deals" value={stats.totalDeals} accent="#E8B24E" delay={0.05} />
        <StatCard
          icon={IndianRupee}
          label="Pipeline value"
          value={stats.totalDealValue}
          prefix="₹"
          accent="#4FAE7E"
          delay={0.1}
        />
        <StatCard
          icon={Clock3}
          label="Pending follow-ups"
          value={stats.pendingFollowups}
          accent="#F08A5D"
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5 lg:col-span-2"
        >
          <p className="font-display font-semibold mb-4">Leads by status</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={leadsBarData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${axisColor}15`} vertical={false} />
              <XAxis
                dataKey="status"
                tick={{ fontSize: 11, fill: `${axisColor}80` }}
                tickLine={false}
                axisLine={{ stroke: `${axisColor}20` }}
              />
              <YAxis tick={{ fontSize: 11, fill: `${axisColor}80` }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: `${axisColor}08` }}
                contentStyle={{
                  background: theme === 'dark' ? '#1D1F26' : '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="#E8B24E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card p-5"
        >
          <p className="font-display font-semibold mb-4">Deals by stage</p>
          {dealsPieData.length === 0 ? (
            <p className="text-sm text-ink/40 dark:text-paper/40 py-14 text-center">No deals yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={dealsPieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={3}>
                  {dealsPieData.map((_, i) => (
                    <Cell key={i} fill={DEAL_COLORS[i % DEAL_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: theme === 'dark' ? '#1D1F26' : '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2 justify-center">
            {dealsPieData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-ink/60 dark:text-paper/60 capitalize">
                <span className="w-2 h-2 rounded-full" style={{ background: DEAL_COLORS[i % DEAL_COLORS.length] }} />
                {d.name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="font-display font-semibold">Recent leads</p>
          <Link to="/leads" className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline">
            View all <ArrowUpRight size={13} />
          </Link>
        </div>
        {stats.recentLeads?.length === 0 ? (
          <p className="text-sm text-ink/40 dark:text-paper/40 py-8 text-center">No leads yet</p>
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/5">
            {stats.recentLeads?.map((lead) => (
              <Link
                key={lead._id}
                to={`/leads/${lead._id}`}
                className="flex items-center justify-between py-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={lead.name} size={32} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{lead.name}</p>
                    <p className="text-xs text-ink/40 dark:text-paper/40 truncate">{lead.company || lead.email}</p>
                  </div>
                </div>
                <LeadStatusBadge status={lead.status} />
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
