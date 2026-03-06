import requests
import numpy as np
import wave
import tempfile
import os

# Create a proper audio file for testing
def create_test_audio():
    # Generate a simple sine wave audio
    sample_rate = 16000  # Whisper works best with 16kHz
    duration = 2  # 2 seconds
    frequency = 440  # A4 note
    
    # Generate sine wave
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    audio_data = np.sin(2 * np.pi * frequency * t)
    
    # Convert to 16-bit PCM
    audio_data = (audio_data * 32767).astype(np.int16)
    
    # Create WAV file
    temp_file = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
    with wave.open(temp_file.name, 'wb') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_data.tobytes())
    
    return temp_file.name

# Test the STT endpoint
def test_stt():
    try:
        # Create test audio
        audio_file = create_test_audio()
        print(f"Created test audio: {audio_file}")
        
        # Send to STT endpoint
        with open(audio_file, 'rb') as f:
            files = {'file': ('test.wav', f, 'audio/wav')}
            response = requests.post(
                'http://127.0.0.1:8000/stt/transcribe',
                files=files,
                timeout=30
            )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Clean up
        os.unlink(audio_file)
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_stt()
