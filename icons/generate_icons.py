#!/usr/bin/env python3
"""
Simple icon generator for PDS Lens Chrome Extension
Creates PNG icons in 16x16, 48x48, and 128x128 sizes
"""

try:
    from PIL import Image, ImageDraw
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("PIL not available. Install with: pip install Pillow")

def generate_icon(size, filename):
    """Generate a simple lens icon"""
    # Create image with blue background
    img = Image.new('RGB', (size, size), color='#0066cc')
    draw = ImageDraw.Draw(img)

    # Calculate dimensions
    center_x = size // 2
    center_y = size // 2
    radius = int(size * 0.25)
    line_width = max(1, int(size * 0.08))

    # Draw lens circle
    left = center_x - radius - int(size * 0.05)
    top = center_y - radius - int(size * 0.05)
    right = center_x + radius - int(size * 0.05)
    bottom = center_y + radius - int(size * 0.05)

    for i in range(line_width):
        draw.ellipse([left - i, top - i, right + i, bottom + i],
                     outline='white', width=1)

    # Draw handle
    handle_start_x = center_x + int(radius * 0.5)
    handle_start_y = center_y + int(radius * 0.5)
    handle_end_x = center_x + int(radius * 1.3)
    handle_end_y = center_y + int(radius * 1.3)

    for i in range(line_width):
        offset = i - line_width // 2
        draw.line([handle_start_x + offset, handle_start_y,
                   handle_end_x + offset, handle_end_y],
                  fill='white', width=1)
        draw.line([handle_start_x, handle_start_y + offset,
                   handle_end_x, handle_end_y + offset],
                  fill='white', width=1)

    # Save
    img.save(filename)
    print(f"Created {filename}")

if __name__ == '__main__':
    if PIL_AVAILABLE:
        generate_icon(16, 'icon16.png')
        generate_icon(48, 'icon48.png')
        generate_icon(128, 'icon128.png')
        print("\nAll icons generated successfully!")
    else:
        print("\nPlease install Pillow to generate icons:")
        print("  pip install Pillow")
        print("\nOr use the generate_icons.html file to create icons manually.")
