const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid('admin', 'sales'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  phone: Joi.string().trim().max(20).allow('', null),
  bio: Joi.string().trim().max(500).allow('', null),
  avatar: Joi.string().allow('', null),
}).min(1);

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(128).required(),
});

module.exports = { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema };

