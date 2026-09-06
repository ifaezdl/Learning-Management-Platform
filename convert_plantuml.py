#!/usr/bin/env python3
import urllib.parse
import urllib.request
import base64
import zlib
import sys

def plantuml_encode(plantuml_text):
    """Encode PlantUML text to URL format"""
    data = plantuml_text.encode('utf-8')
    compressed = zlib.compress(data)
    # Remove zlib header
    compressed = compressed[2:-4]
    # Encode to base64
    encoded = base64.b64encode(compressed).decode('utf-8')
    # Replace characters for PlantUML URL encoding
    encoded = encoded.replace('+', '-').replace('/', '_')
    return encoded

def get_plantuml_url(plantuml_text, format='png'):
    """Generate PlantUML URL for rendering"""
    encoded = plantuml_encode(plantuml_text)
    base_url = "https://www.plantuml.com/plantuml"
    return f"{base_url}/{format}/{encoded}"

# Read the PlantUML file
with open('UML-ActivityDiagram-QuestionGeneration.puml', 'r', encoding='utf-8') as f:
    plantuml_text = f.read()

# Generate URL
url = get_plantuml_url(plantuml_text, 'png')
print(f"PlantUML URL:\n{url}\n")

# Download the image
try:
    print("Downloading PNG image...")
    response = urllib.request.urlopen(url, timeout=30)
    
    # Save the image
    with open('UML-ActivityDiagram-QuestionGeneration.png', 'wb') as f:
        f.write(response.read())
    
    print("✓ PNG file created: UML-ActivityDiagram-QuestionGeneration.png")
    print(f"File size: {len(response.read()) / 1024:.2f} KB")
    
except Exception as e:
    print(f"✗ Error downloading: {e}")
    print(f"\nPlease download manually from:\n{url}")

# Also generate SVG URL
svg_url = get_plantuml_url(plantuml_text, 'svg')
print(f"\nSVG URL (optional):\n{svg_url}")
