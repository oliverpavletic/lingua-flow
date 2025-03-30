from typing import Any, Dict

from fastapi import APIRouter, UploadFile

from app.services.deepgram import convert_audio_to_text
from app.services.gpt_prompt import get_gpt_spanish_feedback_prompt
from app.services.openai_client import query_gpt35

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("lingua-flow")

router = APIRouter()


@router.post("/audio-to-text")
async def audio_to_text(file: UploadFile) -> Dict[Any, Any]:
    audio = await file.read()
    voice_transcript = convert_audio_to_text(audio)
    logger.info(f"{voice_transcript=}")
    prompt_text = get_gpt_spanish_feedback_prompt(voice_transcript)
    feedback = query_gpt35(prompt_text)
    return {"feedback": feedback}
