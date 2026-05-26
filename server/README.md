# ShopStream API Server 🖥️

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green.svg)](https://www.mongodb.com/)
[![Jest](https://img.shields.io/badge/Jest-29.x-brightgreen.svg)](https://jestjs.io/)

The API server for ShopStream is a production-grade, asynchronous backend built using **Node.js**, **Express**, **TypeScript**, and **MongoDB**. It exposes robust REST endpoints, maintains low-latency duplex client connections using **Socket.IO** for real-time inventory tracking, and implements a zero-trust payments layer with the **Stripe Payment Intents API**.

---

## 🛠️ Backend Architecture

The server adheres to a strict controller-service-model pattern, separating concern layers to maintain scalability:

```
Request ──> Middleware (Helmet, Rate Limit, Auth) ──> Router ──> Validator (Zod) ──> Controller ──> DB (Mongoose)
                                                                                         │
                                                                                         └───> Sockets (Broadcast)
```

1. **Routing Layer**: Dispatches incoming HTTP requests to dedicated feature controllers.
2. **Validation Layer**: Zod schemas run inline on router definitions, intercepting and sanitizing payloads before execution.
3. **Controller Layer**: Coordinates business requests, interacts with Mongoose schemas, triggers database transactions, and manages response payloads.
4. **Websockets Gateway**: Dispatches state updates (such as inventory stock changes) to active clients via Socket.IO events.

---

## ⚙️ Environment Configuration

Ensure that your `server/.env` file is fully configured before launching the application:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/shopstream
JWT_SECRET=super_secret_jwt_key_shopstream_portfolioproject
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CURRENCY=INR
```

---

## 🚀 Available Scripts

Run these scripts from the `server/` directory:

| Script | Purpose |
| :--- | :--- |
| `npm run dev` | Starts the server in development mode using `ts-node-dev` with hot reload. |
| `npm run build` | Compiles the TypeScript codebase into static Javascript within the `dist/` directory. |
| `npm start` | Launches the pre-compiled server from `dist/server.js` (production-mode). |
| `npm run lint` | Performs strict TypeScript compile checks without outputting files. |
| `npm test` | Runs the integration test suites using Jest in isolated serial mode. |
| `npm run test:watch` | Enters Jest's watch mode for continuous test execution during refactoring. |
| `npm run test:coverage` | Computes full statement, branch, and file coverage percentages. |

---

## ⚡ Stripe Payment Elements Integration

The backend implements a **zero-trust payment flow**:
1. **Endpoint**: `POST /api/payments/create-intent`
2. **Input**: A list of cart item IDs and requested purchase quantities.
3. **Price Isolation**: The server ignores client-provided pricing models entirely, querying database-level record models to calculate totals securely in **INR (₹)**.
4. **Stripe API Call**: Registers a transaction intent and returns a transaction-specific `client_secret` to the client.
5. **Webhook Handler**: `POST /api/payments/webhook` listens for Stripe's checkout confirmation events, instantly instantiating order records and broadcasting stock reductions when successful.

---

## 📡 Real-Time Socket Updates

Active duplex socket channels are managed via `server/src/sockets/socket.ts`.

### Inventory Broadcasting
Whenever an order is completed, or an administrator adjusts stock balances:
* **Event Name**: `inventory:update`
* **JSON Payload Structure**:
  ```json
  {
    "productId": "65f1a5c68f123456789abcde",
    "stock": 12
  }
  ```

---

## 🔌 API Documentation

### System Health
* `GET /health` - Returns service runtime diagnostics.

### User Authentication (`/api/auth`)
* `POST /register` - Registers a new user. Sanitizes credentials using Zod schemas.
* `POST /login` - Issues a JWT token upon valid credential challenge.
* `GET /me` - Returns active profile details of the authorized user session.

### Product Catalog (`/api/products`)
* `GET /` - Fetches filtered list of products (paginated, supports search).
* `GET /:id` - Fetches individual product details.
* `POST /` - Creates a new catalog item (Admin role only).
* `PUT /:id` - Updates catalog metadata or stock values (Admin role only; triggers socket broadcasts).
* `DELETE /:id` - Removes product from catalogs (Admin role only).

### Shopping Cart (`/api/cart`)
* `GET /` - Retrives cart items.
* `POST /items` - Adds item to cart. Fails if quantity exceeds stock.
* `PUT /items/:productId` - Modifies cart item counts.
* `DELETE /items/:productId` - Removes product from cart.
* `DELETE /` - Clears entire shopping cart.

### Order Processing (`/api/orders`)
* `POST /` - Builds new order sheet after payment success.
* `GET /my` - Retrieves personal order list.
* `GET /` - Displays global sales history (Admin role only).

### Stripe payments (`/api/payments`)
* `POST /create-intent` - Generates payment intent with backend cost recalculation.
* `POST /webhook` - Receives signed Stripe webhook transactions.

---

## 🛡️ Middlewares & Security

* **`requestLogger`**: Tracks incoming REST paths, outputting `[METHOD] /route - Status (duration)` logs.
* **`authMiddleware`**: Verifies incoming Bearer JWT tokens.
* **`roleMiddleware`**: Verifies required roles (e.g. `admin`) to block unauthorized users.
* **`validateRequest`**: Reusable middleware running Zod schema sanitization.
* **`errorHandler`**: Gracefully formats unexpected system errors without leaking database logs or server stacktraces.
