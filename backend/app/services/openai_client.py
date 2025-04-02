from openai import OpenAI


def query_gpt(model: str, input: str, instructions: str) -> str:
    client = OpenAI()
    response = client.responses.create(model=model, input=input, instructions=instructions)
    return response.output_text
