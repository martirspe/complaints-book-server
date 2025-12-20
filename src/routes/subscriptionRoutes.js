/**
 * Subscription routes: billing, plans, usage, and account management.
 * Also includes legacy license verification endpoint (moved from licenseRoutes.js).
 * Protect admin-only endpoints with requireTenantRole('admin').
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const subscriptionController = require('../controllers/subscriptionController');
const requireTenantRole = require('../middlewares/requireTenantRole');

// ============== Public/Authenticated Routes ==============

// List all available plans (public)
router.get('/billing/plans', subscriptionController.listPlans);

// Get current subscription info (requires tenant context)
router.get('/billing/subscription', subscriptionController.getSubscription);

// Get usage metrics vs plan limits (requires tenant context)
router.get('/billing/usage', subscriptionController.getUsage);

// ============== Admin Routes ==============

// Upgrade to a different plan (admin only, usually called by payment webhook)
router.post('/billing/upgrade', requireTenantRole('admin'), subscriptionController.upgradePlan);

// Cancel/downgrade subscription (admin only)
router.post('/billing/cancel', requireTenantRole('admin'), subscriptionController.cancelSubscription);

module.exports = router;
