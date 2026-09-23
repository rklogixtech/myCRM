const activityService = require('../services/activityService');
const asyncHandler = require('../utils/asyncHandler');

exports.createActivity = asyncHandler(async (req, res) => {
  const activity = await activityService.createActivity({ ...req.body, user: req.user.id });
  res.status(201).json({ success: true, data: activity });
});

exports.getActivityTimeline = asyncHandler(async (req, res) => {
  const result = await activityService.getActivityTimeline(req.params.leadId, req.query);
  res.json({ success: true, ...result });
});

