import requests
import tempfile
import os

# Test with a WebM audio file (simulating what frontend sends)
def test_webm_stt():
    try:
        # Create a simple WebM file header (this is just for testing the format detection)
        # In real scenario, this would be actual WebM audio data
        webm_header = b'\x1aE\xdf\xa3B\x86\x81\x01B\xf7\x81\x01B\xf2\x81\x04B\xf3\x81\x08B\x82\x84webmB\x87\x81\x04B\x85\x81\x02M\x80\x81\x01'
        
        # Create temporary WebM file
        temp_file = tempfile.NamedTemporaryFile(suffix='.webm', delete=False)
        temp_file.write(webm_header + b'\x00' * 1000)  # Add some dummy data
        temp_file.close()
        
        print(f"Created test WebM file: {temp_file.name}")
        
        # Send to STT endpoint
        with open(temp_file.name, 'rb') as f:
            files = {'file': ('test.webm', f, 'audio/webm')}
            response = requests.post(
                'http://127.0.0.1:8000/stt/transcribe',
                files=files,
                timeout=30
            )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Clean up
        os.unlink(temp_file.name)
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_webm_stt()
