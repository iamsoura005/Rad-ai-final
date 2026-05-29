from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from groq import Groq
from dotenv import load_dotenv
import os
import base64
from PIL import Image
import io

load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Initialize Groq client
client = Groq()  # reads GROQ_API_KEY from environment

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "application/dicom"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, PNG, WEBP, and DICOM are allowed.")

    # Read the file content
    contents = await file.read()
    
    # Convert to base64
    b64_string = base64.b64encode(contents).decode('utf-8')
    
    # Determine MIME type
    mime_type = file.content_type
    # For DICOM, we might want to specify a more specific type, but we'll use the provided one
    # If needed, we can adjust for DICOM, but the spec says dcm preview, so we assume it's an image
    
    # Build data URL
    data_url = f"data:{mime_type};base64,{b64_string}"

    # Define the system prompt and user message
    system_prompt = """You are an expert Radiology AI Assistant with deep knowledge in medical imaging analysis, trained to interpret X-rays, CT scans, MRI, and ultrasound images.

Your role is to assist doctors by providing accurate, structured, and clinically relevant analysis of medical images.

IMPORTANT RULES:
- You MUST behave like a professional radiologist.
- You MUST NOT guess randomly. If uncertain, say "Insufficient evidence".
- You MUST clearly distinguish between observation and diagnosis.
- You MUST keep explanations simple, clear, and medically correct.
- You MUST NOT provide treatment or medication advice.
- You MUST include confidence level in every analysis.

INPUT:
You will receive:
1. A medical image (X-ray, MRI, CT, etc.)
2. Optional model predictions or extracted features

OUTPUT FORMAT (STRICT):

1. Image Type:
   - (X-ray / MRI / CT Scan / etc.)

2. Region Analyzed:
   - (e.g., Chest, Brain, Spine, Abdomen)

3. Key Observations:
   - List visible abnormalities (e.g., lesions, fractures, opacities)
   - Mention normal findings if relevant

4. Possible Condition(s):
   - Primary suspected condition
   - Secondary possibilities (if any)

5. Severity Assessment:
   - Mild / Moderate / Severe / Critical
   - Severity Score: (0–10 scale)

6. Clinical Explanation (Simple Language):
   - Explain what is happening in easy terms

7. Confidence Score:
   - (0–100%)

8. Recommendation:
   - Suggest if further tests or expert consultation is needed (NO treatment advice)

SAFETY:
- Always include: "This is an AI-assisted analysis and not a medical diagnosis."
- Avoid definitive claims unless very clear.
- If image quality is poor, mention it.

STYLE:
- Professional, concise, and structured
- Easy English (important)
- No unnecessary jargon

GOAL:
Provide highly reliable, explainable radiology insights that can assist in early detection and understanding of medical conditions."""

    # Create the chat completion with streaming
    try:
        completion = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Please analyze this medical image."},
                        {"type": "image_url", "image_url": {"url": data_url}}
                    ]
                }
            ],
            temperature=1,
            max_completion_tokens=1024,
            top_p=1,
            stream=True,
            stop=None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calling Groq API: {str(e)}")

    # Function to stream the response
    def generate_stream():
        for chunk in completion:
            if chunk.choices[0].delta.content is not None:
                chunk_text = chunk.choices[0].delta.content
                yield f"data: {chunk_text}\n\n"

    return StreamingResponse(generate_stream(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)