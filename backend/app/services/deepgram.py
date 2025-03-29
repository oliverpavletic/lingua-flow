from typing import Any, Dict

import requests

from app.core.config import DEEPGRAM_API_KEY


def _extract_transcript(response_json: Dict[Any, Any]) -> str:
    try:
        text = response_json["results"]["channels"][0]["alternatives"][0]["transcript"]
        return text  # type: ignore
    except (KeyError, IndexError):
        raise AssertionError(
            "Failed to extract transcript from deepgram response!\n\n{response_json}"
        )


def convert_audio_to_text(audio_file: str) -> str:
    headers = {
        "Authorization": f"Token {DEEPGRAM_API_KEY}",
        "Content-Type": "audio/m4a",
    }

    params = {
        "language": "es",
        "punctuate": "false",
        "filler_words": "true",
        "model": "general",  # no custom model normalization
        "diarize": "false",
    }

    with open(audio_file, "rb") as audio:
        response = requests.post(
            "https://api.deepgram.com/v1/listen",
            headers=headers,
            params=params,
            data=audio,
        )

    return _extract_transcript(response.json())
