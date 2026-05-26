# ShopStream Security Notes

## Controls Implemented

- JWT-protected customer routes and admin-only product/order routes.
- Strict Zod request validation with unknown-field rejection for auth, cart, orders, products, and payment-intent creation.
- Helmet security headers, restrictive CORS, no-referrer policy, and global/auth-specific rate limiting.
- Password hashing with bcrypt and password hashes excluded from API responses.
- Server-side payment amount calculation from database prices.
- Stripe webhook signature verification and payment-intent idempotency check.
- Safe stock checks for cart, order creation, and payment fulfillment.
- Request IDs in responses and sanitized request logging without query-string leakage.
- Frontend production nginx security headers and CSP.

## Manual Security Regression Checklist

1. Verify customers receive `403` for `POST/PUT/DELETE /api/products` and `GET /api/orders`.
2. Verify protected APIs return `401` without a bearer token.
3. Verify tampered JWTs are rejected.
4. Verify registration rejects unknown fields such as `role`.
5. Verify cart and order quantities cannot exceed available stock.
6. Verify product creation rejects negative price, negative stock, invalid image URLs, and overly large payloads.
7. Verify payment intent amount is calculated from database product prices, not client-submitted totals.
8. Verify Stripe webhooks without a valid signature are rejected.
9. Verify production responses do not include stack traces.
10. Verify the browser receives security headers from the deployed frontend and backend.

## Finding Severity Rubric

- Critical: Authentication bypass, admin takeover, payment manipulation, remote code execution.
- High: IDOR exposing user orders, privilege escalation, persistent XSS, inventory/order tampering.
- Medium: Reflected XSS, weak rate limits, CORS weakness, sensitive error leakage.
- Low: Missing hardening headers, minor information disclosure, incomplete audit logging.
- Informational: Documentation gaps and defense-in-depth recommendations.

## Finding Template

```text
Title:
Severity:
Affected component:
Description:
Steps to reproduce:
Expected result:
Actual result:
Evidence:
Impact:
Recommended remediation:
Verification steps:
```
