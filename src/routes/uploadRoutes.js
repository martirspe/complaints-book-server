const express = require('express');

// File upload controller
const { uploadLogo } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Load a logo independently
router.post('/upload/logo', uploadLogo, (req, res) => {
    res.status(200).json({ message: 'Logo cargado correctamente', data: req.fileInfo });
  });

module.exports = router;
