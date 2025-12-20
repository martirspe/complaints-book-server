const redisClient = require('../config/redis');

const cacheMiddleware = async (req, res, next) => {
  try {
    const { userId } = req.params;  // Cambiado de customerId a userId para coincidir con tu ruta
    const tenantSlug = (req.tenant?.slug || req.header('x-tenant') || req.header('x-tenant-slug') || 'public').toString().toLowerCase();
    const cacheKey = `cache:${tenantSlug}:${userId}`;
    const data = await redisClient.get(cacheKey);
    
    if (data) {
      return res.status(200).json(JSON.parse(data));
    } else {
      next();
    }
  } catch (err) {
    console.error('Cache middleware error:', err);
    next();  // En caso de error, continuamos con la siguiente middleware
  }
};

module.exports = cacheMiddleware;