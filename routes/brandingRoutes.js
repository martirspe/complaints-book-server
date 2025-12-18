const express = require('express');
const branding = require('../config/branding');

const router = express.Router();

// Returns branding configuration with absolute URLs for logos
router.get('/branding', (req, res) => {
  const host = `${req.protocol}://${req.get('host')}`;

  const urlFor = (p) => `${host}/${String(p || '').replace(/^\//, '')}`;

  res.json({
    companyBrand: branding.companyBrand,
    companyName: branding.companyName,
    companyRuc: branding.companyRuc,
    primaryColor: branding.primaryColor,
    accentColor: branding.accentColor,
    logoLightUrl: urlFor(branding.logoLightPath),
    logoDarkUrl: urlFor(branding.logoDarkPath),
    faviconUrl: urlFor(branding.faviconPath),
  });
});

module.exports = router;
