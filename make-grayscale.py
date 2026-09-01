import sys, os
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
from PIL import Image, ImageEnhance

INPUT = 'educore-activity-diagram.png'
OUTPUT = 'educore-activity-diagram-grayscale.png'

img = Image.open(INPUT)

# Convert to grayscale
gray = img.convert('L')

# Enhance contrast slightly for better readability in print
enhancer = ImageEnhance.Contrast(gray)
gray = enhancer.enhance(1.15)

# Convert back to RGB (required for PNG compatibility with Word)
final = gray.convert('RGB')

# Save
final.save(OUTPUT, 'PNG', optimize=True)
sz = os.path.getsize(OUTPUT)
print(f'Grayscale: {final.size[0]}x{final.size[1]} ({sz/1024:.0f} KB)')
print(f'Saved: {OUTPUT}')
