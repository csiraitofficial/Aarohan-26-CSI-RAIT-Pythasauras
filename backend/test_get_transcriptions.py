import requests

def test_get_transcriptions():
    try:
        response = requests.get('http://127.0.0.1:8000/stt/transcriptions', timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Total transcriptions: {data['count']}")
            
            for transcription in data['transcriptions']:
                print(f"\nID: {transcription['id']}")
                print(f"Text: {transcription['text']}")
                print(f"Language: {transcription['language']}")
                print(f"Timestamp: {transcription['timestamp']}")
                print(f"Endpoint: {transcription['endpoint']}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_get_transcriptions()
