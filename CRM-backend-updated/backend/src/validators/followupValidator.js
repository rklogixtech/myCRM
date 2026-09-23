const Joi = require('joi');

const createFollowupSchema = Joi.object({
  lead: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  type: Joi.string().valid('call', 'email', 'meeting', 'task').required(),
  title: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().allow('', null),
  dueDate: Joi.date().iso().required(),
});

const updateFollowupSchema = Joi.object({
  type: Joi.string().valid('call', 'email', 'meeting', 'task'),
  title: Joi.string().trim().min(2).max(200),
  description: Joi.string().allow('', null),
  dueDate: Joi.date().iso(),
  completed: Joi.boolean(),
}).min(1);

module.exports = { createFollowupSchema, updateFollowupSchema };

