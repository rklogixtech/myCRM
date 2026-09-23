const followupService = require('../services/followupService');
const asyncHandler = require('../utils/asyncHandler');

exports.createFollowup = asyncHandler(async (req, res) => {
  const followup = await followupService.createFollowup(req.body);
  res.status(201).json({ success: true, data: followup });
});

exports.getFollowups = asyncHandler(async (req, res) => {
  const result = await followupService.getFollowups(req.query);
  res.json({ success: true, ...result });
});

exports.completeFollowup = asyncHandler(async (req, res) => {
  const followup = await followupService.completeFollowup(req.params.id);
  res.json({ success: true, data: followup });
});

exports.updateFollowup = asyncHandler(async (req, res) => {
  const followup = await followupService.updateFollowup(req.params.id, req.body);
  res.json({ success: true, data: followup });
});

