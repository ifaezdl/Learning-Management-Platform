# نمودار روند پیشرفت در طول زمان (Progress Trend Chart)

## فهرست مطالب
1. [معرفی کلی فیچر](#۱-معرفی-کلی-فیچر)
2. [هدف و کاربرد](#۲-هدف-و-کاربرد)
3. [معماری کلی سیستم](#۳-معماری-کلی-سیستم)
4. [فایل‌ها و فولدرهای مرتبط](#۴-فایل‌ها-و-فولدرهای-مرتبط)
5. [ساختار دیتابیس و مدل داده](#۵-ساختار-دیتابیس-و-مدل-داده)
6. [الگوریتم تابع getProgressTrend](#۶-الگوریتم-تابع-getprogresstrend)
7. [الگوریتم classifyTrend (رگرسیون خطی)](#۷-الگوریتم-classifytrend-رگرسیون-خطی)
8. [نحوه نمایش در فرانت‌اند (Frontend)](#۸-نحوه-نمایش-در-فرانت‌اند-frontend)
9. [جریان داده از صفر تا صد](#۹-جریان-داده-از-صفر-تا-صد)
10. [تست‌ها و اعتبارسنجی](#۱۰-تست‌ها-و-اعتبارسنجی)
11. [نکات فنی مهم برای ارائه](#۱۱-نکات-فنی-مهم-برای-ارائه)
12. [پاسخ به سوالات احتمالی داوران](#۱۲-پاسخ-به-سوالات-احتمالی-داوران)

---

## ۱. معرفی کلی فیچر

نمودار روند پیشرفت در طول زمان یک نمودار **Line Chart** تعاملی است که دو سری داده را به‌صورت همزمان نمایش می‌دهد:

1. **نمرات آزمون (Quiz Scores):** خط بنفش — نشان‌دهنده درصد نمره هر آزمون بر اساس تاریخ ارسال
2. **پیشرفت دوره (Course Completion):** خط سبز — نشان‌دهنده درصد تکمیل دروس دوره به‌صورت تجمعی (rolling)

### خروجی نهایی:
- نمودار Line با دو خط رنگی (بنفش + سبز)
- محور X: تاریخ شمسی (تبدیل شده با `toLocaleDateString('fa-IR')`)
- محور Y: درصد (۰ تا ۱۰۰)
- Tooltip مشترک با نمایش درصد هر دو سری در یک تاریخ
- کارت‌های خلاصه: تعداد آزمون‌های تکمیل‌شده، میانگین نمره، میانگین تسلط مهارتی

---

## ۲.هدف و کاربرد

| هدف | توضیح |
|-----|-------|
| **پیگیری روند یادگیری** | دانشجو ببیند آیا در طول زمان بهتر شده یا نه |
| **مقایسه آزمون و دوره** | هر دو معیار در یک نمودار برای مقایسه بصری |
| **تشخیص روند** | با الگوریتم رگرسیون خطی، وضعیت روند (صعودی/نزولی/ثابت) مشخص شود |
| **فیلتر دوره** | امکان مشاهده روند به تفکیک یک دوره خاص یا همه دوره‌ها |
| **انگیزه‌بخشی** | نمایش پیشرفت واقعی برای افزایش انگیزه دانشجو |

---

## ۳. معماری کلی سیستم

```
┌─────────────────────────────────────────────────────────────────────┐
│                        دانشجو در مرورگر                           │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  LearningAnalytics.tsx                                       │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │  ProgressTrendChart (ApexCharts Line)                  │  │   │
│  │  │  ┌──────────────┐     ┌──────────────────────────┐    │  │   │
│  │  │  │ Quiz Scores  │     │  Course Completion       │    │  │   │
│  │  │  │ (بنفش)       │     │  (سبز)                   │    │  │   │
│  │  │  └──────┬───────┘     └──────────┬───────────────┘    │  │   │
│  │  └─────────┼─────────────────────────┼────────────────────┘  │   │
│  └────────────┼─────────────────────────┼────────────────────────┘   │
│               │                         │                            │
│  ┌────────────┼─────────────────────────┼────────────────────────┐   │
│  │            ▼                         ▼                        │   │
│  │  analytics.service.ts (Frontend Service)                      │   │
│  │  ┌──────────────────────────────────────────────────────────┐ │   │
│  │  │  getProgressTrend(courseId?) → axios GET                 │ │   │
│  │  └────────────────────────┬─────────────────────────────────┘ │   │
│  └───────────────────────────┼────────────────────────────────────┘   │
│                              │ HTTP GET /analytics/students/me/progress-trend│
│                              ▼                                       │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │                  NestJS Backend                                │   │
│  │                                                                │   │
│  │  analytics.controller.ts                                       │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │ @Get('students/me/progress-trend')                       │  │   │
│  │  │ → analyticsService.getProgressTrend(studentId, courseId) │  │   │
│  │  └────────────────────────┬─────────────────────────────────┘  │   │
│  │                           ▼                                    │   │
│  │  analytics.service.ts                                         │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │ 1. findMany(QuizAttempts) → نمرات آزمون‌ها              │  │   │
│  │  │ 2. findMany(Enrollments) → لیست دوره‌ها                 │  │   │
│  │  │ 3. groupBy(Lessons) → تعداد کل دروس هر دوره            │  │   │
│  │  │ 4. findMany(CourseProgress) → دروس تکمیل‌شده            │  │   │
│  │  │ 5. Rolling completion calculation                       │  │   │
│  │  └────────────────────────┬─────────────────────────────────┘  │   │
│  │                           ▼                                    │   │
│  │  Prisma ORM                                                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │ SQL Server Database                                      │  │   │
│  │  │ QuizAttempts → Score, MaxScore, SubmittedAt              │  │   │
│  │  │ Enrollments → Course_Id                                  │  │   │
│  │  │ Lessons → IsPublished (شمارش دروس)                       │  │   │
│  │  │ CourseProgress → IsCompleted, CompletedAt               │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ۴. فایل‌ها و فولدرهای مرتبط

### Backend (سرور)

| فایل | مسیر | وظیفه |
|------|------|-------|
| **analytics.service.ts** | `backend/src/analytics/analytics.service.ts` | تابع `getProgressTrend` و `classifyTrend` |
| **analytics.controller.ts** | `backend/src/analytics/analytics.controller.ts` | اندپوینت `GET /students/me/progress-trend` |
| **analytics.service.spec.ts** | `backend/src/analytics/analytics.service.spec.ts` | تست‌های واحد برای classifyTrend |
| **schema.prisma** | `backend/prisma/schema.prisma` | مدل دیتابیس (QuizAttempts, CourseProgress, Lessons) |

### Frontend (کلاینت)

| فایل | مسیر | وظیفه |
|------|------|-------|
| **LearningAnalytics.tsx** | `FrontEnd/src/feature-module/student/analytics/LearningAnalytics.tsx` | کامپوننت `ProgressTrendChart` + state management |
| **analytics.service.ts** | `FrontEnd/src/services/analytics.service.ts` | متد `getProgressTrend()` برای فراخوانی API |

### توابع کلیدی

| تابع | فایل | نوع | توضیح |
|------|------|-----|-------|
| `getProgressTrend()` | analytics.service.ts (Backend) | **Async** | دریافت نمرات آزمون و درصد تکمیل دوره از دیتابیس |
| `classifyTrend()` | analytics.service.ts (Backend) | **Pure Function** | رگرسیون خطی ساده برای تشخیص روند یادگیری |
| `getProgressTrend()` | analytics.service.ts (Frontend) | **Async** | فراخوانی HTTP به API سرور |
| `ProgressTrendChart()` | LearningAnalytics.tsx (Frontend) | **React Component** | رندر نمودار Line با ApexCharts |
| `formatDate()` | LearningAnalytics.tsx (Frontend) | **Helper** | تبدیل تاریخ به فرمت شمسی |

---

## ۵. ساختار دیتابیس و مدل داده

### جداول مرتبط با روند پیشرفت:

```
QuizAttempts                    CourseProgress                 Lessons
├── Id (PK)                     ├── Id (PK)                    ├── Id (PK)
├── Quiz_Id → Quizzes           ├── Course_Id → Courses        ├── Course_Id → Courses
├── Student_Id → Users          ├── Lesson_Id → Lessons        ├── Title
├── Score                       ├── Student_Id → Users         ├── IsPublished ← فقط دروس منتشرشده
├── MaxScore                    ├── IsCompleted ← آیا تکمیل؟  └── SortOrder
├── SubmittedAt ← تاریخ ارسال   ├── CompletedAt ← تاریخ تکمیل
└── IsPassed                    └── (unique: Lesson+Student)
```

### فرمول محاسبه درصد نمره آزمون:
```
percentage = (Score / MaxScore) × 100
```
- اگر MaxScore صفر یا null باشد → percentage = 0
- از `Math.round` برای گرد کردن استفاده می‌شود

### فرمول محاسبه درصد تکمیل دوره (Rolling):
```
percentage = min(100, round((تعداد دروس تکمیل‌شده / تعداد کل دروس منتشرشده) × 100))
```
- برای هر دوره به‌صورت جداگانه محاسبه می‌شود
- با هر درس تکمیل‌شده جدید، درصد به‌روز می‌شود
- `Math.min(100, ...)` تضمین می‌کند درصد از ۱۰۰ فراتر نرود

---

## ۶. الگوریتم تابع getProgressTrend

### تعریف تابع:
```typescript
async getProgressTrend(
  studentId: number,
  courseId?: number,
): Promise<ProgressTrendResult>
```

### خروجی:
```typescript
interface ProgressTrendResult {
  quizScores: QuizScorePoint[];      // نمرات آزمون
  courseCompletion: CompletionPoint[]; // درصد تکمیل دوره
}

interface QuizScorePoint {
  date: Date;
  percentage: number;
  courseTitle: string;
}

interface CompletionPoint {
  date: Date;
  percentage: number;
  courseTitle: string;
}
```

---

### بخش اول: دریافت نمرات آزمون

```typescript
const attempts = await this.prisma.quizAttempts.findMany({
  where: {
    Student_Id: studentId,
    SubmittedAt: { not: null },          // فقط آزمون‌های ارسال‌شده
    ...(courseId ? { Quizzes: { Course_Id: courseId } } : {}),
  },
  orderBy: { SubmittedAt: 'asc' },      // مرتب‌سازی صعودی بر اساس تاریخ
  include: { 
    Quizzes: { 
      include: { 
        Courses: { select: { Title: true } } 
      } 
    } 
  },
});
```

**توضیح:** 
- فقط آزمون‌هایی که واقعاً ارسال شده‌اند (`SubmittedAt ≠ null`)
- مرتب‌سازی از قدیم به جدید (`asc`)
- اگر courseId ارسال شود، فقط آزمون‌های آن دوره فیلتر می‌شوند

**محاسبه درصد:**
```typescript
const quizScores: QuizScorePoint[] = attempts.map((a) => ({
  date: a.SubmittedAt!,
  percentage:
    a.MaxScore && Number(a.MaxScore) > 0
      ? Math.round((Number(a.Score) / Number(a.MaxScore)) * 100)
      : 0,
  courseTitle: a.Quizzes.Courses.Title,
}));
```

---

### بخش دوم: دریافت درصد تکمیل دوره

#### مرحله ۱: یافتن دوره‌های ثبت‌نام‌شده
```typescript
const enrollments = await this.prisma.enrollments.findMany({
  where: {
    Student_Id: studentId,
    ...(courseId ? { Course_Id: courseId } : {}),
  },
  select: { Course_Id: true },
});
```

#### مرحله ۲: شمارش تعداد کل دروس منتشرشده برای هر دوره
```typescript
const lessonCounts = await this.prisma.lessons.groupBy({
  by: ['Course_Id'],
  where: { 
    Course_Id: { in: courseIds }, 
    IsPublished: true    // فقط دروس منتشرشده
  },
  _count: { Id: true },
});
```

#### مرحله ۳: دریافت دروس تکمیل‌شده دانشجو
```typescript
const progressRows = await this.prisma.courseProgress.findMany({
  where: {
    Student_Id: studentId,
    Course_Id: { in: courseIds },
    IsCompleted: true,
    CompletedAt: { not: null },
  },
  orderBy: { CompletedAt: 'asc' },
  include: { Courses: { select: { Title: true } } },
});
```

#### مرحله ۴: محاسبه Rolling Completion
```typescript
const completedCountByC = new Map<number, number>();

for (const row of progressRows) {
  const cid = row.Course_Id;
  // افزایش شمارنده دروس تکمیل‌شده
  completedCountByC.set(cid, (completedCountByC.get(cid) ?? 0) + 1);
  
  const total = totalByC.get(cid) ?? 1;
  completionPoints.push({
    date: row.CompletedAt!,
    percentage: Math.min(
      100,
      Math.round((completedCountByC.get(cid)! / total) * 100)
    ),
    courseTitle: row.Courses.Title,
  });
}
```

**توضیح Rolling Completion:**
- به‌ازای هر درس تکمیل‌شده جدید، یک نقطه جدید اضافه می‌شود
- درصد تکمیل به‌صورت تجمعی محاسبه می‌شود
- مثال: اگر دوره ۱۰ درس داشته باشد:
  - درس ۱ تکمیل → ۱۰٪
  - درس ۲ تکمیل → ۲۰٪
  - درس ۵ تکمیل → ۵۰٪
  - درس ۱۰ تکمیل → ۱۰۰٪

---

## ۷. الگوریتم classifyTrend (رگرسیون خطی)

### تعریف تابع:
```typescript
classifyTrend(
  scores: { date: Date; percentage: number }[]
): TrendClassification
```

### خروجی:
```typescript
interface TrendClassification {
  status: 'صعودی' | 'نزولی' | 'ثابت' | 'داده کافی نیست';
  slope: number;
  description?: string;
}
```

---

### الگوریتم قدم به قدم:

#### مرحله ۱: بررسی تعداد داده‌ها
```typescript
if (scores.length < 2) {
  return {
    status: 'داده کافی نیست',
    slope: 0,
    description: 'حداقل دو آزمون برای تحلیل روند لازم است.',
  };
}
```
**دلیل:** برای محاسبه شیب خط، حداقل ۲ نقطه لازم است.

#### مرحله ۲: مرتب‌سازی بر اساس تاریخ
```typescript
const sorted = [...scores].sort(
  (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
);
```
**نکته:** از spread operator استفاده می‌شود تا آرایه اصلی تغییر نکند (immutability).

#### مرحله ۳: بررسی یکسان بودن نمرات
```typescript
const allSame = sorted.every((s) => s.percentage === sorted[0].percentage);
if (allSame) {
  return {
    status: 'ثابت',
    slope: 0,
    description: `نمره در ${sorted[0].percentage}٪ ثابت مانده است.`,
  };
}
```

#### مرحله ۴: محاسبه رگرسیون خطی (Least Squares)

**فرمول ریاضی:**
```
y = mx + b

m (شیب) = (n × Σ(xy) - Σx × Σy) / (n × Σ(x²) - (Σx)²)
```

**کد:**
```typescript
let sumX = 0;   // مجموع xها
let sumY = 0;   // مجموع yها
let sumXY = 0;  // مجموع ضرب x در y
let sumX2 = 0;  // مجموع مجذور xها

for (let i = 0; i < n; i++) {
  const x = i;                    // شماره آزمون (0, 1, 2, ...)
  const y = sorted[i].percentage; // درصد نمره
  sumX += x;
  sumY += y;
  sumXY += x * y;
  sumX2 += x * x;
}

const numerator = n * sumXY - sumX * sumY;
const denominator = n * sumX2 - sumX * sumX;
const slope = numerator / denominator;
```

**توضیح:**
- `x`: شماره ترتیبی آزمون (۰, ۱, ۲, ...) — نه تاریخ واقعی
- `y`: درصد نمره آزمون
- شیب (slope) نشان‌دهنده تغییرات درصد به ازای هر آزمون است

#### مرحله ۵: کلاس‌بندی روند بر اساس شیب

```typescript
const POSITIVE_THRESHOLD = 2;
const NEGATIVE_THRESHOLD = -2;

if (slope > POSITIVE_THRESHOLD) {
  status = 'صعودی';   // شیب مثبت بزرگ
} else if (slope < NEGATIVE_THRESHOLD) {
  status = 'نزولی';   // شیب منفی بزرگ
} else {
  status = 'ثابت';    // شیب نزدیک به صفر
}
```

| وضعیت | شیب (slope) | توضیح |
|-------|-------------|-------|
| صعودی | > +2 | هر آزمون حدود ۲٪ بهتر شده |
| نزولی | < -2 | هر آزمون حدود ۲٪ بدتر شده |
| ثابت | -2 تا +2 | تغییرات ناچیز |

---

### مثال عددی:

**مثال ۱: روند صعودی**
```
آزمون‌ها: 20% → 40% → 60% → 80% → 100%
x:         0    1    2    3    4
y:        20   40   60   80   100

Σx = 0+1+2+3+4 = 10
Σy = 20+40+60+80+100 = 300
Σxy = 0×20 + 1×40 + 2×60 + 3×80 + 4×100 = 0+40+120+240+400 = 800
Σx² = 0+1+4+9+16 = 30
n = 5

slope = (5×800 - 10×300) / (5×30 - 10²)
      = (4000 - 3000) / (150 - 100)
      = 1000 / 50
      = 20

وضعیت: صعودی (شیب = 20 > 2)
```

**مثال ۲: روند ثابت**
```
آزمون‌ها: 50% → 51% → 49% → 50%
x:         0    1    2    3
y:        50   51   49   50

slope ≈ 0

وضعیت: ثابت (|شیب| ≤ 2)
```

**مثال ۳: روند نزولی**
```
آزمون‌ها: 100% → 80% → 60% → 40% → 20%
slope = -20

وضعیت: نزولی (شیب = -20 < -2)
```

---

## ۸. نحوه نمایش در فرانت‌اند (Frontend)

### کامپوننت ProgressTrendChart

#### دریافت داده:
```typescript
const fetchTrend = async (courseId?: number) => {
  setLoadingTrend(true);
  try {
    const data = await analyticsService.getProgressTrend(courseId);
    setQuizScores(data.quizScores);
    setCourseCompletion(data.courseCompletion);
  } catch {
    setQuizScores([]);
    setCourseCompletion([]);
  } finally {
    setLoadingTrend(false);
  }
};
```

#### ساختار Series نمودار:
```typescript
const series = [
  {
    name: "نمره آزمون",
    data: quizScores.map((p) => ({
      x: formatDate(p.date),   // تاریخ شمسی
      y: p.percentage,          // درصد نمره
    })),
  },
  {
    name: "پیشرفت دوره",
    data: courseCompletion.map((p) => ({
      x: formatDate(p.date),
      y: p.percentage,
    })),
  },
];
```

#### تنظیمات ApexCharts:

| تنظیم | مقدار | توضیح |
|------|-------|-------|
| `chart.type` | `"line"` | نمودار خطی |
| `stroke.curve` | `"smooth"` | منحنی صاف (نه زاویه‌دار) |
| `stroke.width` | `[4, 4]` | ضخامت هر دو خط |
| `colors` | `["#7c3aed", "#10b981"]` | بنفش (آزمون) + سبز (دوره) |
| `yaxis.min/max` | `0 / 100` | محدوده درصد |
| `yaxis.tickAmount` | `5` | ۵ خط افقی (هر ۲۰٪) |
| `tooltip.shared` | `true` | Tooltip مشترک برای هر دو خط |
| `chart.zoom.enabled` | `false` | زوم غیرفعال |
| `chart.animations.speed` | `800` | سرعت انیمیشن ۸۰۰ms |
| `dataLabels.enabled` | `false` | برچسب‌های عددی غیرفعال |
| `grid.strokeDashArray` | `3` | خطوط نقطه‌چین |
| `xaxis.labels.rotate` | `-30` | چرخش ۳۰ درجه تاریخ‌ها |

#### فرمت تاریخ شمسی:
```typescript
function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("fa-IR", {
    month: "short",   // ماه کوتاه (مثلاً: مهر)
    day: "numeric",   // روز عددی
  });
}
```

#### کارت‌های خلاصه (زیر نمودار):

| کارت | مقدار | محاسبه |
|------|-------|--------|
| آزمون تکمیل‌شده | `quizScores.length` | تعداد کل آزمون‌ها |
| میانگین نمره آزمون | `round(sum(percentage) / count)` | میانگین درصدها |
| میانگین تسلط مهارتی | از داده‌های skill | میانگین درصدهای مهارت |

---

## ۹.جریان داده از صفر تا صد

```
مرحله ۱: دانشجو آزمون‌ها را شرکت می‌کند
         ↓
         هر آزمون در QuizAttempts ذخیره می‌شود:
         Score, MaxScore, SubmittedAt, IsPassed
         ↓
مرحله ۲: دانشجو دروس را تکمیل می‌کند
         ↓
         هر درس تکمیل‌شده در CourseProgress ذخیره می‌شود:
         IsCompleted = true, CompletedAt = تاریخ
         ↓
مرحله ۳: دانشجو وارد داشبورد تحلیل یادگیری می‌شود
         ↓
         کامپوننت LearningAnalytics رندر می‌شود
         ↓
مرحله ۴: فراخوانی API GET /analytics/students/me/progress-trend
         ↓
         Backend: getProgressTrend(studentId, courseId)
         ↓
         ۴.۱: دریافت QuizAttempts → محاسبه درصد نمره هر آزمون
         ۴.۲: دریافت Enrollments → لیست دوره‌های دانشجو
         ۴.۳: groupBy(Lessons) → تعداد کل دروس هر دوره
         ۴.۴: دریافت CourseProgress → دروس تکمیل‌شده
         ۴.۵: Rolling completion calculation → درصد تکمیل
         ↓
مرحله ۵: پاسخ JSON به فرانت‌اند
         ↓
         {
           "quizScores": [
             { "date": "2025-09-01", "percentage": 65, "courseTitle": "JS" },
             { "date": "2025-09-15", "percentage": 80, "courseTitle": "JS" },
             { "date": "2025-10-01", "percentage": 90, "courseTitle": "React" }
           ],
           "courseCompletion": [
             { "date": "2025-09-05", "percentage": 20, "courseTitle": "JS" },
             { "date": "2025-09-20", "percentage": 50, "courseTitle": "JS" },
             { "date": "2025-10-10", "percentage": 100, "courseTitle": "JS" }
           ]
         }
         ↓
مرحله ۶: stateها آپدیت می‌شوند
         ↓
         setQuizScores(data.quizScores)
         setCourseCompletion(data.courseCompletion)
         ↓
مرحله ۷: ProgressTrendChart رندر می‌شود
         ↓
         نمودار Line با دو خط نمایش داده می‌شود
         خط بنفش: روند نمرات آزمون
         خط سبز: روند تکمیل دوره
         ↓
مرحله ۸: دانشجو نتیجه را مشاهده می‌کند
         ↓
         آیا خط بنفش صعودی است؟ → نمرات بهتر شده
         آیا خط سبز به ۱۰۰٪ رسیده؟ → دوره تکمیل شده
```

---

## ۱۰. تست‌ها و اعتبارسنجی

### تست‌های واحد برای classifyTrend:

| تست | ورودی | خروجی مورد انتظار |
|-----|-------|-------------------|
| داده کافی نیست | [] (آرایه خالی) | status: 'داده کافی نیست', slope: 0 |
| یک نقطه | [50%] | status: 'داده کافی نیست' |
| همه یکسان | [60, 60, 60, 60] | status: 'ثابت', slope: 0 |
| صعودی واضح | [20, 40, 60, 80, 100] | status: 'صعودی', slope > 2 |
| نزولی واضح | [100, 80, 60, 40, 20] | status: 'نزولی', slope < -2 |
| ثابت نسبی | [50, 51, 49, 50] | status: 'ثابت', |slope| ≤ 2 |
| مرتب‌سازی | ورودی نامرتب | نتیجه = ورودی مرتب |
| دو نقطه | [30, 90] و [90, 30] | صعودی و نزولی |

### تست‌های getProgressTrend (نیاز به mock دیتابیس):

| تست | سناریو | نتیجه |
|-----|--------|-------|
| بدون آزمون | هیچ attempt ثبت‌شده‌ای نیست | quizScores: [] |
| بدون دوره | هیچ enrollment‌ای نیست | courseCompletion: [] |
| فیلتر دوره | courseId ارسال شده | فقط داده‌های آن دوره |

---

## ۱۱. نکات فنی مهم برای ارائه

### ۱. چرا از نمودار Line استفاده شد؟
- Line chart بهترین نمایش برای **داده‌های زمانی** (time series) است
- نشان‌دهنده **روند** (trend) در طول زمان
- امکان مقایسه دو متغیر مختلف (آزمون و دوره) در یک نمودار

### ۲. Rolling Completion چیست و چرا مهم است؟
- به‌جای نمایش فقط درصد نهایی، **هر مرحله تکمیل** نمایش داده می‌شود
- دانشجو می‌بیند با هر درس جدید، چقدر پیشرفت کرده
- ایجاد **نقطه داده بیشتر** برای نمودار → نمای بهتر روند

### ۳. چرا رگرسیون خطی (Least Squares)؟
- **سادگی:** فهم و پیاده‌سازی آسان
- **سرعت:** O(n) پیچیدگی
- **تفسیرپذیری:** شیب (slope) مستقیماً قابل تفسیر است
- ** Pure Function:** قابل تست بدون نیاز به دیتابیس
- **آستانه قابل تنظیم:** ±2 قابل تغییر است

### ۴. چرا تاریخ شمسی استفاده شد؟
- پروژه برای کاربران ایرانی است
- `toLocaleDateString('fa-IR')` تاریخ را به فرمت شمسی تبدیل می‌کند
- خوانایی بهتر برای کاربر نهایی

### ۵. بهینه‌سازی‌ها
- **Batch queries:** استفاده از `IN` operator برای دریافت یکجا داده‌ها
- **Distinct dates:** حذف تاریخ‌های تکراری در محور X
- **Lazy loading:** نمودار فقط وقتی رندر می‌شود که داده لود شده باشد
- **Error handling:** در صورت خطا، آرایه خالی برگردانده می‌شود (نه crash)

### ۶. ارتباط با سایر بخش‌ها
- **分类Trend** در اندپوینت‌های مدرس هم استفاده می‌شود:
  - `GET /analytics/students/:studentId/trend` → روند یک دانشجو
  - `GET /analytics/courses/:courseId/trend-overview` → روند همه دانشجویان
- **آستانه ±2** در همه اندپوینت‌ها یکسان است → ثبات تصمیم‌گیری

### ۷. فناوری‌های استفاده شده
| لایه | فناوری | دلیل |
|------|--------|-------|
| Backend | NestJS | معماری ماژولار و TypeScript-native |
| ORM | Prisma | Type-safe database queries |
| دیتابیس | SQL Server | پشتیبانی از groupBy و aggregate |
| فرانت‌اند | React + TypeScript | توسعه کامپوننت‌محور |
| نمودار | ApexCharts | نمودارهای تعاملی با انیمیشن صاف |
| HTTP | Axios | مدیریت درخواست‌ها |

---

## ۱۲. پاسخ به سوالات احتمالی داوران

### سوال ۱: اگر دانشجو هیچ آزمونی شرکت نکرده باشد چه می‌شود؟
**پاسخ:** تابع `getProgressTrend` دو آرایه خالی برمی‌گرداند. فرانت‌اند پیام "داده‌ای برای نمایش وجود ندارد" را نمایش می‌دهد. کارت‌های خلاصه هم عدد ۰ نشان می‌دهند.

### سوال ۲: اگر MaxScore صفر باشد چه می‌شود؟
**پاسخ:** در فرمول محاسبه درصد، شرط `a.MaxScore && Number(a.MaxScore) > 0` بررسی می‌شود. اگر صفر باشد، درصد ۰ در نظر گرفته می‌شود (تقسیم بر صفر رخ نمی‌دهد).

### سوال ۳: چرا آستانه ±2 برای شیب انتخاب شده؟
**پاسخ:** این یک **design decision** است. شیب ±2 به این معنی است که هر آزمون حدود ۲٪ تغییر کرده. اگر آستانه خیلی کوچک باشد (مثلاً ±0.5)، حتی تغییرات جزئی "صعودی" یا "نزولی" تشخیص داده می‌شود. اگر خیلی بزرگ باشد (مثلاً ±10)، فقط تغییرات خیلی بزرگ تشخیص داده می‌شود. ±2 تعادل مناسبی است.

### سوال ۴: آیا rolling completion دقیق است؟
**پاسخ:** بله. به‌ازای هر درس تکمیل‌شده، یک نقطه داده جداگانه ایجاد می‌شود. اگر دانشجو ۳ درس از ۱۰ درس را تکمیل کرده باشد، سه نقطه با درصدهای ۱۰٪، ۲۰٪، ۳۰٪ ایجاد می‌شود (نه فقط یک نقطه ۳۰٪).

### سوال ۵: عملکرد در تعداد زیاد آزمون چگونه است؟
**پاسخ:**
- `getProgressTrend`: O(n) برای پیمایش attempts + O(m) برای progress
- `classifyTrend`: O(n log n) به دلیل مرتب‌سازی + O(n) برای محاسبه شیب
- برای ۱۰۰ آزمون، کل عملکرد کمتر از ۱۰ms است

### سوال ۶: چرا دو سری داده در یک نمودار نمایش داده می‌شود؟
**پاسخ:** نمایش همزمان امکان **مقایسه بصری** را فراهم می‌کند:
- آیا نمرات آزمون با تکمیل دوره همبستگی دارند؟
- آیا وقتی دوره را تکمیل کرده، نمرات هم بهتر شده؟
- این اطلاعات اگر در دو نمودار جداگانه باشد، قابل مقایسه نیست

### سوال ۷: اگر دانشجو در چند دوره ثبت‌نام باشد چه می‌شود؟
**پاسخ:**
- بدون فیلتر: داده‌های **همه** دوره‌ها در یک نمودار نمایش داده می‌شود
- با فیلتر courseId: فقط داده‌های آن دوره خاص
- هر نقطه شامل `courseTitle` است که در tooltip نمایش داده می‌شود

### سوال ۸: آیا classifyTrend قابلیت پیش‌بینی دارد؟
**پاسخ:** خیر. classifyTrend فقط **وضعیت فعلی** را تحلیل می‌کند (گذشته‌نگر). برای پیش‌بینی نمرات آینده، الگوریتم‌های پیچیده‌تری مانند ARIMA یا Prophet لازم است که فراتر از Scope این پروژه است.

---

## خلاصه برای ارائه (۲ دقیقه)

> **فیچر روند پیشرفت** یک نمودار Line تعاملی است که دو معیار کلیدی را نمایش می‌دهد: نمرات آزمون (خط بنفش) و درصد تکمیل دوره (خط سبز).
>
> **الگوریتم اصلی** تابع `getProgressTrend` است که:
> 1. نمرات آزمون را از جدول QuizAttempts دریافت و درصد آنها را محاسبه می‌کند
> 2. دروس تکمیل‌شده را به‌صورت Rolling (تجمعی) محاسبه می‌کند
> 3. هر دو سری داده را بر اساس تاریخ مرتب و به فرانت‌اند برمی‌گرداند
>
> **تشخیص روند** با تابع `classifyTrend` انجام می‌شود که از **رگرسیون خطی ساده (Least Squares)** استفاده می‌کند:
> - شیب > +2 → صعودی
> - شیب < -2 → نزولی
> - |شیب| ≤ 2 → ثابت
>
> **فناوری‌ها:** NestJS (Backend)، Prisma (ORM)، React + ApexCharts (Frontend)، SQL Server (دیتابیس).
>
> **نکته مهم:** داده‌های روند در اندپوینت‌های مدرس هم استفاده می‌شود — امکان مشاهده روند همه دانشجویان یک دوره برای مدرس فراهم شده.
