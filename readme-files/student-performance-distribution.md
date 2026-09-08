# نمودار پراکنش عملکرد دانشجویان — توضیحات فنی کامل

## ۱. مرور کلی

نمودار **پراکنش عملکرد دانشجویان** یک نمودار **Scatter (پراکندگی)** تعاملی است که در **داشبورد تحلیلی مدرس** (`/instructor/analytics`) قرار دارد. این نمودار هر دانشجو را به صورت یک نقطه روی دو محور نمایش می‌دهد:

| محور | مقدار | دامنه |
|------|-------|-------|
| **محور X (افقی)** | درصد تکمیل دوره (Progress Percent) | 0 تا 100 |
| **محور Y (عمودی)** | نمره آزمون (Quiz Score Percent) | 0 تا 100 |

**هدف:** مدرس بتواند در یک نگاه، وضعیت کلی یادگیری تمام دانشجویان یک دوره را بسنجد و الگوهای عملکردی را شناسایی کند.

---

## ۲. معماری سیستم

### ۲.۱ نمودار لایه‌بندی (Layer Architecture)

```
┌─────────────────────────────────────────────────┐
│              فرانت‌اند (React)                    │
│  InstructorCourseAnalytics.tsx                   │
│  └─ StudentOverviewChart (ApexCharts Scatter)    │
│  └─ analytics.service.ts (API calls)             │
├─────────────────────────────────────────────────┤
│              بک‌اند (NestJS)                      │
│  AnalyticsController                             │
│  └─ GET /analytics/courses/:courseId/students     │
│  AnalyticsService                                │
│  └─ getCourseStudentAnalytics()                  │
├─────────────────────────────────────────────────┤
│              دیتابیس (SQL Server + Prisma)        │
│  Enrollments ── Users                             │
│  CourseProgress ── Lessons                        │
│  QuizAttempts ── QuizAttemptAnswers ── QuizQuestions│
│  Certificates                                     │
└─────────────────────────────────────────────────┘
```

### ۲.۲ کامپوننت‌های مرتبط

| فایل | نقش |
|------|-----|
| `InstructorCourseAnalytics.tsx` | صفحه اصلی داشبورد تحلیلی مدرس — شامل نمودار Scatter + Radar + جدول |
| `StudentOverviewChart` (function) | کامپوننت داخلی برای رندر نمودار پراکنش |
| `SkillMiniBar` (function) | ویجت نوار مهارت برای ردیف قابل بازشدن هر دانشجو |
| `TrendBadge.tsx` | بج وضعیت روند یادگیری + Sparkline + مودال جزئیات |
| `analytics.service.ts` (فرانت) | سرویس API برای ارتباط با بک‌اند |
| `analytics.service.ts` (بک‌اند) | سرویس تحلیلی — محاسبه مهارت، روند، پیشرفت |
| `analytics.controller.ts` | کنترلر REST با احراز هویت و نقش‌محور |

---

## ۳. مدل داده‌ای (Prisma Schema)

### جدول‌های مرتبط

```prisma
// پیشرفت درسی هر دانشجو
model CourseProgress {
  Id          Int       @id @default(autoincrement())
  Course_Id   Int
  Lesson_Id   Int
  Student_Id  Int
  IsCompleted Boolean?  @default(false)
  CompletedAt DateTime?
  // Unique constraint: [Lesson_Id, Student_Id]
}

// تلاش آزمون
model QuizAttempts {
  Id          Int       @id @default(autoincrement())
  Quiz_Id     Int
  Student_Id  Int
  StartedAt   DateTime  @default(now())
  DeadlineAt  DateTime
  SubmittedAt DateTime?
  Score       Decimal?  @db.Decimal(5, 2)
  MaxScore    Decimal?  @db.Decimal(5, 2)
  IsPassed    Boolean?
}

// پاسخ‌های آزمون
model QuizAttemptAnswers {
  Id          Int       @id @default(autoincrement())
  Attempt_Id  Int
  Question_Id Int
  Choice_Id   Int?
  IsCorrect   Boolean?
}

// سوالات آزمون (شامل برچسب مهارت)
model QuizQuestions {
  Id          Int    @id @default(autoincrement())
  SkillTag    String? @db.NVarChar(200)
  // ...
}

// گواهینامه
model Certificates {
  Id              Int      @id @default(autoincrement())
  Student_Id      Int
  Course_Id       Int
  Attempt_Id      Int      @unique
  CertificateCode String   @unique
  Score           Decimal  @db.Decimal(5, 2)
  MaxScore        Decimal  @db.Decimal(5, 2)
  IssuedAt        DateTime @default(now())
}

// ثبت‌نام
model Enrollments {
  Id             Int      @id @default(autoincrement())
  Student_Id     Int
  Course_Id      Int
  EnrollmentDate DateTime @default(now())
}
```

### روابط کلیدی

```
Enrollments ──(Student_Id)──▶ Users
Enrollments ──(Course_Id)──▶ Courses
CourseProgress ──(Student_Id)──▶ Users
CourseProgress ──(Course_Id)──▶ Courses
CourseProgress ──(Lesson_Id)──▶ Lessons
QuizAttempts ──(Student_Id)──▶ Users
QuizAttempts ──(Quiz_Id)──▶ Quizzes ──(Course_Id)──▶ Courses
QuizAttemptAnswers ──(Attempt_Id)──▶ QuizAttempts
QuizAttemptAnswers ──(Question_Id)──▶ QuizQuestions (SkillTag)
Certificates ──(Student_Id)──▶ Users
Certificates ──(Course_Id)──▶ Courses
```

---

## ۴. محاسبات و الگوریتم‌ها

### ۴.۱ محاسبه درصد تکمیل دوره (محور X)

```
progressPercent = round((completedLessons / totalLessons) × 100)
```

**پیاده‌سازی در بک‌اند:**

```typescript
// شمارش کل دروس منتشرشده دوره
const totalLessons = await this.prisma.lessons.count({
  where: { Course_Id: courseId, IsPublished: true },
});

// شمارش دروس تکمیل‌شده هر دانشجو (از جدول CourseProgress)
const progressGroups = await this.prisma.courseProgress.groupBy({
  by: ['Student_Id'],
  where: { Course_Id: courseId, IsCompleted: true },
  _count: { Lesson_Id: true },
});

// محاسبه درصد
const progressPercent = totalLessons > 0
  ? Math.round((completedLessons / totalLessons) * 100)
  : 0;
```

**منبع داده:** جدول `CourseProgress` — هر ردیف نشان‌دهنده تکمیل یک درس توسط یک دانشجوست.

### ۴.۲ محاسبه نمره آزمون (محور Y)

```
quizScorePercent = round((totalScore / totalMaxScore) × 100)
```

**پیاده‌سازی:**

```typescript
// همه تلاش‌های ثبت‌شده آزمون‌های دوره
const attempts = await this.prisma.quizAttempts.findMany({
  where: {
    Quiz_Id: { in: quizIds },
    SubmittedAt: { not: null },  // فقط آزمون‌های تحویل‌داده‌شده
  },
  select: {
    Student_Id: true,
    Score: true,       // نمره خام (Decimal)
    MaxScore: true,    // نمره максимال (Decimal)
    IsPassed: true,
  },
});

// جمع‌بندی نمرات هر دانشجو
const totalScore = studentAttempts.reduce((s, a) => s + Number(a.Score ?? 0), 0);
const totalMaxScore = studentAttempts.reduce((s, a) => s + Number(a.MaxScore ?? 0), 0);

const quizScorePercent = hasAttempted && totalMaxScore > 0
  ? Math.round((totalScore / totalMaxScore) * 100)
  : null;
```

**نکته:** اگر دانشجو هنوز در آزمون شرکت نکرده باشد، `quizScorePercent = null` است و نقطه‌ای برای او رسم نمی‌شود.

### ۴.۳ تحلیل مهارتی (Skill Breakdown)

هر سوال آزمون دارای یک **SkillTag** (برچسب مهارت) است. پاسخ‌های هر دانشجو بر اساس این برچسب گروه‌بندی می‌شوند:

```typescript
// helper function مشترک
groupBySkill(answers: { skillTag: string | null; isCorrect: boolean }[]): SkillStat[] {
  const map = new Map<string, { correct: number; total: number }>();

  for (const a of answers) {
    const tag = a.skillTag?.trim() || 'سایر';
    const bucket = map.get(tag) ?? { correct: 0, total: 0 };
    bucket.total += 1;
    if (a.isCorrect) bucket.correct += 1;
    map.set(tag, bucket);
  }

  return Array.from(map.entries()).map(([tag, { correct, total }]) => ({
    tag,
    correct,
    total,
    percentage: Math.round((correct / total) * 100),
  })).sort((a, b) => a.percentage - b.percentage);  // ضعیف‌ترین اول
}
```

**خروجی:** آرایه‌ای از `SkillStat` برای هر دانشجو:
```typescript
interface SkillStat {
  tag: string;       // مثال: "React Hooks", "State Management"
  correct: number;   // تعداد پاسخ صحیح
  total: number;     // تعداد کل سوالات این مهارت
  percentage: number; // درصد تسلط (0-100)
}
```

---

## ۵. فرانت‌اند — نمودار ApexCharts Scatter

### ۵.۱ ساختار داده برای نمودار

فقط دانشجویانی که در آزمون شرکت کرده‌اند (`hasAttempted = true`) در نمودار نمایش داده می‌شوند:

```typescript
const attempted = students.filter((s) => s.hasAttempted);

const series = [{
  name: "دانشجو",
  data: attempted.map((s) => ({
    x: s.progressPercent,      // محور X: پیشرفت دوره
    y: s.quizScorePercent ?? 0, // محور Y: نمره آزمون
    name: fullName(s),          // نام دانشجو (برای tooltip)
  })),
}];
```

### ۵.۲ تنظیمات ApexCharts

```typescript
const options: ApexOptions = {
  chart: {
    type: "scatter",
    toolbar: { show: false },       // حذف toolbar پیش‌فرض
    zoom: { enabled: false },       // غیرفعال‌کردن zoom
    animations: { enabled: true, speed: 800 },  // انیمیشن ورود
    dropShadow: { enabled: true, blur: 3, opacity: 0.1 },
  },
  xaxis: {
    title: { text: "درصد تکمیل دوره" },
    min: 0, max: 100, tickAmount: 5,
    labels: { formatter: (v) => `${v}٪` },
  },
  yaxis: {
    title: { text: "نمره آزمون" },
    min: 0, max: 100, tickAmount: 5,
    labels: { formatter: (v) => `${v}٪` },
  },
  markers: {
    size: 8,              // اندازه نقطه
    strokeWidth: 2,       // حاشیه سفید دور نقطه
    strokeColors: "#fff",
    hover: { size: 10 },  // بزرگ‌تر شدن در hover
  },
  colors: ["#7c3aed"],   // رنگ بنفش (brand color)
  grid: {
    borderColor: "#f1f5f9",
    strokeDashArray: 3,   // خطوط نقطه‌چین
  },
  tooltip: {
    custom: ({ seriesIndex, dataPointIndex, w }) => {
      const d = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
      return `<div class="px-3 py-2 small" style="direction: rtl;">
        <strong>${d.name}</strong><br/>
        پیشرفت: ${d.x}٪ | نمره: ${d.y}٪
      </div>`;
    },
  },
};
```

### ۵.۳ خوانش نمودار (Reading the Chart)

| موقعیت نقطه | معنا |
|-------------|------|
| بالا-راست (X↑, Y↑) | ⭐ دانشجوی ممتاز: پیشرفت بالا + نمره بالا |
| بالا-چپ (X↓, Y↑) | 🧠 باهوش ولی کم‌کار: نمره خوب ولی دروس کمتری تکمیل کرده |
| پایین-راست (X↑, Y↓) | 📚 مطالعه‌گر ولی ضعیف در آزمون: دروس زیادی تکمیل کرده ولی نمره پایین |
| پایین-چپ (X↓, Y↓) | ⚠️ در خطر: هم پیشرفت کم و هم نمره پایین |
| وسط نمودار | 📊 عملکرد متوسط |

---

## ۶. API Endpoints مرتبط

### Endpoint اصلی نمودار

```
GET /analytics/courses/:courseId/students
Authorization: Bearer <JWT>
Role: 2 (مدرس) یا 3 (ادمین)
```

**خروجی (JSON):**
```json
[
  {
    "studentId": 42,
    "firstName": "علی",
    "lastName": "احمدی",
    "email": "ali@example.com",
    "avatar": "/uploads/avatars/abc.jpg",
    "enrollmentDate": "2026-03-15T10:30:00.000Z",
    "completedLessons": 8,
    "totalLessons": 12,
    "progressPercent": 67,
    "hasAttempted": true,
    "quizScorePercent": 85,
    "isPassed": true,
    "certificate": {
      "Score": 85.00,
      "MaxScore": 100.00,
      "IssuedAt": "2026-05-20T14:00:00.000Z"
    },
    "skillBreakdown": [
      { "tag": "React Hooks", "correct": 5, "total": 6, "percentage": 83 },
      { "tag": "State Management", "correct": 3, "total": 5, "percentage": 60 }
    ]
  }
]
```

### Endpoint روند یادگیری ( Trend Overview)

```
GET /analytics/courses/:courseId/trend-overview
Authorization: Bearer <JWT>
Role: 2 یا 3
```

**خروجی:**
```json
{
  "courseId": 5,
  "students": [
    {
      "studentId": 42,
      "firstName": "علی",
      "lastName": "احمدی",
      "trendStatus": "صعودی",
      "slope": 5.2,
      "quizCount": 4,
      "latestScore": 88
    }
  ]
}
```

---

## ۷. جدول خلاصه عملکرد دانشجویان

زیر نمودار Scatter، یک **جدول تعاملی** نمایش داده می‌شود که شامل این ستون‌هاست:

| ستون | توضیح |
|------|-------|
| ▼ (expand) | با کلیک، ردیف باز می‌شود و SkillBreakdown + تاریخ ثبت‌نام نمایش داده می‌شود |
| دانشجو | نام + آواتار + ایمیل |
| پیشرفت دوره | نوار پیشرفت + درصد + تعداد درس تکمیل‌شده |
| نمره آزمون | بج رنگی (سبز ≥70%, زرد ≥40%, قرمز <40%) |
| روند یادگیری | بج TrendBadge (صعودی/نزولی/ثابت) + Sparkline خطی |
| وضعیت | قبول/مردود |
| گواهینامه | آیا گواهینامه دارد یا خیر |

### ۷.۱ روند یادگیری — الگوریتم رگرسیون خطی

```typescript
classifyTrend(scores: { date: Date; percentage: number }[]): TrendClassification {
  // حداقل 2 نقطه لازم است
  if (scores.length < 2) return { status: 'داده کافی نیست', slope: 0 };

  // مرتب‌سازی بر اساس تاریخ
  const sorted = [...scores].sort((a, b) => new Date(a.date) - new Date(b.date));

  // محاسبه شیب با رگرسیون خطی (least squares)
  // x: شماره آزمون (0, 1, 2, ...)
  // y: درصد نمره
  const n = sorted.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += sorted[i].percentage;
    sumXY += i * sorted[i].percentage;
    sumX2 += i * i;
  }

  // فرمول شیب: m = (n·ΣXY - ΣX·ΣY) / (n·ΣX² - (ΣX)²)
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // طبقه‌بندی:
  if (slope > 2)   return { status: 'صعودی', slope };
  if (slope < -2)  return { status: 'نزولی', slope };
  return { status: 'ثابت', slope };
}
```

| وضعیت | شرط | رنگ بج |
|--------|------|--------|
| صعودی ↑ | شیب > +2 | سبز (success) |
| نزولی ↓ | شیب < -2 | قرمز (danger) |
| ثابت — | -2 ≤ شیب ≤ +2 | خاکستری (secondary) |
| داده کافی نیست | تعداد آزمون < 2 | روشن (light) |

---

## ۸. نمودار رادار مهارتی کلاس (Class Skill Radar)

در کنار نمودار Scatter، یک نمودار **Radar (عنکبوتی)** نیز نمایش داده می‌شود:

- **ورودی:** تجمیع تمام `skillBreakdown` های تمام دانشجویان
- **خروجی:** برای هر `SkillTag`، میانگین درصد تسلط کل کلاس
- **رنگ:** سبز (#10b981) با opacity 0.25
- **نوع ApexCharts:** `type: "radar"`

```typescript
// تجمیع مهارت‌های کل کلاس
const map = new Map<string, { correct: number; total: number }>();
for (const s of students) {
  for (const sk of s.skillBreakdown) {
    const b = map.get(sk.tag) ?? { correct: 0, total: 0 };
    b.correct += sk.correct;
    b.total += sk.total;
    map.set(sk.tag, b);
  }
}
// محاسبه میانگین برای هر مهارت
const percentages = tags.map((t) => {
  const b = map.get(t)!;
  return b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0;
});
```

---

## ۹. بنر مهارت‌های ضعیف

اگر میانگین تسلط کلاس در هر مهارتی **کمتر از 70٪** باشد، یک بنر هشدار نارنجی رنگ با لیست ۳ مهارت ضعیف‌تر نمایش داده می‌شود:

```
⚠️ ضعیف‌ترین مهارت‌های کلاس
[React Hooks (60٪)]  [State Management (45٪)]
→ این مهارت‌ها نیاز به تدریس مجدد یا تمرین بیشتر دارند.
```

---

## ۱۰. جریان داده‌ها (Data Flow)

```
۱. مدرس دوره‌ای را از dropdown انتخاب می‌کند
         │
۲. handleCourseChange() فراخوانی می‌شود
         │
۳. دو درخواست موازی ارسال می‌شود:
   ├─ GET /analytics/courses/:id/students  → اطلاعات دانشجویان
   └─ GET /analytics/courses/:id/trend-overview  → روند یادگیری
         │
۴. بک‌اند برای هر دانشجو:
   ├─ از Enrollments → نام، ایمیل، آواتار
   ├─ از CourseProgress → تعداد دروس تکمیل‌شده
   ├─ از QuizAttempts → نمره آزمون
   ├─ از QuizAttemptAnswers + QuizQuestions → SkillBreakdown
   └─ از Certificates → وضعیت گواهینامه
         │
۵. فرانت‌اند:
   ├─ StudentOverviewChart → نمودار Scatter رسم می‌شود
   ├─ ClassSkillRadar → نمودار Radar رسم می‌شود
   ├─ جدول دانشجویان → لیست + TrendBadge + ردیف قابل بازشدن
   └─ بنر مهارت‌های ضعیف → در صورت وجود
```

---

## ۱۱. امنیت و کنترل دسترسی

| لایه | مکانیزم |
|------|---------|
| **احراز هویت** | JWT Bearer Token (AuthGuard) |
| **نقش‌محوری** | RolesGuard — فقط نقش 2 (مدرس) و 3 (ادمین) |
| **مالکیت دوره** | مدرس فقط دوره‌های خودش (`Teacher_Id === user.id`) |
| **دمی‌モード** | ادمین به تمام دوره‌ها دسترسی دارد |

```typescript
// کنترل مالکیت در بک‌اند
const course = await this.prisma.courses.findUnique({
  where: { Id: courseId },
  select: { Teacher_Id: true },
});
if (currentUser.roleId !== 3 && course.Teacher_Id !== currentUser.id) {
  throw new ForbiddenException('دسترسی مجاز نیست.');
}
```

---

## ۱۲. بهینه‌سازی و عملکرد

| بهینه‌سازی | توضیح |
|-----------|-------|
| **Parallel Queries** | دریافت اطلاعات دانشجویان و روند به صورت موازی (`Promise.all`) |
| **groupBy** | استفاده از `groupBy` Prisma برای شمارش تکمیل دروس بدون N+1 |
| **Conditional Queries** | اگر آزمونی وجود نداشته باشد، کوئری آزمون اجرا نمی‌شود |
| **Filter Client-side** | فقط دانشجویانی که آزمون داده‌اند در Scatter نمایش داده می‌شوند |
| **ApexCharts Animations** | انیمیشن ورود با سرعت 800ms |
| **Lazy Render** | جدول فقط وقتی رندر می‌شود که `students.length > 0` |

---

## ۱۳. فلوچارت تصمیم‌گیری استخراج داده

```
┌────────────────────────┐
│ courseId دریافت شد      │
└──────────┬─────────────┘
           ▼
┌────────────────────────┐
│ آیا دوره وجود دارد؟    │──── خیر ──▶ NotFoundException
└──────────┬─────────────┘
           │ بله
           ▼
┌────────────────────────┐
│ آیا مدرس مالک دوره     │──── خیر ──▶ ForbiddenException
│ یا ادمین است؟          │
└──────────┬─────────────┘
           │ بله
           ▼
┌────────────────────────┐
│ دریافت Enrollments     │
│ ──────────────────────│
│ دریافت totalLessons    │
│ دریافت CourseProgress  │
│ دریافت QuizAttempts    │
│ دریافت Answers+Skills  │
│ دریافت Certificates    │
└──────────┬─────────────┘
           ▼
┌────────────────────────┐
│ تجمیع و تبدیل برای     │
│ هر دانشجو              │
└──────────┬─────────────┘
           ▼
┌────────────────────────┐
│ بازگشت آرایه خروجی     │
└────────────────────────┘
```

---

## ۱۴. سوالات احتمالی استاد + پاسخ‌های فنی

### سوال ۱: چرا از Scatter Chart استفاده کردید نه Bar Chart؟
**پاسخ:** Scatter Chart امکان نمایش هم‌زمان دو متغیر (پیشرفت دوره و نمره آزمون) برای هر دانشجو را فراهم می‌کند. Bar Chart فقط یک متغیر را نشان می‌دهد. با Scatter می‌توانیم الگوهای عملکردی مثل "دانشجویانی که زیاد درس خواندن ولی نمره خوب نگرفتن" را شناسایی کنیم.

### سوال ۲: رگرسیون خطی را چگونه محاسبه می‌کنید؟
**پاسخ:** از فرمول **Least Squares** استفاده می‌کنیم. متغیر مستقل x شماره آزمون (0, 1, 2, ...) و متغیر وابسته y درصد نمره است. شیب خط با فرمول `m = (n·ΣXY - ΣX·ΣY) / (n·ΣX² - (ΣX)²)` محاسبه می‌شود. آستانه ±2 واحد درصد تعیین می‌کند که روند صعودی، نزولی یا ثابت باشد.

### سوال ۳: SkillTag از کجا می‌آید؟
**پاسخ:** هر سوال آزمون دارای فیلد `SkillTag` در جدول `QuizQuestions` است. مدرس هنگام ساخت سوال، برچسب مهارتی (مثلاً "React Hooks") را مشخص می‌کند. پاسخ‌های دانشجو بر اساس این برچسب گروه‌بندی و تحلیل می‌شوند.

### سوال ۴: اگر دانشجویی آزمون نداده باشد چه می‌شود؟
**پاسخ:** آن دانشجو از نمودار Scatter حذف می‌شود (فیلتر `hasAttempted`). در جدول، وضعیت "شرکت نکرده" نمایش داده می‌شود. روند یادگیری نیز "داده کافی نیست" خواهد بود.

### سوال ۵: مکانیزم کش یا بهینه‌سازی query چیست؟
**پاسخ:** از `groupBy` Prisma برای اجتناب از N+1 Query استفاده می‌کنیم. دریافت اطلاعات دانشجویان و روند با `Promise.all` به صورت موازی انجام می‌شود. شرطی کردن کوئری‌ها (مثلاً اگر quizIds خالی باشد، query آزمون اجرا نمی‌شود) نیز به بهینه‌سازی کمک می‌کند.

### سوال ۶: ApexCharts چیست و چرا آن را انتخاب کردید؟
**پاسخ:** ApexCharts یک کتابخانه رایگان و متن‌باز برای رسم نمودار در JavaScript است. مزایای آن: پشتیبانی از انواع نمودار (Scatter, Radar, Line, Bar)، tooltip سفارشی، انیمیشن‌های روان، و پشتیبانی از React از طریق `react-apexcharts`. در مقایسه با Chart.js، ApexCharts گزینه‌های سفارشی‌سازی بیشتری برای tooltip و marker دارد.

### سوال ۷: چگونه از نظر امنیتی مطمئن می‌شوید مدرس فقط دانشجویان دوره خودش را ببیند؟
**پاسخ:** سه لایه امنیتی داریم: (۱) احراز هویت JWT، (۲) نقش‌محوری با RolesGuard که فقط نقش ۲ و ۳ اجازه دسترسی دارند، (۳) بررسی مالکیت دوره که `Teacher_Id` دوره باید با `user.id` مدرس برابر باشد. ادمین (نقش ۳) به تمام دوره‌ها دسترسی دارد.

### سوال ۸: چطور مهارت‌های ضعیف کلاس را شناسایی می‌کنید؟
**پاسخ:** تمام `skillBreakdown` های تمام دانشجویان را تجمیع می‌کنیم (جمع صحیح‌ها و جمع کل برای هر SkillTag). سپس درصد میانگین هر مهارت را محاسبه می‌کنیم. مهارت‌هایی که درصد میانگین کلاسی آن‌ها کمتر از ۷۰٪ باشد، به عنوان "ضعفیف" شناسایی و در بنر نارنجی رنگ نمایش داده می‌شوند.

### سوال ۹: محدودیت‌های این نمودار چیست؟
**پاسخ:** (۱) فقط دانشجویانی که آزمون داده‌اند نمایش داده می‌شوند. (۲) نمودار Scatter برای تعداد زیاد دانشجو (مثلاً +۱۰۰) شلوغ می‌شود. (۳) رگرسیون خطی ساده است و اثرات خارجی (مثل غیبت) را در نظر نمی‌گیرد. (۴) SkillTag ها باید توسط مدرس به صورت دستی تعریف شوند.

### سوال ۱۰: چطور می‌توان این سیستم را گسترش داد؟
**پاسخ:** (۱) اضافه کردن فیلتر زمانی برای بازه آزمون‌ها. (۲) اضافه کردن خط روند (Trend Line) به نمودار Scatter. (۳) استفاده از Machine Learning برای پیش‌بینی عملکرد آینده. (۴) نمایش مقایسه‌ای بین دوره‌های مختلف. (۵) صادرات گزارش به PDF/Excel.
