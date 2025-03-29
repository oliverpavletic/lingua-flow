from openai import OpenAI


def query_gpt35(input: str) -> str:
    client = OpenAI()
    response = client.responses.create(model="gpt-3.5-turbo", input=input)
    return response.output_text
