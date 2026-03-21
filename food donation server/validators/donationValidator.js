const Joi = require('joi');

const createDonationSchema = Joi.object({
  donorId: Joi.string().required(),
  foodType: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Food type is required'
  }),
  quantity: Joi.number().positive().required().messages({
    'number.base': 'Quantity must be a number',
    'number.positive': 'Quantity must be positive'
  }),
  location: Joi.string().trim().min(3).required().messages({
    'string.empty': 'Location is required',
    'string.min': 'Location must be at least 3 characters'
  })
});

module.exports = {
  createDonationSchema
};
