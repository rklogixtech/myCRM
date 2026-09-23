const { BadRequestError } = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = error.details.map((d) => d.message);
    throw new BadRequestError('Validation failed', details);
  }
  next();
};

module.exports = validate;

