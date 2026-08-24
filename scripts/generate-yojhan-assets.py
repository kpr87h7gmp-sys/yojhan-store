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
    w, h = 1200, 820
    base = Image.new("RGB", (w, h), BLACK)
    px = base.load()
    for y in range(h):
        for x in range(w):
            d = math.hypot((x - w * 0.55) / w, (y - h * 0.42) / h)
            red_boost = max(0, 1 - d * 2.2)
            px[x, y] = (
                min(255, int(5 + red_boost * 74)),
                min(255, int(5 + red_boost * 8)),
                min(255, int(8 + red_boost * 15)),
            )

    img = base.convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")

    for gx in range(-40, w, 80):
        draw.line((gx, 0, gx + 160, h), fill=(255, 255, 255, 18), width=1)
    for gy in range(40, h, 85):
        draw.line((0, gy, w, gy - 90), fill=(255, 255, 255, 13), width=1)

    for i in range(42):
        x = random.randint(0, w)
        y = random.randint(0, h)
        r = random.randint(1, 4)
        draw.ellipse((x-r, y-r, x+r, y+r), fill=(255, 30, 50, random.randint(80, 180)))

    draw.rounded_rectangle((54, 58, w - 54, h - 58), radius=34, outline=(255, 255, 255, 75), width=2, fill=(0, 0, 0, 50))
    draw.rounded_rectangle((76, 86, w - 76, 372), radius=34, outline=(255, 255, 255, 54), width=2, fill=(0, 0, 0, 80))
    draw.rounded_rectangle((88, 88, 235, 148), radius=28, fill=(10, 10, 12, 230), outline=(255, 255, 255, 50), width=1)
    text_center(draw, (161, 116), badge, font(30), fill=WHITE, stroke=(0, 0, 0), stroke_width=1)

    cx, cy = w // 2, 230
    for radius, alpha in [(155, 28), (126, 44), (96, 70)]:
        draw.ellipse((cx-radius, cy-radius, cx+radius, cy+radius), outline=(255, 255, 255, alpha), width=2)
    draw.ellipse((cx-108, cy-108, cx+108, cy+108), fill=(10, 10, 12, 210), outline=(255, 30, 55, 180), width=3)
    text_center(draw, (cx, cy + 2), initials, font(96), fill=WHITE, stroke=(140, 0, 22), stroke_width=3)

    glow_line(draw, (220, 380, 980, 330), width=3)
    glow_line(draw, (275, 110, 960, 94), width=2)

    draw.text((78, 430), title, font=font(58), fill=WHITE, stroke_fill=BLACK, stroke_width=2)
    draw.text((80, 505), subtitle, font=font(32, False), fill=MUTED)
    draw.rounded_rectangle((78, 615, w - 78, 735), radius=26, fill=(0, 0, 0, 145), outline=(255, 255, 255, 55), width=1)
    draw.text((112, 638), "DESDE", font=font(30), fill=(220, 220, 220))
    draw.text((112, 672), price_line, font=font(46), fill=WHITE, stroke_fill=(120, 0, 20), stroke_width=2)
    draw.text((w - 345, 662), "YOJHAN", font=font(42), fill=(255, 40, 62), stroke_fill=BLACK, stroke_width=2)

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
