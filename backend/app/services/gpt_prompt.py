def get_gpt_spanish_feedback_prompt(spanish_text_to_review: str) -> str:
    return f"""
    por favor, enumere los errores del siguiente texto en español
    (escrito por un extranjero),
    ignorando la puntuación
    (por ejemplo, comas, acentos, tildes, mayúsculas y cosas similares)
    y teniendo en cuenta la redacción informal.
    Si no hay errores, diga «sin errores».
    Recuerda, ¡no te quejes de la gramática ni de la ortografía!
    Incluidas las tildes y los puntos.

    texto="{spanish_text_to_review}"
    """
