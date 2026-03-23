from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import os

app = FastAPI()

# Allow requests from your GitHub Pages frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your GitHub Pages URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

SYSTEM_PROMPTS = {
    "chat":         "You are MJ, a warm and intelligent personal AI assistant. Be concise, helpful, and conversational.",
    "voice":        "You are MJ, a voice assistant. Give short, natural spoken responses. Be friendly and direct.",
    "productivity": "You are MJ in productivity mode. Help with tasks, reminders, notes, and planning. Be structured and actionable.",
    "creative":     "You are MJ in creative mode. Be imaginative and inspiring. Help with writing, ideas, and creative projects.",
}

@app.get("/")
def root():
    return {"status": "MJ AI Backend is running"}

@app.post("/chat")
async def chat(request: Request):
    body = await request.json()
    history = body.get("history", [])
    mode    = body.get("mode", "chat")
    system  = SYSTEM_PROMPTS.get(mode, SYSTEM_PROMPTS["chat"])

    payload = {
        "systemInstruction": {"parts": [{"text": system}]},
        "contents": history,
        "generationConfig": {"maxOutputTokens": 800, "temperature": 0.85}
    }

    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            json=payload
        )
        data = res.json()

    if "error" in data:
        return JSONResponse({"error": data["error"]["message"]}, status_code=400)

    reply = data["candidates"][0]["content"]["parts"][0]["text"]
    return {"reply": reply}
