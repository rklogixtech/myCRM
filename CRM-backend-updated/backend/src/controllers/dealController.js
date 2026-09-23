const dealService = require('../services/dealService');
const asyncHandler = require('../utils/asyncHandler');

exports.createDeal = asyncHandler(async (req, res) => {
  const deal = await dealService.createDeal(req.body);
  res.status(201).json({ success: true, data: deal });
});

exports.getDeals = asyncHandler(async (req, res) => {
  const result = await dealService.getDeals(req.query);
  res.json({ success: true, ...result });
});

exports.getDealById = asyncHandler(async (req, res) => {
  const deal = await dealService.getDealById(req.params.id);
  res.json({ success: true, data: deal });
});

exports.updateDeal = asyncHandler(async (req, res) => {
  const deal = await dealService.updateDeal(req.params.id, req.body);
  res.json({ success: true, data: deal });
});

exports.updateDealStage = asyncHandler(async (req, res) => {
  const { stage } = req.body;
  const deal = await dealService.updateDealStage(req.params.id, stage);
  res.json({ success: true, data: deal });
});

exports.deleteDeal = asyncHandler(async (req, res) => {
  await dealService.deleteDeal(req.params.id);
  res.json({ success: true, message: 'Deal deleted successfully' });
});

