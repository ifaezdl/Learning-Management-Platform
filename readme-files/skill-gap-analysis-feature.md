# نمودار تحلیل شکاف مهارتی (Skill Gap Analysis)

## فهرست مطالب
1. [معرفی کلی فیچر](#۱-معرفی-کلی-فیچر)
2. [هدف و کاربرد](#۲-هدف-و-کاربرد)
3. [معماری کلی سیستم](#۳-معماری-کلی-سیستم)
4. [فایل‌ها و فولدرهای مرتبط](#۴-فایل‌ها-و-فولدرهای-مرتبط)
5. [ساختار دیتابیس و مدل داده](#۵-ساختار-دیتابیس-و-مدل-داده)
6. [الگوریتم و تابع اصلی: groupBySkill](#۶-الگوریتم-و-تابع-اصلی-groupbyskill)
7. [نحوه دریافت داده از سرور (Backend)](#۷-نحوه-دریافت-داده-از-سرور-backend)
8. [نحوه نمایش در فرانت‌اند (Frontend)](#۸-نحوه-نمایش-در-فرانت‌اند-frontend)
9. [جریان داده از صفر تا صد](#۹-جریان-داده-از-صفر-تا-صد)
10. [تست‌ها و اعتبارسنجی](#۱۰-تست‌ها-و-اعتبارسنجی)
11. [نکات فنی مهم برای ارائه](#۱۱-نکات-فنی-مهم-برای-ارائه)
12. [پاسخ به سوالات احتمالی داوران](#۱۲-پاسخ-به-سوالات-احتمالی-داوران)

---

## ۱. معرفی کلی فیچر

نمودار تحلیل شکاف مهارتی (Skill Gap Analysis) یکی از بخش‌های کلیدی **داشبورد تحلیل یادگیری** دانشجو است. این فیچر با استفاده از نمودار **Radar ( عنکبوتی)** نشان می‌دهد دانشجو در هر مهارت چه میزان تسلط دارد.

### خروجی نهایی:
- یک نمودار Radar که هر رأس آن یک مهارت (Skill) را نشان می‌دهد
- درصد تسلط دانشجو در هر مهارت (از ۰ تا ۱۰۰ درصد)
- یک جدول زیر نمودار با جزئیات دقیق‌تر
- یک خلاصه متنی از مهارت‌های ضعیف (زیر ۷۰٪)

---

## ۲.هدف و کاربرد

| هدف | توضیح |
|-----|-------|
| **شناسایی نقاط ضعف** | دانشجو بفهمد در کدام مهارت‌ها ضعیف است |
| **اولویت‌بندی مطالعه** | مهارت‌های ضعیف‌تر اولویت بالاتری داشته باشند |
| **پیگیری پیشرفت** | با هر آزمون جدید، درصد تسلط به‌روز شود |
| **فیلتر دوره** | امکان مشاهده شکاف مهارتی به تفکیک دوره خاص یا همه دوره‌ها |
| **ارتباط با سیستم توصیه** | داده‌های شکاف مهارتی برای پیشنهاد دوره‌های مناسب استفاده می‌شود |

---

## ۳. معماری کلی سیستم

```
┌─────────────────────────────────────────────────────────────────────┐
│                        دانشجو در مرورگر                           │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  LearningAnalytics.tsx                                       │   │
│  │  ┌─────────────┐  ┌──────────────────┐  ┌───────────────┐  │   │
│  │  │ WeakSkills   │  │ SkillRadarChart   │  │ Skill Table   │  │   │
│  │  │ Summary      │  │ (ApexCharts)      │  │ (Legend)      │  │   │
│  │  └──────┬──────┘  └────────┬─────────┘  └───────┬───────┘  │   │
│  └─────────┼──────────────────┼─────────────────────┼──────────┘   │
│            │                  │                     │               │
│  ┌─────────┼──────────────────┼─────────────────────┼──────────┐   │
│  │         ▼                  ▼                     ▼          │   │
│  │  analytics.service.ts (Frontend Service)                     │   │
│  │  ┌────────────────────────────────────────────────────────┐ │   │
│  │  │  getMySkillProfile(courseId?) → axios GET              │ │   │
│  │  └────────────────────────┬───────────────────────────────┘ │   │
│  └───────────────────────────┼──────────────────────────────────┘   │
│                              │ HTTP GET /analytics/students/me/skills│
│                              ▼                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                  NestJS Backend                               │  │
│  │                                                               │  │
│  │  analytics.controller.ts                                      │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │ @Get('students/me/skills')                              │  │  │
│  │  │ → analyticsService.getMySkillProfile(user.id, courseId) │  │  │
│  │  └────────────────────────┬────────────────────────────────┘  │  │
│  │                           ▼                                   │  │
│  │  analytics.service.ts                                        │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │ 1. findMany(QuizAttempts) → لیست attemptهای دانشجو    │  │  │
│  │  │ 2. findMany(QuizAttemptAnswers) → همه پاسخ‌ها          │  │  │
│  │  │ 3. groupBySkill(mappedAnswers) → تجمیع مهارت‌ها       │  │  │
│  │  └────────────────────────┬────────────────────────────────┘  │  │
│  │                           ▼                                   │  │
│  │  Prisma ORM                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │ SQL Server Database                                     │  │  │
│  │  │ QuizAttempts → QuizAttemptAnswers → QuizQuestions       │  │  │
│  │  │                 (IsCorrect)            (SkillTag)       │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ۴. فایل‌ها و فولدرهای مرتبط

### Backend (سرور)

| فایل | مسیر | وظیفه |
|------|------|-------|
| **analytics.service.ts** | `backend/src/analytics/analytics.service.ts` | سرویس اصلی: تابع `groupBySkill`، `getMySkillProfile`، `getAttemptSkills` |
| **analytics.controller.ts** | `backend/src/analytics/analytics.controller.ts` | کنترلر API: تعریف endpointها و مدیریت دسترسی |
| **analytics.module.ts** | `backend/src/analytics/analytics.module.ts` | تعریف ماژول NestJS |
| **analytics.service.spec.ts** | `backend/src/analytics/analytics.service.spec.ts` | تست‌های واحد (Unit Tests) |
| **schema.prisma** | `backend/prisma/schema.prisma` | مدل دیتابیس |

### Frontend (کلاینت)

| فایل | مسیر | وظیفه |
|------|------|-------|
| **LearningAnalytics.tsx** | `FrontEnd/src/feature-module/student/analytics/LearningAnalytics.tsx` | کامپوننت اصلی صفحه داشبورد |
| **analytics.service.ts** | `FrontEnd/src/services/analytics.service.ts` | سرویس HTTP برای فراخوانی API |
| **api.ts** | `FrontEnd/src/services/api.ts` | تنظیمات Axios (base URL، interceptors) |

### توابع کلیدی

| تابع | فایل | نوع | توضیح |
|------|------|-----|-------|
| `groupBySkill()` | analytics.service.ts (Backend) | **Pure Function** | تابع خالص بدون وابستگی به دیتابیس - تجمیع پاسخ‌ها بر اساس SkillTag |
| `getMySkillProfile()` | analytics.service.ts (Backend) | Async | دریافت پروفایل مهارتی کلی دانشجو از دیتابیس |
| `getAttemptSkills()` | analytics.service.ts (Backend) | Async | دریافت شکاف مهارتی یک آزمون خاص |
| `getMySkillProfile()` | analytics.service.ts (Frontend) | Async | فراخوانی HTTP به API سرور |
| `SkillRadarChart()` | LearningAnalytics.tsx (Frontend) | React Component | رندر نمودار Radar با ApexCharts |
| `WeakSkillsSummary()` | LearningAnalytics.tsx (Frontend) | React Component | نمایش خلاصه متنی مهارت‌های ضعیف |

---

## ۵. ساختار دیتابیس و مدل داده

### جداول مرتبط با شکاف مهارتی:

```
QuizQuestions
├── Id (PK)
├── Quiz_Id → Quizzes
├── QuestionText
├── SkillTag  ← برچسب مهارت (مثلاً: "حلقه‌های تکرار"، "توابع"، "مدیریت حافظه")
└── ...

QuizAttemptAnswers
├── Id (PK)
├── Attempt_Id → QuizAttempts
├── Question_Id → QuizQuestions
├── IsCorrect  ← آیا پاسخ صحیح بوده؟ (true/false)
└── ...

QuizAttempts
├── Id (PK)
├── Quiz_Id → Quizzes
├── Student_Id → Users
├── Score
├── MaxScore
├── SubmittedAt  ← تاریخ ارسال (برای روند زمانی)
└── ...
```

### فرآیند تگ‌گذاری سوالات:
- **مدرس** هنگام ایجاد سوالات آزمون، برای هر سوال یک **SkillTag** تعریف می‌کند
- مثال: سوالات مربوط به حلقه‌ها → SkillTag = "حلقه‌های تکرار"
- سوالات بدون برچسب → SkillTag = null → در تابع groupBySkill به "سایر" تبدیل می‌شود

---

## ۶. الگوریتم و تابع اصلی: groupBySkill

### تعریف تابع:
```typescript
groupBySkill(
  answers: { skillTag: string | null | undefined; isCorrect: boolean }[]
): SkillStat[]
```

### الگوریتم قدم به قدم:

**ورودی:** آرایه‌ای از پاسخ‌های دانشجو، هر پاسخ شامل:
- `skillTag`: برچسب مهارت سوال (string یا null)
- `isCorrect`: آیا پاسخ صحیح بوده (boolean)

**خروجی:** آرایه‌ای مرتب‌شده از SkillStatها (ضعیف‌ترین اول)

---

### مراحل الگوریتم:

#### مرحله ۱: ساخت Map برای تجمیع
```typescript
const map = new Map<string, { correct: number; total: number }>();
```
- یک نقشه (Map) ایجاد می‌شود که کلید آن نام مهارت و مقدار آن شامل تعداد پاسخ‌های صحیح و کل است

#### مرحله ۲: پیمایش پاسخ‌ها و شمارش
```typescript
for (const a of answers) {
  const tag = a.skillTag && a.skillTag.trim() 
    ? a.skillTag.trim() 
    : 'سایر';
  const bucket = map.get(tag) ?? { correct: 0, total: 0 };
  bucket.total += 1;
  if (a.isCorrect) bucket.correct += 1;
  map.set(tag, bucket);
}
```
- برای هر پاسخ:
  - اگر skillTag خالی یا null بود → "سایر"
  - اگر skillTag دارای فاصله اضافی بود → trim شود
  - شمارنده کل (total) یکی اضافه شود
  - اگر پاسخ صحیح بود، شمارنده صحیح (correct) هم یکی اضافه شود

#### مرحله ۳: محاسبه درصد تسلط
```typescript
for (const [tag, { correct, total }] of map.entries()) {
  result.push({
    tag,
    correct,
    total,
    percentage: total === 0 ? 0 : Math.round((correct / total) * 100),
  });
}
```
- فرمول: **درصد تسط = (تعداد پاسخ‌های صحیح / تعداد کل پاسخ‌ها) × ۱۰۰**
- از `Math.round` برای گرد کردن به عدد صحیح استفاده می‌شود

#### مرحله ۴: مرتب‌سازی (ضعیف‌ترین اول)
```typescript
result.sort((a, b) => a.percentage - b.percentage);
```
- مرتب‌سازی صعودی بر اساس درصد تسلط
- هدف: مهارت‌های ضعیف‌تر در ابتدا نمایش داده شوند

---

### مثال عددی:

فرض کنید دانشجو به ۸ سوال پاسخ داده:

| سوال | SkillTag | IsCorrect |
|------|----------|-----------|
| ۱ | حلقه‌های تکرار | ✅ true |
| ۲ | حلقه‌های تکرار | ❌ false |
| ۳ | حلقه‌های تکرار | ❌ false |
| ۴ | حلقه‌های تکرار | ❌ false |
| ۵ | مدیریت حافظه | ✅ true |
| ۶ | مدیریت حافظه | ✅ true |
| ۷ | مدیریت حافظه | ✅ true |
| ۸ | مدیریت حافظه | ✅ true |

**خروجی:**
```
[
  { tag: "حلقه‌های تکرار", correct: 1, total: 4, percentage: 25 },
  { tag: "مدیریت حافظه",   correct: 4, total: 4, percentage: 100 }
]
```

**تفسیر:** دانشجو در حلقه‌ها ۲۵٪ تسلط و در مدیریت حافظه ۱۰۰٪ تسط دارد. نمودار Radar نشان می‌دهد که "حلقه‌های تکرار" نقطه ضعف اصلی است.

---

### ویژگی‌های مهم تابع:

1. **Pure Function (تابع خالص):** هیچ وابستگی به دیتابیس یا state ندارد
2. **سادگی:** الگوریتم O(n) است (پیمایش یکباره آرایه)
3. **Handling Null:** مقادیر null/empty/whitespace به "سایر" تبدیل می‌شوند
4. **قابل تست:** به‌راحتی با ورودی‌های مختلف قابل تست است
5. **استفاده مجدد:** در چندین endpoint استفاده می‌شود (individual attempt, profile, course overview)

---

## ۷. نحوه دریافت داده از سرور (Backend)

### API Endpoint مورد استفاده:
```
GET /analytics/students/me/skills?courseId={optional}
```

### سطح دسترسی:
- فقط دانشجو (roleId = 1)
- JWT Authentication اجباری

### تابع getMySkillProfile در Backend:

```typescript
async getMySkillProfile(
  studentId: number,
  courseId?: number,
): Promise<{ skills: SkillStat[] }> {
  // ۱. یافتن همه attemptهای ثبت‌شده دانشجو
  const attempts = await this.prisma.quizAttempts.findMany({
    where: {
      Student_Id: studentId,
      SubmittedAt: { not: null },  // فقط آزمون‌های ارسال‌شده
      ...(courseId ? { Quizzes: { Course_Id: courseId } } : {}),
    },
    select: { Id: true },
  });

  if (attempts.length === 0) return { skills: [] };

  // ۲. دریافت همه پاسخ‌ها برای attemptها
  const answers = await this.prisma.quizAttemptAnswers.findMany({
    where: { Attempt_Id: { in: attemptIds } },
    include: { QuizQuestions: { select: { SkillTag: true } } },
  });

  // ۳. تبدیل به فرمت مناسب
  const mapped = answers.map((a) => ({
    skillTag: a.QuizQuestions.SkillTag,
    isCorrect: !!a.IsCorrect,
  }));

  // ۴. فراخوانی تابع groupBySkill
  return { skills: this.groupBySkill(mapped) };
}
```

### نکات مهم:
- **aggregation across attempts:** پاسخ‌ها از **تمام** آزمون‌های دانشجو تجمیع می‌شوند
- **course filter:** اگر courseId ارسال شود، فقط پاسخ‌های آن دوره خاص در نظر گرفته می‌شود
- **submitted only:** فقط آزمون‌هایی که واقعاً ارسال شده‌اند (SubmittedAt ≠ null) لحاظ می‌شوند

---

## ۸. نحوه نمایش در فرانت‌اند (Frontend)

### کامپوننت اصلی: LearningAnalytics.tsx

#### State Management:
```typescript
const [skills, setSkills] = useState<SkillStat[]>([]);
const [loadingSkills, setLoadingSkills] = useState(true);
const [selectedCourse, setSelectedCourse] = useState<number | undefined>(undefined);
```

#### فراخوانی داده:
```typescript
const fetchSkills = async (courseId?: number) => {
  setLoadingSkills(true);
  try {
    const data = await analyticsService.getMySkillProfile(courseId);
    setSkills(data.skills);
  } catch {
    setSkills([]);
  } finally {
    setLoadingSkills(false);
  }
};
```

### کامپوننت‌های نمایشی:

#### ۱. WeakSkillsSummary (خلاصه مهارت‌های ضعیف)
- فیلتر مهارت‌های زیر ۷۰٪
- نمایش حداکثر ۳ مهارت ضعیف
- نمایش با badge نارنجی رنگ

#### ۲. SkillRadarChart (نمودار Radar)
- استفاده از کتابخانه **ApexCharts** (ReactApexChart)
- نوع نمودار: `radar`
- محور X: نام مهارت‌ها (tags)
- محور Y: درصد تسلط (۰ تا ۱۰۰)
- رنگ اصلی: بنفش (#7c3aed)
- ارتفاع: 480px

#### ۳. جدول Skill Legend
- نمایش جزئیات: نام مهارت، تعداد صحیح، تعداد کل، درصد
- رنگ‌بندی خودکار:
  - سبز (≥70٪): تسلط خوب
  - زرد (40-69٪): تسلط متوسط
  - قرمز (<40٪): تسلط ضعیف

#### ۴. فیلتر دوره
- Dropdown برای انتخاب دوره خاص یا "همه دوره‌ها"
- با تغییر فیلتر، داده‌ها مجدداً فراخوانی می‌شوند

---

## ۹.جریان داده از صفر تا صد

```
مرحله ۱: مدرس سوالات آزمون را ایجاد می‌کند
         ↓
         هر سوال یک SkillTag دریافت می‌کند
         (مثلاً: "حلقه‌های تکرار"، "آرایه‌ها"، "توابع")
         ↓
مرحله ۲: دانشجو آزمون را شرکت و ارسال می‌کند
         ↓
         پاسخ‌ها در QuizAttemptAnswers ذخیره می‌شوند
         هر پاسخ شامل: IsCorrect (صحیح/غلط) + Question_Id → SkillTag
         ↓
مرحله ۳: دانشجو وارد داشبورد تحلیل یادگیری می‌شود
         ↓
         کامپوننت LearningAnalytics رندر می‌شود
         ↓
مرحله ۴: فراخوانی API GET /analytics/students/me/skills
         ↓
         Backend: getMySkillProfile(studentId)
         ↓
         ۴.۱: findMany(QuizAttempts) → لیست attemptهای دانشجو
         ۴.۲: findMany(QuizAttemptAnswers) → همه پاسخ‌ها
         ۴.۳: map کردن به {skillTag, isCorrect}
         ۴.۴: groupBySkill(mapped) → تجمیع و محاسبه درصد
         ↓
مرحله ۵: پاسخ JSON به فرانت‌اند برمی‌گردد
         ↓
         {
           "skills": [
             { "tag": "حلقه‌ها", "correct": 2, "total": 5, "percentage": 40 },
             { "tag": "توابع", "correct": 8, "total": 8, "percentage": 100 }
           ]
         }
         ↓
مرحله ۶: state skills آپدیت می‌شود
         ↓
         WeakSkillsSummary رندر می‌شود (مهارت‌های < 70٪)
         SkillRadarChart رندر می‌شود (نمودار Radar)
         جدول Skill Legend رندر می‌شود (جزئیات)
         ↓
مرحله ۷: دانشجو نتیجه را مشاهده می‌کند
         ↓
         نمودار Radar نقاط قوت و ضعف را نشان می‌دهد
         جدول زیر، جزئیات عددی را نمایش می‌دهد
         خلاصه متنی، مهارت‌های نیاز به مرور را لیست می‌کند
```

---

## ۱۰. تست‌ها و اعتبارسنجی

### تست‌های واحد برای تابع groupBySkill:

| تست | ورودی | خروجی مورد انتظار |
|-----|-------|-------------------|
| تجمیع صحیح | ۴ پاسخ حلقه (۱ صحیح) + ۴ پاسخ حافظه (۴ صحیح) | حلقه ۲۵٪، حافظه ۱00٪ |
| null → "سایر" | skillTag: null, "", "  " | همه به "سایر" تبدیل شوند |
| ورودی خالی | [] | [] |
| همه غلط | ۲ پاسخ غلط | percentage: 0 |
| همه صحیح | ۳ پاسخ صحیح | percentage: 100 |
| مرتب‌سازی | A=100%, B=0%, C=50% | مرتب: B, C, A |

### تست‌های اعتبارسنجی دسترسی:

| تست | سناریو | نتیجه |
|-----|--------|-------|
| دسترسی مجاز | دانشجو به attempt خود | ✅ موفق |
| دسترسی غیرمجاز | دانشجو به attempt دیگری | ❌ ForbiddenException |
| دسترسی ادمین | ادمین به هر attempt | ✅ موفق |
| دسترسی مدرس | مدرس به attempt دوره خود | ✅ موفق |

### تست‌های کلاس‌بندی روند (classifyTrend):
- الگوریتم: رگرسیون خطی ساده (Least Squares)
- تشخیص: صعودی (slope > +2)، نزولی (slope < -2)، ثابت

---

## ۱۱. نکات فنی مهم برای ارائه

### ۱. چرا از نمودار Radar استفاده شد؟
- Radar chart بهترین نمایش برای **چندبعدی** بودن مهارت‌ها است
- هر محور نشان‌دهنده یک مهارت است
- شکل کلی نمودار، نقاط قوت و ضعف را به‌صورت بصری نشان می‌دهد

### ۲. چرا تابع groupBySkill Pure Function است؟
- **تست‌پذیری:** بدون نیاز به دیتابیس قابل تست است
- **قابلیت استفاده مجدد:** در endpointهای مختلف (individual, aggregated, course-wide) استفاده می‌شود
- **جداسازی مسئولیت:** منطق تجمیع از منطق دیتابیس جدا شده

### ۳. نقش SkillTag در دیتابیس
- SkillTag یک فیلد اختیاری در جدول QuizQuestions است
- مدرس هنگام ایجاد سوال آن را تعریف می‌کند
- این فیلد پل ارتباطی بین پاسخ دانشجو و مهارت موردنظر است

### ۴. بهینه‌سازی‌ها
- **Batch query:** با `Attempt_Id: { in: attemptIds }` یکجا همه پاسخ‌ها دریافت می‌شود
- **Course filter:** فیلتر در سطح query اعمال می‌شود (نه بعد از دریافت)
- **Sorting:** مرتب‌سازی ضعیف‌ترین اول برای نمایش بهتر در UI

### ۵. ارتباط با سیستم توصیه دوره
- داده‌های groupBySkill در سرویس recommendations هم استفاده می‌شود
- فرمول امتیازدهی دوره‌ها: `(Skill_Gap × ۰.۴۵) + (Level × ۰.۲۵) + ...`
- **۴۵٪ وزن** امتیاز هر دوره بر اساس پوشش مهارت‌های ضعیف دانشجو است

### ۶. فناوری‌های استفاده شده
| لایه | فناوری | دلیل |
|------|--------|-------|
| Backend | NestJS | معماری ماژولار و TypeScript-native |
| ORM | Prisma | Type-safe database queries |
| دیتابیس | SQL Server | پشتیبانی از ارتباطات پیچیده |
| فرانت‌اند | React + TypeScript | توسعه کامپوننت‌محور |
| نمودار | ApexCharts | نمودارهای تعاملی با ظاهر زیبا |
| HTTP Client | Axios | مدیریت درخواست‌ها و interceptors |

---

## ۱۲. پاسخ به سوالات احتمالی داوران

### سوال ۱: اگر دانشجو هیچ آزمونی شرکت نکرده باشد چه می‌شود؟
**پاسخ:** تابع `getMySkillProfile` آرایه خالی برمی‌گرداند. فرانت‌اند پیام "داده‌ای برای نمایش وجود ندارد" را نمایش می‌دهد.

### سوال ۲: اگر سوالی SkillTag نداشته باشد چه می‌شود؟
**پاسخ:** در تابع `groupBySkill`، مقادیر null/empty/whitespace به رشته "سایر" تبدیل می‌شوند. این یک edge case handling مناسب است.

### سوال ۳: چرا مرتب‌سازی از ضعیف‌ترین است؟
**پاسخ:** هدف این است که دانشجو ابتدا نقاط ضعف خود را ببیند و بتواند اولویت‌بندی کند. در UI هم مهارت‌های ضعیف با رنگ قرمز و مهارت‌های قوی با رنگ سبز نمایش داده می‌شوند.

### سوال ۴: عملکرد (Performance) در تعداد زیاد پاسخ چگونه است؟
**پاسخ:**
- الگوریتم `groupBySkill` از نوع O(n) است
- در Backend، پاسخ‌ها با `IN` query یکجا دریافت می‌شوند (نه N+1 query)
- برای دانشجویی با ۱۰۰ آزمون و ۱۰ سوال هرکدام، حدود ۱۰۰۰ رکورد پردازش می‌شود که در کمتر از ۱۰۰ms انجام می‌شود

### سوال ۵: چرا از درصد تسلط به جای تعداد صحیح استفاده شد؟
**پاسخ:** درصد یک معیار نرمال‌شده است. اگر دانشجو در یک مهارت ۱۰ سوال و در مهارت دیگر ۵ سوال پاسخ داده باشد، مقایسه تعداد صحیح عادلانه نیست. درصد، مقایسه را منصفانه می‌کند.

### سوال ۶: محدودیت ۷۰٪ برای WeakSkillsSummary از کجا آمده؟
**پاسخ:** آستانه ۷۰٪ یک انتخاب طراحی (design decision) است. در نظام آموزشی، معمولاً کمتر از ۷۰٪ به معنای "نیاز به مرور" است. این آستانه قابل تغییر است.

### سوال ۷: آیا این سیستم قابلیت مقایسه بین دانشجویان را دارد؟
**پاسخ:** بله. اندپوینت `getCourseSkillsOverview` برای مدرس تعریف شده که مهارت‌های کل کلاس را نشان می‌دهد. همچنین `getCourseStudentAnalytics` جزئیات هر دانشجو را به تفکیک نمایش می‌دهد.

### سوال ۸: چگونه مطمئن می‌شوید دانشجو فقط به داده‌های خودش دسترسی دارد؟
**پاسخ:** در هر endpoint چند لایه بررسی دسترسی وجود دارد:
1. **JWT Guard:** احراز هویت اجباری
2. **Roles Guard:** بررسی نقش کاربر (دانشجو/مدرس/ادمین)
3. **Ownership Check:** بررسی اینکه attempt متعلق به کاربر جاری است
4. **Course Ownership:** برای مدرس، بررسی مالکیت دوره

---

## خلاصه برای ارائه (۲ دقیقه)

> **فیچر تحلیل شکاف مهارتی** یک داشبورد تعاملی برای دانشجو است که با استفاده از نمودار Radar نشان می‌دهد در هر مهارت چه میزان تسلط دارد.
>
> **الگوریتم اصلی** تابع `groupBySkill` است که پاسخ‌های دانشجو را بر اساس برچسب مهارت (SkillTag) تجمیع و درصد تسط هر مهارت را محاسبه می‌کند. این تابع Pure Function است و O(n) اجرا می‌شود.
>
> **داده‌ها** از جداول QuizAttempts، QuizAttemptAnswers و QuizQuestions با استفاده از Prisma ORM از SQL Server دریافت می‌شوند.
>
> **فناوری‌ها:** NestJS (Backend)، React + TypeScript (Frontend)، ApexCharts (نمودار)، Prisma (ORM)، SQL Server (دیتابیس).
>
> **نکته مهم:** این داده‌ها پایه سیستم توصیه دوره هم هستند — ۴۵٪ امتیاز هر دوره پیشنهادی بر اساس پوشش مهارت‌های ضعیف دانشجو محاسبه می‌شود.
