const express = require('express');

// Tutor controller
const {
  createTutor,
  getTutors,
  getTutorByDocument,
  getTutorById,
  updateTutor,
  deleteTutor
} = require('../controllers/tutorController');

const router = express.Router();
const { validateTutorCreate, validateTutorUpdate } = require('../middlewares/validationMiddleware');
const { apiKeyOrJwt } = require('../middlewares');

// All tutor routes require authentication and tenant context
// Public-facing (can be accessed via API key or JWT)

// Create a new tutor
router.post('/tutors', apiKeyOrJwt, validateTutorCreate, createTutor);

// Get all tutors (scoped to tenant)
router.get('/tutors', apiKeyOrJwt, getTutors);

// Get a tutor by document number (scoped to tenant)
router.get('/tutors/document/:document_number', apiKeyOrJwt, getTutorByDocument);

// Get a tutor by ID (scoped to tenant)
router.get('/tutors/:id', apiKeyOrJwt, getTutorById);

// Update a tutor
router.put('/tutors/:id', apiKeyOrJwt, validateTutorUpdate, updateTutor);

// Delete a tutor
router.delete('/tutors/:id', apiKeyOrJwt, deleteTutor);

module.exports = router;
