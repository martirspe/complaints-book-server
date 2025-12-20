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

// Create a new customer
router.post('/customers', validateCustomerCreate, createCustomer);

// Get all customers
router.get('/customers', getCustomers);

// Get a customer by document number
router.get('/customers/document/:document_number', getCustomerByDocument);

// Get a customer by ID
router.get('/customers/:id', getCustomerById);

// Update a customer
router.put('/customers/:id', validateCustomerUpdate, updateCustomer);

// Delete a customer
router.delete('/customers/:id', deleteCustomer);

module.exports = router;
