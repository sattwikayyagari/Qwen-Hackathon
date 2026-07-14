from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os

load_dotenv()

api_key=os.getenv("API_KEY")
print("Key loaded:", api_key[:10] if api_key else "NOT FOUND")
app= FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000"],
    allow_headers=["*"],
    allow_methods=["*"]
)

client= OpenAI(
    api_key=api_key,
    base_url="https://api.groq.com/openai/v1"
)

class apiRequest(BaseModel):
    question: str
    capturedText: str

@app.post("/ask")
def ask_question(request: apiRequest):
    question=request.question
    capturedText=request.capturedText

    response=client.chat.completions.create(model="llama-3.3-70b-versatile", messages=[{"role": "system", "content": "You are a helpful learning assistant that explains user queries very clearly"},{"role":"user", "content": f"Explain the question for the highlighted text\n\nQuestion:\n\n{question}\n\nHighlighted Text:\n\n{capturedText}"}])
    return f"Here is the answer to your question: {response.choices[0].message.content}"