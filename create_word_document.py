#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

# Create a new Document
doc = Document()

# Add title
title = doc.add_paragraph()
title_run = title.add_run('نمودار فعالیت UML')
title_run.font.size = Pt(18)
title_run.font.bold = True
title_run.font.name = 'B Titr'
title.alignment = WD_ALIGN_PARAGRAPH.CENTER

# Add subtitle
subtitle = doc.add_paragraph()
subtitle_run = subtitle.add_run('تولید و تأیید سؤال آزمون مبتنی بر هوش مصنوعی')
subtitle_run.font.size = Pt(14)
subtitle_run.font.name = 'B Titr'
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER

# Add some spacing
doc.add_paragraph()

# Add description
desc = doc.add_paragraph()
desc_run = desc.add_run('شکل ۳-۳: نمودار فعالیت تولید و تأیید سؤال آزمون مبتنی بر هوش مصنوعی در سامانه Mentorito')
desc_run.font.size = Pt(11)
desc_run.font.name = 'B Titr'
desc_run.italic = True
desc.alignment = WD_ALIGN_PARAGRAPH.CENTER

doc.add_paragraph()

# Add SVG as embedded image
try:
    # First, let's add the SVG file as a description
    info = doc.add_paragraph()
    info_run = info.add_run('محتوای نمودار:')
    info_run.font.bold = True
    info_run.font.name = 'B Titr'
    
    doc.add_paragraph()
    
    # Add description of the diagram
    content = """
فرایند تولید و تأیید سؤال آزمون شامل موارد زیر است:

۱. مراحل اولیه:
   • انتخاب دوره و آزمون توسط مدرس
   • انتخاب زمینه آموزشی سؤال
   • تهیه‌ی داده‌های زمینه‌ای توسط سامانه

۲. مرحله تولید:
   • ارسال داده‌ها به سرویس AI
   • تولید سؤال توسط مدل زبانی
   • دریافت پیش‌نمایش سؤال

۳. مرحله بررسی اول:
   • نمایش سؤال برای مدرس
   • تصمیم‌گیری: آیا سؤال تأیید می‌شود؟

   الف) اگر بله:
       • تعیین SkillTag
       • ذخیره‌ی سؤال در بانک
       • به‌روزرسانی آزمون
       • پایان

   ب) اگر خیر:
       • انتخاب: ویرایش یا تولید مجدد؟

۴. مسیر ویرایش:
   • ویرایش سؤال توسط مدرس
   • ذخیره‌ی تغییرات
   • بررسی نهایی
   • تصمیم‌گیری دوم
   
   • اگر تأیید شود: تعیین SkillTag و ذخیره‌ی نهایی
   • اگر رد شود: حذف و درخواست تولید جدید

۵. مسیر تولید مجدد:
   • حذف سؤال موقت
   • بازگشت به مرحله تهیه‌ی داده‌ها
   • تکرار فرایند تولید و بررسی

Swimlanes (خطوط شنایی):
• مدرس: تصمیم‌گیری‌ها و بررسی‌های انسانی
• سامانه Mentorito: مدیریت فرایند و ذخیره‌سازی
• سرویس AI: تولید سؤال مبتنی بر هوش مصنوعی
    """
    
    # Add the content with proper formatting
    for line in content.strip().split('\n'):
        if line.strip():
            p = doc.add_paragraph(line)
            p.paragraph_format.right_to_left = True
            if line.strip().startswith('۱') or line.strip().startswith('۲') or line.strip().startswith('۳') or line.strip().startswith('۴') or line.strip().startswith('۵'):
                p.style = 'Heading 2'
    
    # Add SVG file reference
    doc.add_paragraph()
    ref = doc.add_paragraph()
    ref_run = ref.add_run('📎 فایل SVG: UML-ActivityDiagram-QuestionGeneration.svg')
    ref_run.font.name = 'B Titr'
    ref_run.font.size = Pt(10)
    
except Exception as e:
    print(f"Error: {e}")

# Save the document
output_path = r'e:\Final-Project\Learning-Management-System\UML-ActivityDiagram-QuestionGeneration.docx'
doc.save(output_path)
print(f"✓ Word document created: {output_path}")
