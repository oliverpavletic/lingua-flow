from typing import Any, Dict

from fastapi import APIRouter

from app.services.deepgram import convert_audio_to_text
from app.services.gpt_prompt import get_gpt_spanish_feedback_prompt
from app.services.openai_client import query_gpt35

router = APIRouter()


@router.get("/audio-to-text")
async def audio_to_text() -> Dict[Any, Any]:
    # TODO pass in an actual audio file via HTTP
    audio_file = "/Users/oliverpavletic/Desktop/short_spanish_audio_demo.m4a"
    voice_transcript = convert_audio_to_text(audio_file)
    prompt_text = get_gpt_spanish_feedback_prompt(voice_transcript)
    feedback_text = query_gpt35(prompt_text)
    return {"feedback_text": feedback_text}
