const Joi = require("joi");

const pointLocationSchema = Joi.object({
  type: Joi.string().trim().valid("Point").required(),
  coordinates: Joi.array().items(Joi.number().required()).length(2).required()
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  phone: Joi.string().trim().min(10).max(15),
  address: Joi.string().trim().max(250).allow(""),
  location: pointLocationSchema,
  description: Joi.string().trim().max(1000).allow(""),
  profileImage: Joi.string().trim().uri().allow(""),
  operatingHours: Joi.string().trim().max(120).allow("")
}).min(1);

module.exports = {
  updateProfileSchema
};
