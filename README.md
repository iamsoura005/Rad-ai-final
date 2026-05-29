# RadiologyAI - Medical Radiology AI Analysis Web Application

A web app where doctors/users upload medical images (X-ray, MRI, CT scan, Ultrasound), and the app sends them to Groq's API (using meta-llama/llama-4-scout-17b-16e-instruct model) for structured radiology analysis. The result is displayed in a clean, professional medical UI.

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Python FastAPI
- **AI API**: Groq Cloud API (groq Python SDK)
- **Image handling**: Base64 encoding for image_url data URL

## File Structure

```
project/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example        # GROQ_API_KEY=your_key_here
└── frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
├── main.jsx
├── App.jsx
├── index.css
└── components/
├── Navbar.jsx
├── UploadPanel.jsx
├── ResultPanel.jsx
└── ResultCard.jsx
```

## Setup Instructions

1. **Backend Setup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Environment Variables**:
   - Copy `.env.example` to `.env`
   - Add your actual Groq API key: `GROQ_API_KEY=your_actual_key_here`

3. **Start Backend Server**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

4. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the Application**:
   Open http://localhost:5173 in your browser

## Important Notes

- The Groq streaming uses `stream=True` and yields SSE chunks
- The frontend consumes the SSE stream using `fetch()` + `ReadableStream`, NOT EventSource
- Images are converted to base64 data URL before sending to Groq
- CORS is properly configured to allow frontend to call backend
- All components are functional React with hooks (useState, useEffect, useRef)

## Features

- Professional dark-themed medical dashboard UI
- Drag-and-drop image upload with preview
- Real-time streaming analysis results
- Structured output with categorized sections
- Color-coded severity and confidence indicators
- Responsive design for mobile and desktop
- Medical disclaimer displayed prominently

## API Endpoints

- `POST /analyze`: Accepts multipart file upload and returns streaming analysis results

## Dependencies

### Backend
- fastapi
- uvicorn
- groq
- python-dotenv
- python-multipart
- Pillow

### Frontend
- react
- react-dom
- vite
- @vitejs/plugin-react
- tailwindcss
- autoprefixer
- postcss

## Safety Disclaimer

⚠️ This is an AI-assisted analysis and not a medical diagnosis. Always consult with qualified healthcare professionals for medical advice and diagnosis.