# Extension Icons

This directory contains the icon assets for the Holy Land Fee Calculator Chrome extension.

## Required Icons

Chrome Web Store requires the following icon sizes:

### Extension Icons (Required)
- **icon-16.png** - 16x16px - Displayed in extension toolbar
- **icon-48.png** - 48x48px - Displayed in Extensions management page
- **icon-128.png** - 128x128px - Used in Chrome Web Store and during installation

### Store Listing Images (Required)
- **screenshot-1.png** - 1280x800px (or 640x400px) - Main feature showcase
- **screenshot-2.png** - 1280x800px - Order summary calculator
- **screenshot-3.png** - 1280x800px - Product page calculator
- **promo-large.png** - 1400x560px - Marquee promotional tile (optional but recommended)
- **promo-small.png** - 440x280px - Small promotional tile (optional)

## Design Guidelines

### Icon Design Concept

The icon should represent:
- 🎸 Musical instruments (Thomann is a music gear retailer)
- 🇮🇱 Israeli connection (₪ shekel symbol, Star of David, or blue/white colors)
- 💰 Fee/price calculation (calculator, currency symbols)
- 📦 Shipping/customs (package, globe)

### Suggested Icon Ideas

**Option 1: Guitar + Shekel**
- Simple guitar silhouette with ₪ symbol overlay
- Colors: Blue (#0066CC) and white, or Israel flag colors

**Option 2: Calculator + Music Note**
- Calculator icon with musical note
- Green accent for "calculation complete"

**Option 3: Package + Israel Flag**
- Stylized package/box with Israel flag colors
- Simple, recognizable at small sizes

**Option 4: Price Tag + Guitar**
- Price tag shape with guitar icon inside
- ₪ symbol visible

### Design Requirements

1. **Simplicity**: Must be recognizable at 16x16px
2. **Contrast**: Clear edges, high contrast colors
3. **No text**: Avoid text in icons (hard to read at small sizes)
4. **Consistent style**: Same design at all sizes, just scaled
5. **Transparency**: Use PNG with transparent background
6. **Colors**:
   - Primary: Blue (#0066CC or similar)
   - Secondary: White or light gray
   - Accent: Green for "success" or orange for "info"

## Creating Icons

### Tools You Can Use

**Online (Free):**
- Figma (free tier) - https://figma.com
- Canva - https://canva.com
- Photopea (Photoshop alternative) - https://photopea.com

**Desktop:**
- GIMP (free) - https://gimp.org
- Inkscape (free, vector) - https://inkscape.org
- Adobe Illustrator / Photoshop (paid)

### Quick Icon Creation Steps

1. **Design at 128x128**
   - Create the largest size first
   - Use vector shapes if possible
   - Keep it simple and bold

2. **Test at 16x16**
   - Scale down to 16x16 and check clarity
   - Simplify if details are lost
   - Adjust contrast if needed

3. **Export at all required sizes**
   - 16x16px → icon-16.png
   - 48x48px → icon-48.png
   - 128x128px → icon-128.png

4. **Save as PNG**
   - 32-bit color with alpha channel (transparency)
   - Optimize file size (<10KB per icon)

### Using AI to Generate Icons

You can use AI tools to generate icon concepts:

**Prompt example:**
```
Create a simple, modern icon for a Chrome extension that calculates Israeli customs fees for musical instruments from Thomann.de. The icon should include a guitar silhouette and the Israeli Shekel (₪) symbol. Use blue and white colors. Make it clean and recognizable at small sizes. Flat design style.
```

**Tools:**
- DALL-E (OpenAI)
- Midjourney
- Stable Diffusion
- Adobe Firefly

## Placeholder Icon

While you work on a professional icon, you can use a simple colored square as a placeholder:

### Quick Placeholder (Using ImageMagick)

```bash
# Install imagemagick first: brew install imagemagick

# Create blue squares with ₪ symbol
convert -size 128x128 xc:"#0066CC" -pointsize 96 -fill white -gravity center -annotate +0+0 "₪" icon-128.png
convert -size 48x48 xc:"#0066CC" -pointsize 36 -fill white -gravity center -annotate +0+0 "₪" icon-48.png
convert -size 16x16 xc:"#0066CC" -pointsize 12 -fill white -gravity center -annotate +0+0 "₪" icon-16.png
```

Or use this Python script (requires Pillow):

```python
from PIL import Image, ImageDraw, ImageFont

def create_placeholder_icon(size, filename):
    # Create blue background
    img = Image.new('RGB', (size, size), color='#0066CC')
    draw = ImageDraw.Draw(img)

    # Draw ₪ symbol
    font_size = int(size * 0.75)
    try:
        font = ImageFont.truetype("Arial.ttf", font_size)
    except:
        font = ImageFont.load_default()

    text = "₪"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((size - text_width) // 2, (size - text_height) // 2)

    draw.text(position, text, fill='white', font=font)
    img.save(filename)

# Generate icons
create_placeholder_icon(128, 'icon-128.png')
create_placeholder_icon(48, 'icon-48.png')
create_placeholder_icon(16, 'icon-16.png')
```

## Screenshots Guide

For Chrome Web Store screenshots:

### Screenshot 1: Order Summary Calculator
- Show the checkout page with Israeli prices displayed
- Highlight the fee breakdown
- Size: 1280x800px
- Annotate key features if needed

### Screenshot 2: Product Page View
- Show a product page with the calculator
- Display price comparison
- Size: 1280x800px

### Screenshot 3: Fee Breakdown Detail
- Close-up of the calculation breakdown
- Show tooltip or detailed view
- Size: 1280x800px

### Tips for Good Screenshots
1. Use a clean Thomann.de page (no personal info)
2. Highlight the extension's UI clearly
3. Use arrows or annotations to point out features
4. Keep text readable (avoid tiny fonts)
5. Show real, useful data (not Lorem Ipsum)

## Testing Icons

After creating icons:

1. **Visual Test**: Place all three sizes side-by-side and verify consistency
2. **Chrome Test**: Load extension and check how icons appear in:
   - Toolbar (16x16)
   - Extension management page (48x48)
   - Installation prompt (128x128)
3. **Background Test**: View icons on both light and dark backgrounds
4. **Print Test**: Print at actual size to check clarity

## File Checklist

Before submitting to Chrome Web Store:

- [ ] icon-16.png (16x16px, <10KB)
- [ ] icon-48.png (48x48px, <10KB)
- [ ] icon-128.png (128x128px, <20KB)
- [ ] screenshot-1.png (1280x800px)
- [ ] screenshot-2.png (1280x800px)
- [ ] screenshot-3.png (1280x800px, optional but recommended)
- [ ] All icons look clear and professional
- [ ] No placeholder icons in production build
- [ ] Icons tested in Chrome

## Resources

- Chrome Web Store Best Practices: https://developer.chrome.com/docs/webstore/images/
- Material Design Icons: https://fonts.google.com/icons
- Flaticon (free icons): https://flaticon.com
- Icon size checker: https://www.websiteplanet.com/webtools/favicon-generator/

---

**Note**: The current manifest.json will be updated to reference these icons once they're created.
