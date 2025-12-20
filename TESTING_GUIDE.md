# 🧪 Testing Guide - Consolidación de Licencias → Suscripciones

## Manual Testing Checklist

### 1. List Available Plans
```bash
curl -X GET http://localhost:3000/api/tenants/default/billing/plans

Expected Response:
[
  {
    "name": "free",
    "features": { ... },
    "price_monthly": 0,
    "description": "Para probar la plataforma"
  },
  {
    "name": "basic",
    "features": { ... },
    "price_monthly": 49,
    "description": "Para pequeños negocios"
  },
  ...
]
```

### 3. Get Current Subscription
```bash
curl -X GET http://localhost:3000/api/tenants/default/billing/subscription

Expected Response:
{
  "subscription": {
    "id": 1,
    "tenant_id": 1,
    "plan_name": "free",
    "status": "active",
    "billing_cycle_start": "2025-12-20T00:00:00.000Z",
    "billing_cycle_end": "2026-12-20T00:00:00.000Z",
    "auto_renew": true,
    ...
  },
  "plan_details": {
    "name": "Free",
    "features": { ... },
    "price_monthly": 0
  }
}
```

### 4. Check Usage vs Plan Limits
```bash
curl -X GET http://localhost:3000/api/tenants/default/billing/usage

Expected Response:
{
  "plan_name": "free",
  "usage": {
    "claims_this_month": 5,
    "claims_limit": 100,
    "users": 1,
    "users_limit": 2
  },
  "warnings": {
    "claims_approaching_limit": false,
    "users_approaching_limit": false
  }
}
```

### 5. Upgrade Plan (Admin Only)
```bash
# Admin token required
curl -X POST http://localhost:3000/api/tenants/default/billing/upgrade \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_name": "pro",
    "billing_cycle_start": "2025-12-20",
    "billing_cycle_end": "2026-12-20"
  }'

Expected Response:
{
  "message": "Plan actualizado a pro",
  "subscription": {
    "plan_name": "pro",
    "status": "active",
    ...
  },
  "plan_details": {
    "name": "Professional",
    "features": { ... },
    "price_monthly": 149
  }
}
```

### 6. Feature Gate - API Access
```bash
# Before upgrade (free plan): API access should be blocked
curl -X POST http://localhost:3000/api/tenants/default/api-keys \
  -H "Authorization: Bearer <user_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"label": "test"}'

Expected Response (403 Forbidden):
{
  "message": "Feature \"api_access\" no disponible en el plan free.",
  "upgrade_url": "/api/billing/upgrade"
}

# After upgrade to pro: Should work
(Upgrade to pro first, then retry)
Expected Response (200 OK):
{
  "message": "API key created",
  "api_key": { ... }
}
```

### 7. Cancel Subscription (Admin Only)
```bash
curl -X POST http://localhost:3000/api/tenants/default/billing/cancel \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "No longer needed"
  }'

Expected Response:
{
  "message": "Suscripción cancelada",
  "subscription": {
    "status": "cancelled",
    "cancelled_at": "2025-12-20T10:30:00.000Z",
    "cancellation_reason": "No longer needed"
  }
}
```

## Automated Tests (Jest Example)

```javascript
describe('Subscription Controller', () => {
  
  it('should get current subscription', async () => {
    const res = await request(app)
      .get('/api/tenants/default/billing/subscription')
      .expect(200);
    
    expect(res.body).toHaveProperty('subscription');
    expect(res.body).toHaveProperty('plan_details');
  });

  it('should list all plans', async () => {
    const res = await request(app)
      .get('/api/tenants/default/billing/plans')
      .expect(200);
    
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(4); // free, basic, pro, enterprise
  });

  it('should get usage metrics', async () => {
    const res = await request(app)
      .get('/api/tenants/default/billing/usage')
      .expect(200);
    
    expect(res.body).toHaveProperty('plan_name');
    expect(res.body).toHaveProperty('usage');
    expect(res.body.usage).toHaveProperty('claims_this_month');
    expect(res.body.usage).toHaveProperty('users');
  });

  it('should block api-key creation for free plan', async () => {
    const res = await request(app)
      .post('/api/tenants/default/api-keys')
      .set('Authorization', `Bearer ${token}`)
      .send({ label: 'test' })
      .expect(403);
    
    expect(res.body.message).toContain('api_access');
  });

  it('should upgrade plan to pro', async () => {
    const res = await request(app)
      .post('/api/tenants/default/billing/upgrade')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        plan_name: 'pro',
        billing_cycle_end: '2026-12-20'
      })
      .expect(200);
    
    expect(res.body.subscription.plan_name).toBe('pro');
  });
});
```

## Smoke Tests (Quick Validation)

```bash
#!/bin/bash
# smoke-test.sh

BASE_URL="http://localhost:3000/api/tenants/default"

echo "🧪 Running smoke tests..."

# Test 1: Plans endpoint
echo "1. Testing /billing/plans..."
curl -s $BASE_URL/billing/plans | jq . || echo "❌ FAILED"

# Test 2: Subscription endpoint
echo "2. Testing /billing/subscription..."
curl -s $BASE_URL/billing/subscription | jq . || echo "❌ FAILED"

# Test 3: Usage endpoint
echo "3. Testing /billing/usage..."
curl -s $BASE_URL/billing/usage | jq . || echo "❌ FAILED"

echo "✅ Smoke tests completed!"
```

## Regression Tests

Make sure these still work after consolidation:

```bash
# 1. User can still login
POST /api/users/login

# 2. User can still create claims
POST /api/tenants/:slug/claims

# 3. API keys still work (if plan supports)
POST /api/tenants/:slug/api-keys

# 4. Branding endpoint still works
GET /api/branding

# 5. Cache middleware works
GET /api/tenants/:slug/license/:userId (should be cached second time)
```

---

**Note**: All tests should pass after consolidation.  
**If any test fails**, check DEPRECATION_NOTES.md for migration details.
