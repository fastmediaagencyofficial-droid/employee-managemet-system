# 🚀 Backend Deployment Guide

This guide covers deploying the `employee-management-backend` to **Render** and **Railway**.

---

## 📋 Prerequisites
Before deploying, ensure you have the following information ready:

1.  **DATABASE_URL**: Connection string for your PostgreSQL database (e.g., from Neon, Supabase, or Railway config).
2.  **JWT_SECRET**: A secure random string for authentication.
3.  **FRONTEND_URL**: The URL of your deployed frontend (e.g., `https://your-frontend.vercel.app`).
4.  **OPENAI_API_KEY**: (If utilizing AI features).

---

## 1️⃣ Deploy to Render (Render.com)

Render is great for simple, zero-config deployments.

### Steps:
1.  **Push your code** to GitHub.
2.  Go to the [Render Dashboard](https://dashboard.render.com/).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  Configure the service:
    *   **Name**: `employee-backend` (or similar)
    *   **Region**: Choose one close to your database (e.g., `Oregon, USA` if using Neon `us-east-1`).
    *   **Branch**: `Maheen` (or your main branch).
    *   **Root Directory**: `backend` (Important! Since your app is in a subfolder).
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install && npm run build`
    *   **Start Command**: `npm start`
6.  **Environment Variables** (Scroll down to "Advanced"):
    *   Add the keys from your `.env` file (`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, etc.).
    *   **Note:** Render automatically handles `PORT`.
7.  Click **Create Web Service**.

> **Note:** The first build might take a few minutes as it installs dependencies and compiles TypeScript.

---

## 2️⃣ Deploy to Railway (Railway.app)

Railway is excellent for managing both database and backend in one project.

### Steps:
1.  Go to the [Railway Dashboard](https://railway.app/).
2.  Click **New Project** -> **Deploy from GitHub repo**.
3.  Select your repository.
4.  **Configure the Root Directory**:
    *   Click on the new service card.
    *   Go to **Settings** -> **Root Directory**.
    *   Set it to `/backend`.
5.  **Environment Variables**:
    *   Go to the **Variables** tab.
    *   Add your variables (`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, etc.).
    *   *Tip:* If you add a PostgreSQL database within Railway, `DATABASE_URL` is automatically added.
6.  **Build & Search Command** (Optional - Railway usually detects this):
    *   Railway uses Nixpacks. It should auto-detect `npm run build` and `npm start` from your `package.json`.
7.  **Generate Domain**:
    *   Go to **Settings** -> **Networking**.
    *   Click **Generate Domain** to get a public URL (e.g., `web-production-123.up.railway.app`).

---

## 3️⃣ Deploy to Vercel (Recommended for Serverless)

Vercel is great for frontend, but our backend is also configured for Vercel Serverless.

### Steps:
1.  **Install Vercel CLI**: `npm i -g vercel`
2.  **Login**: `vercel login`
3.  **Deploy**:
    -   Navigate to `backend` folder: `cd backend`
    -   Run: `vercel`
    -   Follow the prompts:
        -   Set up and deploy? **Yes**
        -   Which scope? **(Select your account)**
        -   Link to existing project? **No**
        -   Project name? **employee-backend**
        -   In which directory is your code located? **./**
        -   Want to modify these settings? **No**
4.  **Environment Variables**:
    -   Go to Vercel Dashboard -> `employee-backend` -> Settings -> Environment Variables.
    -   Add all variables from your `backend/.env` file:
        -   `DATABASE_URL` (From Aiven, see below)
        -   `JWT_SECRET`
        -   `FRONTEND_URL` (Your Vercel Frontend URL)
        -   `EMAIL_USER` / `EMAIL_PASS` (For emails)
        -   `GEMINI_API_KEY` (For AI)
5.  **Redeploy**: Run `vercel --prod` to apply environment variables.

### 🗄️ Database Setup (Aiven PostgreSQL - Free Tier)

1.  **Sign Up**: Go to [Aiven Console](https://console.aiven.io/signup).
2.  **Create Service**:
    -   Click **"Create Service"**.
    -   Select **PostgreSQL**.
    -   Choose **Free Plan** (look for "Free" tag).
    -   Select a region (e.g., `google-cloud-asia-south1`).
    -   Name your service (e.g., `employee-system-db`).
    -   Click **Create Service**.
3.  **Get Connection URL**:
    -   Wait for the service to be "Running" (green dot).
    -   Copy the **"Service URI"**.
    -   It looks like: `postgres://avnadmin:password@host:port/defaultdb?sslmode=require`
    -   Use this as your `DATABASE_URL` in `.env` and Vercel variables.

---

## 🛑 Common Issues

*   **"Command not found: tsc"**: Ensure your Build Command is `npm install && npm run build`. The `npm install` step ensures `typescript` (devDependency) is available for the build.
*   **Prisma Client Error**: If you see errors about "Prisma Client," ensure `npm install` ran successfully. `package.json` has a `postinstall` script (`prisma generate`) which should run automatically after install.
*   **CORS Errors**: Ensure your `FRONTEND_URL` variable exactly matches your deployed frontend URL (no trailing slash).
