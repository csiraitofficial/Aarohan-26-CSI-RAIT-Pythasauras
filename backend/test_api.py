import requests
import io

# Test the STT endpoint with a simple text file (will fail but shows if endpoint is reachable)
try:
    # Create a dummy file
    dummy_data = b"dummy audio data"
    
    files = {'file': ('test.webm', dummy_data, 'audio/webm')}
    
    response = requests.post(
        'http://127.0.0.1:8000/stt/transcribe',
        files=files,
        timeout=10
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
except requests.exceptions.ConnectionError:
    print("Connection Error: Backend not reachable")
except Exception as e:
    print(f"Error: {e}")
