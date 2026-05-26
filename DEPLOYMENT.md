# 🚀 ShopStream Deployment Guide

This guide walks you through deploying the ShopStream platform online using **GitHub**, **Vercel** (for the frontend React client), and **Render** (for the backend Node/Express server).

---

## 📦 Prerequisites

Before deploying, make sure you have:
1. A [GitHub](https://github.com) account.
2. A [Vercel](https://vercel.com) account.
3. A [Render](https://render.com) account.
4. A hosted [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database) connection URI.
5. A [Stripe Developer](https://stripe.com) account (for API keys).

---

## 🛠️ Step 1: Commit and Push to GitHub

Prepare your repository and push the codebase to GitHub.

Run the following commands in the root of your workspace:

```bash
# Initialize git if not already initialized
git init

# Add all files to staging (automatically respects .gitignore)
git add .

# Commit changes
git commit -m "feat: modernize design system and add vercel & render deployment scripts"

# Link your remote GitHub repository
git remote add origin https://github.com/your-username/shopstream.git
git branch -M main

# Push to your repository
git push -u origin main
```

---

## 🔌 Step 2: Deploy the Backend on Render

We have included a custom blueprint (`render.yaml`) in the repository, making server deployment a one-click process.

1. Log into [Render Dashboard](https://dashboard.render.com).
2. Click **New** in the top right corner and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will read the `render.yaml` file and prompt you to name your service group and fill in the missing environment variables:
   - `MONGO_URI`: Enter your MongoDB Atlas connection string.
   - `CLIENT_URL`: Enter your Vercel deployment URL (e.g., `https://shopstream.vercel.app`). *Tip: You can update this on Render after creating your Vercel app.*
   - `STRIPE_SECRET_KEY`: Enter your Stripe test secret key (`sk_test_...`).
   - `STRIPE_WEBHOOK_SECRET`: Enter your Stripe webhook signature secret (`whsec_...`).
   - `NODE_ENV`: Set to `production` (already prefilled).
   - `JWT_SECRET`: Render will automatically generate a secure, 256-bit random key for you! (already prefilled).
5. Click **Apply**. Render will automatically build the server (`npm run build`) and start it on the free web service tier.

---

## 💻 Step 3: Deploy the Frontend on Vercel

Vercel will build and host your single-page React frontend.

1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** and select **Project**.
3. Import your GitHub repository.
4. Configure the project settings:
   - **Framework Preset**: Select **Vite** (Vercel usually autodetects this).
   - **Root Directory**: Click *Edit* and select the `client` directory.
   - **Build and Output Settings**: Keep defaults (Vercel will run `npm run build` and serve `dist`).
5. Open the **Environment Variables** toggle and add the following keys:
   - `VITE_API_URL`: The URL of your Render backend web service (e.g., `https://shopstream-api.onrender.com`).
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe test publishable key (`pk_test_...`).
6. Click **Deploy**. Vercel will build the React application and deploy it.
7. Note down your Vercel deployment URL and update the `CLIENT_URL` environment variable in your **Render** service configurations to ensure CORS and Socket.IO function flawlessly!

---

## ⚡ Local Development Commands

To help manage this monorepo locally, we added root-level helper scripts to the root `package.json`. You can use them to run tasks in both directories without leaving the root directory:

- `npm run install:all` - Installs dependencies in both the `client/` and `server/` folders.
- `npm run dev:client` - Starts the local React development frontend.
- `npm run dev:server` - Starts the local Express backend with hot reloading.
- `npm run build:client` - Compiles the client React app for production.
- `npm run build:server` - Compiles the TypeScript server code into JavaScript (`dist/`).
