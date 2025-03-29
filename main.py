import requests
import json
from datetime import datetime

AUDIO_FILE = "/Users/oliverpavletic/Desktop/short_spanish_audio_demo.m4a"
API_KEY_FILE = 'key.txt'

def load_api_key() -> str:
    with open(API_KEY_FILE, 'r') as f:
        return f.read().strip()

if __name__ == "__main__":
    headers = {
        "Authorization": f"Token {load_api_key()}",
        "Content-Type": "audio/m4a"
    }

    params = {
        "language": "es",
        "punctuate": "false",
        "filler_words": "true",
        "model": "general",  # no custom model normalization
        "diarize": "false"
    }

    with open(AUDIO_FILE, "rb") as audio:
        response = requests.post(
            "https://api.deepgram.com/v1/listen",
            headers=headers,
            params=params,
            data=audio
        )

    data = response.json()

    # Generate current time string in "yyyymmdd_hhmmss" format
    current_time_str = datetime.now().strftime("%Y%m%d_%H%M%S")

    with open(f'{current_time_str}_output.json', 'w') as f:
        f.write(json.dumps(data, indent=4))
