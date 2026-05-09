import urllib.request
import json

# Test scheme recommendation endpoint
url = "http://127.0.0.1:5000/recommend/scheme"
data = {
    "location": "north",
    "budget": 50000,
    "capacity": 3
}

# Convert to JSON
json_data = json.dumps(data).encode('utf-8')

# Make request
req = urllib.request.Request(url, data=json_data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        print("Response:", json.dumps(result, indent=2))
except Exception as e:
    print("Error:", str(e))