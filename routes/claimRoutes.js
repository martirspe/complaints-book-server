const express = require('express');

// Upload middleware
const { uploadClaim, uploadResolveClaim } = require('../middlewares/uploadMiddleware');
// Optional reCAPTCHA middleware
const recaptchaMiddleware = require('../middlewares/recaptchaMiddleware');
const { validateClaimCreate, validateClaimUpdate, validateClaimAssign, validateClaimResolve } = require('../middlewares/validationMiddleware');

// Claims controller
const {
  createClaim,
  getClaims,
  getClaimById,
  updateClaim,
  deleteClaim,
  assignClaim,
  resolveClaim
} = require('../controllers/claimController');

const router = express.Router();

// Create a new claim (multipart parsing first to populate req.body)
router.post('/claims', uploadClaim, validateClaimCreate, recaptchaMiddleware, createClaim);

// Get all claims
router.get('/claims', getClaims);

// Get a claim by ID
router.get('/claims/:id', getClaimById);

// Update a claim
router.put('/claims/:id', validateClaimUpdate, uploadClaim, updateClaim);

// Delete a claim
router.delete('/claims/:id', deleteClaim);

// Assign a claim
router.patch('/claims/:id/assign', validateClaimAssign, assignClaim);

// Resolve a claim (multipart parsing first to populate req.body)
router.patch('/claims/:id/resolve', uploadResolveClaim, validateClaimResolve, resolveClaim);

module.exports = router;
