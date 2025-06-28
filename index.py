import json
import requests

# Load API token from config.json
with open("config.json") as f:
    config = json.load(f)
    token = config["KONTUR_API_TOKEN"]

# Define headers with Authorization
headers = {
    "Authorization": f"Bearer {token}"
}

# Example URL (adjust based on endpoint you want)
url = "https://api.kontur.io/disaster/live"

# Make the request
response = requests.get(url, headers=headers)

# Handle the response
if response.status_code == 200:
    data = response.json()
    print("Received data:", data)
else:
    print("Failed to retrieve data:", response.status_code, response.text)