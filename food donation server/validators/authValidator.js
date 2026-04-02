const Joi = require('joi');

const ACCOUNT_TYPE_VALUES = ['individual', 'organization', 'ngo', 'business', 'restaurant', 'business/restaurant'];
const LEGACY_ROLE_TYPE_VALUES = ['individual', 'organization', 'business', 'business/restaurant'];
const ACCESS_ROLE_VALUES = ['user'];

const normalizeType = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === 'business') {
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
  city: Joi.string().trim().max(100).allow('').optional(),
  organizationName: Joi.string().trim().max(120).allow('').optional(),
  registrationNumber: Joi.string().trim().max(80).allow('').optional(),
  organizationAddress: Joi.string().trim().max(250).allow('').optional(),
  organizationCertificateName: Joi.string().trim().max(255).allow('').optional(),
  businessName: Joi.string().trim().max(120).allow('').optional(),
  businessType: Joi.string().trim().max(120).allow('').optional(),
  ownerName: Joi.string().trim().max(120).allow('').optional(),
  businessAddress: Joi.string().trim().max(250).allow('').optional(),
  gstNumber: Joi.string().trim().max(50).allow('').optional()
}).custom((value, helper) => {
  const resolvedType =
    normalizeType(value.accountType) ||
    normalizeType(value.role) ||
    normalizeType(value.userType) ||
    'individual';

  if (resolvedType === 'individual') {
    const error = requireFieldForType(value.address, helper, 'Address');
    return error || value;
  }

  if (resolvedType === 'organization') {
    const error =
      requireFieldForType(value.organizationName, helper, 'Organization name') ||
      requireFieldForType(value.registrationNumber, helper, 'Registration number') ||
      requireFieldForType(value.city, helper, 'City') ||
      requireFieldForType(value.organizationAddress, helper, 'Organization address') ||
      requireFieldForType(value.organizationCertificateName, helper, 'Organization certificate');

    return error || value;
  }

  if (resolvedType === 'business/restaurant') {
    const error =
      requireFieldForType(value.businessName, helper, 'Business name') ||
      requireFieldForType(value.businessType, helper, 'Business type') ||
      requireFieldForType(value.ownerName, helper, 'Owner name') ||
      requireFieldForType(value.city, helper, 'City') ||
      requireFieldForType(value.businessAddress, helper, 'Business address');

    return error || value;
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
