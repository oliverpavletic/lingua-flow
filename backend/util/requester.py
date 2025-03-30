import requests

_FILENAME = "/Users/oliverpavletic/Desktop/short_spanish_audio_demo.m4a"

with open(_FILENAME, "rb") as f:
    response = requests.post("http://localhost:8000/audio-to-text", files={"file": f})

if response.status_code == 200:
    print(
        "Response:", response.text
    ) 
else:
    print(
        f"Status code: {response.status_code}, Response: {response.text}"
    )

# USAGE:
# hatch run python -m util.requester
