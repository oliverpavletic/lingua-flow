from typing import Any, Dict

from fastapi import APIRouter, UploadFile

from app.services.deepgram import convert_audio_to_text
from app.services.gpt_prompt import get_gpt_spanish_tutor_instructions
from app.services.openai_client import query_gpt

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("lingua-flow")

router = APIRouter()


@router.post("/audio-to-text")
async def audio_to_text(file: UploadFile) -> Dict[Any, Any]:
    audio = await file.read()
    transcript = convert_audio_to_text(audio)
    instructions = get_gpt_spanish_tutor_instructions()
    feedback = query_gpt(model="gpt-4o", input=transcript, instructions=instructions) 
    response = {"transcript": transcript, "feedback": feedback}
    logger.info(response)
    return response
