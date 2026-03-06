from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os

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

app = FastAPI(title="RoboBuddy API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "RoboBuddy API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database_loaded": QUESTIONS_DATABASE is not None}

@app.get("/questions/{category}/{section_id}")
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

@app.get("/sections")
async def get_all_sections():
    """Get all available sections organized by category"""
    return {
        "categories": QUESTIONS_DATABASE,
        "total_categories": len(QUESTIONS_DATABASE),
        "total_sections": sum(len(sections) for sections in QUESTIONS_DATABASE.values())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
