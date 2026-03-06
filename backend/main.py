from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
import io
import json
import asyncio
from elevenlabs import generate, Voice, set_api_key
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="RoboBuddy API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ElevenLabs
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
if not ELEVENLABS_API_KEY:
    print("Warning: ELEVENLABS_API_KEY environment variable not set")
else:
    set_api_key(ELEVENLABS_API_KEY)

# Sample question database
QUESTIONS_DATABASE = {
    "job-interview": {
        "software-engineer": [
            "Can you explain the difference between REST and GraphQL?",
            "How would you design a URL shortener service?",
            "What is the time complexity of binary search and why?",
            "Describe the difference between SQL and NoSQL databases.",
            "How do you handle concurrency in distributed systems?",
            "What is the difference between authentication and authorization?",
            "Can you explain what a microservices architecture is?",
            "How would you optimize a slow database query?",
            "What is the difference between synchronous and asynchronous programming?",
            "Describe the CAP theorem in distributed systems."
        ],
        "web-developer": [
            "What is the difference between let, const, and var in JavaScript?",
            "How does the CSS box model work?",
            "What are React hooks and why are they useful?",
            "Explain the concept of CORS and how to handle it.",
            "What is the difference between GET and POST requests?",
            "How do you optimize website performance?",
            "What is the difference between client-side and server-side rendering?",
            "Explain the concept of responsive web design.",
            "What are websockets and when would you use them?",
            "How do you handle state management in React applications?"
        ],
        "ui-ux-designer": [
            "What are the principles of good visual design?",
            "How do you conduct user research effectively?",
            "What is the difference between UX and UI design?",
            "How do you create an effective design system?",
            "What are accessibility guidelines and why are they important?",
            "How do you approach user journey mapping?",
            "What is the role of prototyping in design?",
            "How do you conduct usability testing?",
            "What are common design patterns in mobile apps?",
            "How do you balance aesthetics with functionality?"
        ],
        "data-scientist": [
            "What is the difference between supervised and unsupervised learning?",
            "How do you handle missing data in a dataset?",
            "Explain the bias-variance tradeoff in machine learning.",
            "What is cross-validation and why is it important?",
            "How do you evaluate the performance of a classification model?",
            "What is the difference between precision and recall?",
            "How do you handle imbalanced datasets?",
            "What is feature engineering and why is it important?",
            "Explain the concept of regularization in machine learning.",
            "How do you prevent overfitting in neural networks?"
        ]
    },
    "skill-development": {
        "presentation-skills": [
            "How do you structure an effective presentation?",
            "What techniques can you use to engage your audience?",
            "How do you handle presentation anxiety?",
            "What are the key elements of a good slide design?",
            "How do you prepare for a Q&A session after your presentation?",
            "What body language techniques improve public speaking?",
            "How do you tailor your presentation to different audiences?",
            "What storytelling techniques can enhance your presentation?",
            "How do you effectively use visual aids in presentations?",
            "What strategies help you remember key points during a presentation?"
        ],
        "communication-boost": [
            "How do you practice active listening in professional settings?",
            "What are the key elements of effective business communication?",
            "How do you give and receive constructive feedback?",
            "What non-verbal communication cues should you be aware of?",
            "How do you adapt your communication style to different personalities?",
            "What techniques help you communicate complex ideas clearly?",
            "How do you handle difficult conversations at work?",
            "What role does empathy play in effective communication?",
            "How do you improve your written communication skills?",
            "What strategies help you communicate in cross-cultural environments?"
        ],
        "leadership-skills": [
            "What are the key qualities of an effective leader?",
            "How do you motivate team members during challenging projects?",
            "What strategies help you delegate tasks effectively?",
            "How do you handle conflicts within your team?",
            "What is the difference between managing and leading?",
            "How do you develop a strategic vision for your team?",
            "What techniques help you build trust with team members?",
            "How do you provide effective performance feedback?",
            "What approaches help you make difficult decisions?",
            "How do you foster innovation and creativity in your team?"
        ],
        "negotiation-skills": [
            "What are the key principles of effective negotiation?",
            "How do you prepare for a successful negotiation?",
            "What techniques help you understand the other party's interests?",
            "How do you handle objections during negotiations?",
            "What strategies help you create win-win outcomes?",
            "How do you negotiate salary and benefits effectively?",
            "What role does timing play in negotiations?",
            "How do you maintain relationships while negotiating firmly?",
            "What techniques help you overcome negotiation anxiety?",
            "How do you know when to walk away from a negotiation?"
        ]
    }
}

class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = "21m00Tcm4TlvDq8ikWAM"  # Default to "Adam" voice

class QuestionRequest(BaseModel):
    category: str
    section_id: str

@app.get("/")
async def root():
    return {"message": "RoboBuddy API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "elevenlabs_configured": bool(ELEVENLABS_API_KEY)}

@app.post("/questions/{category}/{section_id}")
async def get_questions(category: str, section_id: str):
    """Get all questions for a specific practice section"""
    if category not in QUESTIONS_DATABASE:
        raise HTTPException(status_code=404, detail=f"Category '{category}' not found")
    
    if section_id not in QUESTIONS_DATABASE[category]:
        raise HTTPException(status_code=404, detail=f"Section '{section_id}' not found in category '{category}'")
    
    questions = QUESTIONS_DATABASE[category][section_id]
    return {
        "category": category,
        "section_id": section_id,
        "questions": questions,
        "total_questions": len(questions)
    }

@app.get("/questions/{category}/{section_id}/{question_index}")
async def get_specific_question(category: str, section_id: str, question_index: int):
    """Get a specific question by index"""
    if category not in QUESTIONS_DATABASE:
        raise HTTPException(status_code=404, detail=f"Category '{category}' not found")
    
    if section_id not in QUESTIONS_DATABASE[category]:
        raise HTTPException(status_code=404, detail=f"Section '{section_id}' not found in category '{category}'")
    
    questions = QUESTIONS_DATABASE[category][section_id]
    
    if question_index < 0 or question_index >= len(questions):
        raise HTTPException(status_code=404, detail=f"Question index {question_index} out of range")
    
    return {
        "category": category,
        "section_id": section_id,
        "question_index": question_index,
        "question": questions[question_index],
        "total_questions": len(questions)
    }

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    """Convert text to speech using ElevenLabs"""
    if not ELEVENLABS_API_KEY:
        raise HTTPException(status_code=503, detail="ElevenLabs API key not configured")
    
    try:
        # Generate audio using ElevenLabs
        audio = generate(
            text=request.text,
            voice=request.voice_id or "21m00Tcm4TlvDq8ikWAM",
            model="eleven_turbo_v2"
        )
        
        # Convert audio bytes to streaming response
        audio_stream = io.BytesIO(audio)
        
        return StreamingResponse(
            io.BytesIO(audio_stream.getvalue()),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"attachment; filename=tts_audio.mp3"
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")

@app.get("/sections")
async def get_all_sections():
    """Get all available sections organized by category"""
    return {
        "categories": QUESTIONS_DATABASE,
        "total_categories": len(QUESTIONS_DATABASE),
        "total_sections": sum(len(sections) for sections in QUESTIONS_DATABASE.values())
    }

@app.websocket("/api/speech/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time speech processing"""
    await websocket.accept()
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                
                # Handle different message types
                if message.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
                elif message.get("type") == "audio_chunk":
                    # Echo back acknowledgment for audio chunks
                    await websocket.send_text(json.dumps({
                        "type": "chunk_received",
                        "timestamp": message.get("timestamp")
                    }))
                else:
                    # Echo back the message for debugging
                    await websocket.send_text(json.dumps({
                        "type": "echo",
                        "received": message
                    }))
                    
            except json.JSONDecodeError:
                # Send error if message is not valid JSON
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Invalid JSON format"
                }))
                
    except WebSocketDisconnect:
        print("WebSocket client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        try:
            await websocket.send_text(json.dumps({
                "type": "error",
                "message": str(e)
            }))
        except:
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
