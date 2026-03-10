# Vercel Configuration Fix: Output Directory

## Problem
The build failed with: `Error: No Output Directory named "public" found`.
This happens because Vercel is looking for a folder named `public` to serve your site, but your Next.js app is building to `.next` (the default).

## Solution
You need to change the **Output Directory** setting in Vercel to be empty (default).

### Steps to Fix
1.  Go to your **Vercel Dashboard**.
2.  Select your project (`employee-management-frontend` or similar).
3.  Go to **Settings** -> **Build & Development**.
4.  **Framework Preset**: Ensure this is set to **Next.js**.
    *   If it is set to "Other" or "None", change it to "Next.js".
5.  **Output Directory**: Ensure this is **Override: Off** (empty) or specifically cleared.
    *   If you manually typed `public`, delete it.
6.  Click **Save**.
7.  Go to the **Deployments** tab and **Redeploy** the latest commit.

### Why this happened?
Vercel sometimes defaults to `public` for static sites. Since your app uses dynamic features (Server Side Rendering), it builds to `.next`, so Vercel couldn't find the `public` folder it was told to look for.
