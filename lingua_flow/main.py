import json
from lingua_flow.api_clients import deepgram, openai_client
from lingua_flow import util

_AUDIO_FILE = "/Users/oliverpavletic/Desktop/short_spanish_audio_demo.m4a"

def main():
    deepgram_response = deepgram.convert_audio_to_text(_AUDIO_FILE)
    # deepgram_response = "hola me llamo oliver y quiero aprender espa\u00f1ol muchas gracias chao"

    query_str = f"""
    por favor, enumere los errores del siguiente texto en español (escrito por un extranjero), 
    ignorando la puntuación (por ejemplo, comas, acentos, tildes, mayúsculas y cosas similares) y teniendo en cuenta la redacción informal. 
    Si no hay errores, diga «sin errores».
    Recuerda, ¡no te quejes de la gramática ni de la ortografía! Incluidas las tildes y los puntos.

    texto="{deepgram_response}"
    """

    open_ai_response = openai_client.query_gpt35(query_str)

    with open(f'{util.get_curr_time_str()}_output.json', 'w') as f:
        f.write(json.dumps(open_ai_response, indent=4))

if __name__ == "__main__":
    main()
