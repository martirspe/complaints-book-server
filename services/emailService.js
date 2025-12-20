const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Branding configuration (single source of truth)
const branding = require('../config/branding');

// Get data from environment variables and branding config
const BRANDING_COMPANY_NAME = branding.companyName || 'MartiPE';
const BRANDING_LOGO_LIGHT_PATH = branding.logoLightPath || 'uploads/logos/logo-light.png';
const BRANDING_LOGO_DARK_PATH = branding.logoDarkPath || 'uploads/logos/logo-dark.png';

// Use light logo path for emails by default
const EMAIL_LOGO_PATH = BRANDING_LOGO_LIGHT_PATH;
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_SECURE = process.env.EMAIL_SECURE;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

// Support Email
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'admin@marrso.com';

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

const sendEmail = async (to, subject, text, templateName, replacements, attachments = []) => {
    try {
        const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
        const html = await fs.promises.readFile(templatePath, 'utf8');

        // Add EMAIL_COMPANY and current year to substitutions if they are not present
        replacements.companyName = BRANDING_COMPANY_NAME;
        replacements.currentYear = new Date().getFullYear();

        // Replace the placeholders in the template with real data
        const replacedHtml = html.replace(/{{([^{}]*)}}/g, (match, key) => {
            return replacements[key.trim()] || '';
        });

        // Include the company logo as an embedded attachment
        // Navigate from services folder to uploads folder (one level up from services)
        const logoPath = path.join(__dirname, '..', EMAIL_LOGO_PATH);
        
        // Check if logo file exists before attaching
        if (fs.existsSync(logoPath)) {
            attachments.push({
                filename: 'logo.png',
                path: logoPath,
                cid: 'companylogo' // CID used in HTML template
            });
        } else {
            console.warn(`Logo file not found at path: ${logoPath}`);
        }

        // Definition of email
        const mailOptions = {
            from: `${BRANDING_COMPANY_NAME} <${EMAIL_USER}>`,
            to: to,
            bcc: SUPPORT_EMAIL, // Sending a copy to support
            subject: subject,
            text: text,
            html: replacedHtml,
            attachments: attachments,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to: ${to} and BCC: ${SUPPORT_EMAIL}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendEmail;
