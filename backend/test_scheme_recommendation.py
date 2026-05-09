import requests
import json

# Test scheme recommendation endpoint
url = "http://127.0.0.1:5000/recommend/scheme"

test_cases = [
    {"location": "north", "budget": 50000, "capacity": 3},
    {"location": "south", "budget": 80000, "capacity": 5},
    {"location": "central", "budget": 30000, "capacity": 2},
]

for i, data in enumerate(test_cases, 1):
    print("\n--- Test Case {} ---".format(i))
    print("Input: {}".format(data))

    try:
        response = requests.post(url, json=data)
        result = response.json()

        if response.status_code == 200 and result.get("success"):
            print("Success!")
            print("Recommended Scheme: {}".format(result.get('recommended_scheme')))
            print("Subsidy: {}%".format(result.get('subsidy_percentage')))
            print("Estimated Subsidy: Rs.{}".format(result.get('estimated_subsidy')))
        else:
            print("Error:", result.get("error", "Unknown error"))

    except Exception as e:
        print("Request failed:", str(e))