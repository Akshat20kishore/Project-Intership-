# Vana Botanicals — Organic Ayurvedic Skincare & Wellness

A mobile-first direct-to-consumer (D2C) e-commerce storefront and apothecary admin panel designed with a **Warm Botanical Luxury** aesthetic. Built with Next.js 14 (App Router) on the frontend and FastAPI on the backend, with full support for zero-config standalone SQLite local execution or cloud-scale Supabase PostgreSQL.

---

## 🌿 Brand Identity & Design System

- **Aesthetic**: Warm Botanical Luxury.
- **Palette**: Forest & Sage Green (`#213829`, `#2e4f3a`), Warm Cream parchment background (`#faf7f0`), Terracotta & Ochre accents (`#c16538`, `#b5832a`).
- **Typography**: Editorial serif display headings with warm, legible sans-serif body typography.
- **Visuals**: High-resolution curated photography for all botanical elixirs, face oils, clarifying masks, and hand-carved ritual tools.

---

## 📦 Tech Stack

- **Frontend**: Next.js 14 (React 18), semantic CSS design tokens, custom lightweight SVG icons, zero bloated external UI frameworks.
- **Client Storage**: Native IndexedDB (`idb.js`) cart persistence with optimistic inventory checking and cross-tab synchronization.
- **Backend**: FastAPI (Python 3.12), Pydantic v2 schemas, async HTTP client.
- **Database**:
  - **Local Mode (Zero Setup)**: Built-in SQLite database auto-seeded on first run (`backend/local_vana.db`). No cloud accounts or API keys required to test or run locally.
  - **Production Mode**: Supabase PostgreSQL with PostgREST and Row-Level Security (RLS).
- **Deployment**: Ready for Render (Backend) and Vercel (Frontend).

---

## 🚀 Quick Start (One Command)

To run both backend and frontend simultaneously with automated port detection (uses ports `8001` and `3001` if `8000`/`3000` are occupied):

```bash
./run.sh
```

---

## 🛠️ Manual Setup

### 1. Backend (FastAPI)

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

- API Documentation: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`
- Products endpoint: `http://localhost:8000/products`

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

- Storefront: `http://localhost:3000`
- Catalog: `http://localhost:3000/products`
- Apothecary Admin: `http://localhost:3000/admin`

---

## 🔑 Demo Accounts (Out-of-the-Box Local Auth)

The standalone local mode comes pre-configured with testing credentials:

| Role | Email | Password |
|---|---|---|
| **Apothecary Admin** | `admin@vanabotanicals.com` | `admin123` |
| **Customer** | `customer@vanabotanicals.com` | `customer123` |

---

## 🧪 Key Features & User Flows

1. **Catalog & Filtering**: Browse Ayurvedic serums, cold-pressed face oils, botanical face mists, restorative night elixirs, and bronze Kansa massage wands.
2. **Dynamic Stock Protection**: Live inventory badges (`In Stock`, `Only X batches left`, `Sold Out`). Sold out items cannot be incremented or added to the basket.
3. **Persistent Cart**: Powered by native IndexedDB so cart contents survive browser restarts, tab reloads, and temporary network dropouts.
4. **Checkout & Simulated Ritual Payment**: Delivery address validation (PIN code, phone, address) and simulated card processing (success/failure flows).
5. **Customer Orders**: Track past orders and live crafting/fulfillment status (`Order Placed`, `Crafting in Apothecary`, `Packed`, `Shipped`, `Delivered`).
6. **Apothecary Admin Suite**:
   - Metrics overview (Catalog count, Total orders, Revenue, Depleted stock).
   - Real-time order status management with inline status change updates.
   - Formulation CRUD (Add new botanical product, edit prices/batch quantities, archive items).

---

## ☁️ Cloud Deployment

### Backend (Render)
1. Fork or push this repository to GitHub.
2. In Render, select **New Web Service** and link your repository.
3. Root Directory: `backend`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Python version: Pinned to `3.12.7` via `.python-version`.

### Frontend (Vercel)
1. In Vercel, select **Import Project** and link your repository.
2. Root Directory: Click **Edit** and set to `frontend`.
3. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = your live Render backend URL (e.g. `https://vana-botanicals-api.onrender.com`).
4. Click **Deploy**.
