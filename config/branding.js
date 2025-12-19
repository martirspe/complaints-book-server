const path = require('path');

// Branding configuration (single source of truth)
// Update values here or via environment variables to customize company data and appearance
// Fallback values provide a complete branded experience even without .env configuration

module.exports = {
  // Company Identity
  companyBrand: process.env.BRANDING_COMPANY_NAME_COMERCIAL || 'ACME Corp',
  companyName: process.env.BRANDING_COMPANY_NAME || 'ACME Corporation S.A.',
  companyRuc: process.env.BRANDING_COMPANY_RUC || '98765432109',

  // Color Scheme (Brand colors used throughout the client app)
  // Primary: Main action color (buttons, links, accents)
  // Accent: Secondary color for highlights and borders
  primaryColor: process.env.BRANDING_PRIMARY_COLOR || '#01b681',     // Green - Trust & Growth
  accentColor: process.env.BRANDING_ACCENT_COLOR || '#2d2a26',       // Dark Brown - Professionalism

  // Asset Paths (relative to server root where static assets are served)
  // Light logo: Use on dark backgrounds
  // Dark logo: Use on light backgrounds
  // Favicon: 16x16 or 32x32 recommended
  logoLightPath: process.env.BRANDING_LOGO_LIGHT_PATH || 'assets/logos/logo-light.png',
  logoDarkPath: process.env.BRANDING_LOGO_DARK_PATH || 'assets/logos/logo-dark.png',
  faviconPath: process.env.BRANDING_FAVICON_PATH || 'assets/logos/favicon.png',
};
