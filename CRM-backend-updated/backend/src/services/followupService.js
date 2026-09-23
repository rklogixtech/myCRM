const Followup = require('../models/Followup');
const { NotFoundError } = require('../utils/ApiError');
const { invalidateStatsCache } = require('./dashboardService');

exports.createFollowup = async (data) => {
  const followup = await Followup.create(data);
  await invalidateStatsCache();
  return followup;
};

exports.getFollowups = async ({ lead, assignedTo, completed, page = 1, limit = 10 }) => {
  const filter = {};
  if (lead) filter.lead = lead;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (completed !== undefined) filter.completed = completed === 'true';

  const skip = (page - 1) * limit;
  const [followups, total] = await Promise.all([
    Followup.find(filter)
      .populate('lead', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Followup.countDocuments(filter),
  ]);

  return {
    followups,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

exports.completeFollowup = async (id) => {
  const followup = await Followup.findByIdAndUpdate(
    id,
    { completed: true, completedAt: new Date() },
    { new: true }
  )
    .populate('lead', 'name email')
    .lean();
  if (!followup) throw new NotFoundError('Followup not found');
  await invalidateStatsCache();
  return followup;
};

exports.updateFollowup = async (id, data) => {
  const followup = await Followup.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('lead', 'name email')
    .lean();
  if (!followup) throw new NotFoundError('Followup not found');
  await invalidateStatsCache();
  return followup;
};

