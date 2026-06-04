# LandSecure (frontend)

Next.js 14 (App Router) frontend for **LandSecure — Property Risk Assessment
Platform** (University of Ibadan final-year project, Adiamo Sodiq · E046135).
It renders the map-driven verification flow, buyer dashboard/history and the admin
console, talking to the FastAPI backend over JSON + JWT.

The API lives in a separate repo: **landsecure-backend**.

## Stack
Next.js 14 · React 18 · TypeScript · react-leaflet + leaflet-draw + OpenStreetMap.

## Run locally
```bash
npm install
cp .env.local.example .env.local     # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```
Open <http://localhost:3000>. The backend must be running on `:8000` (see the
landsecure-backend repo).

### Demo accounts
| Role  | Email                 | Password    |
|-------|-----------------------|-------------|
| Buyer | `buyer@landsecure.ng` | `buyer1234` |
| Admin | `admin@landsecure.ng` | `admin1234` |

## Deploy to Vercel

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com): **Add New… → Project → import this repo**.
   The framework auto-detects as **Next.js** (`vercel.json` pins it too).
3. Add **one environment variable** (Project → Settings → Environment Variables),
   for Production *and* Preview:

   | Name                  | Value                                   |
   |-----------------------|-----------------------------------------|
   | `NEXT_PUBLIC_API_URL` | `https://landsecure-backend.onrender.com` |

   Use the actual URL of your Render service. `NEXT_PUBLIC_*` is inlined at build
   time, so **redeploy** after changing it.
4. Deploy. Then add the resulting Vercel URL to the backend's `CORS_ORIGINS`
   (see the backend README) so the browser is allowed to call the API.

> The default backend `CORS_ORIGIN_REGEX` (`https://.*\.vercel\.app`) already
> permits Vercel production and preview deployments out of the box.

---
© LandSecure — final-year project, University of Ibadan. *Verify Before You Buy.*
