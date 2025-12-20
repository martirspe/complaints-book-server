// Default tenant/branding fallback config. Used for seeds and email templates when tenant data is absent.
module.exports = {
  companyBrand: process.env.DEFAULT_TENANT_COMPANY_BRAND || 'ACME Corp',
  companyName: process.env.DEFAULT_TENANT_COMPANY_NAME || 'ACME Corporation S.A.',
  companyRuc: process.env.DEFAULT_TENANT_COMPANY_RUC || '98765432109',
  primaryColor: process.env.DEFAULT_TENANT_PRIMARY_COLOR || '#1a1a1a',
  accentColor: process.env.DEFAULT_TENANT_ACCENT_COLOR || '#3a3a3a',
  logoLightPath: process.env.DEFAULT_TENANT_LOGO_LIGHT_PATH || 'assets/default-tenant/logo-light.png',
  logoDarkPath: process.env.DEFAULT_TENANT_LOGO_DARK_PATH || 'assets/default-tenant/logo-dark.png',
  faviconPath: process.env.DEFAULT_TENANT_FAVICON_PATH || 'assets/default-tenant/favicon.png',
  notificationsEmail: process.env.DEFAULT_TENANT_NOTIFICATIONS_EMAIL || 'support@example.com',
};