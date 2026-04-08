# CA Policy Visualizer

A full-stack web application that authenticates with **Microsoft Entra ID**, fetches
**Conditional Access policies** via the Microsoft Graph API, and renders them as
interactive flow diagrams using React Flow.

---

## Features

- **Interactive Flow Diagrams** — Policies rendered as connected nodes: conditions → grant controls → session controls
- **Policy Detail Panel** — Click any policy to see full configuration in a side panel
- **Search & Filter** — Find policies by name, filter by state (enabled / disabled / report-only)
- **Export as PNG** — Download diagrams as high-resolution images for reports
- **Dark / Light Mode** — Toggle with system preference detection and persistence
- **Keyboard Shortcuts** — `Ctrl+K` to search, `Esc` to close panels
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Hardened Security** — JWT validation, security headers, rate limiting, structured logging

---

## Tech Stack

| Layer        | Technology                                                        |
|--------------|-------------------------------------------------------------------|
| Frontend     | React 19 + Vite 6 + TypeScript                                    |
| Styling      | Tailwind CSS v3 + shadcn/ui (CSS variable theme)                  |
| Diagrams     | React Flow v11 + Dagre (auto layout)                              |
| Validation   | Zod (runtime schema validation)                                   |
| Auth (FE)    | MSAL.js v5 (`@azure/msal-browser`, `@azure/msal-react`)           |
| Backend      | Python 3.11+ + FastAPI + Uvicorn                                  |
| Auth (BE)    | `azure-identity` (`ClientSecretCredential`) + PyJWT (JWKS)        |
| API          | Microsoft Graph API v1.0 — `/identity/conditionalAccess/policies` |

---

## Prerequisites

- **Node.js 18 or higher** — [nodejs.org](https://nodejs.org)
- **Python 3.11 or higher** — [python.org](https://python.org)
- **pip** (bundled with Python)
- A **Microsoft Entra ID tenant** with an **App Registration** configured as follows:
  - Redirect URI: `http://localhost:5173` (type: **Single-page application**)
  - Microsoft Graph API permission: `Policy.Read.All` (**Application** permission, admin consent required)
  - A **client secret** for backend authentication

---

## Installation

### 1. Clone and configure environment variables

```bash
git clone https://github.com/JD117parra/ca-policy-visualizer.git
cd ca-policy-visualizer
cp .env.example .env
# Open .env and fill in all required values
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

```bash
cd ../server
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
```

### 4. Start the development servers

Open two terminals:

```bash
# Terminal 1 — FastAPI backend (port 8000)
cd server
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Vite frontend (port 5173)
cd client
npm run dev
```

| Service              | URL                              |
|----------------------|----------------------------------|
| Frontend             | http://localhost:5173            |
| Backend API docs     | http://localhost:8000/docs       |
| Health check         | http://localhost:8000/api/health |

---

## Environment Variables

| Variable         | Used by  | Description                                                  |
|------------------|----------|--------------------------------------------------------------|
| `TENANT_ID`      | Backend  | Microsoft Entra ID tenant ID                                 |
| `CLIENT_ID`      | Backend  | App Registration client (application) ID                    |
| `CLIENT_SECRET`  | Backend  | Client secret for `ClientSecretCredential`                   |
| `CORS_ORIGINS`   | Backend  | Comma-separated allowed origins (default: `http://localhost:5173`) |
| `ENFORCE_HTTPS`  | Backend  | Enable HSTS header (default: `false`)                        |
| `VITE_TENANT_ID` | Frontend | Tenant ID exposed to the browser bundle by Vite              |
| `VITE_CLIENT_ID` | Frontend | Client ID exposed to the browser bundle by Vite              |

> **Security note:** Never commit `.env`. It is listed in `.gitignore`.

---

## Project Structure

```
ca-policy-visualizer/
├── client/                        React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── flow/              Custom React Flow nodes (Policy, Condition, Control)
│   │   │   ├── ui/                shadcn/ui components (Card, Badge, Tooltip, ScrollArea)
│   │   │   ├── PolicyDetailPanel  Side panel with full policy details
│   │   │   ├── PolicyFilters      Search bar + state filter badges
│   │   │   └── SkeletonLoader     Animated loading placeholder
│   │   ├── hooks/
│   │   │   ├── useConditionalAccessPolicies.ts
│   │   │   └── useTheme.ts        Dark/light mode with localStorage
│   │   ├── lib/
│   │   │   ├── policyToGraph.ts   Transforms policies into nodes + edges
│   │   │   ├── layoutGraph.ts     Dagre auto-layout engine
│   │   │   └── utils.ts           cn() utility
│   │   ├── schemas/
│   │   │   └── policy.ts          Zod runtime validation schemas
│   │   ├── services/
│   │   │   └── graphService.ts    API client with Zod validation
│   │   ├── types/
│   │   │   └── policy.ts          TypeScript interfaces
│   │   └── pages/
│   │       ├── LoginPage.tsx       Split layout with branding + diagram preview
│   │       └── DashboardPage.tsx   Flow canvas + filters + detail panel
│   ├── vite.config.ts             @ alias, proxy, chunk splitting
│   └── tailwind.config.js         shadcn/ui color tokens
│
├── server/                        Python + FastAPI backend
│   ├── app/
│   │   ├── main.py                FastAPI app + CORS + security headers + rate limiting
│   │   ├── settings.py            Pydantic Settings (loads .env)
│   │   ├── logging_config.py      Structured JSON logging
│   │   ├── routes/
│   │   │   └── policies.py        GET /api/policies (rate limited, sanitized errors)
│   │   ├── controllers/
│   │   │   └── graph_controller.py  Graph API client with audit logging
│   │   └── middleware/
│   │       └── auth.py            JWT validation against Entra ID JWKS
│   └── requirements.txt
│
├── .env.example
├── .gitignore
└── README.md
```

---

## Security

The application implements multiple layers of security:

- **JWT Validation** — Tokens verified against Microsoft Entra ID JWKS endpoint (signature, expiration, audience, issuer)
- **Security Headers** — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **HSTS** — Strict-Transport-Security enabled via `ENFORCE_HTTPS=true`
- **Rate Limiting** — 60 req/min global, 10 req/min on `/api/policies`
- **Error Sanitization** — Internal errors logged server-side, generic messages returned to clients
- **Structured Logging** — JSON-formatted logs with auth failure audit trail (IP, path, failure reason)
- **Zod Validation** — Runtime schema validation on API responses before rendering
- **CORS** — Configurable per environment via `CORS_ORIGINS`

---

## Authentication Flow

```
Browser (MSAL.js v5)
  │  loginPopup() → acquireTokenSilent()
  │  Authorization: Bearer <token>
  ▼
FastAPI backend
  │  JWT validation (JWKS signature + claims)
  │  ClientSecretCredential → acquires Graph app token
  ▼
Microsoft Graph API
  GET /v1.0/identity/conditionalAccess/policies
  ▼
FastAPI → Zod validated JSON → React Flow diagram
```

The backend uses **application-level** auth (`Policy.Read.All` application permission)
because Conditional Access policies are tenant-wide admin resources, not user-scoped data.
The frontend MSAL token is forwarded to authenticate the request to the backend only.

---

## Production Build

```bash
cd client
npm run build
```

Output is in `client/dist/` — optimized with chunk splitting (MSAL and React Flow in separate bundles).

---

## License

MIT
