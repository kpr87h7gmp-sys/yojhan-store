from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math
import random

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
SOURCE_LOGO = Path(r"C:\Users\Enmanuel\Documents\WhatsApp Image 2026-08-24 at 1.00.53 PM.jpeg")

RED = (255, 22, 46)
DARK_RED = (90, 0, 14)
WHITE = (245, 245, 245)
MUTED = (180, 180, 184)
BLACK = (5, 5, 7)


def font(size, bold=True):
    candidates = [
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\impact.ttf",
        r"C:\Windows\Fonts\calibrib.ttf",
    ]
    for item in candidates:
        if Path(item).exists():
            return ImageFont.truetype(item, size)
    return ImageFont.load_default()


def cover(img, size):
    img = img.convert("RGB")
    src_ratio = img.width / img.height
    dst_ratio = size[0] / size[1]
    if src_ratio > dst_ratio:
        new_h = size[1]
        new_w = int(new_h * src_ratio)
    else:
        new_w = size[0]
        new_h = int(new_w / src_ratio)
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = (new_w - size[0]) // 2
    top = (new_h - size[1]) // 2
    return resized.crop((left, top, left + size[0], top + size[1]))


def rounded_mask(size, radius):
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def save_logo():
    original = Image.open(SOURCE_LOGO).convert("RGB")
    square = cover(original, (900, 900))
    square.save(ASSETS / "yojhan-logo.png", quality=95)
    small = cover(original, (220, 220))
    small.save(ASSETS / "yojhan-logo-small.png", quality=95)


def glow_line(draw, xy, fill=RED, width=3):
    for extra, alpha in [(10, 35), (6, 60), (2, 130)]:
        color = (fill[0], fill[1], fill[2], alpha)
        draw.line(xy, fill=color, width=width + extra)
    draw.line(xy, fill=fill + (255,), width=width)


def text_center(draw, pos, text, fnt, fill=WHITE, stroke=BLACK, stroke_width=2):
    box = draw.textbbox((0, 0), text, font=fnt, stroke_width=stroke_width)
    x = pos[0] - (box[2] - box[0]) / 2
    y = pos[1] - (box[3] - box[1]) / 2
    draw.text((x, y), text, font=fnt, fill=fill, stroke_fill=stroke, stroke_width=stroke_width)


def product_card(filename, title, badge, subtitle, price_line, initials):
    random.seed(title)
    w, h = 1200, 800
    base = Image.new("RGB", (w, h), BLACK)
    px = base.load()
    for y in range(h):
        for x in range(w):
            d = math.hypot((x - w * 0.46) / w, (y - h * 0.28) / h)
            red_boost = max(0, 1 - d * 2.35)
            pale = max(0, 1 - math.hypot((x - w * 0.3) / w, (y - h * 0.05) / h) * 2.0)
            px[x, y] = (
                min(255, int(4 + red_boost * 50 + pale * 16)),
                min(255, int(4 + red_boost * 6 + pale * 16)),
                min(255, int(6 + red_boost * 10 + pale * 17)),
            )

    img = base.convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")

    for gx in range(-110, w + 110, 78):
        draw.line((gx, 0, gx + 130, h), fill=(255, 255, 255, 15), width=1)
    for gy in range(36, h, 70):
        draw.line((0, gy, w, gy - 75), fill=(255, 255, 255, 11), width=1)

    for i in range(34):
        x = random.randint(16, w - 16)
        y = random.randint(16, h - 16)
        r = random.randint(1, 3)
        draw.ellipse((x-r, y-r, x+r, y+r), fill=(255, 28, 52, random.randint(70, 150)))

    draw.rounded_rectangle((44, 50, w - 44, h - 50), radius=34, outline=(255, 255, 255, 70), width=2, fill=(0, 0, 0, 46))
    draw.rounded_rectangle((82, 92, w - 82, h - 130), radius=34, outline=(255, 255, 255, 48), width=2, fill=(0, 0, 0, 86))
    cx, cy = w // 2, h // 2 + 8
    glow_line(draw, (240, 244, 442, 240), fill=(255, 28, 52), width=4)
    glow_line(draw, (758, 560, 956, 548), fill=(255, 28, 52), width=4)
    draw.line((134, 602, 1044, 602), fill=(255, 255, 255, 62), width=2)

    screen = (cx - 54, 104, cx + 54, 160)
    draw.rounded_rectangle(screen, radius=7, outline=(244, 244, 244, 230), width=9)
    draw.line((cx, 160, cx, 184), fill=(244, 244, 244, 230), width=9)
    draw.rounded_rectangle((cx - 38, 184, cx + 38, 195), radius=5, fill=(244, 244, 244, 230))

    for radius, alpha in [(170, 25), (132, 42), (97, 66)]:
        draw.ellipse((cx-radius, cy-radius, cx+radius, cy+radius), outline=(255, 255, 255, alpha), width=2)
    draw.ellipse((cx-116, cy-116, cx+116, cy+116), fill=(6, 6, 8, 214), outline=(255, 38, 62, 178), width=4)
    draw.ellipse((cx-88, cy-88, cx+88, cy+88), outline=(255, 255, 255, 34), width=2)
    text_center(draw, (cx, cy + 2), initials, font(112), fill=WHITE, stroke=(120, 0, 20), stroke_width=3)
    text_center(draw, (cx, cy + 144), "FREE FIRE", font(34), fill=MUTED, stroke=(0, 0, 0), stroke_width=1)

    for j in range(5):
        offset = j * 18
        draw.line((106 + offset, 662 + j * 3, 1090 - offset, 636 + j * 2), fill=(255, 255, 255, 18 - j * 2), width=1)

    img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=110, threshold=3))
    img.convert("RGB").save(ASSETS / filename, quality=94)


if __name__ == "__main__":
    ASSETS.mkdir(exist_ok=True)
    save_logo()
    product_card("yojhan-product-bypass.png", "BYPASS", "BYPASS", "Acceso premium por dias", "5 USD", "BP")
    product_card("yojhan-product-panel-esp.png", "PANEL ESP", "ESP", "Lineas o hologramas", "5 USD", "ESP")
    product_card("yojhan-product-panel-basico.png", "PANEL BASICO", "BASICO", "Lineas, hologramas y aimbot", "5 USD", "PB")
    product_card("yojhan-product-panel-supreme.png", "PANEL SUPREME", "SUPREME", "Premium con opcion permanente", "5 USD", "PS")
    product_card("yojhan-product-panel-extreme.png", "PANEL EXTREME", "EXTREME", "Descaro total", "12 USD", "PX")
