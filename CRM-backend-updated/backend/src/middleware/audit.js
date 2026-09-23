const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');

const auditLog = (action, resource) => {
  return asyncHandler(async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode < 400) {
        AuditLog.create({
          user: req.user?.id,
          action,
          resource,
          resourceId: req.params.id || body?.data?._id || body?._id,
          details: { method: req.method, path: req.originalUrl, body: req.body },
          ip: req.ip,
          userAgent: req.get('user-agent'),
        }).catch(() => {}); // non-blocking
      }
      return originalJson(body);
    };
    next();
  });
};

module.exports = auditLog;

