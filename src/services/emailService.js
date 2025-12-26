const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { Tenant } = require('../models');

// In-memory cache for default tenant record
let defaultTenantCache = null;
const getDefaultTenant = async () => {
    if (defaultTenantCache) return defaultTenantCache;
    const slug = process.env.DEFAULT_TENANT_SLUG || 'default';
    defaultTenantCache = await Tenant.findOne({ where: { slug } });
    return defaultTenantCache;
};

// Helper to resolve branding per tenant with fallback to DB default tenant
const resolveBranding = async (tenant) => {
    const fallback = tenant || await getDefaultTenant();
    const companyName = fallback?.company_name || 'ReclamoFácil';
    const companyBrand = fallback?.company_brand || fallback?.company_name || companyName;
    const logoLightPath = fallback?.logo_light_url || 'assets/default-tenant/logo-light.png';
    const logoDarkPath = fallback?.logo_dark_url || 'assets/default-tenant/logo-dark.png';
    const notificationsEmail = fallback?.notifications_email || process.env.DEFAULT_TENANT_NOTIFICATIONS_EMAIL;
    return { companyName, companyBrand, logoLightPath, logoDarkPath, notificationsEmail };
};

// Use light logo path for emails by default (resolved per-tenant later)
const DEFAULT_EMAIL_LOGO_PATH = 'assets/default-tenant/logo-light.png';
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_SECURE = process.env.EMAIL_SECURE;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

// Global notifications email (fallback only)
const DEFAULT_NOTIFICATIONS_EMAIL = process.env.DEFAULT_TENANT_NOTIFICATIONS_EMAIL;

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_SECURE === 'true',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
    }
});

const sendEmail = async (to, subject, text, templateName, replacements, attachments = [], options = {}) => {
    try {
        const tenant = options.tenant;
        const brand = await resolveBranding(tenant);

        const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
        const html = await fs.promises.readFile(templatePath, 'utf8');

        // Add EMAIL_COMPANY and current year to substitutions if they are not present
        replacements.companyName = brand.companyName;
        replacements.currentYear = new Date().getFullYear();

        // Replace the placeholders in the template with real data
        const replacedHtml = html.replace(/{{([^{}]*)}}/g, (match, key) => {
            return replacements[key.trim()] || '';
        });

        // Include the company logo as an embedded attachment when it is a local path
        const logoPathRaw = brand.logoLightPath || brand.logoDarkPath || DEFAULT_EMAIL_LOGO_PATH;
        const isHttp = /^https?:\/\//i.test(logoPathRaw || '');
        if (!isHttp && logoPathRaw) {
            const logoPath = path.join(__dirname, '..', '..', logoPathRaw);
            if (fs.existsSync(logoPath)) {
                attachments.push({
                    filename: 'logo.png',
                    path: logoPath,
                    cid: 'companylogo' // CID used in HTML template
                });
            } else {
                console.warn(`Logo file not found at path: ${logoPath}`);
            }
        }

        // Resolve per-tenant support/notification email (BCC)
        const supportEmail = brand.notificationsEmail || DEFAULT_NOTIFICATIONS_EMAIL;

        // Definition of email
        const mailOptions = {
            from: `${brand.companyBrand} <${EMAIL_USER}>`,
            to: to,
            bcc: supportEmail, // Copy to tenant support/notifications
            subject: subject,
            text: text,
            html: replacedHtml,
            attachments: attachments,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to: ${to} and BCC: ${supportEmail}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendEmail;
