const leadService = require('../services/leadService');
const asyncHandler = require('../utils/asyncHandler');

exports.createLead = asyncHandler(async (req, res) => {
  const lead = await leadService.createLead(req.body);
  res.status(201).json({ success: true, data: lead });
});

exports.getLeads = asyncHandler(async (req, res) => {
  const result = await leadService.getLeads(req.query);
  res.json({ success: true, ...result });
});

exports.getLeadById = asyncHandler(async (req, res) => {
  const lead = await leadService.getLeadById(req.params.id);
  res.json({ success: true, data: lead });
});

exports.updateLead = asyncHandler(async (req, res) => {
  const lead = await leadService.updateLead(req.params.id, req.body);
  res.json({ success: true, data: lead });
});

exports.deleteLead = asyncHandler(async (req, res) => {
  await leadService.deleteLead(req.params.id);
  res.json({ success: true, message: 'Lead deleted successfully' });
});

