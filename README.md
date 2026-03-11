# RoboBuddy 🤖

> **AI-Powered Interview & Public Speaking Practice Platform**

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat&logo=three.js&logoColor=white)](https://threejs.org/)
[![ElevenLabs](https://img.shields.io/badge/ElevenLabs-000000?style=flat&logo=elevenlabs&logoColor=white)](https://elevenlabs.io/)

RoboBuddy is an intelligent practice platform that helps users improve their interview skills and public speaking abilities through AI-powered mock interviews, real-time speech analysis, and interactive 3D visualizations.

## Features

### Core Capabilities
- **AI Mock Interviews** - Practice job interviews with AI-generated questions across multiple domains (Software Engineering, Web Development, Data Science, UI/UX Design)
- **Speech-to-Text Analysis** - Real-time transcription using OpenAI Whisper with filler word detection ("um", "uh", "like")
- **Text-to-Speech** - Natural voice synthesis using ElevenLabs for realistic interview experiences
- **Focus Tracking** - AI-powered attention monitoring during practice sessions
- **Performance Metrics** - Track pause duration, word count, and filler word usage

### Technical Features
- **Real-time WebSocket Communication** - Low-latency audio streaming for live transcription
- **3D Interactive Robot Scene** - Three.js-powered animated robot companion
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Framer Motion Animations** - Smooth, cinematic UI transitions
- **Audio Visualization** - Real-time waveform display during speech recording

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.9+** - For the backend API
- **Node.js 18+** - For the frontend application
- **FFmpeg** - For audio format conversion
- **Git** - For cloning the repository

### Installing FFmpeg

**Windows:**
```powershell
# Using winget
winget install Gyan.FFmpeg

# Or download from https://ffmpeg.org/download.html and add to PATH
```

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

## Project Structure

```
RoboBuddy/
├── backend/                    # FastAPI Backend
│   ├── main.py                # Main application entry
│   ├── questions_database.json # Interview questions data
│   ├── requirements.txt       # Python dependencies
│   └── .env.example          # Environment template
│
├── Frontend/                  # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   ├── contexts/         # React contexts (Auth, etc.)
│   │   ├── services/         # API services
│   │   ├── lib/              # Utility hooks
│   │   └── styles/           # Global styles
│   ├── package.json          # Node dependencies
│   └── vite.config.ts        # Vite configuration
│
└── README.md                 # This file
```

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd RoboBuddy
```

### 2. Backend Setup

Navigate to the backend directory and set up the Python environment:

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your ElevenLabs API key
# Get your API key from: https://elevenlabs.io/app/settings/api-keys
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

#### Start the Backend Server

```bash
python main.py
```

The API will be available at `http://localhost:8000`

**Backend Features:**
- Auto-downloads Whisper model on first run (base model ~150MB)
- ElevenLabs TTS integration
- CORS enabled for frontend communication
- RESTful API with automatic documentation at `/docs`

### 3. Frontend Setup

Open a new terminal and navigate to the Frontend directory:

```bash
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

**Frontend Features:**
- Vite for fast development and hot module replacement
- Automatic proxy to backend at `localhost:8000`
- TypeScript for type safety
- Tailwind CSS for styling

## How It Works

### Architecture Overview

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   React Frontend │ ────▶│   FastAPI Backend │ ────▶│  ElevenLabs TTS │
│  (TypeScript)    │      │    (Python)        │      │   Whisper STT   │
└─────────────────┘      └──────────────────┘      └─────────────────┘
         │                          │
         │ WebSocket                │
         ▼                          ▼
┌─────────────────┐      ┌──────────────────┐
│  Real-time Audio │      │   Questions DB   │
│   Streaming      │      │   (JSON)         │
└─────────────────┘      └──────────────────┘
```

### User Flow

1. **Authentication** - Users register/login (simulated auth with localStorage)
2. **Dashboard** - View practice categories and progress
3. **Topic Selection** - Choose job interviews or skill development
4. **Practice Session** - 
   - Camera feed with focus detection
   - AI interviewer asks questions via TTS
   - User responds via microphone
   - Real-time transcription and analysis
5. **Feedback** - View metrics (filler words, pauses, word count)

### Key Components

#### Backend (`main.py`)
- **STT Endpoint** (`/stt`): Converts uploaded audio to text using Whisper
- **TTS Endpoint** (`/tts`): Synthesizes speech from text using ElevenLabs
- **WebSocket** (`/api/speech/ws`): Real-time bidirectional audio streaming
- **Questions API**: CRUD operations for interview questions

#### Frontend Hooks
- **`useSpeechWebSocket.ts`**: Manages WebSocket connection, audio capture, PCM16 encoding
- **`useFocus.ts`**: Tracks user attention using face detection
- **`useAuth.ts`**: Authentication state management

#### 3D Scene (`RoboticScene.tsx`)
- Three.js animated robot with floating animation
- Emissive materials for sci-fi aesthetic
- Lazy-loaded with error boundary

## API Documentation

### REST Endpoints

#### Health Check
```http
GET /health
```
Returns API status and ElevenLabs configuration.

#### Questions
```http
GET /sections
POST /questions/{category}/{section_id}
GET /questions/{category}/{section_id}/{question_index}
```

**Categories:** `job-interview`, `skill-development`

**Sections:** `software-engineer`, `web-developer`, `ui-ux-designer`, `data-scientist`, `presentation-skills`, `communication-boost`, `leadership-skills`, `negotiation-skills`

#### Speech-to-Text
```http
POST /stt
Content-Type: multipart/form-data

file: <audio_file>
```

#### Text-to-Speech
```http
POST /tts
Content-Type: application/json

{
  "text": "Your question text here",
  "voice_id": "Rachel"
}
```

### WebSocket Protocol

**Connection:** `ws://localhost:8000/api/speech/ws`

**Client → Server:**
```json
{
  "type": "audio",
  "pcm16_b64": "base64_encoded_pcm_data",
  "sample_rate": 16000
}
```

**Server → Client:**
```json
{
  "type": "transcript",
  "text": "transcribed text",
  "is_final": true,
  "metrics": {
    "filler_count": 2,
    "pause_seconds": 1.5,
    "total_words": 25
  }
}
```

## Available Scripts

### Backend
```bash
python main.py              # Start server on port 8000
uvicorn main:app --reload   # Alternative with auto-reload
```

### Frontend
```bash
npm run dev     # Start dev server (port 5173)
npm run build   # Build for production
npm run lint    # Run ESLint
npm run preview # Preview production build
```

## Environment Variables

### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `ELEVENLABS_API_KEY` | ElevenLabs API key for TTS | Yes |

### Frontend (.env.local)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_WS_URL` | WebSocket URL | `ws://localhost:8000/api/speech/ws` |
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |

## Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError: No module named 'ffmpeg'`
**Solution:** Install FFmpeg system-wide and ensure it's in PATH

**Problem:** `Error loading Whisper model`
**Solution:** Check internet connection (downloads model on first run) or clear cache at `~/.cache/whisper`

**Problem:** `ElevenLabs API error`
**Solution:** Verify `ELEVENLABS_API_KEY` is set in `.env`

### Frontend Issues

**Problem:** `WebSocket connection failed`
**Solution:** 
- Ensure backend is running on port 8000
- Check Vite proxy configuration in `vite.config.ts`
- Verify no firewall blocking WebSocket

**Problem:** `Microphone not working`
**Solution:**
- Check browser permissions for microphone access
- Ensure HTTPS or localhost (browsers block mic on insecure origins)

**Problem:** `3D scene not rendering`
**Solution:**
- Check WebGL support in browser
- Disable hardware acceleration in browser settings if black screen

## Development Notes

### Adding New Question Categories

1. Edit `backend/questions_database.json`
2. Add category and sections following existing structure
3. Frontend will automatically display new categories

### Customizing TTS Voice

1. Get voice ID from [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)
2. Update voice_id in API calls or set default in `main.py`

### Extending Speech Analysis

The WebSocket protocol supports adding custom metrics. Modify:
- Backend: `main.py` WebSocket handler
- Frontend: `useSpeechWebSocket.ts` message parser

## Tech Stack

### Backend
- **FastAPI** - High-performance web framework
- **OpenAI Whisper** - Speech recognition
- **ElevenLabs** - Text-to-speech synthesis
- **FFmpeg** - Audio format conversion
- **Python-multipart** - File upload handling

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Three.js + React Three Fiber** - 3D graphics
- **Lucide React** - Icons
- **Zod** - Schema validation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [ElevenLabs](https://elevenlabs.io/) for TTS API
- [OpenAI](https://openai.com/) for Whisper model
- [FastAPI](https://fastapi.tiangolo.com/) for excellent backend framework
- [Three.js](https://threejs.org/) community for 3D resources

---

**Made with ❤️ for Aarohan '26 - CSI RAIT**
**By Pythasauras**
**Members: [vAISHNAV KADAV, AMAN KANOJIYA, TANVI BHAGESHWAR, MAHIMA MOURYA]**

For support or questions, please open an issue on the repository.
