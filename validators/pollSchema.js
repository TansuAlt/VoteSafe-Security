const Joi = require('joi');

const createPollSchema = Joi.object({
  question: Joi.string().min(5).required(),
  options: Joi.array().items(Joi.string().min(1)).min(2).required(),
  durationMinutes: Joi.number().integer().min(1).max(10080).required()
});
module.exports = { createPollSchema };