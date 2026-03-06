import requests
import json

def test_tts():
    try:
        # Test the TTS endpoint
        response = requests.post(
            'http://127.0.0.1:8000/tts',
            json={"text": "Hello, this is a test of the text to speech system."},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ TTS working successfully!")
            print(f"Audio size: {len(response.content)} bytes")
            # Save the audio file
            with open('test_tts_output.mp3', 'wb') as f:
                f.write(response.content)
            print("Audio saved as 'test_tts_output.mp3'")
        else:
            print(f"❌ TTS failed: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_tts()
