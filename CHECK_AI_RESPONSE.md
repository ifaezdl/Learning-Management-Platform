# چک کردن AI Model Response - مهم!

اگر مشکل "پاسخ صحیح نمشخص" هنوز وجود دارد، باید **مدل چه ارسال میکند** ببینیم.

## مراحل Debug

### مرحله 1: Backend Logs فعال کن

سوال جدید ایجاد کن:
```
GET /practice-exams/courses/[ID]/generate?skillTag=...
```

Backend console میں ببین - ببین چی log میکند:

**Expected:**
```
=== AI Question -1 ===
correctChoiceIndex: 0
studentChoiceId (choiceId): 0
choices: 4 items
isCorrect: true

=== AI Question -2 ===
correctChoiceIndex: 2
studentChoiceId (choiceId): 2
isCorrect: true
```

**اگر غلط:**
```
=== AI Question -1 ===
correctChoiceIndex: undefined  ← مشکل!
...
isCorrect: false  ← نتیجه غلط
```

---

### مرحله 2: اگر `correctChoiceIndex` undefined است

مسئله: `generateQuestionsForCourse` یا `generateQuestionsForSkill` غلط response داد

**Cause:** مدل JSON درست نمی‌فرستد

**Solution:** پرامپت را بهتر کنیم

---

### مرحله 3: AI Model Response را فیلتر کن

Backend `/backend/src/ai/ai.service.ts` میں خط 248 اضافی log کن:

```typescript
const content: string | undefined = data?.choices?.[0]?.message?.content;

if (!content) {
  console.error('AI API No Content:', data);
  throw new BadRequestException(...);
}

// جدید - log raw response
console.log('=== RAW AI RESPONSE ===');
console.log(content.substring(0, 500)); // اول ۵۰۰ حرف
```

**Output مثال:**

اگر صحیح:
```
[{"questionText":"...", "skillTag":"...", "choices":[{"text":"A","isCorrect":true},{"text":"B","isCorrect":false},...]}
```

اگر غلط:
```
برخی مدل‌ها فقط متن ارسال می‌کنند (JSON نیست)
```

---

### مرحله 4: Validation Errors بررسی کن

اگر backend میگوید:
```
Question validation failed: [
  "سوال 1: هیچ گزینه صحیحی وجود ندارد. ⚠️"
]
```

**علت:** مدل `isCorrect` نمی‌دهد

**حل:** Prompt تغییر کن

---

## راهنمای اصلاح Prompt

اگر مشکل از مدل است:

### مسئله 1: مدل `isCorrect` ندارد

**Prompt میں اضافی کن:**
```
مهم: هر گزینه باید دارای یک فیلد "isCorrect" باشد!
{"text": "گزینه", "isCorrect": true/false}
```

### مسئله 2: مدل تمام مهارت‌ها را نمی‌شناسد

**مثال:**
```
دسته‌بندی: برنامه نویسی
اهداف: سوالات باید فقط درباره JavaScript باشند
```

اگر مدل Python سوالات میدهد → prompt اضافی کن

### مسئله 3: JSON Format غلط است

**فیکس:**

```typescript
// extractJsonArray میں بهتر parsing
let jsonSlice = text.slice(start, end + 1);

// Attempt to fix common formatting issues
jsonSlice = jsonSlice
  .replace(/(['"])?isCorrect(['"])?\s*:\s*(")?true(")?/gi, '"isCorrect": true')
  .replace(/(['"])?isCorrect(['"])?\s*:\s*(")?false(")?/gi, '"isCorrect": false');
```

---

## مثال: Correct AI Response

جواب صحیح از مدل:
```json
[
  {
    "questionText": "متغیر محلی چیست؟",
    "skillTag": "متغیرهای محلی",
    "choices": [
      {"text": "متغیری که فقط داخل تابع استفاده می‌شود", "isCorrect": true},
      {"text": "متغیری که در تمام برنامه استفاده می‌شود", "isCorrect": false},
      {"text": "متغیری که در سرور ذخیره می‌شود", "isCorrect": false},
      {"text": "متغیری که هرگز پاک نمی‌شود", "isCorrect": false}
    ]
  }
]
```

---

## مثال: غلط AI Response

جواب غلط:
```json
[
  {
    "questionText": "متغیر محلی چیست؟",
    "skillTag": "متغیرهای محلی",
    "choices": [
      {"text": "متغیری که فقط داخل تابع استفاده می‌شود"},  // ← NO isCorrect!
      {"text": "متغیری که در تمام برنامه استفاده می‌شود"},
      {"text": "متغیری که در سرور ذخیره می‌شود"},
      {"text": "متغیری که هرگز پاک نمی‌شود"}
    ]
  }
]
```

---

## Quick Diagnostic

### سوال: پاسخ صحیح را نشان نمیدهد

**شک من 1 - صحیح است؟**
```
Backend logs → correctChoiceIndex = 0
studentChoiceId = 0
isCorrect = true ✓
```
→ مشکل در **نمایش** است (frontend)

**شک من 2 - correctChoiceIndex تعریف است؟**
```
Backend logs → correctChoiceIndex = undefined ✗
```
→ مشکل در **مدل** است (AI)

**شک من 3 - validation pass شد؟**
```
Backend: Question validation failed: [
  "سوال 1: هیچ گزینه صحیحی وجود ندارد"
]
```
→ مشکل در **JSON** است (format)

---

## چک‌لیست

- [ ] Backend log میں `correctChoiceIndex` تعریف شده؟
- [ ] `isCorrect` مقادیر true/false دارند؟
- [ ] Validation errors نیستند؟
- [ ] JSON format معتبر است؟
- [ ] دقیقا یک `isCorrect: true` در هر سوال؟
- [ ] حداقل ۳ `isCorrect: false` در هر سوال؟

اگر تمام YES → مشکل فقط نمایش است
اگر هیچ NO → مشکل مدل است

---

## رفع سریع

اگر مدل مشکل دارد:

**Option 1:** Mock Questions برای تست
```typescript
const mockQuestions = [
  {
    questionText: "۲ + ۲ برابر است؟",
    skillTag: "ریاضیات",
    choices: [
      { text: "۴", isCorrect: true },
      { text: "۳", isCorrect: false },
      { text: "۵", isCorrect: false },
      { text: "۶", isCorrect: false }
    ]
  }
];
// return mockQuestions;
```

**Option 2:** بهتر Prompt
```
برنامه ریاضی درخواست میکند:
1. دقیقا یک "isCorrect": true
2. تمام دیگری "isCorrect": false
3. JSON Array کامل
```

---

## Next Steps

1. Backend restart کن
2. سوال جدید ایجاد کن
3. Logs بررسی کن
4. اگر مشکل دیدی → اینجا report کن
5. تا مشکل حل شود
