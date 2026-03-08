# TerraCheck

An AI-powered land viability assessment platform for Canada. Drop a pin on any location and get an instant environmental, regulatory, and zoning viability report.

## Tech Stack

**Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Leaflet
**Backend:** FastAPI, GeoPandas, Shapely
**AI:** Google Gemini 2.0 Flash
**Auth:** Auth0

## Prerequisites

- Node.js 18+
- Python 3.10+
- A [Google Gemini API key](https://aistudio.google.com/apikey)
- An [Auth0](https://auth0.com) account with a Regular Web Application

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/terracheck.git
cd terracheck
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install fastapi uvicorn geopandas shapely google-genai pydantic
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `AUTH0_SECRET` | Run `openssl rand -hex 32` to generate |
| `APP_BASE_URL` | `http://localhost:3000` for local dev |
| `AUTH0_DOMAIN` | Your Auth0 domain (e.g. `dev-xxx.us.auth0.com`) |
| `AUTH0_CLIENT_ID` | From Auth0 app settings |
| `AUTH0_CLIENT_SECRET` | From Auth0 app settings |

### 5. Configure Auth0

In your Auth0 dashboard (Applications > Your App > Settings):

- **Allowed Callback URLs:** `http://localhost:3000/auth/callback`
- **Allowed Logout URLs:** `http://localhost:3000`

## Running the App

### Start the backend (terminal 1)

```bash
source venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### Start the frontend (terminal 2)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
terracheck/
  backend/             # FastAPI backend
    main.py            # API endpoints
    geo_engine.py      # GeoPandas spatial queries
    gemini_service.py  # Gemini AI integration
  data/
    geojson/           # GeoJSON data layers (greenbelt, treaties, zoning, etc.)
  scripts/
    convert_data.py    # Data conversion utilities
  src/                 # Next.js frontend
    app/               # App Router pages
      assess/          # Map + assessment page
      dashboard/       # Saved assessments
      api/             # API route proxies to backend
    components/        # React components (Navbar, Map, ScoreIndicator, etc.)
    lib/               # API client, Auth0 config
    middleware.ts      # Auth0 middleware
```

## Data Layers

| Layer | Source |
|---|---|
| Greenbelt boundaries | Ontario Open Data |
| Indigenous treaty boundaries | CIRNAC |
| Flood zones | Mock data (Waterloo Region) |
| Zoning | Mock data (Waterloo Region) |
| Contaminated sites | Mock data (Waterloo Region) |
| Protected areas | Mock data (Waterloo Region) |

## License

MIT

