from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
import io
import json
import asyncio
import whisper
import tempfile
import os
import ffmpeg
from elevenlabs import generate, Voice, set_api_key
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Load questions from JSON file
def load_questions_database():
    try:
        with open('questionDatabase.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Warning: questionDatabase.json not found, using default questions")
        return {
            "job-interview": {
                "software-engineer": ["Default question 1", "Default question 2"]
            },
            "skill-development": {
                "presentation-skills": ["Default question 1", "Default question 2"]
            }
        }

QUESTIONS_DATABASE = load_questions_database()

# STT transcription storage functions
STT_DATA_FILE = "STTdata.json"

def load_stt_data():
    """Load existing STT data from JSON file"""
    try:
        if os.path.exists(STT_DATA_FILE):
            with open(STT_DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except Exception as e:
        print(f"Error loading STT data: {e}")
        return []

def save_stt_transcription(text: str, language: str = "en", duration: float = 0.0):
    """Save STT transcription to JSON file"""
    try:
        stt_data = load_stt_data()
        
        new_entry = {
            "id": len(stt_data) + 1,
            "text": text,
            "language": language,
            "duration": duration,
            "timestamp": datetime.now().isoformat(),
            "endpoint": "/stt/transcribe"
        }
        
        stt_data.append(new_entry)
        
        with open(STT_DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(stt_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Saved STT transcription: {text[:50]}...")
        return new_entry
        
    except Exception as e:
        print(f"❌ Error saving STT transcription: {e}")
        return None

def convert_webm_to_wav(webm_path: str, wav_path: str) -> bool:
    """Convert WebM to WAV using ffmpeg"""
    try:
        # Check if ffmpeg is available
        import subprocess
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
        
        (
            ffmpeg
            .input(webm_path)
            .output(wav_path, acodec='pcm_s16le', ac=1, ar='16000')
            .overwrite_output()
            .run(capture_stdout=True, capture_stderr=True)
        )
        return True
    except (ffmpeg.Error, subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"FFmpeg conversion error: {e}")
        return False

def process_audio_with_whisper(audio_path: str, language: str = "en"):
    """Process audio with Whisper with error handling"""
    try:
        result = whisper_model.transcribe(
            audio_path, 
            language=language if language != "auto" else None,
            fp16=False,
            verbose=False  # Reduce verbosity
        )
        return result
    except Exception as e:
        print(f"Whisper transcription error: {e}")
        # Try with different parameters as fallback
        try:
            result = whisper_model.transcribe(
                audio_path, 
                language=None,  # Auto-detect language
                fp16=False,
                verbose=False
            )
            return result
        except Exception as e2:
            print(f"Whisper fallback also failed: {e2}")
            raise e2

# Initialize Whisper model
print("Loading Whisper model...")
whisper_model = whisper.load_model("small")
print("Whisper model loaded successfully!")

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

class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = "pNInz6obpgDQGcFmaJgB"  # Default to "Adam" voice (updated ID)

class QuestionRequest(BaseModel):
    category: str
    section_id: str

class STTRequest(BaseModel):
    model: Optional[str] = "base"
    language: Optional[str] = "en"
    
class TranscriptionResponse(BaseModel):
    text: str
    language: str
    duration: float

@app.get("/")
async def root():
    return {"message": "RoboBuddy API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "elevenlabs_configured": bool(ELEVENLABS_API_KEY), "whisper_loaded": whisper_model is not None}

@app.post("/questions/{category}/{section_id}")
async def get_questions(category: str, section_id: str):
    """Get all questions for a specific practice section"""
    if category not in QUESTIONS_DATABASE:
        raise HTTPException(status_code=404, detail=f"Category '{category}' not found")
    
    if section_id not in QUESTIONS_DATABASE[category]:
        raise HTTPException(status_code=404, detail=f"Section '{section_id}' not found in category '{category}'")
    
    section_data = QUESTIONS_DATABASE[category][section_id]
    
    # Handle the new enhanced structure for app-developer
    if isinstance(section_data, dict) and "interview-questions" in section_data:
        return {
            "category": category,
            "section_id": section_id,
            "interview_questions": section_data.get("interview-questions", []),
            "video_resources": section_data.get("video-resources", []),
            "text_resources": section_data.get("text-resources", []),
            "total_questions": len(section_data.get("interview-questions", []))
        }
    
    # Handle legacy structure (array of questions)
    questions = section_data if isinstance(section_data, list) else []
    return {
        "category": category,
        "section_id": section_id,
        "questions": questions,
        "total_questions": len(questions)
    }

@app.get("/questions/{category}/{section_id}")
async def get_questions_get(category: str, section_id: str):
    """Get all questions for a specific practice section (GET endpoint)"""
    return await get_questions(category, section_id)

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
    """Convert text to speech using ElevenLabs or fallback"""
    
    # Fallback voice IDs in order of preference
    fallback_voices = [
        "pNInz6obpgDQGcFmaJgB",  # Adam
        "21m00Tcm4TlvDq8ikWAM",  # Adam (old ID)
        "AZnzlk1XvdvUeBnRgbld",  # Domi
        "EXAVITGu4G4kzY6CFlYu",  # Bella
        "ErXwobaYiN019PkySvjV",  # Elli
        "MF3mGyNYGl1u6R4ZHJwN",  # Josh
        "TxGEqnHWrfWFTfGW9XVX",  # Default male voice
    ]
    
    # If no API key, provide a simple fallback response
    if not ELEVENLABS_API_KEY:
        # Return a simple text response indicating TTS is not available
        return {
            "text": request.text,
            "message": "TTS not available - please configure ELEVENLABS_API_KEY in .env file",
            "fallback": True
        }
    
    try:
        # Try with requested voice ID first, then fallbacks
        voice_id = request.voice_id
        for attempt, voice in enumerate([voice_id] + fallback_voices):
            if not voice:
                continue
                
            try:
                print(f"Attempting TTS with voice: {voice} (attempt {attempt + 1})")
                audio = generate(
                    text=request.text,
                    voice=voice,
                    model="eleven_turbo_v2_5"  # Use newer model
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
                
            except Exception as voice_error:
                print(f"Voice {voice} failed: {str(voice_error)}")
                if attempt == len(fallback_voices):  # Last attempt
                    raise voice_error
                continue
        
        raise HTTPException(status_code=500, detail="All voice options failed")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")

@app.post("/stt/transcribe")
async def transcribe_audio(file: UploadFile = File(...), model: str = "base", language: str = "en"):
    """Transcribe audio file to text using OpenAI Whisper"""
    if not whisper_model:
        raise HTTPException(status_code=503, detail="Whisper model not loaded")
    
    valid_types = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg']
    if file.content_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Unsupported audio format: {file.content_type}")
    
    temp_input_path = None
    temp_wav_path = None
    
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename or "audio")[1]) as temp_file:
            content = await file.read()
            if len(content) < 100:
                raise HTTPException(status_code=400, detail="Audio file too small")
            temp_file.write(content)
            temp_input_path = temp_file.name
        
        if file.content_type != 'audio/wav':
            temp_wav_path = tempfile.mktemp(suffix='.wav')
            if not convert_webm_to_wav(temp_input_path, temp_wav_path):
                raise HTTPException(status_code=500, detail="Audio conversion failed")
            audio_path = temp_wav_path
        else:
            audio_path = temp_input_path
        
        result = process_audio_with_whisper(audio_path, language)
        
        # Save transcription to JSON file
        transcribed_text = result["text"].strip()
        detected_language = result.get("language", language)
        audio_duration = result.get("duration", 0.0)
        
        save_stt_transcription(
            text=transcribed_text,
            language=detected_language,
            duration=audio_duration
        )
        
        return TranscriptionResponse(
            text=transcribed_text,
            language=detected_language,
            duration=audio_duration
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    finally:
        if temp_input_path and os.path.exists(temp_input_path):
            os.unlink(temp_input_path)
        if temp_wav_path and os.path.exists(temp_wav_path):
            os.unlink(temp_wav_path)

@app.get("/stt/transcriptions")
async def get_stt_transcriptions():
    """Get all saved STT transcriptions"""
    try:
        transcriptions = load_stt_data()
        return {
            "count": len(transcriptions),
            "transcriptions": transcriptions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load transcriptions: {str(e)}")

@app.post("/stt/transcribe-base64")
async def transcribe_audio_base64(audio_data: dict):
    """Transcribe base64 encoded audio to text using OpenAI Whisper"""
    if not whisper_model:
        raise HTTPException(status_code=503, detail="Whisper model not loaded")
    
    try:
        import base64
        
        # Decode base64 audio
        audio_bytes = base64.b64decode(audio_data["audio"])
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            temp_file.write(audio_bytes)
            temp_file_path = temp_file.name
        
        try:
            # Transcribe using Whisper
            result = whisper_model.transcribe(
                temp_file_path,
                language=audio_data.get("language", "en") if audio_data.get("language") != "auto" else None,
                fp16=False
            )
            
            return TranscriptionResponse(
                text=result["text"].strip(),
                language=result.get("language", audio_data.get("language", "en")),
                duration=result.get("duration", 0.0)
            )
            
        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

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
