const axios = require('axios');

// Optional reCAPTCHA v2 verification middleware
// Expects token in req.body.recaptcha
// Skips verification if RECAPTCHA_SECRET is not set
module.exports = async function recaptchaMiddleware(req, res, next) {
  try {
    const secret = process.env.RECAPTCHA_SECRET;
    if (!secret) {
      return next();
    }
    const token = req.body.recaptcha;
    if (!token) {
      return res.status(400).json({ message: 'Missing reCAPTCHA token' });
    }

    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      new URLSearchParams({ secret, response: token }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (!response.data.success) {
      return res.status(400).json({ message: 'Invalid reCAPTCHA', codes: response.data['error-codes'] });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: 'reCAPTCHA verification failed', error: err.message });
  }
}
