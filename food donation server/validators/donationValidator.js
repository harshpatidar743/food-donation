const Joi = require("joi");

const phonePattern = /^\+?[0-9][0-9\s-]{8,14}$/;
const pincodePattern = /^\d{4,10}$/;

const createDonationSchema = Joi.object({
  foodName: Joi.string().trim().min(2).required().messages({
    "string.empty": "Food name is required",
    "string.min": "Food name must be at least 2 characters"
  }),
  foodCategory: Joi.string().valid("Veg", "Non-veg").required().messages({
    "any.only": "Food category must be Veg or Non-veg",
    "string.empty": "Food category is required"
  }),
  quantity: Joi.number().positive().required().messages({
    "number.base": "Quantity must be a number",
    "number.positive": "Quantity must be positive",
    "any.required": "Quantity is required"
  }),
  quantityUnit: Joi.string().valid("people", "plates").default("plates").messages({
    "any.only": "Quantity type must be people or plates"
  }),
  foodPreparedTime: Joi.date().iso().required().messages({
    "date.base": "Food prepared time is invalid",
    "date.format": "Food prepared time must be a valid date and time",
    "any.required": "Food prepared time is required"
  }),
  availableUntil: Joi.date().iso().greater("now").required().messages({
    "date.base": "Available until / expiry time is invalid",
    "date.format": "Available until / expiry time must be a valid date and time",
    "date.greater": "Available until / expiry time must be after the current time",
    "any.required": "Available until / expiry time is required"
  }),
  fullAddress: Joi.string().trim().min(10).required().messages({
    "string.empty": "Full address is required",
    "string.min": "Full address must be at least 10 characters"
  }),
  pincode: Joi.string().trim().allow("").pattern(pincodePattern).messages({
    "string.pattern.base": "Pincode must contain 4 to 10 digits"
  }),
  contactNumber: Joi.string().trim().pattern(phonePattern).required().messages({
    "string.empty": "Contact number is required",
    "string.pattern.base": "Contact number must be a valid phone number"
  }),
  additionalNotes: Joi.string().trim().allow(""),
  foodImage: Joi.object({
    fileName: Joi.string().trim().required(),
    contentType: Joi.string().trim().pattern(/^image\//).required().messages({
      "string.pattern.base": "Food image must be a valid image file"
    }),
    dataUrl: Joi.string().dataUri().required().messages({
      "string.dataUri": "Food image must be a valid image file"
    })
  }).optional()
})
  .custom((value, helpers) => {
    if (new Date(value.availableUntil) <= new Date(value.foodPreparedTime)) {
      return helpers.error("any.invalid", {
        message: "Available until / expiry time must be after food prepared time"
      });
    }

    return value;
  })
  .messages({
    "any.invalid": "{{#message}}"
  });

const reduceDonationQuantitySchema = Joi.object({
  takenQuantity: Joi.number().integer().positive().required().messages({
    "number.base": "Taken quantity must be a number",
    "number.integer": "Taken quantity must be a whole number",
    "number.positive": "Taken quantity must be positive",
    "any.required": "Taken quantity is required"
  })
});

module.exports = {
  createDonationSchema,
  reduceDonationQuantitySchema
};
