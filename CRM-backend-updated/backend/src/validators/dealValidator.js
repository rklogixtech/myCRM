const Joi = require('joi');

const createDealSchema = Joi.object({
  lead: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  title: Joi.string().trim().min(2).max(200).required(),
  value: Joi.number().min(0).required(),
  stage: Joi.string().valid('discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost'),
  assignedTo: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  expectedCloseDate: Joi.date().iso().allow(null),
  notes: Joi.string().allow('', null),
});

const updateDealSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200),
  value: Joi.number().min(0),
  stage: Joi.string().valid('discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost'),
  assignedTo: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  expectedCloseDate: Joi.date().iso().allow(null),
  notes: Joi.string().allow('', null),
}).min(1);

module.exports = { createDealSchema, updateDealSchema };

