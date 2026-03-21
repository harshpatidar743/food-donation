const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters'
  }),
  email: Joi.string().email().lowercase().required().messages({
    'string.email': 'Valid email is required'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters'
  }),
  phone: Joi.string().min(10).max(15).required().messages({
    'string.min': 'Phone number too short',
    'string.max': 'Phone number too long'
  }),
  userType: Joi.string().valid('individual', 'organization', 'business/restaurant', 'admin').optional(),
  accountType: Joi.string().optional(),
  role: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required().messages({
    'string.email': 'Valid email is required'
  }),
  password: Joi.string().min(1).required().messages({
    'string.empty': 'Password is required'
  })
});

module.exports = {
  registerSchema,
  loginSchema
};
