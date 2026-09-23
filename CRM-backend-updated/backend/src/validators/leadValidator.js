const Joi = require('joi');

const createLeadSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(7).max(20).required(),
  company: Joi.string().trim().max(200).allow('', null),
  source: Joi.string().valid('website', 'referral', 'social', 'email', 'call', 'other'),
  status: Joi.string().valid('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'),
  notes: Joi.string().allow('', null),
  dealValue: Joi.number().min(0),
});

const updateLeadSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200),
  email: Joi.string().email(),
  phone: Joi.string().min(7).max(20),
  company: Joi.string().trim().max(200).allow('', null),
  source: Joi.string().valid('website', 'referral', 'social', 'email', 'call', 'other'),
  status: Joi.string().valid('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'),
  notes: Joi.string().allow('', null),
  dealValue: Joi.number().min(0),
  assignedTo: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
}).min(1);

module.exports = { createLeadSchema, updateLeadSchema };

