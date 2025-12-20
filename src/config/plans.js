/**
 * Plan definitions: feature limits, rate limits, and pricing per plan.
 * Centralized source of truth for SaaS tiers.
 */

const PLANS = {
  free: {
    name: 'Free',
    price_monthly: 0,
    features: {
      max_users: 2,
      max_claims_per_month: 100,
      storage_gb: 1,
      custom_branding: false,
      api_access: false,
      email_support: false,
      rate_limit_per_minute: 30,
    },
    description: 'Para probar la plataforma',
  },
  basic: {
    name: 'Basic',
    price_monthly: 49,
    features: {
      max_users: 5,
      max_claims_per_month: 1000,
      storage_gb: 10,
      custom_branding: true,
      api_access: false,
      email_support: true,
      rate_limit_per_minute: 60,
    },
    description: 'Para pequeños negocios',
  },
  pro: {
    name: 'Professional',
    price_monthly: 149,
    features: {
      max_users: 20,
      max_claims_per_month: 10000,
      storage_gb: 100,
      custom_branding: true,
      api_access: true,
      email_support: true,
      rate_limit_per_minute: 200,
    },
    description: 'Para empresas en crecimiento',
  },
  enterprise: {
    name: 'Enterprise',
    price_monthly: null, // Custom pricing
    features: {
      max_users: null, // Unlimited
      max_claims_per_month: null, // Unlimited
      storage_gb: null, // Unlimited
      custom_branding: true,
      api_access: true,
      email_support: true,
      rate_limit_per_minute: 1000,
    },
    description: 'Soluciones personalizadas para grandes empresas',
  },
};

/**
 * Get feature set for a plan name.
 * @param {string} planName - 'free', 'basic', 'pro', 'enterprise'
 * @returns {object} feature limits
 */
function getPlanFeatures(planName) {
  const plan = PLANS[planName?.toLowerCase()];
  if (!plan) return PLANS.free.features;
  return plan.features;
}

/**
 * Check if a tenant has access to a specific feature.
 * @param {object} subscription - Subscription record with plan_name
 * @param {string} featureName - e.g., 'api_access', 'custom_branding'
 * @returns {boolean}
 */
function hasFeature(subscription, featureName) {
  if (!subscription) return PLANS.free.features[featureName] || false;
  const features = getPlanFeatures(subscription.plan_name);
  return features[featureName] === true || features[featureName] !== false;
}

/**
 * Get rate limit for a plan.
 * @param {object} subscription - Subscription record
 * @returns {number} requests per minute
 */
function getRateLimit(subscription) {
  const features = getPlanFeatures(subscription?.plan_name);
  return features.rate_limit_per_minute || PLANS.free.features.rate_limit_per_minute;
}

module.exports = {
  PLANS,
  getPlanFeatures,
  hasFeature,
  getRateLimit,
};
