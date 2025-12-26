const express = require('express');

// Customer controller
const {
  createCustomer,
  getCustomers,
  getCustomerByDocument,
  getCustomerById,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');

const router = express.Router();
const { validateCustomerCreate, validateCustomerUpdate } = require('../middlewares/validationMiddleware');
const { apiKeyOrJwt } = require('../middlewares');

// All customer routes require authentication and tenant context
// Public-facing (can be accessed via API key or JWT)
// Routes are scoped by tenant slug in URL

// Create a new customer
router.post('/tenants/:slug/customers', apiKeyOrJwt, validateCustomerCreate, createCustomer);

// Get all customers (scoped to tenant)
router.get('/tenants/:slug/customers', apiKeyOrJwt, getCustomers);

// Get a customer by document number (scoped to tenant)
router.get('/tenants/:slug/customers/document/:document_number', apiKeyOrJwt, getCustomerByDocument);

// Get a customer by ID (scoped to tenant)
router.get('/tenants/:slug/customers/:id', apiKeyOrJwt, getCustomerById);

// Update a customer
router.put('/tenants/:slug/customers/:id', apiKeyOrJwt, validateCustomerUpdate, updateCustomer);

// Delete a customer
router.delete('/tenants/:slug/customers/:id', apiKeyOrJwt, deleteCustomer);

module.exports = router;
