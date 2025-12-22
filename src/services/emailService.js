const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Default tenant/branding fallback values
const defaultTenant = require('../config/defaultTenant');

// Helper to resolve branding per tenant with fallback to global config
const resolveBranding = (tenant) => {
    const companyName = tenant?.company_name || defaultTenant.companyName || 'ReclamoFácil';
    const companyBrand = tenant?.company_brand || tenant?.company_name || defaultTenant.companyBrand || companyName;
    const logoLightPath = tenant?.logo_light_url || defaultTenant.logoLightPath || 'assets/default-tenant/logo-light.png';
    const logoDarkPath = tenant?.logo_dark_url || defaultTenant.logoDarkPath || 'assets/default-tenant/logo-dark.png';
    return { companyName, companyBrand, logoLightPath, logoDarkPath };
};

// Use light logo path for emails by default (resolved per-tenant later)
const DEFAULT_EMAIL_LOGO_PATH = defaultTenant.logoLightPath || 'assets/default-tenant/logo-light.png';
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
        const brand = resolveBranding(tenant);

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
        const supportEmail = tenant?.notifications_email || DEFAULT_NOTIFICATIONS_EMAIL || defaultTenant.notificationsEmail;

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
