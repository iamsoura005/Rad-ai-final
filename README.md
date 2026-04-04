# RadiologyAI

Full-stack medical radiology analysis web app using React + Vite + Tailwind on frontend and FastAPI + Groq on backend.

## Setup

1. `cd backend && pip install -r requirements.txt`
2. Create `.env` with `GROQ_API_KEY=your_actual_key`
3. `uvicorn main:app --reload --port 8000`
4. `cd frontend && npm install && npm run dev`
5. Open `http://localhost:5173`

Local note:
- Frontend calls `/api/*` and Vite proxies to `http://localhost:8000/*`.

## Quick Start (Paste Key and Run)

1. Open `backend/.env`
2. Paste your key as: `GROQ_API_KEY=your_actual_key`
3. From project root, run: `./start-dev.ps1`

## Project Structure

- `backend/main.py` - FastAPI API and Groq streaming integration
- `backend/requirements.txt` - Python dependencies
- `backend/.env.example` - environment template
- `frontend/src` - React application source

## Vercel Deployment (Frontend + Backend API)

This repository is configured for single-project Vercel deployment:
- Frontend static build from `frontend/dist`
- FastAPI API as Vercel Python function at `api/index.py`

Required Vercel Environment Variables:
- `GROQ_API_KEY`

Optional Vercel Environment Variables (recommended):
- `GROQ_ANALYZE_MODEL` (example: `meta-llama/llama-4-scout-17b-16e-instruct`)
- `GROQ_TEXT_MODEL` (example: `meta-llama/llama-4-scout-17b-16e-instruct`)

Optional Grad-CAM Model Environment Variables:
- `GRADCAM_MODEL_BACKEND`:
	- `torchvision_densenet121` (default)
	- `torchvision_resnet50`
	- `torchxrayvision_densenet`
- `GRADCAM_XRV_WEIGHTS` (used only for `torchxrayvision_densenet`, default: `densenet121-res224-all`)

If using TorchXRayVision backend, install:
- `pip install torchxrayvision`

Deploy steps:
1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Add environment variable `GROQ_API_KEY` in Project Settings.
4. Deploy.

API endpoints in production:
- `/api/analyze`
- `/api/gradcam-health`
- `/api/symptoms`
- `/api/medicine`
- `/api/chat`

Important files for deployment:
- `vercel.json`
- `api/index.py`
- `api/[...path].py`
- `api/requirements.txt`
- `frontend/.env.example`

Production routing note:
- Backend supports both `/analyze` and `/api/analyze` style paths (same for all endpoints) for compatibility across local and Vercel runtimes.
