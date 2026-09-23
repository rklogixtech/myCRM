const Activity = require('../models/Activity');

exports.createActivity = async (data) => {
  return Activity.create(data);
};

exports.getActivityTimeline = async (leadId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const [activities, total] = await Promise.all([
    Activity.find({ lead: leadId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Activity.countDocuments({ lead: leadId }),
  ]);

  return {
    activities,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

