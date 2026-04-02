const Joi = require("joi");

const contactSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters"
  }),
  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be valid"
  }),
  message: Joi.string().trim().min(5).max(5000).required().messages({
    "string.empty": "Message is required",
    "string.min": "Message must be at least 5 characters"
  })
});

module.exports = {
  contactSchema
};
