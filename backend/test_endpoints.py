#!/usr/bin/env python
import requests
import json
import time
import subprocess
import os

# Start Flask backend with UTF-8 enabled
env = os.environ.copy()
env.update({'PYTHONUTF8': '1', 'PYTHONIOENCODING': 'utf-8'})

print("Starting Flask backend...")
proc = subprocess.Popen(['python', 'app.py'], env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
time.sleep(4)  # Wait for Flask to start

base = 'http://127.0.0.1:5000'

# Test vendor endpoint
print("\n" + "="*60)
print("TEST 1: VENDOR RECOMMENDATION")
print("="*60)
try:
    r = requests.post(f'{base}/recommend/vendor', json={
        'price_per_kw': 50000,
        'rating': 4.5,
        'experience_years': 5
    })
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
except Exception as e:
    print(f"Error: {e}")

time.sleep(1)

# Test scheme endpoint
print("\n" + "="*60)
print("TEST 2: SCHEME RECOMMENDATION")
print("="*60)
try:
    r = requests.post(f'{base}/recommend/scheme', json={
        'location': 'central',
        'budget': 250000,
        'capacity': 4.0
    })
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
except Exception as e:
    print(f"Error: {e}")

# Read backend output (the debug logs)
time.sleep(2)
print("\n" + "="*60)
print("BACKEND DEBUG OUTPUT:")
print("="*60)

# Give time for any remaining stdout/stderr
proc.terminate()
proc.wait(timeout=5)

# Try to capture any output that was written
try:
    out, _ = proc.communicate(timeout=2)
    if out:
        print(out)
except:
    pass

print("\nDone.")
