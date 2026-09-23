const Deal = require('../models/Deal');
const { NotFoundError } = require('../utils/ApiError');
const { invalidateStatsCache } = require('./dashboardService');

exports.createDeal = async (data) => {
  const deal = await Deal.create(data);
  await invalidateStatsCache();
  return deal;
};

exports.getDeals = async ({ page = 1, limit = 10, stage, assignedTo, sort = '-createdAt' }) => {
  const filter = {};
  if (stage) filter.stage = stage;
  if (assignedTo) filter.assignedTo = assignedTo;

  const skip = (page - 1) * limit;
  const [deals, total] = await Promise.all([
    Deal.find(filter)
      .populate('lead', 'name email company')
      .populate('assignedTo', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Deal.countDocuments(filter),
  ]);

  return {
    deals,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

exports.getDealById = async (id) => {
  const deal = await Deal.findById(id)
    .populate('lead', 'name email company phone')
    .populate('assignedTo', 'name email')
    .lean();
  if (!deal) throw new NotFoundError('Deal not found');
  return deal;
};

exports.updateDeal = async (id, data) => {
  const deal = await Deal.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('lead', 'name email company')
    .populate('assignedTo', 'name email')
    .lean();
  if (!deal) throw new NotFoundError('Deal not found');
  await invalidateStatsCache();
  return deal;
};

exports.updateDealStage = async (id, stage) => {
  const deal = await Deal.findByIdAndUpdate(id, { stage }, { new: true })
    .populate('lead', 'name email company')
    .lean();
  if (!deal) throw new NotFoundError('Deal not found');
  await invalidateStatsCache();
  return deal;
};

exports.deleteDeal = async (id) => {
  const deal = await Deal.findByIdAndDelete(id);
  if (!deal) throw new NotFoundError('Deal not found');
  await invalidateStatsCache();
  return deal;
};

 