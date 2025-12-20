/**
 * Feature gate middleware: validates tenant plan access to features.
 * Usage: app.use(requireFeature('api_access')) to gate API endpoints.
 */

const { Subscription } = require('../models');

/**
 * Middleware factory: requires a specific feature in the tenant's plan.
 * @param {string} featureName - e.g., 'api_access', 'custom_branding'
 * @param {function} customCheck - optional async function(subscription) => boolean
 * @returns {function} middleware
 */
const requireFeature = (featureName, customCheck = null) => {
  return async (req, res, next) => {
    try {
      if (!req.tenant) {
        return res.status(400).json({ message: 'Tenant no encontrado en request' });
      }

      const subscription = await Subscription.findOne({
        where: { tenant_id: req.tenant.id }
      });

      // Free plan or no subscription = default features only
      const features = require('../config/plans').getPlanFeatures(subscription?.plan_name);
      const hasAccess = features[featureName] === true;

      if (!hasAccess) {
        return res.status(403).json({
          message: `Feature "${featureName}" no disponible en el plan ${subscription?.plan_name || 'free'}.`,
          upgrade_url: `/api/billing/upgrade`
        });
      }

      // Optional custom validation (e.g., check usage limits)
      if (customCheck) {
        const customResult = await customCheck(subscription);
        if (!customResult) {
          return res.status(403).json({
            message: `Límite de uso alcanzado para "${featureName}".`,
            upgrade_url: `/api/billing/upgrade`
          });
        }
      }

      req.subscription = subscription;
      next();
    } catch (err) {
      req.log?.error({ err }, 'Error validando feature');
      res.status(500).json({ message: 'Error validando feature' });
    }
  };
};

module.exports = requireFeature;
