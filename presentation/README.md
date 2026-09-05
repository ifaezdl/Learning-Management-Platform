# Mentorito — Defense Presentation

**`Mentorito_Defense.pptx`** — 22-slide, 16:9, Persian (RTL) deck for the B.Sc. software
engineering defense (~20 min talk), built to the approved brief.

## Files

| File | Purpose |
|---|---|
| `Mentorito_Defense.pptx` | The deck (generated output) |
| `generate_defense_pptx.py` | Reproducible generator (python-pptx 1.0.2) |
| `render_check/` | Optional PNG export folder for visual review |

## Regenerate

```bash
cd presentation
python generate_defense_pptx.py
```

The script prints a verification summary (slide count, footer checks, bounds checks)
and exits with `VERIFY OK` when clean.

## Design system (baked into every slide)

- **Palette:** Deep Purple `#4338CA`, Primary `#5B5FEF`, Blue `#3B82F6`, Indigo `#6366F1`,
  Light `#EEF0FF`, Background `#F8F9FF`, Dark `#17172B`, White. No green/yellow.
- **Footer** on all slides except cover (01) and closing (22):
  `Mentorito | [نام دانشگاه] | NN / 22`
- **Fonts:** Persian = `Vazirmatn` (declared in the file; falls back if not installed),
  Latin = `Segoe UI`. To switch to `IRANSansX` or `Yekan Bakh`, change `FA_FONT` at the
  top of the script and regenerate.
- **RTL** is set at paragraph level (`rtl="1"`) with complex-script font binding, so
  PowerPoint lays out Persian correctly.

## Slide map

| # | Slide | Visual style |
|---|---|---|
| 01 | Cover — Mentorito | Hero wordmark, gradient, AI+learning vector, no footer |
| 02 | مسئله و ضرورت | 3 problem cards → Mentorito bar |
| 03 | اهداف | 6 goal cards + final-goal banner |
| 04 | بررسی سامانه‌های موجود | Comparison table (5 systems × 7 criteria) |
| 05 | معرفی Mentorito | 3 roles + 4 system layers + Screenshot P11 |
| 06 | معماری فنی | Frontend / Backend / Data / AI / SSE architecture |
| 07 | چرخه یادگیری | 8-stage cycle around "Learning Intelligence" hub |
| 08 | دید دانشجو | 4 screenshot slots + mini flow |
| 09 | تولید سؤال با AI | 10-step workflow + Screenshots P2, P3 |
| 10 | Context-Aware AI | Context list → prompt → Qwen3-4B diagram |
| 11 | Human-in-the-Loop + SkillTag | Approval flow + SkillTag example + Screenshot P4 |
| 12 | تحلیل مهارتی | Big Screenshot P1 + skill/performance table |
| 13 | داشبورد کلاس | Big Screenshot P5 + instructor items |
| 14 | روند یادگیری | Trend chart + slope rules (±2, <2 exams) |
| 15 | توصیه دوره | Screenshot P8 + weighted-score cards (0.45/0.25/0.20/0.10) |
| 16 | آزمون تمرینی | 8-step workflow + Screenshots P6, P7 |
| 17 | چرخه بسته | Loop diagram + Screenshot P7 |
| 18 | چت بلادرنگ | Big Screenshot P10 + SSE pipeline |
| 19 | دستاوردهای فنی | 7 summary tiles |
| 20 | نتیجه‌گیری | 4 big achievements |
| 21 | Backup — محدودیت‌ها و Future Work | Two-column, labeled Backup |
| 22 | پایان | Minimal closing, no footer |

## Screenshots — capture checklist (priority order)

Place captures in a `presentation/shots/` folder. 1920×1080, bookmarks bar hidden,
real data on screen.

| Priority | Capture | Route |
|---|---|---|
| P1 | Student skill analytics dashboard | `/student/analytics` |
| P2 | AI question generation request (instructor) | instructor exam page |
| P3 | Preview of AI-generated questions | after generation |
| P4 | Instructor review/edit + approve questions | after preview |
| P5 | Instructor class performance dashboard | `/instructor/instructor-analytics` |
| P6 | Practice exam start/selection page | `/student/practice-exams` |
| P7 | Practice exam result page | after a practice exam |
| P8 | Personalized recommendations page | `/student/recommendations` |
| P9 | Student dashboard | `/student/student-dashboard` |
| P10 | Chat page | `/chat` |
| P11 | Landing/home page | `/` |

### Swapping a placeholder for a real screenshot

Each placeholder is a `screenshot_slot(slide, x, y, w, h, caption, priority)` call in the
script. Replace the call with:

```python
# optional frame behind the shot:
card(s, x - 0.06, y - 0.06, w + 0.12, h + 0.12)
s.shapes.add_picture("shots/p1_analytics.png", Inches(x), Inches(y),
                     width=Inches(w), height=Inches(h))
```

Keep `x, y, w, h` identical so the layout grid doesn't shift. Alternatively, drag the
PNG directly over the placeholder in PowerPoint and use *Picture Format → Crop to Fill*.

## Placeholders to fill before the defense

- `[نام دانشگاه]` — footer on every slide + cover chip
- `[نام دانشجو]`, `[نام استاد]`, `[سال تحصیلی]` — cover chips
