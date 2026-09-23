const Lead = require('../models/Lead');
const { NotFoundError } = require('../utils/ApiError');
const { invalidateStatsCache } = require('./dashboardService');

exports.createLead = async (data) => {
  const lead = await Lead.create(data);
  await invalidateStatsCache();
  return lead;
};

exports.getLeads = async ({ page = 1, limit = 10, status, search, assignedTo, sort = '-createdAt' }) => {
  const filter = {};
  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [leads, total] = await Promise.all([
    Lead.find(filter).populate('assignedTo', 'name email').sort(sort).skip(skip).limit(limit).lean(),
    Lead.countDocuments(filter),
  ]);

  return {
    leads,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

exports.getLeadById = async (id) => {
  const lead = await Lead.findById(id).populate('assignedTo', 'name email').lean();
  if (!lead) throw new NotFoundError('Lead not found');
  return lead;
};

exports.updateLead = async (id, data) => {
  const lead = await Lead.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('assignedTo', 'name email')
    .lean();
  if (!lead) throw new NotFoundError('Lead not found');
  await invalidateStatsCache();
  return lead;
};

exports.deleteLead = async (id) => {
  const lead = await Lead.findByIdAndDelete(id);
  if (!lead) throw new NotFoundError('Lead not found');
  await invalidateStatsCache();
  return lead;
};

exports.assignLead = async (id, assignedTo) => {
  const lead = await Lead.findByIdAndUpdate(id, { assignedTo }, { new: true })
    .populate('assignedTo', 'name email')
    .lean();
  if (!lead) throw new NotFoundError('Lead not found');
  await invalidateStatsCache();
  return lead;
};

