const leadService = require('../services/leadService');
const asyncHandler = require('../utils/asyncHandler');

exports.assignLead = asyncHandler(async (req, res) => {
  const { assignedTo } = req.body;
  const lead = await leadService.assignLead(req.params.id, assignedTo);
  res.json({ success: true, data: lead });
});

