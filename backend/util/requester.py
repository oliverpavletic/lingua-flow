import requests

# Endpoint URL
url = "http://127.0.0.1:8000/audio-to-text"

# Make the POST request to the FastAPI endpoint with the JSON payload
response = requests.get(url)

# Print the response from the server
if response.status_code == 200:
    print(
        "Response:", response.text
    )  # Print the response from the FastAPI app (likely the text result)
else:
    print(
        "Failed to get text. "
        f"Status code: {response.status_code}, Response: {response.text}"
    )

# Run with hatch run python -m util.requester
