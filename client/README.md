# ShopStream Frontend Client 🎨

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-blue.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4.x-orange.svg)](https://vitest.dev/)

ShopStream Client is a production-grade single page application (SPA) built using **React**, **TypeScript**, and **Vite**. It features responsive layout rendering via **Tailwind CSS**, optimized state management using **Zustand**, server caching via **TanStack Query**, and instant state reconciliation through **Socket.IO Client** for real-time inventory tracking.

---

## 🚀 Core Features & Implementation Details

* **Interactive Shopping Experience**: Fluid layouts for browsing catalogs, filtering products by categories, searching items, and reviewing details.
* **Persistent Zustand Stores**: Lightweight, custom Zustand stores with auto-persistence configurations for `auth` token storage and `cart` session caching.
* **Secure Checkout Flow**: Employs **Stripe Elements** inline inside the Checkout page, retrieving secure backend payment client secrets, confirming transactions, and triggering automated order sheets.
* **Socket-Driven State Sync**: Integrates a global socket listener (`client/src/sockets/inventory.socket.ts`) that intercepts `inventory:update` broadcasts, updating stock volumes instantly.
* **Robust Form Handling**: Leverages **React Hook Form** + **Zod** for high-performance, validated registration and login forms.
* **Client-Side Security Guards**: Protected client-side routing modules (`ProtectedRoute` and `AdminRoute`) that secure pathways from unauthorized visitors or customer role elevation.

---

## ⚙️ Environment Variables

Create a `client/.env` file in the client root directory:

```env
# URL path to the backend API server gateway
VITE_API_URL=http://localhost:5000

# Stripe publishable API key (safe for client exposure)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🏃 Available Scripts

Execute these scripts inside the `client/` directory:

| Script | Purpose |
| :--- | :--- |
| `npm run dev` | Spins up the Vite local developer server at `http://localhost:5173`. |
| `npm run build` | Validates TypeScript compilation and generates optimized production assets inside `dist/`. |
| `npm run preview` | Spins up a local web server to preview the built production assets in `dist/`. |
| `npm run lint` | Performs strict TypeScript checks without outputting files. |
| `npm test` | Runs the Vitest unit/integration test runner. |
| `npm run test:coverage` | Computes full Vitest component, store, and api coverage percentages. |

---

## 📐 Client Directory Layout

```
client/
├── src/
│   ├── api/               # Axios clients and API hooks (auth, products, cart, payments)
│   ├── components/
│   │   ├── admin/         # Administrative portal views and tools
│   │   ├── cart/          # Shopping cart item rows and item management
│   │   ├── common/        # Shared loading, error, empty state representations
│   │   ├── layout/        # Navbar and global shell components
│   │   └── product/       # Product catalog grids, details, cards
│   ├── hooks/             # Specialized custom hooks (e.g. Socket callbacks)
│   ├── pages/             # Route-level screens (Products, Detail, Checkout, Dashboard)
│   ├── routes/            # Route protections (AdminRoute, ProtectedRoute)
│   ├── sockets/           # Socket.IO connection configurations
│   ├── store/             # Zustand persistent global stores (auth, cart)
│   ├── tests/             # Component and store test suites (Vitest + RTL)
│   ├── types/             # Common TypeScript interfaces
│   └── utils/             # Formatting and validation helpers
├── Dockerfile             # Multi-stage production Nginx dockerfile
├── nginx.conf             # Custom Nginx configuration for router failovers
└── package.json
```

---

## 💳 Stripe Checkout & Payment Elements

The payment flow is designed with extreme attention to security and usability:
1. **Checkout Activation**: The user reviews items in the Cart and clicks "Checkout".
2. **Stripe Elements Wrappers**: The client requests a `client_secret` from `/api/payments/intent` using the backend-safe item layout, then wraps the checkout forms in `@stripe/react-stripe-js` `<Elements>` provider.
3. **Card Processing**: Stripe's customized payment container handles input validation automatically.
4. **Completion Redirects**: Upon card success, the client triggers transaction state updates, logs an authenticated Order payload with the backend, and clears the Zustand Cart state.

---

## 🧪 Frontend Test Suites

The client features comprehensive unit and component testing using **Vitest** and **React Testing Library**:
* **Component Testing**: Verifies presentational elements, action triggers, and click handlers (e.g., `CartItemRow.test.tsx`, `Navbar.test.tsx`, `ProductCard.test.tsx`).
* **Route Protection**: Validates auth redirects and loading wrappers (e.g., `ProtectedRoute.test.tsx`, `AdminRoute.test.tsx`).
* **State Stores**: Focuses on Zustand store state assertions (e.g., `authStore.test.ts`, `cartStore.test.ts`).
* **APIs**: Mocks Axios clients to ensure correct request parameters (e.g., `authApi.test.ts`, `productsApi.test.ts`).
* **Page States**: Ensures loading, empty, and query integration renders accurately (e.g., `ProductsPage.test.tsx`, `CartPage.test.tsx`).

### Execute Tests
```bash
npm run test
```

---

## 🐳 Docker Deployment Setup
The application is pre-configured for containerized hosting using **Nginx**. The production build compiles static client files and maps them inside an Alpine Nginx container. Nginx redirects fallback requests using `try_files $uri $uri/ /index.html;`, solving route refreshes in Single Page Applications (SPAs).
