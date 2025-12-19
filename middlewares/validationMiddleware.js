const { body, param, validationResult } = require('express-validator');

// Common error handler for validations
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(422).json({
    message: 'Validación fallida. Por favor revisa los campos',
    errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
  });
};

// Regex helpers
const DIGITS = count => new RegExp(`^\\d{${count}}$`);
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;

// Customer validators
const validateCustomerCreate = [
  body('document_type_id').isInt().withMessage('document_type_id must be an integer').toInt(),
  body('document_number').custom(val => DIGITS(8).test(String(val))).withMessage('document_number must have 8 digits'),
  body('first_name').isString().isLength({ min: 1 }).withMessage('first_name is required').matches(NAME_REGEX).withMessage('first_name contains invalid characters'),
  body('last_name').isString().isLength({ min: 1 }).withMessage('last_name is required').matches(NAME_REGEX).withMessage('last_name contains invalid characters'),
  body('email').isEmail().withMessage('email must be valid').normalizeEmail(),
  body('phone').custom(val => DIGITS(9).test(String(val))).withMessage('phone must have 9 digits'),
  body('address').isString().isLength({ min: 25 }).withMessage('address must be at least 25 characters'),
  body('is_younger').optional().isBoolean().withMessage('is_younger must be boolean').toBoolean(),
  handleValidationErrors,
];

const validateCustomerUpdate = [
  param('id').isInt().withMessage('id param must be integer').toInt(),
  body('document_type_id').optional().isInt().withMessage('document_type_id must be an integer').toInt(),
  body('document_number').optional().custom(val => DIGITS(8).test(String(val))).withMessage('document_number must have 8 digits'),
  body('first_name').optional().isString().matches(NAME_REGEX).withMessage('first_name contains invalid characters'),
  body('last_name').optional().isString().matches(NAME_REGEX).withMessage('last_name contains invalid characters'),
  body('email').optional().isEmail().withMessage('email must be valid').normalizeEmail(),
  body('phone').optional().custom(val => DIGITS(9).test(String(val))).withMessage('phone must have 9 digits'),
  body('address').optional().isString().isLength({ min: 25 }).withMessage('address must be at least 25 characters'),
  body('is_younger').optional().isBoolean().withMessage('is_younger must be boolean').toBoolean(),
  handleValidationErrors,
];

// Tutor validators
const validateTutorCreate = [
  body('document_type_id').isInt().withMessage('document_type_id must be an integer').toInt(),
  body('document_number').custom(val => DIGITS(8).test(String(val))).withMessage('document_number must have 8 digits'),
  body('first_name').isString().isLength({ min: 1 }).withMessage('first_name is required').matches(NAME_REGEX).withMessage('first_name contains invalid characters'),
  body('last_name').isString().isLength({ min: 1 }).withMessage('last_name is required').matches(NAME_REGEX).withMessage('last_name contains invalid characters'),
  body('email').isEmail().withMessage('email must be valid').normalizeEmail(),
  body('phone').custom(val => DIGITS(9).test(String(val))).withMessage('phone must have 9 digits'),
  handleValidationErrors,
];

const validateTutorUpdate = [
  param('id').isInt().withMessage('id param must be integer').toInt(),
  body('document_type_id').optional().isInt().withMessage('document_type_id must be an integer').toInt(),
  body('document_number').optional().custom(val => DIGITS(8).test(String(val))).withMessage('document_number must have 8 digits'),
  body('first_name').optional().isString().matches(NAME_REGEX).withMessage('first_name contains invalid characters'),
  body('last_name').optional().isString().matches(NAME_REGEX).withMessage('last_name contains invalid characters'),
  body('email').optional().isEmail().withMessage('email must be valid').normalizeEmail(),
  body('phone').optional().custom(val => DIGITS(9).test(String(val))).withMessage('phone must have 9 digits'),
  handleValidationErrors,
];

// Claim validators
const validateClaimCreate = [
  body('customer_id').isInt().withMessage('customer_id must be integer').toInt(),
  body('tutor_id').optional({ nullable: true }).isInt().withMessage('tutor_id must be integer').toInt(),
  body('claim_type_id').isInt().withMessage('claim_type_id must be integer').toInt(),
  body('consumption_type_id').isInt().withMessage('consumption_type_id must be integer').toInt(),
  body('currency_id').isInt().withMessage('currency_id must be integer').toInt(),
  body('order_number').optional().isInt().withMessage('order_number must be integer').toInt(),
  body('claimed_amount').isFloat().withMessage('claimed_amount must be a number').toFloat(),
  body('description').isString().isLength({ min: 100 }).withMessage('description must be at least 100 characters'),
  body('detail').isString().isLength({ min: 50 }).withMessage('detail must be at least 50 characters'),
  body('request').isString().isLength({ min: 100 }).withMessage('request must be at least 100 characters'),
  handleValidationErrors,
];

const validateClaimUpdate = [
  param('id').isInt().withMessage('id param must be integer').toInt(),
  body('claim_type_id').optional().isInt().withMessage('claim_type_id must be integer').toInt(),
  body('consumption_type_id').optional().isInt().withMessage('consumption_type_id must be integer').toInt(),
  body('currency_id').optional().isInt().withMessage('currency_id must be integer').toInt(),
  body('order_number').optional().isInt().withMessage('order_number must be integer').toInt(),
  body('claimed_amount').optional().isFloat().withMessage('claimed_amount must be a number').toFloat(),
  body('description').optional().isString().isLength({ min: 100 }).withMessage('description must be at least 100 characters'),
  body('detail').optional().isString().isLength({ min: 50 }).withMessage('detail must be at least 50 characters'),
  body('request').optional().isString().isLength({ min: 100 }).withMessage('request must be at least 100 characters'),
  handleValidationErrors,
];

const validateClaimAssign = [
  param('id').isInt().withMessage('id param must be integer').toInt(),
  body('assigned_user').isInt().withMessage('assigned_user must be integer').toInt(),
  handleValidationErrors,
];

const validateClaimResolve = [
  param('id').isInt().withMessage('id param must be integer').toInt(),
  body('response').isString().isLength({ min: 1 }).withMessage('response is required'),
  body('resolved').isBoolean().withMessage('resolved must be boolean').toBoolean(),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateCustomerCreate,
  validateCustomerUpdate,
  validateTutorCreate,
  validateTutorUpdate,
  validateClaimCreate,
  validateClaimUpdate,
  validateClaimAssign,
  validateClaimResolve,
};
