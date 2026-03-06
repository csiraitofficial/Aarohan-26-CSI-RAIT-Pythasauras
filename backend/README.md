# RoboBuddy Backend API

FastAPI backend for RoboBuddy application with ElevenLabs TTS integration.

## Features

- **Question Management**: Fetch specific questions from practice sections
- **Text-to-Speech**: Convert questions to audio using ElevenLabs
- **RESTful API**: Clean and documented endpoints

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
# Copy the example file
cp env.example .env

# Edit .env with your ElevenLabs API key
ELEVENLABS_API_KEY=your_api_key_here
```

3. Run the server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Health Check
- `GET /health` - Check API status and ElevenLabs configuration

### Questions
- `GET /sections` - Get all available sections and categories
- `POST /questions/{category}/{section_id}` - Get all questions for a specific section
- `GET /questions/{category}/{section_id}/{question_index}` - Get a specific question by index

### Text-to-Speech
- `POST /tts` - Convert text to speech
  ```json
  {
    "text": "Your question text here",
    "voice_id": "Rachel"  // optional, defaults to "Rachel"
  }
  ```

## Example Usage

### Get software engineer questions
```bash
curl -X POST http://localhost:8000/questions/job-interview/software-engineer
```

### Get specific question
```bash
curl http://localhost:8000/questions/job-interview/software-engineer/0
```

### Generate TTS audio
```bash
curl -X POST http://localhost:8000/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Can you explain the difference between REST and GraphQL?"}'
```

## Available Categories

### Job Interview
- `software-engineer` - Technical interviews, coding challenges
- `web-developer` - Frontend/backend development
- `ui-ux-designer` - Design principles and portfolio review
- `data-scientist` - Machine learning and statistical analysis

### Skill Development
- `presentation-skills` - Public speaking and engagement
- `communication-boost` - Verbal and non-verbal communication
- `leadership-skills` - Team management and decision making
- `negotiation-skills` - Effective negotiation techniques

## Frontend Integration

The frontend is already configured to work with this API. The `SectionTranscript` component in the frontend will:

1. Fetch questions from the appropriate endpoint
2. Automatically play TTS for each question
3. Handle navigation between questions
4. Display error messages for TTS failures

Make sure to set the `VITE_API_URL` environment variable in the frontend to point to this backend server.
