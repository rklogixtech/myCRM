const dashboardService = require('../services/dashboardService');
const asyncHandler = require('../utils/asyncHandler');

exports.getStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getStats();
  res.json({ success: true, data: stats });
});

