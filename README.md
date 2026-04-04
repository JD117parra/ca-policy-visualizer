# CA Policy Visualizer

A full-stack web application that authenticates with **Microsoft Entra ID**, fetches
**Conditional Access policies** via the Microsoft Graph API, and renders them as
interactive flow diagrams using React Flow.

---

## Tech Stack

| Layer        | Technology                                                        |
|--------------|-------------------------------------------------------------------|
| Frontend     | React 19 + Vite 6 + TypeScript                                    |
| Styling      | Tailwind CSS v3 + shadcn/ui (CSS variable theme)                  |
| Diagrams     | React Flow (`reactflow` v11)                                      |
| Auth (FE)    | MSAL.js v5 (`@azure/msal-browser`, `@azure/msal-react`)           |
| Backend      | Python 3.11+ + FastAPI + Uvicorn                                  |
| Auth (BE)    | `azure-identity` (`ClientSecretCredential`)                       |
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
git clone https://github.com/your-org/ca-policy-visualizer.git
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
| `VITE_TENANT_ID` | Frontend | Tenant ID exposed to the browser bundle by Vite              |
| `VITE_CLIENT_ID` | Frontend | Client ID exposed to the browser bundle by Vite              |

> **Security note:** Never commit `.env`. It is listed in `.gitignore`.

---

## Project Structure

```
ca-policy-visualizer/
├── client/                        React + Vite frontend
│   ├── src/
│   │   ├── components/            Reusable UI components (shadcn/ui wrappers)
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx      Microsoft sign-in landing page
│   │   │   └── DashboardPage.tsx  React Flow diagram dashboard
│   │   ├── hooks/
│   │   │   └── useConditionalAccessPolicies.ts
│   │   ├── services/
│   │   │   └── graphService.ts    Calls the FastAPI backend
│   │   ├── types/
│   │   │   └── policy.ts          ConditionalAccessPolicy TypeScript interfaces
│   │   ├── lib/
│   │   │   └── utils.ts           cn() utility (clsx + tailwind-merge)
│   │   ├── App.tsx                Root component — routing + auth guards
│   │   ├── main.tsx               Entry point — MSAL v5 async initialize()
│   │   └── index.css              Tailwind directives + shadcn/ui CSS variables
│   ├── index.html
│   ├── vite.config.ts             @ alias, port 5173, /api proxy → :8000
│   ├── tailwind.config.js         shadcn/ui color tokens
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   └── tsconfig.node.json
│
├── server/                        Python + FastAPI backend
│   ├── app/
│   │   ├── main.py                FastAPI app + CORS + health check
│   │   ├── settings.py            Pydantic Settings (loads .env)
│   │   ├── routes/
│   │   │   └── policies.py        GET /api/policies
│   │   ├── controllers/
│   │   │   └── graph_controller.py  Calls Graph API via ClientSecretCredential
│   │   └── middleware/
│   │       └── auth.py            Bearer token validation dependency
│   ├── requirements.txt
│   └── .env.example
│
├── .env.example
├── .gitignore
└── README.md
```

---

## Authentication Flow

```
Browser (MSAL.js v5)
  │  loginPopup() → acquireTokenSilent()
  │  Authorization: Bearer <token>
  ▼
FastAPI backend
  │  auth middleware → validates Bearer header presence
  │  ClientSecretCredential → acquires Graph app token
  ▼
Microsoft Graph API
  GET /v1.0/identity/conditionalAccess/policies
  ▼
FastAPI → JSON response → React Flow nodes
```

The backend uses **application-level** auth (`Policy.Read.All` application permission)
because Conditional Access policies are tenant-wide admin resources, not user-scoped data.
The frontend MSAL token is forwarded to authenticate the request to the backend only.

---

## License

MIT
