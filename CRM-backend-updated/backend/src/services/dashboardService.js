const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const Followup = require('../models/Followup');
const { getCache, setCache, deleteCache } = require('../utils/cache');
const { DASHBOARD_CACHE_TTL } = require('../config/env');

const DASHBOARD_CACHE_KEY = 'dashboard:stats';

exports.getStats = async () => {
  const cached = await getCache(DASHBOARD_CACHE_KEY);
  if (cached) {
    return { ...cached, cached: true };
  }

  const [
    totalLeads,
    leadsByStatus,
    totalDeals,
    dealsByStage,
    totalDealValue,
    pendingFollowups,
    recentLeads,
  ] = await Promise.all([
    Lead.countDocuments(),
    Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Deal.countDocuments(),
    Deal.aggregate([{ $group: { _id: '$stage', count: { $sum: 1 } } }]),
    Deal.aggregate([{ $group: { _id: null, total: { $sum: '$value' } } }]),
    Followup.countDocuments({ completed: false, dueDate: { $gte: new Date() } }),
    Lead.find().sort({ createdAt: -1 }).limit(5).populate('assignedTo', 'name email').lean(),
  ]);

  const stats = {
    totalLeads,
    leadsByStatus: leadsByStatus.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
    totalDeals,
    dealsByStage: dealsByStage.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
    totalDealValue: totalDealValue[0]?.total || 0,
    pendingFollowups,
    recentLeads,
  };

  await setCache(DASHBOARD_CACHE_KEY, stats, DASHBOARD_CACHE_TTL);

  return { ...stats, cached: false };
};

/**
 * Invalidate the dashboard cache. Called by lead/deal/followup services
 * whenever they mutate data the dashboard aggregates depend on, so stale
 * numbers are never served for longer than one write.
 */
exports.invalidateStatsCache = async () => {
  await deleteCache(DASHBOARD_CACHE_KEY);
};

