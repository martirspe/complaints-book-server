// Config de branding por defecto (fallback). Para multi-tenant se usa la tabla tenants.
module.exports = {
  companyBrand: process.env.BRANDING_COMPANY_NAME_COMERCIAL || 'ACME Corp',
  companyName: process.env.BRANDING_COMPANY_NAME || 'ACME Corporation S.A.',
  companyRuc: process.env.BRANDING_COMPANY_RUC || '98765432109',
  primaryColor: process.env.BRANDING_PRIMARY_COLOR || '#1a1a1a',
  accentColor: process.env.BRANDING_ACCENT_COLOR || '#3a3a3a',
  logoLightPath: process.env.BRANDING_LOGO_LIGHT_PATH || 'assets/default-branding/logo-light.png',
  logoDarkPath: process.env.BRANDING_LOGO_DARK_PATH || 'assets/default-branding/logo-dark.png',
  faviconPath: process.env.BRANDING_FAVICON_PATH || 'assets/default-branding/favicon.png',
};
