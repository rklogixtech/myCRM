const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const AuditLog = require('../models/AuditLog');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get(
  '/',
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, resource, userId } = req.query;
    const filter = {};
    if (resource) filter.resource = resource;
    if (userId) filter.user = userId;

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      logs,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  })
);

module.exports = router;

