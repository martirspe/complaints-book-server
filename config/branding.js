const path = require('path');

// Branding configuration (single source of truth)
// Update values here to change company data, colors and logos.
module.exports = {
  companyBrand: process.env.BRANDING_COMPANY_NAME_COMERCIAL || 'MARRSO Store',
  companyName: process.env.BRANDING_COMPANY_NAME || 'MARRSO S.A.C',
  companyRuc: process.env.BRANDING_COMPANY_RUC || '20613518895',
  primaryColor: process.env.BRANDING_PRIMARY_COLOR || '#0d6efd',
  accentColor: process.env.BRANDING_ACCENT_COLOR || '#6610f2',
  // Paths are relative to the server root where static assets are served
  // Defaults to SVG placeholders; replace with your own files (PNG/SVG)
  logoLightPath: process.env.BRANDING_LOGO_LIGHT_PATH || 'assets/logos/logo-light.png',
  logoDarkPath: process.env.BRANDING_LOGO_DARK_PATH || 'assets/logos/logo-dark.png',
  faviconPath: process.env.BRANDING_FAVICON_PATH || 'assets/logos/favicon.png',
};
