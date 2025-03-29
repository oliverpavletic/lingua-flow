import os
from dotenv import load_dotenv

# Auto-load .env file when this module is imported
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY is missing in .env")

if not DEEPGRAM_API_KEY:
    raise ValueError("DEEPGRAM_API_KEY is missing in .env")
