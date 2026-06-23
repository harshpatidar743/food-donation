const Joi = require('joi');

const ACCOUNT_TYPE_VALUES = ['individual', 'organization', 'ngo', 'business', 'restaurant', 'business/restaurant'];
const LEGACY_ROLE_TYPE_VALUES = ['individual', 'organization', 'business', 'business/restaurant'];
const ACCESS_ROLE_VALUES = ['user', 'admin'];

const normalizeType = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === 'business' || normalizedValue === 'restaurant') {
    return 'business/restaurant';
  }

  return normalizedValue;
};

const requireFieldForType = (value, helper, label) => {
  if (typeof value === 'string' && value.trim()) {
    return;
  }

  return helper.message(`${label} is required`);
};

const hasValidPointCoordinates = (coordinates) =>
  Array.isArray(coordinates) &&
  coordinates.length === 2 &&
  coordinates.every((coordinate) => typeof coordinate === 'number' && Number.isFinite(coordinate));

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
  userType: Joi.string().trim().valid(...ACCOUNT_TYPE_VALUES).optional(),
  accountType: Joi.string().trim().valid(...ACCOUNT_TYPE_VALUES).optional(),
  role: Joi.string().trim().valid(...LEGACY_ROLE_TYPE_VALUES, ...ACCESS_ROLE_VALUES).optional(),
  address: Joi.string().trim().max(250).allow('').optional(),
  location: Joi.object({
    type: Joi.string().trim().valid('Point').required(),
    coordinates: Joi.array().items(Joi.number().required()).length(2).required()
  }).optional(),
  city: Joi.string().trim().max(100).allow('').optional()
}).custom((value, helper) => {
  const resolvedType =
    normalizeType(value.accountType) ||
    normalizeType(value.role) ||
    normalizeType(value.userType) ||
    'individual';

  if (resolvedType === 'organization' || resolvedType === 'business/restaurant') {
    if (!hasValidPointCoordinates(value.location?.coordinates)) {
      return helper.message('Location coordinates are required');
    }
  }

  return value;
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
