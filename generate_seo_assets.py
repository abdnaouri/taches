import os
import math
from PIL import Image, ImageDraw, ImageFont

PUBLIC_DIR = os.path.join(os.getcwd(), 'public')
os.makedirs(PUBLIC_DIR, exist_ok=True)

# Try to find Helvetica / Arial or fallback
def get_font(size, bold=True):
    font_paths = [
        "/System/Library/Fonts/HelveticaNeue.ttc",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                # Some .ttc fonts require index
                if p.endswith('.ttc'):
                    index = 1 if bold else 0
                    try:
                        return ImageFont.truetype(p, size, index=index)
                    except Exception:
                        return ImageFont.truetype(p, size, index=0)
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()

def draw_rounded_rect(draw, bbox, radius, fill):
    draw.rounded_rectangle(bbox, radius=radius, fill=fill)

def generate_app_icon(size=512):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Rounded squircle background with clean gradient
    pad = int(size * 0.04)
    radius = int(size * 0.22)
    
    # Background
    bg_color = (29, 78, 216, 255) # #1d4ed8 royal blue
    draw.rounded_rectangle([pad, pad, size - pad, size - pad], radius=radius, fill=bg_color)
    
    # Subtle inner border for executive crispness
    draw.rounded_rectangle([pad, pad, size - pad, size - pad], radius=radius, outline=(59, 130, 246, 180), width=max(1, int(size * 0.015)))

    # Draw bold geometric "T"
    t_color = (255, 255, 255, 255)
    
    # Proportions for a modern geometric 'T'
    # Top bar
    bar_top = int(size * 0.25)
    bar_height = int(size * 0.13)
    bar_left = int(size * 0.22)
    bar_right = int(size * 0.78)
    bar_radius = int(bar_height * 0.35)
    draw.rounded_rectangle([bar_left, bar_top, bar_right, bar_top + bar_height], radius=bar_radius, fill=t_color)
    
    # Stem
    stem_width = int(size * 0.15)
    stem_left = int((size - stem_width) / 2)
    stem_right = stem_left + stem_width
    stem_top = bar_top + int(bar_height * 0.5)
    stem_bottom = int(size * 0.76)
    stem_radius = int(stem_width * 0.3)
    draw.rounded_rectangle([stem_left, stem_top, stem_right, stem_bottom], radius=stem_radius, fill=t_color)

    # Green accent dot (representing validation / Daman escrow guarantee)
    dot_radius = int(size * 0.08)
    dot_cx = int(size * 0.75)
    dot_cy = int(size * 0.27)
    dot_color = (16, 185, 129, 255) # #10b981 Emerald Green
    
    # White ring around dot
    draw.ellipse([dot_cx - dot_radius - int(size*0.02), dot_cy - dot_radius - int(size*0.02),
                  dot_cx + dot_radius + int(size*0.02), dot_cy + dot_radius + int(size*0.02)],
                 fill=(29, 78, 216, 255))
    draw.ellipse([dot_cx - dot_radius, dot_cy - dot_radius, dot_cx + dot_radius, dot_cy + dot_radius],
                 fill=dot_color)

    return img

def create_svg_icon():
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
  </defs>
  <!-- Background Squircle -->
  <rect x="20" y="20" width="472" height="472" rx="110" fill="url(#brandGrad)" stroke="#3b82f6" stroke-width="6" />
  
  <!-- Geometric Clean 'T' -->
  <rect x="112" y="128" width="288" height="66" rx="22" fill="#ffffff" />
  <rect x="218" y="150" width="76" height="240" rx="20" fill="#ffffff" />
  
  <!-- Escrow Green Guarantee Badge Dot -->
  <circle cx="384" cy="138" r="46" fill="#1d4ed8" />
  <circle cx="384" cy="138" r="38" fill="#10b981" stroke="#ffffff" stroke-width="6" />
</svg>'''
    with open(os.path.join(PUBLIC_DIR, 'icon.svg'), 'w', encoding='utf-8') as f:
        f.write(svg_content)
    with open(os.path.join(PUBLIC_DIR, 'favicon.svg'), 'w', encoding='utf-8') as f:
        f.write(svg_content)

def generate_favicons():
    create_svg_icon()
    base_512 = generate_app_icon(512)
    base_512.save(os.path.join(PUBLIC_DIR, 'icon-512.png'), 'PNG')
    
    # 192x192
    img_192 = base_512.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save(os.path.join(PUBLIC_DIR, 'icon-192.png'), 'PNG')
    
    # 180x180 (Apple Touch Icon)
    img_180 = base_512.resize((180, 180), Image.Resampling.LANCZOS)
    img_180.save(os.path.join(PUBLIC_DIR, 'apple-touch-icon.png'), 'PNG')
    
    # 96x96
    img_96 = base_512.resize((96, 96), Image.Resampling.LANCZOS)
    img_96.save(os.path.join(PUBLIC_DIR, 'icon-96.png'), 'PNG')
    
    # 48x48 (Google Search Desktop Favicon standard)
    img_48 = base_512.resize((48, 48), Image.Resampling.LANCZOS)
    img_48.save(os.path.join(PUBLIC_DIR, 'icon-48.png'), 'PNG')
    img_48.save(os.path.join(PUBLIC_DIR, 'favicon.png'), 'PNG')

    # favicon.ico (multi-size: 16, 32, 48)
    img_16 = base_512.resize((16, 16), Image.Resampling.LANCZOS)
    img_32 = base_512.resize((32, 32), Image.Resampling.LANCZOS)
    base_512.save(os.path.join(PUBLIC_DIR, 'favicon.ico'), format='ICO', sizes=[(16,16), (32,32), (48,48)])
    print("Favicons and app icons generated successfully.")

def generate_og_image():
    W, H = 1200, 630
    img = Image.new('RGB', (W, H), (15, 23, 42)) # #0f172a Deep Slate
    draw = ImageDraw.Draw(img)

    # Subtle top royal glow / border
    for y in range(4):
        draw.line([(0, y), (W, y)], fill=(29, 78, 216))

    # Grid background dots for tech precision
    dot_color = (30, 41, 59) # #1e293b
    for gx in range(40, W, 40):
        for gy in range(40, H, 40):
            draw.ellipse([gx - 1, gy - 1, gx + 1, gy + 1], fill=dot_color)

    # Top Brand Bar
    # Draw Brand Icon squircle (72x72)
    icon_size = 72
    icon_x, icon_y = 70, 60
    draw.rounded_rectangle([icon_x, icon_y, icon_x + icon_size, icon_y + icon_size], radius=18, fill=(29, 78, 216))
    draw.rounded_rectangle([icon_x, icon_y, icon_x + icon_size, icon_y + icon_size], radius=18, outline=(59, 130, 246), width=2)
    
    # White T in icon
    t_font = get_font(44, bold=True)
    draw.text((icon_x + 22, icon_y + 9), "T", font=t_font, fill=(255, 255, 255))
    # Green dot
    draw.ellipse([icon_x + 50, icon_y + 12, icon_x + 64, icon_y + 26], fill=(16, 185, 129), outline=(255, 255, 255), width=1)

    # Brand Title Text next to icon
    brand_font = get_font(38, bold=True)
    draw.text((icon_x + icon_size + 18, icon_y + 12), "tâches", font=brand_font, fill=(255, 255, 255))
    draw.text((icon_x + icon_size + 18 + 140, icon_y + 12), ".ma", font=brand_font, fill=(96, 165, 250))

    # Top Right Badge: "🇲🇦 N°1 AU MAROC • PAIEMENT GARANTI"
    badge_font = get_font(15, bold=True)
    badge_w, badge_h = 320, 36
    badge_x, badge_y = W - 70 - badge_w, 75
    draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=18, fill=(30, 41, 59), outline=(51, 65, 85), width=1)
    draw.ellipse([badge_x + 16, badge_y + 13, badge_x + 26, badge_y + 23], fill=(16, 185, 129))
    draw.text((badge_x + 36, badge_y + 9), "🇲🇦 N°1 BOURSE DE SERVICES AU MAROC", font=badge_font, fill=(226, 232, 240))

    # Main Headline
    head_font = get_font(46, bold=True)
    draw.text((70, 165), "Bourse de Micro-Tâches &", font=head_font, fill=(255, 255, 255))
    draw.text((70, 222), "Services Freelance au Maroc", font=head_font, fill=(96, 165, 250))

    # Subtitle / Lead
    sub_font = get_font(21, bold=False)
    sub_text1 = "Déléguez en 1 minute à des milliers de prestataires vérifiés à travers le Maroc."
    sub_text2 = "Paiement 100% sécurisé et garanti sous séquestre Daman."
    draw.text((70, 290), sub_text1, font=sub_font, fill=(148, 163, 184))
    draw.text((70, 320), sub_text2, font=sub_font, fill=(203, 213, 225))

    # 3 Feature Pills / Highlights Box
    card_y = 375
    card_h = 100
    card_w = (W - 140 - 30) // 3

    features = [
        ("🔒 Séquestre Daman", "Fonds bloqués et libérés à validation", (5, 150, 105)),
        ("⚡ Exécution Rapide", "Premières réponses en 5 minutes", (37, 99, 235)),
        ("🇲🇦 Paiement Local", "Virements CIH, Attijari & CMI", (124, 58, 237)),
    ]

    for i, (title, desc, color) in enumerate(features):
        cx = 70 + i * (card_w + 15)
        # card background
        draw.rounded_rectangle([cx, card_y, cx + card_w, card_y + card_h], radius=16, fill=(30, 41, 59), outline=(51, 65, 85), width=1)
        # title
        card_t_font = get_font(18, bold=True)
        draw.text((cx + 20, card_y + 22), title, font=card_t_font, fill=(255, 255, 255))
        # desc
        card_d_font = get_font(14, bold=False)
        draw.text((cx + 20, card_y + 54), desc, font=card_d_font, fill=(148, 163, 184))

    # Category strip at bottom
    cat_y = 510
    cat_h = 60
    draw.rounded_rectangle([70, cat_y, W - 70, cat_y + cat_h], radius=14, fill=(15, 23, 42), outline=(30, 41, 59), width=1)
    
    cat_font = get_font(14, bold=True)
    categories = [
        "⚡ Micro-tâches",
        "📊 Saisie Excel",
        "💻 E-commerce & YouCan",
        "📱 Marketing & Pubs",
        "✍️ Traduction",
        "🎨 Graphisme",
    ]
    spacing = (W - 140) // len(categories)
    for i, cat in enumerate(categories):
        tx = 70 + i * spacing + 15
        draw.text((tx, cat_y + 21), cat, font=cat_font, fill=(203, 213, 225))

    img.save(os.path.join(PUBLIC_DIR, 'og-image.png'), 'PNG')
    img.save(os.path.join(PUBLIC_DIR, 'twitter-image.png'), 'PNG')
    print("OpenGraph and Twitter images generated successfully (1200x630).")

def generate_logo_images():
    # Crisp horizontal logo with text (600x160)
    w, h = 600, 160
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Icon (96x96)
    icon_size = 96
    ix, iy = 30, (h - icon_size) // 2
    draw.rounded_rectangle([ix, iy, ix + icon_size, iy + icon_size], radius=24, fill=(29, 78, 216))
    draw.rounded_rectangle([ix, iy, ix + icon_size, iy + icon_size], radius=24, outline=(59, 130, 246), width=3)
    
    t_font = get_font(60, bold=True)
    draw.text((ix + 28, iy + 10), "T", font=t_font, fill=(255, 255, 255))
    draw.ellipse([ix + 68, iy + 16, ix + 86, iy + 34], fill=(16, 185, 129), outline=(255, 255, 255), width=2)

    # Text "tâches.ma"
    font_main = get_font(52, bold=True)
    draw.text((ix + icon_size + 24, iy + 8), "tâches", font=font_main, fill=(15, 23, 42))
    draw.text((ix + icon_size + 24 + 185, iy + 8), ".ma", font=font_main, fill=(37, 99, 235))

    # Subtitle
    font_sub = get_font(16, bold=True)
    draw.text((ix + icon_size + 26, iy + 64), "SERVICES FREELANCE & SÉQUESTRE AU MAROC", font=font_sub, fill=(100, 116, 139))

    img.save(os.path.join(PUBLIC_DIR, 'logo.png'), 'PNG')
    
    # Also dark version for dark backgrounds
    img_dark = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw_dark = ImageDraw.Draw(img_dark)
    draw_dark.rounded_rectangle([ix, iy, ix + icon_size, iy + icon_size], radius=24, fill=(29, 78, 216))
    draw_dark.rounded_rectangle([ix, iy, ix + icon_size, iy + icon_size], radius=24, outline=(59, 130, 246), width=3)
    draw_dark.text((ix + 28, iy + 10), "T", font=t_font, fill=(255, 255, 255))
    draw_dark.ellipse([ix + 68, iy + 16, ix + 86, iy + 34], fill=(16, 185, 129), outline=(255, 255, 255), width=2)
    draw_dark.text((ix + icon_size + 24, iy + 8), "tâches", font=font_main, fill=(255, 255, 255))
    draw_dark.text((ix + icon_size + 24 + 185, iy + 8), ".ma", font=font_main, fill=(96, 165, 250))
    draw_dark.text((ix + icon_size + 26, iy + 64), "SERVICES FREELANCE & SÉQUESTRE AU MAROC", font=font_sub, fill=(148, 163, 184))
    img_dark.save(os.path.join(PUBLIC_DIR, 'logo-dark.png'), 'PNG')

    print("Logos generated successfully.")

if __name__ == '__main__':
    generate_favicons()
    generate_og_image()
    generate_logo_images()
    print("All SEO visual assets generated.")
