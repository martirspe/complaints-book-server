// Default tenant/branding fallback config. Used for seeds and email templates when tenant data is absent.
module.exports = {
  companyBrand: process.env.DEFAULT_TENANT_COMPANY_BRAND || 'ReclamoFácil',
  companyName: process.env.DEFAULT_TENANT_COMPANY_NAME || 'ReclamoFácil S.A.C.',
  companyRuc: process.env.DEFAULT_TENANT_COMPANY_RUC || '20605432109',
  primaryColor: process.env.DEFAULT_TENANT_PRIMARY_COLOR || '#2563EB',
  accentColor: process.env.DEFAULT_TENANT_ACCENT_COLOR || '#16A34A',
  logoLightPath: process.env.DEFAULT_TENANT_LOGO_LIGHT_PATH || 'assets/default-tenant/logo-light.png',
  logoDarkPath: process.env.DEFAULT_TENANT_LOGO_DARK_PATH || 'assets/default-tenant/logo-dark.png',
  faviconPath: process.env.DEFAULT_TENANT_FAVICON_PATH || 'assets/default-tenant/favicon.png',
  notificationsEmail: process.env.DEFAULT_TENANT_NOTIFICATIONS_EMAIL || 'soporte@reclamofacil.com',
};