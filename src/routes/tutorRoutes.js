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

// Create a new tutor
router.post('/tutors', validateTutorCreate, createTutor);

// Get all tutors
router.get('/tutors', getTutors);

// Get a tutor by document number
router.get('/tutors/document/:document_number', getTutorByDocument);

// Get a tutor by ID
router.get('/tutors/:id', getTutorById);

// Update a tutor
router.put('/tutors/:id', validateTutorUpdate, updateTutor);

// Delete a tutor
router.delete('/tutors/:id', deleteTutor);

module.exports = router;
