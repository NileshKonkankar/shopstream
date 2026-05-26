# ShopStream Reliability Runbook

## MVP SLO Targets

| Area | Target |
| --- | --- |
| API availability | 99.5% monthly |
| Product list p95 latency | < 500 ms |
| Product detail p95 latency | < 400 ms |
| Cart mutation p95 latency | < 600 ms |
| Checkout API p95 latency | < 1.5 s, excluding payment provider latency |
| 5xx error rate | < 1% over 10 minutes |
| Inventory socket delivery | < 2 seconds p95 |
| Restore time objective | < 4 hours |
| Recovery point objective | < 24 hours |

## Health And Readiness

- `GET /health`: liveness check. Returns process uptime and timestamp.
- `GET /ready`: readiness check. Returns dependency state and should be used by load balancers/orchestrators before sending traffic.

Expected readiness behavior:

```json
{
  "status": "ready",
  "service": "shopstream-server",
  "dependencies": {
    "database": {
      "status": "up",
      "readyState": 1
    }
  }
}
```

## Required Dashboards

Track these signals before production launch:

- API requests per second by route.
- p50/p95/p99 latency by route.
- 4xx and 5xx rates by route.
- MongoDB query latency and connection pool usage.
- CPU, memory, event-loop delay, and process restarts.
- Stripe payment intent failures and webhook failures.
- Socket.IO connected clients and inventory event count.

## Alert Thresholds

| Alert | Threshold |
| --- | --- |
| High API errors | 5xx rate > 2% for 5 minutes |
| High latency | p95 API latency > 1 second for 10 minutes |
| Database unavailable | `/ready` returns 503 for 2 consecutive checks |
| Payment failures | Payment intent failures > 5% for 15 minutes |
| Webhook failures | Stripe webhook verification/processing failures > 1% for 15 minutes |
| Resource pressure | CPU or memory > 85% for 10 minutes |

## Deployment Expectations

- Run at least two stateless API replicas behind a load balancer for production.
- Use `SIGTERM` graceful shutdown during rolling deploys.
- Keep `/api/*` routes for compatibility and prefer `/api/v1/*` for new clients.
- Rollback target: restore previous backend/frontend version within 10 minutes.
- Run `npm run build`, `npm run lint`, `npm test`, and `npm audit --omit=dev` in CI.

## Data Reliability

- Maintain automated MongoDB backups.
- Test a restore before production launch and at least quarterly after launch.
- Hot-path indexes are declared in Mongoose models:
  - products by slug, category, active status, created date, and text search
  - orders by user/date, status/date, payment status/date, and payment intent id
  - carts by user
  - users by email

## Incident Checklist

1. Check `/health` and `/ready`.
2. Check recent deploys and rollback if the issue started after release.
3. Check logs by `requestId` from failing user responses.
4. Check MongoDB connectivity and slow queries.
5. Check Stripe dashboard and webhook delivery logs for checkout incidents.
6. Check Socket.IO connection counts for realtime inventory incidents.
7. Record impact, timeline, root cause, and corrective actions.
