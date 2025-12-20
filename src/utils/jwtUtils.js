const jwt = require('jsonwebtoken');

// Set up your secret key securely
const secret = process.env.JWT_SECRET || 'your_super_secret_key';

// Generate an access token with an expiration policy
const generateJWT = (user, tenantSlug = null) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      tenant_slug: tenantSlug,
    },
    secret,
    { expiresIn: '1h' }
  );
};

// Verifica el token y devuelve el payload decodificado
const verifyToken = (token) => {
  return jwt.verify(token, secret);
};

module.exports = { generateJWT, verifyToken };
