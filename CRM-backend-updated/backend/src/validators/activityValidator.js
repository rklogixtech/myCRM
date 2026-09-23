const Joi = require('joi');

const createActivitySchema = Joi.object({
  lead: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  type: Joi.string().valid('note', 'call', 'email', 'meeting', 'status_change', 'assignment', 'deal_update').required(),
  description: Joi.string().trim().min(1).max(2000).required(),
  metadata: Joi.object(),
});

module.exports = { createActivitySchema };

