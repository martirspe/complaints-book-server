const logger = require('../utils/logger');

// Creates an audit logger middleware that records key request context after response finishes.
const auditMiddleware = (action) => {
  return (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      logger.info({
        action,
        tenant: req.tenant?.slug || null,
        user_id: req.user?.id || null,
        role: req.membership?.role || null,
        status: res.statusCode,
        method: req.method,
        path: req.originalUrl,
        duration_ms: Date.now() - start,
        ip: req.ip,
      }, 'audit');
    });
    next();
  };
};

module.exports = auditMiddleware;
