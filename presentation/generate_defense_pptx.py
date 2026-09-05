# -*- coding: utf-8 -*-
"""
Mentorito — B.Sc. Software Engineering Defense Deck generator.

Produces: presentation/Mentorito_Defense.pptx  (22 slides, 16:9, Persian RTL)

Run:  python generate_defense_pptx.py

Design system (from the approved brief):
  - Purple/blue identity only: #4338CA #5B5FEF #3B82F6 #6366F1 #EEF0FF #F8F9FF #17172B #FFFFFF
  - Footer on every slide except cover (1) and closing (22): Mentorito | [نام دانشگاه] | NN / 22
  - Persian font: Vazirmatn (falls back gracefully if not installed)
  - Latin technical terms stay Latin: React, NestJS, Prisma, Qwen3-4B, SkillTag, SSE, Fisher-Yates...
  - Screenshot slots are styled placeholders (rounded frame, browser chrome, priority labels);
    drop real PNGs in by replacing screenshot_slot(...) calls with slide.shapes.add_picture(...).
"""

import math
import os
import sys
from lxml import etree

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.oxml.ns import qn

# ----------------------------------------------------------------------------
# Design tokens
# ----------------------------------------------------------------------------
DEEP   = RGBColor(0x43, 0x38, 0xCA)   # Deep Purple
PRIM   = RGBColor(0x5B, 0x5F, 0xEF)   # Primary Purple
BLUE   = RGBColor(0x3B, 0x82, 0xF6)   # Blue
INDIGO = RGBColor(0x63, 0x66, 0xF1)   # Indigo
LIGHT  = RGBColor(0xEE, 0xF0, 0xFF)   # Light Purple
BGCOL  = RGBColor(0xF8, 0xF9, 0xFF)   # Background
DARK   = RGBColor(0x17, 0x17, 0x2B)   # Dark
WHITE  = RGBColor(0xFF, 0xFF, 0xFF)
MUTED  = RGBColor(0x55, 0x58, 0x7A)
FAINT  = RGBColor(0x8A, 0x8F, 0xB8)
LINEC  = RGBColor(0xD8, 0xDA, 0xF5)

FA_FONT = "Vazirmatn"       # Persian face; change to "IRANSansX" / "Yekan Bakh" if preferred
EN_FONT = "Segoe UI"        # Latin face for technical terms

TOTAL = 22
SLIDE_W_IN = 13.333
SLIDE_H_IN = 7.5
FOOTER_Y_IN = 7.06
UNIV_PLACEHOLDER = "[نام دانشگاه]"
_emu_per_in = 914400

# ----------------------------------------------------------------------------
# Low-level XML helpers (RTL, complex-script fonts, shadows)
# ----------------------------------------------------------------------------
def set_rtl_alignment(paragraph, rtl=True, align=None):
    pPr = paragraph._p.get_or_add_pPr()
    pPr.set("rtl", "1" if rtl else "0")
    if align is not None:
        paragraph.alignment = align

def set_run_fonts(run, size=None, bold=None, color=None, fa=FA_FONT, en=EN_FONT,
                  italic=None, spacing=None):
    """Set latin + complex-script fonts, size, color, spacing. Keeps OOXML order valid."""
    f = run.font
    if size is not None:
        f.size = Pt(size)
    if bold is not None:
        f.bold = bold
    if color is not None:
        f.color.rgb = color
    if italic is not None:
        f.italic = italic
    rPr = run._r.get_or_add_rPr()
    if spacing is not None:
        rPr.set("spc", str(int(spacing * 100)))
    rPr.set("lang", "fa-IR")
    for tag, face in ((qn("a:latin"), en), (qn("a:ea"), fa), (qn("a:cs"), fa)):
        el = rPr.find(tag)
        if el is None:
            el = etree.SubElement(rPr, tag)
        el.set("typeface", face)

def _fill_frame(tf, runs_spec, align, rtl, line_spacing, anchor, margins, shrink):
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    ml, mr, mt, mb = margins
    tf.margin_left, tf.margin_right = Inches(ml), Inches(mr)
    tf.margin_top, tf.margin_bottom = Inches(mt), Inches(mb)
    if shrink:
        bodyPr = tf._txBody.find(qn("a:bodyPr"))
        etree.SubElement(bodyPr, qn("a:normAutofit"))
    first = True
    for para_spec in runs_spec:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        set_rtl_alignment(p, rtl=rtl, align=align)
        p.line_spacing = line_spacing
        for rs in para_spec:
            r = p.add_run()
            r.text = rs.get("t", "")
            is_fa = rs.get("font", "fa") == "fa"
            set_run_fonts(r,
                          size=rs.get("size", 14),
                          bold=rs.get("bold", False),
                          color=rs.get("color", DARK),
                          fa=FA_FONT if is_fa else EN_FONT,
                          en=EN_FONT if not is_fa else FA_FONT,
                          spacing=rs.get("spacing"))

def add_text(slide, x, y, w, h, runs_spec, align=PP_ALIGN.RIGHT, rtl=True,
             anchor=MSO_ANCHOR.TOP, line_spacing=1.0, shrink=False):
    """runs_spec: list of paragraphs; each paragraph = list of run dicts
    (use FA(...) / EN(...) helpers)."""
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    _fill_frame(box.text_frame, runs_spec, align, rtl, line_spacing, anchor,
                (0.03, 0.03, 0.01, 0.01), shrink)
    return box

def FA(text, size=14, bold=False, color=DARK, spacing=None):
    return {"t": text, "size": size, "bold": bold, "color": color, "font": "fa", "spacing": spacing}

def EN(text, size=14, bold=False, color=DARK, spacing=None):
    return {"t": text, "size": size, "bold": bold, "color": color, "font": "en", "spacing": spacing}

def solid(shape, color):
    shape.fill.solid()
    shape.fill.fore_color.rgb = color

def no_line(shape):
    shape.line.fill.background()

def soft_shadow(shape, blur=0.10, dist=0.05, alpha=78):
    spPr = shape._element.spPr
    old = spPr.find(qn("a:effectLst"))
    if old is not None:
        spPr.remove(old)
    effectLst = etree.SubElement(spPr, qn("a:effectLst"))
    effect = etree.SubElement(effectLst, qn("a:outerShdw"))
    effect.set("blurRad", str(int(blur * _emu_per_in)))
    effect.set("dist", str(int(dist * _emu_per_in)))
    effect.set("dir", "5400000")
    effect.set("rotWithShape", "0")
    clr = etree.SubElement(effect, qn("a:srgbClr"))
    clr.set("val", "6366F1")
    etree.SubElement(clr, qn("a:alpha")).set("val", str((100 - alpha) * 1000))

def no_shadow(shape):
    spPr = shape._element.spPr
    old = spPr.find(qn("a:effectLst"))
    if old is not None:
        spPr.remove(old)
    spPr.append(etree.fromstring(
        '<a:effectLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"/>'))

def add_shape(slide, shp, x, y, w, h, fill=None, line=None, line_w=1.0, radius=None, shadow=False):
    s = slide.shapes.add_shape(shp, Inches(x), Inches(y), Inches(w), Inches(h))
    if fill is None:
        s.fill.background()
    else:
        solid(s, fill)
    if line is None:
        no_line(s)
    else:
        s.line.color.rgb = line
        s.line.width = Pt(line_w)
    if radius is not None and shp == MSO_SHAPE.ROUNDED_RECTANGLE:
        try:
            s.adjustments[0] = max(0.02, min(0.5, radius / min(w, h)))
        except Exception:
            pass
    if shadow:
        soft_shadow(s)
    else:
        no_shadow(s)
    s.shadow.inherit = False
    return s

def shape_text(shape, runs_spec, align=PP_ALIGN.CENTER, rtl=True, anchor=MSO_ANCHOR.MIDDLE,
               line_spacing=1.0, margins=(0.05, 0.05, 0.01, 0.01), shrink=False):
    _fill_frame(shape.text_frame, runs_spec, align, rtl, line_spacing, anchor, margins, shrink)
    return shape

# ----------------------------------------------------------------------------
# Page furniture
# ----------------------------------------------------------------------------
def add_header(slide, title, subtitle=None):
    add_shape(slide, MSO_SHAPE.RECTANGLE, 0, 0, SLIDE_W_IN, 0.06, fill=DEEP)
    add_shape(slide, MSO_SHAPE.OVAL, 12.55, 0.18, 0.12, 0.12, fill=PRIM)
    add_shape(slide, MSO_SHAPE.OVAL, 12.73, 0.18, 0.12, 0.12, fill=BLUE)
    tw = 11.85
    if subtitle:
        add_text(slide, 0.6, 0.30, tw, 0.55, [[FA(title, 27, True, DARK)]], align=PP_ALIGN.RIGHT)
        add_text(slide, 0.6, 0.56, tw, 0.34, [[FA(subtitle, 12.5, False, INDIGO)]], align=PP_ALIGN.RIGHT)
        add_shape(slide, MSO_SHAPE.ROUNDED_RECTANGLE, 11.71, 0.94, 0.72, 0.055, fill=PRIM, radius=0.03)
    else:
        add_text(slide, 0.6, 0.32, tw, 0.6, [[FA(title, 29, True, DARK)]], align=PP_ALIGN.RIGHT)
        add_shape(slide, MSO_SHAPE.ROUNDED_RECTANGLE, 11.71, 0.98, 0.72, 0.055, fill=PRIM, radius=0.03)

def add_footer(slide, number):
    y = FOOTER_Y_IN
    add_shape(slide, MSO_SHAPE.RECTANGLE, 0, y, SLIDE_W_IN, 0.012, fill=RGBColor(0xE2, 0xE4, 0xFA))
    add_text(slide, 0.55, y + 0.05, 2.2, 0.3, [[EN("Mentorito", 9.5, True, PRIM)]],
             align=PP_ALIGN.LEFT, rtl=False)
    add_text(slide, (SLIDE_W_IN - 4.0) / 2, y + 0.05, 4.0, 0.3,
             [[FA(UNIV_PLACEHOLDER, 9, False, FAINT)]], align=PP_ALIGN.CENTER)
    add_text(slide, SLIDE_W_IN - 2.75, y + 0.05, 2.2, 0.3,
             [[EN(f"{number:02d} / {TOTAL}", 9.5, True, INDIGO)]], align=PP_ALIGN.RIGHT, rtl=False)

def new_slide(prs, number, title=None, subtitle=None, footer=True):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_shape(slide, MSO_SHAPE.RECTANGLE, 0, 0, SLIDE_W_IN, SLIDE_H_IN, fill=BGCOL)
    if title:
        add_header(slide, title, subtitle)
    if footer:
        add_footer(slide, number)
    return slide

# ----------------------------------------------------------------------------
# Reusable components
# ----------------------------------------------------------------------------
def card(slide, x, y, w, h, fill=WHITE, line=RGBColor(0xE4, 0xE6, 0xFB), shadow=True, radius=0.12):
    return add_shape(slide, MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h,
                     fill=fill, line=line, line_w=1.0, radius=radius, shadow=shadow)

def chip(slide, x, y, w, h, text, fill=LIGHT, color=PRIM, size=10.5, bold=True, en=False, line=None):
    c = add_shape(slide, MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h, fill=fill, line=line, radius=h / 2)
    shape_text(c, [[EN(text, size, bold, color) if en else FA(text, size, bold, color)]],
               margins=(0.02, 0.02, 0.01, 0.01))
    return c

def arrow_down(slide, x, y, w=0.34, h=0.26, color=PRIM):
    a = add_shape(slide, MSO_SHAPE.DOWN_ARROW, x, y, w, h, fill=color)
    return a

def arrow_right(slide, x, y, w=0.5, h=0.26, color=PRIM):
    a = add_shape(slide, MSO_SHAPE.RIGHT_ARROW, x, y, w, h, fill=color)
    return a

def arrow_left(slide, x, y, w=0.5, h=0.26, color=PRIM):
    a = add_shape(slide, MSO_SHAPE.LEFT_ARROW, x, y, w, h, fill=color)
    return a

def icon_circle(slide, x, y, d, glyph, fill=DEEP, txt_color=WHITE, size=13):
    c = add_shape(slide, MSO_SHAPE.OVAL, x, y, d, d, fill=fill)
    shape_text(c, [[FA(glyph, size, True, txt_color)]], margins=(0.0, 0.0, 0.0, 0.0))
    return c

def screenshot_slot(slide, x, y, w, h, caption, priority=None):
    """Styled placeholder for a real screenshot: browser-chrome frame + label.
    Replace later: swap this call for slide.shapes.add_picture('shot.png', ...)."""
    card(slide, x, y, w, h, fill=WHITE, line=RGBColor(0xC9, 0xCC, 0xF2), shadow=True, radius=0.10)
    bar = add_shape(slide, MSO_SHAPE.ROUND_2_SAME_RECTANGLE, x, y, w, 0.30,
                    fill=LIGHT, radius=0.10)
    for i, c in enumerate((RGBColor(0xC9, 0xCC, 0xF2), RGBColor(0xA5, 0xA6, 0xF0), PRIM)):
        add_shape(slide, MSO_SHAPE.OVAL, x + 0.12 + i * 0.16, y + 0.09, 0.10, 0.10, fill=c)
    add_text(slide, x + 0.6, y + 0.03, w - 0.75, 0.24,
             [[EN("Mentorito", 8.5, True, INDIGO)]], align=PP_ALIGN.LEFT, rtl=False)
    if h >= 1.4:
        add_text(slide, x + 0.15, y + h / 2 - 0.5, w - 0.3, 0.8,
                 [[FA("جای اسکرین‌شات واقعی", 12.5, True, PRIM)],
                  [FA(caption, 11, False, DARK)]],
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, line_spacing=1.15)
    else:
        add_text(slide, x + 0.15, y + 0.36, w - 0.3, 0.4,
                 [[FA(caption, 10.5, True, PRIM)]], align=PP_ALIGN.CENTER)
    if priority:
        chip(slide, x + w - 1.22, y + h - 0.38, 1.06, 0.26,
             f"Priority {priority}", fill=DEEP, color=WHITE, size=8.5, en=True)
    return None

def pill_step(slide, x, y, w, h, runs, fill=WHITE, line=LINEC, align=PP_ALIGN.CENTER):
    s = add_shape(slide, MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h, fill=fill, line=line, radius=h / 2)
    shape_text(s, runs, align=align, margins=(0.06, 0.06, 0.01, 0.01))
    return s

def bottom_banner(slide, x, y, w, h, runs, fill=DEEP):
    b = add_shape(slide, MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h, fill=fill, shadow=True, radius=0.12)
    shape_text(b, runs, line_spacing=1.15)
    return b

def set_gradient_bg(slide):
    bgfill = slide.background.fill
    bgfill.gradient()
    try:
        stops = bgfill.gradient_stops
        stops[0].color.rgb = RGBColor(0x1E, 0x1B, 0x4B)
        stops[0].position = 0.0
        stops[1].color.rgb = DEEP
        stops[1].position = 1.0
        bgfill.gradient_angle = 40.0
    except Exception:
        pass

def connect(slide, kind, x1, y1, x2, y2, color, width=1.25):
    ln = slide.shapes.add_connector(kind, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    ln.line.color.rgb = color
    ln.line.width = Pt(width)
    no_shadow(ln)
    return ln

# ----------------------------------------------------------------------------
# Presentation
# ----------------------------------------------------------------------------
prs = Presentation()
prs.slide_width = Inches(SLIDE_W_IN)
prs.slide_height = Inches(SLIDE_H_IN)

# ============================== SLIDE 01 — Cover ==============================
s = new_slide(prs, 1, footer=False)
set_gradient_bg(s)
# abstract AI + learning decor (flat vector)
add_shape(s, MSO_SHAPE.OVAL, 10.9, -1.2, 4.2, 4.2, fill=None, line=INDIGO, line_w=1.2)
add_shape(s, MSO_SHAPE.OVAL, 11.5, -0.6, 3.0, 3.0, fill=None, line=PRIM, line_w=1.0)
add_shape(s, MSO_SHAPE.OVAL, -1.6, 4.9, 3.6, 3.6, fill=None, line=BLUE, line_w=1.2)
for cx, cy, r, c in [(10.55, 4.62, 0.16, PRIM), (11.55, 5.45, 0.12, BLUE), (12.45, 4.15, 0.10, INDIGO),
                     (9.7, 5.6, 0.09, LIGHT), (12.9, 5.15, 0.13, BLUE)]:
    add_shape(s, MSO_SHAPE.OVAL, cx, cy, r * 2, r * 2, fill=c)
for x1, y1, x2, y2 in [(10.71, 4.78, 11.67, 5.57), (11.67, 5.57, 12.55, 4.25),
                       (10.71, 4.78, 12.99, 5.28), (12.55, 4.25, 12.99, 5.28)]:
    connect(s, MSO_CONNECTOR.STRAIGHT, x1, y1, x2, y2, INDIGO, 1.0)
# academic glyph + brand row
add_shape(s, MSO_SHAPE.OVAL, 0.9, 0.72, 1.05, 1.05, fill=LIGHT)
add_shape(s, MSO_SHAPE.FLOWCHART_MULTIDOCUMENT, 1.08, 0.95, 0.7, 0.58, fill=PRIM)
add_text(s, 2.1, 0.95, 5.0, 0.5, [[EN("MENTORITO LMS", 12, True, RGBColor(0xC7, 0xC9, 0xF8), spacing=3.2)]],
         align=PP_ALIGN.LEFT, rtl=False)
# hero wordmark
add_text(s, 0.9, 2.35, 11.5, 1.5, [[EN("Mentorito", 88, True, WHITE)]],
         align=PP_ALIGN.LEFT, rtl=False)
add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, 0.95, 3.92, 1.35, 0.075, fill=BLUE, radius=0.037)
# subtitle + strapline
add_text(s, 0.9, 4.15, 11.6, 0.85,
         [[FA("سامانه مدیریت یادگیری هوشمند با تحلیل مهارتی و قابلیت‌های مبتنی بر هوش مصنوعی", 19, True,
              RGBColor(0xDD, 0xDE, 0xFC))]], align=PP_ALIGN.LEFT)
add_text(s, 0.9, 4.95, 11.6, 0.4,
         [[EN("AI-Powered Question Generation  •  Skill-Level Analytics  •  Personalized Learning Path",
              12.5, False, RGBColor(0xA9, 0xAE, 0xEF), spacing=0.6)]], align=PP_ALIGN.LEFT, rtl=False)
# info chips
labels = ["پروژه کارشناسی مهندسی نرم‌افزار", "دانشجو: [نام دانشجو]", "استاد راهنما: [نام استاد]",
          "[نام دانشگاه]", "[سال تحصیلی]"]
widths = [2.6, 2.05, 2.2, 1.7, 1.35]
x = 0.9
for lab, wd in zip(labels, widths):
    c = add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, x, 5.75, wd, 0.46,
                  fill=RGBColor(0x2A, 0x27, 0x6B), line=INDIGO, line_w=0.75, radius=0.23)
    shape_text(c, [[FA(lab, 10.5, False, RGBColor(0xE4, 0xE5, 0xFB))]], margins=(0.04, 0.04, 0.01, 0.01))
    x += wd + 0.18

# ============================== SLIDE 02 — Problem ============================
s = new_slide(prs, 2, "مسئله و ضرورت پروژه", "چرا این پروژه؟")
probs = [
    ("۰۱", "تولید سؤال", "تولید تعداد زیادی سؤال استاندارد برای مدرس زمان‌بر است.", DEEP),
    ("۰۲", "تحلیل سطح مهارت", "نمره کلی آزمون مشخص نمی‌کند دانشجو دقیقاً در کدام مهارت ضعف دارد.", PRIM),
    ("۰۳", "نبود ارتباط تحلیل با آموزش بعدی", "نتیجه ارزیابی باید بتواند به تصمیم آموزشی بعدی منجر شود.", BLUE),
]
cw, gap = 3.55, 0.35
x0 = (SLIDE_W_IN - (3 * cw + 2 * gap)) / 2
for i, (num, t, b, c) in enumerate(probs):
    x = x0 + i * (cw + gap)
    card(s, x, 1.55, cw, 2.55)
    add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, x, 1.55, cw, 0.14, fill=c, radius=0.07)
    add_text(s, x + 0.25, 1.86, 1.2, 0.55, [[EN(num.replace("۰", "0").replace("۱", "1").replace("۲", "2"),
             22, True, c)]], align=PP_ALIGN.LEFT, rtl=False)
    add_text(s, x + 0.2, 2.05, cw - 0.4, 0.9, [[FA(t, 15, True, DARK)]],
             align=PP_ALIGN.RIGHT, line_spacing=1.05)
    add_text(s, x + 0.2, 3.0, cw - 0.4, 1.0, [[FA(b, 12, False, MUTED)]],
             align=PP_ALIGN.RIGHT, line_spacing=1.2)
for i in range(3):
    cx = x0 + i * (cw + gap) + cw / 2
    arrow_down(s, cx - 0.11, 4.28, 0.22, 0.4, INDIGO)
bar_w = 3 * cw + 2 * gap
bottom_banner(s, x0, 4.85, bar_w, 0.62,
              [[FA("Mentorito — ", 14, True, WHITE),
                FA("اتصال ارزیابی، تحلیل مهارتی و شخصی‌سازی یادگیری", 14, True, WHITE)]])
qb = add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, x0, 5.75, bar_w, 0.85, fill=LIGHT, line=INDIGO,
               line_w=1.0, radius=0.12)
shape_text(qb, [[FA("مسئله اصلی: ", 14.5, True, DEEP),
                 FA("چگونه می‌توان ارزیابی، تحلیل مهارتی و شخصی‌سازی یادگیری را در یک سامانه واحد به هم متصل کرد؟",
                    14.5, True, DARK)]], line_spacing=1.2)

# ============================== SLIDE 03 — Objectives =========================
s = new_slide(prs, 3, "اهداف Mentorito", "شش هدف اصلی سامانه")
goals = [
    ("مدیریت یکپارچه دوره و محتوای آموزشی", "Course & Content Management", DEEP),
    ("برگزاری آزمون و ارزیابی دانشجو", "Question Bank + Exam Engine", PRIM),
    ("تولید سؤال با کمک هوش مصنوعی", "AI Question Generation", BLUE),
    ("تحلیل عملکرد در سطح SkillTag", "Skill-Level Analytics", DEEP),
    ("توصیه آموزشی مبتنی بر وضعیت یادگیرنده", "Recommendation Engine", PRIM),
    ("ارائه آزمون‌های تمرینی هدفمند", "Targeted Practice Exams", BLUE),
]
gw, gh, ggap = 3.85, 1.9, 0.35
x0 = (SLIDE_W_IN - (3 * gw + 2 * ggap)) / 2
for i, (t, sub, c) in enumerate(goals):
    r, cc = divmod(i, 3)
    x = x0 + cc * (gw + ggap)
    y = 1.55 + r * (gh + ggap)
    card(s, x, y, gw, gh)
    add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, x + gw - 0.2, y + 0.25, 0.09, gh - 0.5, fill=c, radius=0.045)
    add_text(s, x + 0.22, y + 0.18, 0.9, 0.6, [[EN(f"0{i+1}", 20, True, RGBColor(0xD6, 0xD8, 0xF8))]],
             align=PP_ALIGN.LEFT, rtl=False)
    add_text(s, x + 0.24, y + 0.78, gw - 0.55, 0.75, [[FA(t, 13.5, True, DARK)]],
             align=PP_ALIGN.RIGHT, line_spacing=1.1)
    add_text(s, x + 0.24, y + 1.5, gw - 0.55, 0.32, [[EN(sub, 10, False, INDIGO)]],
             align=PP_ALIGN.RIGHT, rtl=False)
bottom_banner(s, x0, 5.85, 3 * gw + 2 * ggap, 0.7,
              [[FA("هدف نهایی: ", 14.5, True, WHITE),
                FA("تبدیل داده‌های آموزشی به تصمیم‌های قابل استفاده برای یادگیری", 14.5, True, WHITE)]])

# ============================== SLIDE 04 — Comparison =========================
s = new_slide(prs, 4, "بررسی سامانه‌های موجود و شکاف عملکردی", "تحلیل تطبیقی")
cols = ["معیار", "Moodle", "Google Classroom", "Coursera", "edX", "LMS فارسی", "Mentorito"]
rows = [
    ("مدیریت دوره", "✓", "✓", "✓", "✓", "✓", "✓"),
    ("آزمون", "✓", "✓", "✗", "✓", "✓", "✓"),
    ("تولید سؤال با AI", "✗", "✗", "✗", "✗", "✗", "✓"),
    ("Skill-Level Analysis", "✗", "✗", "✗", "✗", "✗", "✓"),
    ("Skill Gap Detection", "✗", "✗", "✗", "✗", "✗", "✓"),
    ("Recommendation", "✗", "✗", "✗", "✗", "✗", "✓"),
    ("Real-Time Chat", "✓", "✓", "✗", "✗", "✗", "✓"),
]
tx, ty = 0.55, 1.45
tw, th = SLIDE_W_IN - 1.1, 4.55
tbl = s.shapes.add_table(len(rows) + 1, len(cols), Inches(tx), Inches(ty), Inches(tw), Inches(th)).table
tbl.columns[0].width = Inches(2.9)
for ci in range(1, len(cols) - 1):
    tbl.columns[ci].width = Inches((tw - 4.9) / (len(cols) - 2))
tbl.columns[len(cols) - 1].width = Inches(2.0)
tbl.rows[0].height = Inches(0.52)
for ri in range(1, len(rows) + 1):
    tbl.rows[ri].height = Inches((th - 0.52) / len(rows))
for ci, cname in enumerate(cols):
    cell = tbl.cell(0, ci)
    cell.fill.solid()
    cell.fill.fore_color.rgb = DEEP if ci == 0 else (PRIM if ci == len(cols) - 1 else RGBColor(0x2A, 0x27, 0x6B))
    cell.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = cell.text_frame.paragraphs[0]
    set_rtl_alignment(p, rtl=(ci == 0), align=PP_ALIGN.CENTER)
    r = p.add_run()
    r.text = cname
    set_run_fonts(r, size=10.5, bold=True, color=WHITE,
                  fa=FA_FONT if ci == 0 else EN_FONT, en=EN_FONT)
for ri, row in enumerate(rows, start=1):
    band = WHITE if ri % 2 else RGBColor(0xF2, 0xF3, 0xFC)
    for ci, val in enumerate(row):
        cell = tbl.cell(ri, ci)
        cell.fill.solid()
        cell.fill.fore_color.rgb = LIGHT if ci == len(cols) - 1 else band
        cell.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = cell.text_frame.paragraphs[0]
        set_rtl_alignment(p, rtl=(ci == 0), align=PP_ALIGN.CENTER)
        r = p.add_run()
        r.text = val
        if ci == 0:
            set_run_fonts(r, size=11.5, bold=True, color=DARK, fa=FA_FONT, en=FA_FONT)
        elif val == "✓":
            set_run_fonts(r, size=12.5, bold=True, color=INDIGO, fa=EN_FONT, en=EN_FONT)
        elif val == "✗":
            set_run_fonts(r, size=12.5, bold=True, color=RGBColor(0xB4, 0xB6, 0xD8), fa=EN_FONT, en=EN_FONT)
        else:
            set_run_fonts(r, size=12, bold=True, color=PRIM, fa=EN_FONT, en=EN_FONT)
concl = add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, tx, ty + th + 0.18, tw, 0.78,
                  fill=LIGHT, line=INDIGO, line_w=1.0, radius=0.12)
shape_text(concl, [[FA("تفاوت Mentorito در قابلیت‌های پایه LMS نیست؛ بلکه در ", 13.5, True, DARK),
                    EN("اتصال قابلیت‌های هوشمند به یک چرخه آموزشی یکپارچه", 13.5, True, DEEP),
                    FA(" است.", 13.5, True, DARK)]], line_spacing=1.15)

# ============================== SLIDE 05 — What is Mentorito ==================
s = new_slide(prs, 5, "معرفی سیستم پیشنهادی Mentorito", "سه نقش، چهار لایه")
roles = [("دانشجو", "یادگیری • آزمون • تحلیل • توصیه • تمرین", DEEP),
         ("مدرس", "ایجاد دوره • آزمون • تولید سؤال • تحلیل کلاس", PRIM),
         ("مدیر", "مدیریت کاربران، نقش‌ها و نظارت سامانه", BLUE)]
rx, rw = 9.05, 3.73
for i, (t, b, c) in enumerate(roles):
    y = 1.5 + i * 1.13
    card(s, rx, y, rw, 1.0)
    add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, rx + rw - 0.16, y + 0.16, 0.08, 0.68, fill=c, radius=0.04)
    add_text(s, rx + 0.2, y + 0.14, rw - 0.45, 0.4, [[FA(t, 14.5, True, DARK)]], align=PP_ALIGN.RIGHT)
    add_text(s, rx + 0.2, y + 0.53, rw - 0.45, 0.42, [[FA(b, 10, False, MUTED)]],
             align=PP_ALIGN.RIGHT, line_spacing=1.1)
lx, lw = 5.15, 3.6
layers = [("Frontend", "React 19 • TypeScript • MUI", DEEP),
          ("Backend", "NestJS • REST API • JWT", PRIM),
          ("Database", "Prisma • SQL Server", INDIGO),
          ("AI Service", "Qwen3-4B • OpenAI-Compatible", BLUE)]
add_text(s, lx, 1.42, lw, 0.35, [[EN("System Layers", 12.5, True, INDIGO)]],
         align=PP_ALIGN.CENTER, rtl=False)
for i, (t, b, c) in enumerate(layers):
    y = 1.82 + i * 1.0
    lb = add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, lx, y, lw, 0.74, fill=WHITE, line=c, line_w=1.25,
                   shadow=True, radius=0.1)
    shape_text(lb, [[EN(t, 13, True, c)], [FA(b, 9.5, False, MUTED)]], line_spacing=1.0)
    if i < 3:
        arrow_down(s, lx + lw / 2 - 0.09, y + 0.76, 0.18, 0.2, c)
screenshot_slot(s, 0.55, 1.5, 4.3, 3.45, "صفحه اصلی (Home) سامانه Mentorito", priority=11)
add_text(s, 0.55, 5.08, 4.3, 0.4, [[FA("محصول واقعی پیاده‌سازی‌شده — نه نمونه مفهومی", 11.5, True, PRIM)]],
         align=PP_ALIGN.CENTER)
bottom_banner(s, 0.55, 5.72, 12.23, 0.78,
              [[FA("سه نقش کاربری، چهار لایه فنی — یک سامانه یکپارچه", 15, True, WHITE)]])

# ============================== SLIDE 06 — Architecture =======================
s = new_slide(prs, 6, "معماری فنی Mentorito", "بر پایه پیاده‌سازی واقعی")
# Frontend panel (right)
fx, fy, fw, fh = 8.6, 1.5, 4.18, 3.05
card(s, fx, fy, fw, fh)
add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, fx, fy, fw, 0.5, fill=DEEP, radius=0.12)
add_text(s, fx + 0.2, fy + 0.08, fw - 0.4, 0.38, [[EN("Frontend", 15, True, WHITE)]],
         align=PP_ALIGN.RIGHT, rtl=False)
for i, t in enumerate(["React 19", "TypeScript", "MUI", "React Router", "React Query", "Axios", "Vite"]):
    r, c = divmod(i, 2)
    chip(s, fx + 0.28 + c * 1.95, fy + 0.72 + r * 0.48, 1.8, 0.4, t, fill=LIGHT, color=DEEP, en=True, size=11)
add_text(s, fx + 0.2, fy + 2.62, fw - 0.4, 0.35, [[FA("SPA — تعامل کامل کاربر", 10, False, MUTED)]],
         align=PP_ALIGN.RIGHT)
arrow_left(s, fx - 0.48, fy + 1.3, 0.4, 0.3, PRIM)
# Backend panel (middle)
bx, by, bw, bh = 4.15, 1.5, 3.9, 3.05
card(s, bx, by, bw, bh)
add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, bx, by, bw, 0.5, fill=PRIM, radius=0.12)
add_text(s, bx + 0.2, by + 0.08, bw - 0.4, 0.38, [[EN("Backend", 15, True, WHITE)]],
         align=PP_ALIGN.RIGHT, rtl=False)
for i, t in enumerate(["NestJS", "TypeScript", "REST API", "JWT", "Refresh Token", "SSE"]):
    r, c = divmod(i, 2)
    chip(s, bx + 0.25 + c * 1.78, by + 0.72 + r * 0.48, 1.68, 0.4, t, fill=LIGHT, color=PRIM, en=True, size=10.5)
add_text(s, bx + 0.2, by + 2.62, bw - 0.4, 0.35, [[FA("لایه منطق، امنیت و هماهنگی", 10, False, MUTED)]],
         align=PP_ALIGN.RIGHT)
arrow_left(s, 3.68, by + 1.3, 0.4, 0.3, INDIGO)
# Data layer (bottom-left)
dx, dy, dw = 0.55, 4.85, 4.05
card(s, dx, dy, dw, 1.75)
add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, dx, dy, dw, 0.46, fill=INDIGO, radius=0.12)
add_text(s, dx + 0.2, dy + 0.06, dw - 0.4, 0.36, [[EN("Data Layer", 14, True, WHITE)]],
         align=PP_ALIGN.RIGHT, rtl=False)
chip(s, dx + 0.25, dy + 0.68, 1.55, 0.44, "Prisma ORM", fill=LIGHT, color=INDIGO, en=True, size=10.5)
chip(s, dx + 1.95, dy + 0.68, 1.85, 0.44, "SQL Server", fill=LIGHT, color=INDIGO, en=True, size=10.5)
add_text(s, dx + 0.2, dy + 1.26, dw - 0.4, 0.4, [[FA("ذخیره‌سازی و پرس‌وجوی داده‌های آموزشی", 10, False, MUTED)]],
         align=PP_ALIGN.RIGHT)
arrow_down(s, bx + bw / 2 - 0.11, 4.58, 0.22, 0.24, INDIGO)
# AI service (bottom-right)
ax, ay, aw = 9.0, 4.85, 3.78
card(s, ax, ay, aw, 1.75)
add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, ax, ay, aw, 0.46, fill=BLUE, radius=0.12)
add_text(s, ax + 0.2, ay + 0.06, aw - 0.4, 0.36, [[EN("AI Service", 14, True, WHITE)]],
         align=PP_ALIGN.RIGHT, rtl=False)
chip(s, ax + 0.25, ay + 0.68, 1.6, 0.44, "Qwen3-4B", fill=LIGHT, color=BLUE, en=True, size=10.5)
chip(s, ax + 2.0, ay + 0.68, 1.55, 0.44, "OpenAI API", fill=LIGHT, color=BLUE, en=True, size=10)
add_text(s, ax + 0.2, ay + 1.26, aw - 0.4, 0.4, [[FA("تولید سؤال مبتنی بر Context دوره", 10, False, MUTED)]],
         align=PP_ALIGN.RIGHT)
connect(s, MSO_CONNECTOR.ELBOW, bx + bw, by + 0.9, ax + aw / 2, ay, BLUE, 1.5)
# Real-time lane (left)
card(s, 0.55, 1.5, 3.0, 3.05, fill=WHITE, line=INDIGO)
add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, 0.55, 1.5, 3.0, 0.5, fill=INDIGO, radius=0.12)
add_text(s, 0.75, 1.58, 2.6, 0.38, [[EN("Real-Time", 14, True, WHITE)]], align=PP_ALIGN.CENTER, rtl=False)
add_text(s, 0.7, 2.2, 2.7, 1.9,
         [[EN("SSE", 30, True, INDIGO)], [FA("Server-Sent Events", 10.5, False, DARK)],
          [FA("ارتباط بلادرنگ", 10.5, False, MUTED)], [FA("چت و رویدادهای زنده", 10.5, False, MUTED)]],
         align=PP_ALIGN.CENTER, line_spacing=1.3)
connect(s, MSO_CONNECTOR.STRAIGHT, 3.55, 3.0, 4.15, 3.0, INDIGO, 1.5)

# ============================== SLIDE 07 — Learning Cycle =====================
s = new_slide(prs, 7, "چرخه یادگیری در Mentorito", "ارتباط قابلیت‌ها در یک چرخه واحد")
steps = ["مشاهده محتوا", "شرکت در آزمون", "ثبت پاسخ‌ها", "تحلیل SkillTag",
         "تشخیص مهارت‌های ضعیف", "توصیه دوره", "آزمون تمرینی", "یادگیری مجدد"]
cx, cy = SLIDE_W_IN / 2, 3.85
R, YS = 3.45, 0.70
nw, nh = 1.95, 0.62
positions = []
for i in range(8):
    ang = math.radians(-90 + i * 45)
    px = cx + R * math.cos(ang) - nw / 2
    py = cy + R * math.sin(ang) * YS - nh / 2
    positions.append((px, py))
# spokes first (under nodes)
for (px, py) in positions:
    connect(s, MSO_CONNECTOR.STRAIGHT, cx, cy, px + nw / 2, py + nh / 2, RGBColor(0xC9, 0xCC, 0xF2), 1.0)
# chevrons on the ring
for i in range(8):
    ang = -90 + (i + 0.5) * 45
    rad = math.radians(ang)
    px = cx + (R + 0.35) * math.cos(rad) - 0.12
    py = cy + (R + 0.35) * math.sin(rad) * YS - 0.11
    ch = add_shape(s, MSO_SHAPE.CHEVRON, px, py, 0.24, 0.22, fill=PRIM)
    ch.rotation = (ang + 90) % 360
# node pills
for i, t in enumerate(steps):
    px, py = positions[i]
    pill_step(s, px, py, nw, nh, [[FA(t, 10.5, True, DARK)]],
              fill=WHITE, line=[DEEP, PRIM, INDIGO, BLUE][i % 4])
# hub on top
hub_d = 2.35
hub = add_shape(s, MSO_SHAPE.OVAL, cx - hub_d / 2, cy - hub_d / 2, hub_d, hub_d, fill=DEEP, shadow=True)
shape_text(hub, [[EN("Mentorito", 17, True, WHITE)], [EN("Learning Intelligence", 13, True,
              RGBColor(0xC7, 0xC9, 0xF8))]], line_spacing=1.1)
bottom_banner(s, 1.2, 6.62, 10.93, 0.5,
              [[FA("ارزیابی ← تحلیل ← تشخیص ← توصیه ← تمرین ← یادگیری دوباره؛ بدون خروج از سامانه",
                   12.5, True, DEEP)]], fill=LIGHT)

# ============================== SLIDE 08 — Student journey ====================
s = new_slide(prs, 8, "فرایند یادگیری از دید دانشجو", "پیاده‌سازی واقعی — نه نمونه اولیه")
caps = ["Dashboard دانشجو", "فهرست دوره‌ها", "جزئیات دوره", "اجرای آزمون"]
pri = [9, None, None, 5]
sw8 = (12.23 - 3 * 0.34) / 4
for i in range(4):
    x = 0.55 + i * (sw8 + 0.34)
    screenshot_slot(s, x, 1.5, sw8, 2.15, caps[i], priority=pri[i])
    if i < 3:
        arrow_right(s, x + sw8 + 0.09, 2.47, 0.16, 0.2, INDIGO)
flow = ["انتخاب دوره", "یادگیری", "آزمون", "نتیجه"]
fw8 = 1.72
x = SLIDE_W_IN - 0.55 - fw8
for i, t in enumerate(flow):
    pill_step(s, x, 4.05, fw8, 0.5, [[FA(t, 12, True, WHITE if i == 3 else DARK)]],
              fill=DEEP if i == 3 else WHITE, line=DEEP if i == 3 else PRIM)
    if i < 3:
        arrow_left(s, x - 0.42, 4.17, 0.34, 0.26, PRIM)
    x -= (fw8 + 0.5)
card(s, 0.55, 4.85, 6.0, 1.9)
add_text(s, 0.8, 5.02, 5.5, 1.6,
         [[FA("چه کسی؟ ", 11.5, True, DEEP), FA("دانشجو — از یادگیری تا آزمون", 11.5, False, DARK)],
          [FA("سیستم چه می‌کند؟ ", 11.5, True, DEEP), FA("مدیریت دوره، اجرای آزمون، ثبت پاسخ", 11.5, False, DARK)],
          [FA("خروجی؟ ", 11.5, True, DEEP), FA("پاسخ‌های ساخت‌یافته برای تحلیل SkillTag", 11.5, False, DARK)]],
         align=PP_ALIGN.RIGHT, line_spacing=1.45)
card(s, 6.78, 4.85, 6.0, 1.9, fill=LIGHT, line=INDIGO)
add_text(s, 7.0, 5.02, 5.6, 1.6,
         [[FA("این بخش در Mentorito به‌صورت واقعی پیاده‌سازی شده است:", 12, True, DARK)],
          [EN("React 19 SPA  •  REST API  •  JWT Session", 11, True, INDIGO)],
          [FA("داده‌های پاسخ، ورودی چرخه تحلیل مهارتی است (اسلایدهای بعد)", 11, False, MUTED)]],
         align=PP_ALIGN.RIGHT, line_spacing=1.45)

# ============================== SLIDE 09 — AI Question Generation =============
s = new_slide(prs, 9, "تولید سؤال آزمون با هوش مصنوعی", "قابلیت کلیدی شماره ۱")
screenshot_slot(s, 9.0, 1.5, 3.78, 2.3, "درخواست تولید سؤال توسط مدرس", priority=2)
screenshot_slot(s, 9.0, 3.95, 3.78, 2.3, "Preview سؤال‌های تولیدشده", priority=3)
add_text(s, 9.0, 6.34, 3.78, 0.4, [[FA("مدرس: درخواست ← سیستم: پیشنهاد", 11, True, PRIM)]],
         align=PP_ALIGN.CENTER)
wf = ["انتخاب آزمون", "Request Generation", "استخراج ساختار دوره", "ساخت Prompt", "Qwen3-4B",
      "JSON Response", "Validation", "Preview", "تأیید مدرس", "Question Bank"]
col_w, col_h = 3.95, 0.56
for i, t in enumerate(wf):
    r, c = divmod(i, 2)
    x = 0.55 + c * (col_w + 0.35)
    y = 1.5 + r * (col_h + 0.22)
    hi_blue = (i == 4)
    hi_deep = (i == 8)
    fill = BLUE if hi_blue else (DEEP if hi_deep else WHITE)
    txt_c = WHITE if (hi_blue or hi_deep) else DARK
    num_c = WHITE if (hi_blue or hi_deep) else PRIM
    pill_step(s, x, y, col_w, col_h,
              [[FA(f"{i+1}. ", 11.5, True, num_c), FA(t, 11.5, True, txt_c)]],
              fill=fill, line=INDIGO if (hi_blue or hi_deep) else LINEC)
    if c == 0:
        arrow_right(s, x + col_w + 0.06, y + col_h / 2 - 0.1, 0.24, 0.2, PRIM)
card(s, 0.55, 5.35, 8.25, 1.4, fill=LIGHT, line=INDIGO)
add_text(s, 0.8, 5.5, 7.75, 1.15,
         [[FA("چه کسی؟ ", 11.5, True, DEEP), FA("مدرس درخواست تولید سؤال می‌دهد", 11.5, False, DARK)],
          [FA("سیستم: ", 11.5, True, DEEP), FA("استخراج Context ← ساخت Prompt ← ", 11.5, False, DARK),
           EN("Qwen3-4B", 11.5, True, DARK), FA(" ← اعتبارسنجی JSON", 11.5, False, DARK)],
          [FA("خروجی: ", 11.5, True, DEEP), FA("پیش‌نمایش سؤال‌ها برای بررسی و تأیید مدرس", 11.5, False, DARK)]],
         align=PP_ALIGN.RIGHT, line_spacing=1.4)

# ============================== SLIDE 10 — Context-Aware AI ===================
s = new_slide(prs, 10, "تولید سؤال مبتنی بر محتوای واقعی دوره", "Context-Aware Generation")
cx0, cw0 = 8.35, 4.43
card(s, cx0, 1.5, cw0, 4.35)
add_text(s, cx0 + 0.2, 1.62, cw0 - 0.4, 0.4, [[EN("Learning Context", 14, True, DEEP)]],
         align=PP_ALIGN.CENTER, rtl=False)
for i, t in enumerate(["Course Title", "Section Titles", "Lesson Titles", "Learning Outcomes",
                       "Prerequisites", "Course Description", "Difficulty", "Category"]):
    y = 2.12 + i * 0.45
    add_shape(s, MSO_SHAPE.OVAL, cx0 + cw0 - 0.42, y + 0.1, 0.12, 0.12,
              fill=[DEEP, PRIM, INDIGO, BLUE][i % 4])
    add_text(s, cx0 + 0.3, y, cw0 - 0.85, 0.36, [[EN(t, 12, False, DARK)]],
             align=PP_ALIGN.RIGHT, rtl=False)
boxes = [("Course Structure", DEEP), ("Learning Context", PRIM), ("Prompt", INDIGO),
         ("Qwen3-4B", BLUE), ("Structured Questions", DEEP)]
bw0, bh0 = 3.3, 0.62
bx0 = 0.55 + (7.4 - bw0) / 2
for i, (t, c) in enumerate(boxes):
    y = 1.55 + i * 0.92
    b = add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, bx0, y, bw0, bh0, fill=c, shadow=True, radius=0.1)
    shape_text(b, [[EN(t, 13.5, True, WHITE)]])
    if i < 4:
        arrow_down(s, bx0 + bw0 / 2 - 0.1, y + bh0 + 0.04, 0.2, 0.22, c)
add_text(s, 0.6, 1.7, 1.9, 0.6, [[FA("از دیتابیس دوره", 10.5, True, INDIGO)]], align=PP_ALIGN.LEFT)
add_text(s, 0.6, 3.55, 1.9, 0.6, [[FA("مهندسی Prompt", 10.5, True, INDIGO)]], align=PP_ALIGN.LEFT)
add_text(s, 6.05, 5.3, 1.85, 0.7, [[FA("سؤال ساخت‌یافته + SkillTag", 10.5, True, INDIGO)]],
         align=PP_ALIGN.RIGHT, line_spacing=1.1)
screenshot_slot(s, bx0 + bw0 / 2 - 1.4, 5.95, 2.8, 1.05, "Preview سؤال‌ها", priority=3)
key = add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, cx0, 6.1, cw0, 0.85, fill=DEEP, shadow=True, radius=0.12)
shape_text(key, [[FA("هدف: ", 12.5, True, WHITE),
                  FA("تولید سؤال مرتبط با همان دوره، نه سؤال عمومی و مستقل از محتوا", 12.5, True, WHITE)]],
           line_spacing=1.15)

# ============================== SLIDE 11 — HITL + SkillTag ====================
s = new_slide(prs, 11, "کنترل مدرس و برچسب مهارتی سؤال", "Human-in-the-Loop + SkillTag")
card(s, 0.55, 1.45, 12.23, 2.3)
add_text(s, 0.8, 1.58, 11.7, 0.4, [[EN("Human in the Loop", 14, True, DEEP)]],
         align=PP_ALIGN.RIGHT, rtl=False)
hitl = ["AI پیشنهاد می‌دهد", "مدرس بررسی می‌کند", "مدرس اصلاح / تأیید می‌کند", "سؤال وارد بانک سؤال می‌شود"]
hw = 2.62
x = 12.78 - hw
for i, t in enumerate(hitl):
    hi = (i == 3)
    pill_step(s, x, 2.12, hw, 0.72, [[FA(t, 11.5, True, WHITE if hi else DARK)]],
              fill=DEEP if hi else WHITE, line=DEEP if hi else LINEC)
    if i < 3:
        arrow_left(s, x - 0.44, 2.35, 0.36, 0.26, PRIM)
    x -= (hw + 0.55)
add_text(s, 0.8, 3.06, 11.7, 0.45,
         [[FA("تأکید: ", 12.5, True, PRIM), FA("هوش مصنوعی جایگزین تصمیم تخصصی مدرس نیست.", 12.5, True, DARK)]],
         align=PP_ALIGN.RIGHT)
card(s, 0.55, 3.95, 6.0, 2.75)
add_text(s, 0.8, 4.08, 5.5, 0.4, [[EN("SkillTag", 14, True, DEEP), FA(" — برچسب مهارتی سؤال", 14, True, DARK)]],
         align=PP_ALIGN.RIGHT)
st1 = add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, 1.0, 4.62, 2.4, 0.6, fill=LIGHT, line=INDIGO,
                line_w=1.0, radius=0.1)
shape_text(st1, [[EN("Normalization", 12.5, True, DEEP)]])
arrow_left(s, 3.5, 4.79, 0.4, 0.26, PRIM)
st2 = add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, 4.0, 4.62, 2.3, 0.6, fill=DEEP, radius=0.1)
shape_text(st2, [[FA("نرمال‌سازی جداول", 11.5, True, WHITE)]])
add_text(s, 0.8, 5.44, 5.5, 1.15,
         [[FA("هر سؤال یک برچسب مهارتی ۲ تا ۴ کلمه‌ای دارد.", 11.5, False, DARK)],
          [FA("این برچسب بعداً مبنای تحلیل عملکرد دانشجو است.", 11.5, False, DARK)],
          [FA("مدرس پس از Preview می‌تواند سؤال‌ها را ویرایش کند.", 11, False, MUTED)]],
         align=PP_ALIGN.RIGHT, line_spacing=1.35)
screenshot_slot(s, 6.78, 3.95, 6.0, 2.75, "صفحه تأیید و ویرایش سؤال توسط مدرس", priority=4)

# ============================== SLIDE 12 — Skill analytics ====================
s = new_slide(prs, 12, "تحلیل عملکرد دانشجو در سطح مهارت", "فراتر از نمره کلی — Skill-Level Analytics")
screenshot_slot(s, 0.55, 1.5, 7.0, 5.2, "داشبورد تحلیل مهارتی دانشجو — نمودار راداری و Weak Skills",
                priority=1)
rx0 = 7.85
rw0 = SLIDE_W_IN - rx0 - 0.55
pipe = ["۱. پاسخ‌ها", "۲. گروه‌بندی بر اساس SkillTag", "۳. محاسبه درصد تسلط", "۴. مرتب‌سازی مهارت‌ها"]
for i, t in enumerate(pipe):
    r, c = divmod(i, 2)
    x = rx0 + c * (rw0 / 2 + 0.06)
    y = 1.5 + r * 0.64
    pill_step(s, x, y, rw0 / 2 - 0.06, 0.54, [[FA(t, 10, True, DARK)]],
              fill=WHITE if i % 2 == 0 else LIGHT, line=PRIM)
add_text(s, rx0, 2.85, rw0, 0.35, [[FA("نمونه خروجی تحلیل:", 12, True, DEEP)]], align=PP_ALIGN.RIGHT)
skills = [("SQL", "85%", "مطلوب", False), ("ERD", "75%", "مطلوب", False),
          ("Normalization", "44%", "ضعیف", True), ("Transaction", "32%", "ضعیف", True)]
tbl2 = s.shapes.add_table(5, 3, Inches(rx0), Inches(3.28), Inches(rw0), Inches(1.85)).table
tbl2.columns[0].width = Inches(2.0)
tbl2.columns[1].width = Inches(1.33)
tbl2.columns[2].width = Inches(rw0 - 3.33)
for ci, hname in enumerate(["Skill", "Performance", "وضعیت"]):
    cell = tbl2.cell(0, ci)
    cell.fill.solid()
    cell.fill.fore_color.rgb = DEEP
    cell.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = cell.text_frame.paragraphs[0]
    set_rtl_alignment(p, rtl=(ci == 2), align=PP_ALIGN.CENTER)
    r = p.add_run()
    r.text = hname
    set_run_fonts(r, size=10.5, bold=True, color=WHITE, fa=FA_FONT if ci == 2 else EN_FONT, en=EN_FONT)
for ri, (sk, pc, st_, weak) in enumerate(skills, start=1):
    for ci, v in enumerate([sk, pc, st_]):
        cell = tbl2.cell(ri, ci)
        cell.fill.solid()
        cell.fill.fore_color.rgb = LIGHT if weak else WHITE
        cell.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = cell.text_frame.paragraphs[0]
        set_rtl_alignment(p, rtl=(ci == 2), align=PP_ALIGN.CENTER)
        r = p.add_run()
        r.text = v
        col = DEEP if weak else (INDIGO if ci == 0 else DARK)
        set_run_fonts(r, size=10.5, bold=(ci == 2 or weak),
                      color=col, fa=FA_FONT if ci == 2 else EN_FONT, en=EN_FONT)
note = add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, rx0, 5.35, rw0, 0.8, fill=LIGHT, line=INDIGO,
                 line_w=1.0, radius=0.12)
shape_text(note, [[FA("دو دانشجو با نمره یکسان الزاماً وضعیت مهارتی یکسانی ندارند.", 12, True, DEEP)]],
           line_spacing=1.15)
add_text(s, rx0, 6.3, rw0, 0.6,
         [[FA("در داشبورد Mentorito، ", 11, False, DARK), EN("Radar Chart", 11, True, INDIGO),
           FA(" و نمایش Weak Skills برای همین هدف استفاده شده است.", 11, False, DARK)]],
         align=PP_ALIGN.RIGHT, line_spacing=1.25)

# ============================== SLIDE 13 — Class analytics ====================
s = new_slide(prs, 13, "تحلیل عملکرد کلاس از دید مدرس", "Instructor Analytics Dashboard")
screenshot_slot(s, 0.55, 1.5, 7.6, 5.2, "داشبورد تحلیل عملکرد کلاس — دید مدرس", priority=5)
rx0 = 8.35
rw0 = SLIDE_W_IN - rx0 - 0.55
items = [("عملکرد دانشجویان", "عملکرد هر دانشجو در آزمون‌ها و مهارت‌ها"),
         ("میانگین عملکرد", "میانگین کلاس به‌صورت لحظه‌ای و تجمیعی"),
         ("وضعیت مهارت‌ها", "نمای تجمیعی SkillTag در سطح کلاس"),
         ("نقاط ضعف کلاس", "شناسایی مهارت‌های ضعیف برای اقدام آموزشی")]
for i, (t, b) in enumerate(items):
    y = 1.5 + i * 1.12
    card(s, rx0, y, rw0, 0.98)
    add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, rx0 + rw0 - 0.16, y + 0.15, 0.08, 0.68,
              fill=[DEEP, PRIM, INDIGO, BLUE][i], radius=0.04)
    add_text(s, rx0 + 0.2, y + 0.1, rw0 - 0.5, 0.4, [[FA(t, 13, True, DARK)]], align=PP_ALIGN.RIGHT)
    add_text(s, rx0 + 0.2, y + 0.48, rw0 - 0.5, 0.45, [[FA(b, 10.5, False, MUTED)]],
             align=PP_ALIGN.RIGHT, line_spacing=1.1)
bottom_banner(s, rx0, 6.12, rw0, 0.85,
              [[FA("تحلیل فقط برای دانشجو نیست؛ مدرس نیز وضعیت یادگیری کلاس را می‌بیند.", 11.5, True, WHITE)]])

# ============================== SLIDE 14 — Learning trend ====================
s = new_slide(prs, 14, "تشخیص روند یادگیری", "Learning Trend — Linear Regression")
chx, chy, chw, chh = 0.55, 1.5, 7.3, 4.6
card(s, chx, chy, chw, chh)
ax_x, ax_y = chx + 0.55, chy + chh - 0.65
ax_w, ax_h = chw - 1.6, chh - 1.15
connect(s, MSO_CONNECTOR.STRAIGHT, ax_x, ax_y, ax_x + ax_w, ax_y, RGBColor(0xB9, 0xBC, 0xE0), 1.5)
connect(s, MSO_CONNECTOR.STRAIGHT, ax_x, ax_y, ax_x, ax_y - ax_h, RGBColor(0xB9, 0xBC, 0xE0), 1.5)
add_text(s, ax_x + ax_w - 2.2, ax_y + 0.12, 2.2, 0.3, [[FA("آزمون‌های متوالی", 10, True, MUTED)]],
         align=PP_ALIGN.CENTER)
add_text(s, ax_x - 0.45, ax_y - ax_h - 0.05, 1.4, 0.3, [[FA("نمره", 10, True, MUTED)]],
         align=PP_ALIGN.LEFT)
band = add_shape(s, MSO_SHAPE.RECTANGLE, ax_x + 0.2, ax_y - 2.1, 2.8, 0.45, fill=LIGHT)
def trend_line(x1, y1, x2, y2, color, label):
    connect(s, MSO_CONNECTOR.STRAIGHT, x1, y1, x2, y2, color, 3.0)
    add_text(s, x2 + 0.08, y2 - 0.15, 1.15, 0.3, [[FA(label, 10.5, True, color)]], align=PP_ALIGN.LEFT)
trend_line(ax_x + 0.2, ax_y - 0.7, ax_x + 3.0, ax_y - 2.7, DEEP, "صعودی")
trend_line(ax_x + 0.2, ax_y - 1.85, ax_x + 3.0, ax_y - 2.0, PRIM, "پایدار")
trend_line(ax_x + 0.2, ax_y - 3.1, ax_x + 3.0, ax_y - 1.2, BLUE, "نزولی")
add_text(s, ax_x + 0.2, ax_y + 0.35, 2.9, 0.3, [[FA("نمونه نمرات آزمون", 9, False, FAINT)]],
         align=PP_ALIGN.CENTER)
mx = 8.15
mw = SLIDE_W_IN - mx - 0.55
card(s, mx, 1.5, mw, 1.15)
add_text(s, mx + 0.2, 1.63, mw - 0.4, 0.9,
         [[EN("Linear Regression", 14, True, DEEP)],
          [FA("روش: Least Squares بر نمرات آزمون‌های متوالی", 11, False, DARK)]],
         align=PP_ALIGN.RIGHT, line_spacing=1.3)
rules = [("Slope > +2", "صعودی — بهبود عملکرد", DEEP),
         ("-2 ≤ Slope ≤ +2", "پایدار — تغییر معنادار مشاهده نمی‌شود", PRIM),
         ("Slope < -2", "نزولی — کاهش عملکرد", BLUE)]
for i, (rule, t, c) in enumerate(rules):
    y = 2.85 + i * 0.98
    card(s, mx, y, mw, 0.85)
    add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, mx + mw - 0.14, y + 0.12, 0.07, 0.6, fill=c, radius=0.035)
    add_text(s, mx + 0.2, y + 0.08, mw - 0.45, 0.4, [[EN(rule, 12.5, True, c)]],
             align=PP_ALIGN.RIGHT, rtl=False)
    add_text(s, mx + 0.2, y + 0.46, mw - 0.45, 0.34, [[FA(t, 10.5, False, DARK)]], align=PP_ALIGN.RIGHT)
warn = add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, mx, 5.85, mw, 0.62, fill=LIGHT, line=INDIGO,
                 line_w=0.75, radius=0.1)
shape_text(warn, [[FA("کمتر از ۲ آزمون ← داده کافی نیست", 11.5, True, DEEP)]])

# ============================== SLIDE 15 — Recommendation =====================
s = new_slide(prs, 15, "توصیه دوره بر اساس شکاف مهارتی", "Recommendation Engine")
screenshot_slot(s, 0.55, 1.5, 6.1, 4.0, "صفحه پیشنهادهای شخصی‌سازی‌شده", priority=8)
add_text(s, 0.55, 5.65, 6.1, 0.5, [[FA("پیشنهادها مستقیماً از تحلیل مهارتی دانشجو ساخته می‌شوند", 11.5, True, PRIM)]],
         align=PP_ALIGN.CENTER)
wf15 = ["Skill Analysis", "Weak Skills", "Candidate Courses", "Weighted Scoring", "Recommended Courses"]
for i, t in enumerate(wf15):
    y = 1.5 + i * 0.66
    hi = (i == 4)
    pill_step(s, 7.3, y, 5.48, 0.5, [[EN(t, 11.5, True, WHITE if hi else DARK)]],
              fill=DEEP if hi else WHITE, line=DEEP if hi else LINEC)
    if i < 4:
        arrow_down(s, 7.3 + 5.48 / 2 - 0.09, y + 0.52, 0.18, 0.13, PRIM)
add_text(s, 6.9, 4.88, 5.88, 0.35, [[EN("Recommendation Score =", 13, True, DEEP)]],
         align=PP_ALIGN.RIGHT, rtl=False)
wts = [("0.45", "Skill Gap Match", DEEP), ("0.25", "Level Progression", PRIM),
       ("0.20", "Category Affinity", INDIGO), ("0.10", "Course Quality", BLUE)]
for i, (w_, t, c) in enumerate(wts):
    x = 6.9 + i * 1.5
    card(s, x, 5.28, 1.4, 1.2, fill=WHITE, line=c)
    add_text(s, x, 5.36, 1.4, 0.5, [[EN(w_, 16, True, c)]], align=PP_ALIGN.CENTER, rtl=False)
    add_text(s, x + 0.04, 5.86, 1.32, 0.58, [[EN(t, 8.5, True, DARK)]], align=PP_ALIGN.CENTER, rtl=False,
             line_spacing=1.0)
ops = add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, 6.9, 6.6, 5.88, 0.4, fill=LIGHT, radius=0.08)
shape_text(ops, [[EN("Score = 0.45×SkillGap + 0.25×Level + 0.20×Category + 0.10×Quality", 9.5, True, DEEP)]])

# ============================== SLIDE 16 — Practice exams =====================
s = new_slide(prs, 16, "آزمون تمرینی هدفمند بر اساس مهارت ضعیف", "یکی از نوآوری‌های اصلی Mentorito")
badge = add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, 0.55, 0.62, 2.15, 0.4, fill=DEEP, radius=0.2)
shape_text(badge, [[EN("KEY INNOVATION", 9.5, True, WHITE, spacing=1.2)]])
steps16 = ["Weak Skill", "انتخاب دوره و SkillTag", "Filter Questions", "بررسی حداقل ۱۰ سؤال",
           "Fisher-Yates Shuffle", "انتخاب ۱۰ سؤال", "Practice Exam", "Result"]
col_x = {0: 5.4, 1: 0.9}   # right column first (RTL reading), then left column
for i, t in enumerate(steps16):
    col = 0 if i < 4 else 1
    row = i % 4
    x = col_x[col]
    y = 1.6 + row * 0.9
    hi = (i == 7)
    pill_step(s, x, y, 3.4, 0.56,
              [[FA(f"{i+1}. ", 11, True, WHITE if hi else PRIM), FA(t, 11, True, WHITE if hi else DARK)]],
              fill=DEEP if hi else WHITE, line=DEEP if hi else LINEC)
    if row < 3:
        arrow_down(s, x + 3.4 / 2 - 0.09, y + 0.6, 0.18, 0.26, PRIM)
screenshot_slot(s, 9.05, 1.6, 3.73, 2.25, "انتخاب / شروع آزمون تمرینی", priority=6)
screenshot_slot(s, 9.05, 4.0, 3.73, 2.25, "نتیجه آزمون تمرینی", priority=7)
bottom_banner(s, 0.55, 5.5, 8.25, 0.95,
              [[FA("تمرین دقیقاً برای همان مهارتی ایجاد می‌شود که دانشجو در آن ضعف دارد.", 14, True, WHITE)]])
add_text(s, 0.55, 6.58, 8.25, 0.35,
         [[EN("Fisher-Yates", 10.5, True, INDIGO),
           FA(" — بُر زدن تصادفی و بدون سوگیری پیش از انتخاب ۱۰ سؤال", 10.5, False, MUTED)]],
         align=PP_ALIGN.RIGHT)

# ============================== SLIDE 17 — Closed loop ========================
s = new_slide(prs, 17, "از تحلیل تا بهبود؛ یک چرخه بسته", "Practice Exam فقط یک Quiz معمولی نیست")
loop = ["آزمون اصلی", "Skill Analysis", "Weak Skill", "Practice Exam", "New Result", "Updated Status"]
lw17 = 1.72
x = SLIDE_W_IN - 0.55 - lw17
xs17 = []
for i, t in enumerate(loop):
    hi = i in (3, 4)
    pill_step(s, x, 2.0, lw17, 0.72, [[FA(t, 10.5, True, WHITE if hi else DARK)]],
              fill=DEEP if hi else WHITE, line=DEEP if hi else LINEC)
    xs17.append(x)
    if i < 5:
        arrow_left(s, x - 0.36, 2.24, 0.3, 0.26, PRIM)
    x -= (lw17 + 0.36)
# return path: from last (left-most) pill bottom back to first (right-most) pill bottom
lx17 = xs17[-1] + lw17 / 2
rx17 = xs17[0] + lw17 / 2
connect(s, MSO_CONNECTOR.STRAIGHT, lx17, 2.72, lx17, 3.0, INDIGO, 1.25)
connect(s, MSO_CONNECTOR.STRAIGHT, lx17, 3.0, rx17, 3.0, INDIGO, 1.25)
connect(s, MSO_CONNECTOR.STRAIGHT, rx17, 3.0, rx17, 2.76, INDIGO, 1.25)
arrow_up = add_shape(s, MSO_SHAPE.UP_ARROW, rx17 - 0.1, 2.74, 0.2, 0.22, fill=INDIGO)
add_text(s, 4.6, 2.74, 4.2, 0.26, [[FA("نتایج جدید دوباره وارد تحلیل می‌شوند", 9.5, True, INDIGO)]],
         align=PP_ALIGN.CENTER)
screenshot_slot(s, 4.35, 3.3, 4.6, 2.6, "نتیجه آزمون تمرینی — Updated Status", priority=7)
card(s, 0.55, 3.3, 3.5, 2.6, fill=LIGHT, line=INDIGO)
add_text(s, 0.75, 3.5, 3.1, 2.2,
         [[FA("چه کسی؟ ", 11.5, True, DEEP), FA("دانشجو پس از تحلیل", 11.5, False, DARK)],
          [FA("چه کاری؟ ", 11.5, True, DEEP), FA("تمرین هدفمند روی Weak Skill", 11.5, False, DARK)],
          [FA("خروجی؟ ", 11.5, True, DEEP), FA("نتیجه جدید و به‌روزرسانی وضعیت یادگیری", 11.5, False, DARK)]],
         align=PP_ALIGN.RIGHT, line_spacing=1.5)
card(s, 9.15, 3.3, 3.63, 2.6)
add_text(s, 9.35, 3.5, 3.23, 2.2,
         [[FA("داده‌های ارزیابی دوباره وارد چرخه یادگیری می‌شوند:", 11.5, True, DARK)],
          [EN("Result → Analytics → Next Action", 11, True, INDIGO)],
          [FA("ارزش اصلی: تبدیل نمره به «اقدام بعدی»", 11, False, MUTED)]],
         align=PP_ALIGN.RIGHT, line_spacing=1.5)
bottom_banner(s, 0.55, 6.15, 12.23, 0.68,
              [[FA("ارزیابی ← تحلیل ← اقدام ← ارزیابی دوباره؛ یک حلقه بسته یادگیری", 13.5, True, WHITE)]])

# ============================== SLIDE 18 — Real-time chat =====================
s = new_slide(prs, 18, "تعامل و چت بلادرنگ", "Real-Time Communication")
screenshot_slot(s, 0.55, 1.5, 7.9, 5.2, "صفحه چت Mentorito — گفت‌وگوی بلادرنگ", priority=10)
px0 = 8.75
pw0 = SLIDE_W_IN - px0 - 0.55
pipe = [("React Client", DEEP), ("Backend", PRIM), ("SSE", INDIGO), ("Real-Time Events", BLUE)]
for i, (t, c) in enumerate(pipe):
    y = 1.5 + i * 1.06
    b = add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, px0, y, pw0, 0.68, fill=c, shadow=True, radius=0.1)
    shape_text(b, [[EN(t, 13, True, WHITE)]])
    if i < 3:
        arrow_down(s, px0 + pw0 / 2 - 0.09, y + 0.7, 0.18, 0.24, c)
note = add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, px0, 5.85, pw0, 0.85, fill=LIGHT, line=INDIGO,
                 line_w=1.0, radius=0.12)
shape_text(note, [[FA("ارتباط بلادرنگ با ", 11.5, True, DARK), EN("Server-Sent Events", 11.5, True, DEEP),
                   FA(" و مدیریت اتصال‌های فعال درون Backend پیاده‌سازی شده است.", 11.5, True, DARK)]],
           line_spacing=1.2)

# ============================== SLIDE 19 — Technical summary ==================
s = new_slide(prs, 19, "مهم‌ترین دستاوردهای پیاده‌سازی", "Technical Summary")
tiles = [
    ("Backend", "NestJS + TypeScript + Prisma", DEEP),
    ("Frontend", "React 19 + TypeScript + MUI", PRIM),
    ("Database", "Microsoft SQL Server", INDIGO),
    ("Security", "JWT + Refresh Token + Role-Based Access", BLUE),
    ("AI", "Qwen3-4B", DEEP),
    ("Real-Time", "SSE", PRIM),
    ("Intelligent Learning", "SkillTag + Analytics + Recommendation + Practice Exams", INDIGO),
]
tw19, th19 = 2.95, 1.85
for i, (t, b, c) in enumerate(tiles):
    if i < 4:
        x = 0.39 + i * 3.2
        y = 1.5
    else:
        x = 1.99 + (i - 4) * 3.2
        y = 3.55
    card(s, x, y, tw19, th19)
    add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, x, y, tw19, 0.14, fill=c, radius=0.07)
    icon_circle(s, x + 0.2, y + 0.3, 0.48, "▪", fill=LIGHT, txt_color=c, size=12)
    add_text(s, x + 0.78, y + 0.32, tw19 - 0.98, 0.45, [[EN(t, 13, True, c)]],
             align=PP_ALIGN.RIGHT, rtl=False)
    add_text(s, x + 0.2, y + 0.85, tw19 - 0.4, 0.9, [[EN(b, 10, False, DARK)]],
             align=PP_ALIGN.RIGHT, rtl=False, line_spacing=1.15)
bottom_banner(s, 1.99, 5.75, 9.35, 0.62,
              [[FA("Mentorito قابلیت‌های فنی و هوشمند را در یک معماری یکپارچه پیاده‌سازی کرده است.",
                   13.5, True, WHITE)]])

# ============================== SLIDE 20 — Conclusion =========================
s = new_slide(prs, 20, "نتیجه‌گیری", "چهار دستاورد اصلی")
ach = [
    ("01", "LMS یکپارچه", "مدیریت دوره، محتوا، آزمون و کاربران", DEEP),
    ("02", "AI Question Generation", "کاهش بار تولید سؤال برای مدرس", PRIM),
    ("03", "Skill-Level Analytics", "تحلیل عملکرد فراتر از نمره کلی", INDIGO),
    ("04", "Personalized Learning", "توصیه دوره + آزمون تمرینی هدفمند", BLUE),
]
aw, ah = 5.9, 1.9
positions = [(SLIDE_W_IN - 0.55 - aw, 1.6), (0.55, 1.6),
             (SLIDE_W_IN - 0.55 - aw, 3.7), (0.55, 3.7)]
for (num, t, b, c), (x, y) in zip(ach, positions):
    card(s, x, y, aw, ah)
    add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, x + aw - 0.14, y, 0.14, ah, fill=c, radius=0.07)
    add_text(s, x + 0.3, y + 0.22, 1.4, 0.7, [[EN(num, 30, True, RGBColor(0xD6, 0xD8, 0xF8))]],
             align=PP_ALIGN.LEFT, rtl=False)
    add_text(s, x + 0.3, y + 0.3, aw - 0.6, 0.55, [[FA(t, 17, True, DARK)]], align=PP_ALIGN.RIGHT)
    add_text(s, x + 0.3, y + 0.98, aw - 0.6, 0.8, [[FA(b, 12, False, MUTED)]],
             align=PP_ALIGN.RIGHT, line_spacing=1.2)
bottom_banner(s, 1.2, 5.95, 10.93, 0.95,
              [[FA("Mentorito ارزیابی را به تحلیل و سپس به اقدام آموزشی تبدیل می‌کند.", 17, True, WHITE)]])

# ============================== SLIDE 21 — Backup: limits & future ============
s = new_slide(prs, 21, "محدودیت‌ها و مسیر توسعه", "Backup — در صورت وجود زمان نمایش داده شود")
lx0 = 6.9
lw21 = SLIDE_W_IN - lx0 - 0.55
card(s, lx0, 1.55, lw21, 4.9)
add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, lx0, 1.55, lw21, 0.52, fill=PRIM, radius=0.12)
add_text(s, lx0 + 0.2, 1.63, lw21 - 0.4, 0.4, [[FA("محدودیت‌های نسخه فعلی", 14, True, WHITE)]],
         align=PP_ALIGN.RIGHT)
lims = [
    "کیفیت سؤال AI وابسته به مدل، Prompt و بررسی انسانی است.",
    "چت بلادرنگ فعلی برای زیرساخت توزیع‌شده چندسروری نیازمند لایه هماهنگ‌کننده مشترک است.",
    "الگوریتم توصیه فعلی مبتنی بر امتیازدهی شفاف و وزن‌دار است.",
]
yy = 2.32
for t in lims:
    add_shape(s, MSO_SHAPE.OVAL, lx0 + lw21 - 0.42, yy + 0.09, 0.14, 0.14, fill=PRIM)
    add_text(s, lx0 + 0.25, yy, lw21 - 0.85, 0.95, [[FA(t, 12, False, DARK)]],
             align=PP_ALIGN.RIGHT, line_spacing=1.25)
    yy += 1.05
add_text(s, lx0 + 0.25, 5.62, lw21 - 0.5, 0.7,
         [[FA("این محدودیت‌ها شفاف مستند شده‌اند و مسیر بهبود مشخصی دارند.", 11, True, PRIM)]],
         align=PP_ALIGN.RIGHT, line_spacing=1.2)
fx21 = 0.55
card(s, fx21, 1.55, lw21, 4.9, fill=LIGHT, line=INDIGO)
add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, fx21, 1.55, lw21, 0.52, fill=DEEP, radius=0.12)
add_text(s, fx21 + 0.2, 1.63, lw21 - 0.4, 0.4,
         [[EN("Future Work", 14, True, WHITE), FA(" — توسعه آینده", 14, True, WHITE)]],
         align=PP_ALIGN.RIGHT)
futs = ["استفاده از مدل‌های زبانی بزرگ‌تر", "بهبود الگوریتم Recommendation",
        "توسعه تحلیل‌های یادگیری", "توسعه قابلیت‌های شخصی‌سازی"]
yy = 2.35
for t in futs:
    pill = add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, fx21 + 0.3, yy, lw21 - 0.6, 0.62,
                     fill=WHITE, line=INDIGO, line_w=0.75, radius=0.1)
    shape_text(pill, [[FA(t, 12, True, DARK)]], align=PP_ALIGN.CENTER)
    yy += 0.82
add_text(s, fx21 + 0.3, 5.72, lw21 - 0.6, 0.55,
         [[FA("واضحاً جدا از قابلیت‌های فعلی — Future Work", 10.5, True, DEEP)]], align=PP_ALIGN.RIGHT)
add_text(s, 0.55, 6.62, 12.23, 0.35,
         [[FA("اسلاید Backup — در صورت کمبود زمان، ارائه با اسلاید نتیجه‌گیری پایان می‌یابد.",
              10, False, FAINT)]], align=PP_ALIGN.CENTER)

# ============================== SLIDE 22 — Closing ============================
s = new_slide(prs, 22, footer=False)
set_gradient_bg(s)
add_shape(s, MSO_SHAPE.OVAL, 11.2, -1.4, 4.4, 4.4, fill=None, line=INDIGO, line_w=1.2)
add_shape(s, MSO_SHAPE.OVAL, -1.8, 5.0, 4.0, 4.0, fill=None, line=BLUE, line_w=1.2)
for cx2, cy2, r2, c2 in [(10.4, 5.5, 0.12, PRIM), (11.6, 4.7, 0.09, BLUE), (12.3, 5.9, 0.14, INDIGO)]:
    add_shape(s, MSO_SHAPE.OVAL, cx2, cy2, r2 * 2, r2 * 2, fill=c2)
add_text(s, 0.9, 2.0, 11.53, 1.0, [[FA("ممنون از توجه شما", 48, True, WHITE)]], align=PP_ALIGN.CENTER)
add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, SLIDE_W_IN / 2 - 0.7, 3.2, 1.4, 0.07, fill=BLUE, radius=0.035)
add_text(s, 0.9, 3.45, 11.53, 0.9, [[EN("Mentorito", 40, True, RGBColor(0xC7, 0xC9, 0xF8))]],
         align=PP_ALIGN.CENTER, rtl=False)
qa = add_shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, SLIDE_W_IN / 2 - 1.35, 4.7, 2.7, 0.72,
               fill=None, line=RGBColor(0x9B, 0x9F, 0xEC), line_w=1.25, radius=0.36)
shape_text(qa, [[FA("پرسش و پاسخ", 16, True, WHITE)]])
add_text(s, 0.9, 6.6, 11.53, 0.4,
         [[EN("AI-Powered Learning  •  Skill Analytics  •  Personalized Growth",
              10.5, False, RGBColor(0x8F, 0x93, 0xD8), spacing=1.2)]], align=PP_ALIGN.CENTER, rtl=False)

# ----------------------------------------------------------------------------
# Save + self-verification
# ----------------------------------------------------------------------------
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Mentorito_Defense.pptx")
prs.save(OUT)

chk = Presentation(OUT)
n = len(chk.slides)
issues = []
if n != TOTAL:
    issues.append(f"slide count {n} != {TOTAL}")

def all_text(slide):
    parts = []
    for sh in slide.shapes:
        if sh.has_text_frame:
            parts.append(sh.text_frame.text)
        if sh.has_table:
            for row in sh.table.rows:
                for cell in row.cells:
                    parts.append(cell.text)
    return " ".join(parts)

for idx, sl in enumerate(chk.slides, start=1):
    blob = all_text(sl)
    if idx in (1, TOTAL):
        if f"{idx:02d} / {TOTAL}" in blob:
            issues.append(f"slide {idx}: footer unexpectedly present")
    else:
        if f"{idx:02d} / {TOTAL}" not in blob:
            issues.append(f"slide {idx}: footer number missing")
        if "Mentorito" not in blob:
            issues.append(f"slide {idx}: footer brand missing")

# bounds check for text-bearing shapes only (decor shapes intentionally bleed off-canvas)
for idx, sl in enumerate(chk.slides, start=1):
    for sh in sl.shapes:
        try:
            has_txt = sh.has_text_frame and sh.text_frame.text.strip()
        except Exception:
            has_txt = False
        if not has_txt:
            continue
        r = (sh.left + sh.width) / _emu_per_in
        b = (sh.top + sh.height) / _emu_per_in
        if r > SLIDE_W_IN + 0.05 or b > SLIDE_H_IN + 0.05 or sh.left < -9525 or sh.top < -9525:
            issues.append(f"slide {idx}: text shape out of bounds (r={r:.2f}, b={b:.2f}) '{sh.text_frame.text[:30]}'")

print("=" * 64)
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass
if issues:
    print(f"VERIFY: {len(issues)} issue(s):")
    for i in issues:
        print("  -", i)
else:
    print(f"VERIFY OK: {n} slides; footers correct; text shapes in bounds.")
print(f"Saved: {OUT}")
print("=" * 64)

print("""
SCREENSHOT CAPTURE CHECKLIST (priority order from the brief):
  P1  Student skill analytics dashboard        (/student/analytics)
  P2  AI question generation request           (instructor)
  P3  Preview of AI-generated questions
  P4  Instructor review/edit + approve questions
  P5  Instructor class performance dashboard   (/instructor/instructor-analytics)
  P6  Practice exam start/selection page       (/student/practice-exams)
  P7  Practice exam result page
  P8  Personalized recommendations page        (/student/recommendations)
  P9  Student dashboard                        (/student/student-dashboard)
  P10 Chat page                                 (/chat)
  P11 Landing/home page                        (/)

TIP: capture at 1920x1080 with the bookmarks bar hidden. Then replace the
screenshot_slot(...) call for that slide with:
    slide.shapes.add_picture("shots/p1_analytics.png", Inches(x), Inches(y),
                             width=Inches(w), height=Inches(h))
and add a thin rounded-rectangle frame behind it if desired.
""")
