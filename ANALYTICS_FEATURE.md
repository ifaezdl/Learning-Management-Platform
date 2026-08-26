# مستندات فنی فیچر: داشبورد تحلیل یادگیری (Learning Analytics Dashboard)

---

## ۱. خلاصه فیچر

این فیچر یک سیستم تحلیل یادگیری هوشمند به پلتفرم EduCore اضافه می‌کند که به دانشجو نشان می‌دهد در کدام مهارت‌ها ضعیف است، نمراتش در طول زمان چه روندی داشته، و پس از قبولی در آزمون، مستقیماً در گواهینامه‌اش می‌بیند کجا باید بیشتر تمرین کند.

---

## ۲. تغییرات پایگاه داده

### فایل تغییر یافته: `backend/prisma/schema.prisma`

**چه تغییری انجام شد:**
یک فیلد جدید به جدول `QuizQuestions` اضافه شد:

```prisma
SkillTag String? @db.NVarChar(200)
```

**چرا این فیلد؟**
هر سوال آزمون حالا یک برچسب مهارتی دارد — مثلاً «حلقه‌های تکرار»، «مدیریت حافظه»، «شی‌گرایی». این برچسب است که به سیستم می‌گوید هر سوال چه مفهومی را می‌سنجد. بدون این برچسب، تحلیل مهارتی امکان‌پذیر نبود.

فیلد nullable است — یعنی سوالات قدیمی بدون برچسب همچنان کار می‌کنند و چیزی نمی‌شکند.

**دستورات اجرا شده:**
```bash
npx prisma db push     # ستون را در SQL Server ایجاد کرد
npx prisma generate    # Prisma Client را بازسازی کرد
```

---

## ۳. تغییرات موتور هوش مصنوعی تولید سوال

### فایل تغییر یافته: `backend/src/quiz/quiz.service.ts`

قبل از این فیچر، موتور AI فقط سوال و گزینه‌ها تولید می‌کرد. حالا به ازای هر سوال یک برچسب مهارتی فارسی هم تولید می‌کند.

#### تغییر ۱ — پرامپت سیستم به مدل Qwen3-4b

**قبل:**
```
{"questionText": "...", "choices": [...]}
```

**بعد:**
```
{
  "questionText": "...",
  "skillTag": "برچسب مهارت (۲ تا ۴ کلمه فارسی، مثلاً 'مدیریت حافظه')",
  "choices": [...]
}
```

مدل حالا موظف است برای هر سوال یک برچسب کوتاه فارسی بنویسد که مفهوم اصلی آن سوال را توصیف می‌کند و با اهداف یادگیری دوره هم‌راستا باشد.

#### تغییر ۲ — تابع `extractJsonArray`

این تابع خروجی خام مدل AI را پردازش می‌کند. حالا:
- `skillTag` را از JSON خروجی مدل می‌خواند
- اگر مدل آن را برنگرداند (edge case)، از نام دسته‌بندی دوره به عنوان fallback استفاده می‌کند
- اگر آن هم موجود نبود، رشته خالی برمی‌گرداند — یعنی هیچ‌وقت تولید سوال fail نمی‌شود

#### تغییر ۳ — ذخیره‌سازی SkillTag

در متد `saveQuiz`، وقتی مدرس سوالات تأییدشده را ذخیره می‌کند، `SkillTag` هم به جدول `QuizQuestions` نوشته می‌شود:

```typescript
const question = await tx.quizQuestions.create({
  data: {
    ...
    SkillTag: q.skillTag ?? null,
  },
});
```

### فایل تغییر یافته: `backend/src/quiz/dto/save-quiz.dto.ts`

فیلد `skillTag?: string` به `QuizQuestionDto` اضافه شد تا مدرس بتواند هنگام ساخت دستی سوال هم برچسب مهارتی تعیین کند.

---

## ۴. ماژول Analytics — بک‌اند

### فایل جدید: `backend/src/analytics/analytics.service.ts`

این سرویس مغز تحلیل است. شامل یک تابع کمکی순 pure و چهار متد اصلی:

#### تابع `groupBySkill` (pure function — قلب سیستم)

```typescript
groupBySkill(answers: { skillTag: string | null, isCorrect: boolean }[]): SkillStat[]
```

این تابع آرایه‌ای از پاسخ‌ها می‌گیرد و به تفکیک هر برچسب مهارتی حساب می‌کند:
- چند سوال از این مهارت بوده (`total`)
- چند تا درست جواب داده شده (`correct`)
- درصد تسلط (`percentage = Math.round(correct/total*100)`)

خروجی را از ضعیف‌ترین به قوی‌ترین مرتب می‌کند. اگر سوالی برچسب نداشته باشد، زیر دسته «سایر» می‌رود.

#### اندپوینت ۱ — تحلیل یک آزمون خاص

```
GET /analytics/attempts/:attemptId/skills
```

- بررسی مالکیت: دانشجو فقط آزمون خودش را می‌بیند، مدرس فقط دوره خودش، ادمین همه چیز
- پاسخ‌های آن attempt را از `QuizAttemptAnswers` لود می‌کند
- Join با `QuizQuestions` برای گرفتن `SkillTag`
- خروجی: آرایه مهارت‌ها مرتب از ضعیف‌ترین به قوی‌ترین

نمونه خروجی:
```json
{
  "attemptId": 12,
  "skills": [
    { "tag": "حلقه‌های تکرار", "correct": 1, "total": 5, "percentage": 20 },
    { "tag": "مدیریت حافظه",   "correct": 4, "total": 5, "percentage": 80 }
  ]
}
```

#### اندپوینت ۲ — پروفایل مهارتی تجمعی دانشجو

```
GET /analytics/students/me/skills?courseId=<optional>
```

- همان منطق groupBySkill، اما روی همه آزمون‌های submit‌شده دانشجو
- اگر `courseId` پاس شود، فقط آزمون‌های آن دوره را در نظر می‌گیرد
- این داده برای رادار چارت فرانت‌اند استفاده می‌شود

#### اندپوینت ۳ — روند پیشرفت در طول زمان

```
GET /analytics/students/me/progress-trend?courseId=<optional>
```

دو سری داده برمی‌گرداند:

**سری اول — نمرات آزمون:**
برای هر آزمون submit‌شده: تاریخ ارسال، درصد نمره، نام دوره

**سری دوم — درصد تکمیل دوره:**
برای هر درس تکمیل‌شده (`CourseProgress` جدول)، درصد تجمعی پیشرفت در آن دوره محاسبه می‌شود. مثلاً اگر دوره ۱۰ درس داشته باشد و دانشجو ۳ درس تمام کرده باشد، نقطه آن تاریخ = 30%.

نمونه خروجی:
```json
{
  "quizScores": [
    { "date": "2026-05-01T...", "percentage": 65, "courseTitle": "برنامه‌نویسی پایتون" }
  ],
  "courseCompletion": [
    { "date": "2026-05-01T...", "percentage": 30, "courseTitle": "برنامه‌نویسی پایتون" }
  ]
}
```

#### اندپوینت ۴ — نمای کلاسی برای مدرس

```
GET /analytics/courses/:courseId/skills-overview
```

- فقط مدرس صاحب دوره یا ادمین می‌توانند دسترسی داشته باشند
- همه آزمون‌های همه دانشجویان آن دوره را تجمیع می‌کند
- نشان می‌دهد کل کلاس در کدام مهارت‌ها ضعیف است — داده قابل استفاده برای طراحی مجدد محتوا

### فایل جدید: `backend/src/analytics/analytics.controller.ts`

چهار endpoint با decorator های کامل Swagger (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiQuery`). قابل مشاهده در `http://localhost:3000/api/docs`.

### فایل جدید: `backend/src/analytics/analytics.module.ts`

ماژول NestJS که `AnalyticsService` را export می‌کند تا ماژول Certificates بتواند آن را inject کند.

### فایل تغییر یافته: `backend/src/app.module.ts`

`AnalyticsModule` به آرایه `imports` اضافه شد.

---

## ۵. غنی‌سازی پاسخ گواهینامه

### فایل‌های تغییر یافته:
- `backend/certificates/certificates.service.ts`
- `backend/certificates/certificates.module.ts`

**چه اتفاقی افتاد:**
وقتی دانشجو یک گواهینامه خاص را باز می‌کند (`GET /certificates/:id`)، پاسخ حالا یک فیلد اضافه دارد:

```json
{
  "Id": 5,
  "CertificateCode": "CERT-3-12-1720000000000",
  "Score": 85,
  "MaxScore": 100,
  "Courses": { "Title": "برنامه‌نویسی پایتون" },
  "skillBreakdown": [
    { "tag": "حلقه‌های تکرار", "correct": 2, "total": 5, "percentage": 40 },
    { "tag": "مدیریت حافظه",   "correct": 5, "total": 5, "percentage": 100 }
  ]
}
```

**نکته مهم:** تراکنش اصلی ثبت آزمون و صدور گواهینامه دست‌نخورده باقی ماند. `skillBreakdown` فقط در لحظه خواندن گواهینامه محاسبه می‌شود (read-side enrichment). اگر داده‌ای وجود نداشت، آرایه خالی برمی‌گردد — هیچ‌وقت خطا نمی‌دهد.

`CertificatesModule` حالا `AnalyticsModule` را import می‌کند تا `AnalyticsService` قابل inject باشد.

---

## ۶. فرانت‌اند — سرویس

### فایل جدید: `FrontEnd/src/services/analytics.service.ts`

یک کلاس Axios service با چهار متد منطبق با endpoint های بک‌اند:

```typescript
analyticsService.getAttemptSkills(attemptId)
analyticsService.getMySkillProfile(courseId?)
analyticsService.getProgressTrend(courseId?)
analyticsService.getCourseSkillsOverview(courseId)
```

از همان instance مشترک `api.ts` استفاده می‌کند — یعنی token injection خودکار و silent token refresh بدون نیاز به تغییر اضافه.

---

## ۷. صفحه جدید: داشبورد تحلیل یادگیری

### فایل جدید: `FrontEnd/src/feature-module/student/analytics/LearningAnalytics.tsx`

**مسیر دسترسی:** `/student/analytics` — فقط برای دانشجویان (role = 1)

این صفحه سه بخش اصلی دارد:

### بخش اول — بنر هشدار مهارت‌های ضعیف

در بالای صفحه، یک بنر نارنجی نشان می‌دهد:

```
⚠️ نیاز به مرور بیشتر در: حلقه‌های تکرار (20٪)، توابع بازگشتی (35٪)
```

این بنر از همان داده‌ای که برای رادار چارت fetch می‌شود می‌آید — بدون endpoint جداگانه. سه ضعیف‌ترین مهارت را نشان می‌دهد.

### بخش دوم — رادار چارت مهارتی (ApexCharts `type="radar"`)

هر محور یک برچسب مهارتی است. مقدار هر محور = درصد پاسخ صحیح در آن مهارت.

- داده از endpoint 2 (`GET /analytics/students/me/skills`) می‌آید
- زیر چارت یک جدول کوچک هم هست که exact عدد را نشان می‌دهد
- رنگ badge در جدول: سبز ≥ 70٪، زرد ≥ 40٪، قرمز < 40٪

### بخش سوم — خط‌نمودار روند پیشرفت (ApexCharts `type="line"`)

دو سری روی یک محور زمانی:
- **بنفش** — نمره آزمون (درصد)
- **سبز** — درصد تکمیل دوره

داده از endpoint 3 (`GET /analytics/students/me/progress-trend`) می‌آید. محور X تاریخ‌های فارسی است.

### بخش چهارم — کارت‌های خلاصه آماری

سه کارت ساده:
1. تعداد آزمون‌های تکمیل‌شده
2. میانگین نمره آزمون
3. میانگین تسلط مهارتی

### فیلتر دوره

یک dropdown در header صفحه. لیست دوره‌ها از `/courses/enrolled` می‌آید. با انتخاب هر دوره، هر دو endpoint داده را فیلتر می‌کنند.

---

## ۸. ویجت تحلیل مهارتی در صفحه گواهینامه

### فایل تغییر یافته: `FrontEnd/src/feature-module/student/student-certificates/student-certificates.tsx`

**کامپوننت جدید درون فایل: `SkillBreakdownWidget`**

وقتی دانشجو روی «مشاهده گواهینامه» کلیک می‌کند، مودال باز می‌شود. زیر تصویر گواهینامه، این ویجت نمایش داده می‌شود:

1. **بنر نارنجی** — «نیاز به مرور بیشتر در: [مهارت‌های ضعیف]»
2. **Progress bar برای هر مهارت** — رنگ‌بندی سبز/زرد/قرمز بر اساس درصد
3. عدد دقیق `correct/total (درصد٪)` کنار هر مهارت

**نحوه کار:**
وقتی `openView(cert)` فراخوانی می‌شود، علاوه بر ست کردن `viewingCert`، یک call به `certificateService.getCertificate(cert.Id)` هم می‌زند. پاسخ شامل `skillBreakdown[]` است که state را آپدیت می‌کند. اگر call fail شد (edge case)، ویجت فقط render نمی‌شود — چیزی نمی‌شکند.

---

## ۹. مسیریابی و منوی ناوبری

### فایل تغییر یافته: `FrontEnd/src/feature-module/router/all_routes.tsx`

```typescript
studentAnalytics: "/student/analytics"
```

### فایل تغییر یافته: `FrontEnd/src/feature-module/router/router.link.tsx`

```tsx
{
  path: routes.studentAnalytics,
  element: (
    <RoleRoute roles={[1]}>
      <LearningAnalytics />
    </RoleRoute>
  ),
}
```

### فایل تغییر یافته: `FrontEnd/src/core/common/data/json/student-sidebar.tsx`

آیتم جدید در منوی کناری دانشجو، بعد از «گواهینامه‌های من»:

```typescript
{
  title: "تحلیل یادگیری",
  icon: "isax isax-chart-2",
  route: all_routes.studentAnalytics,
}
```

---

## ۱۰. تست‌های واحد

### فایل جدید: `backend/src/analytics/analytics.service.spec.ts`

**۲۱ تست، همه pass:**

| گروه | تعداد تست | چه چیزی تست می‌شود |
|---|---|---|
| `groupBySkill` | 7 | محاسبه درصد، fallback به «سایر»، ورودی خالی، 0٪، 100٪، مرتب‌سازی صعودی، tag های مختلط |
| `getAttemptSkills` | 5 | 404 وقتی attempt نیست، forbidden دانشجوی دیگر، دسترسی مالک، دسترسی ادمین، forbidden مدرس بیگانه |
| `getMySkillProfile` | 2 | بدون attempt، تجمیع چند attempt |
| `getCourseSkillsOverview` | 5 | 404 دوره، forbidden مدرس، ادمین، بدون quiz، تجمیع کل کلاس |
| defined | 1 | سرویس instantiate می‌شود |

`PrismaService` با jest.fn() کامل mock شده — تست‌ها به دیتابیس نیاز ندارند.

---

## ۱۱. خلاصه فایل‌های تغییر یافته

| فایل | نوع تغییر | توضیح |
|---|---|---|
| `backend/prisma/schema.prisma` | تغییر | اضافه کردن `SkillTag` به `QuizQuestions` |
| `backend/src/quiz/quiz.service.ts` | تغییر | پرامپت AI، پارس `skillTag`، ذخیره `SkillTag` |
| `backend/src/quiz/dto/save-quiz.dto.ts` | تغییر | فیلد `skillTag?` به `QuizQuestionDto` |
| `backend/src/analytics/analytics.service.ts` | **جدید** | منطق تحلیل مهارتی و روند پیشرفت |
| `backend/src/analytics/analytics.controller.ts` | **جدید** | ۴ endpoint با Swagger |
| `backend/src/analytics/analytics.module.ts` | **جدید** | ماژول NestJS |
| `backend/src/analytics/analytics.service.spec.ts` | **جدید** | ۲۱ تست واحد |
| `backend/src/app.module.ts` | تغییر | ثبت `AnalyticsModule` |
| `backend/certificates/certificates.service.ts` | تغییر | inject `AnalyticsService`، غنی‌سازی `getOne` |
| `backend/certificates/certificates.module.ts` | تغییر | import `AnalyticsModule` |
| `FrontEnd/src/services/analytics.service.ts` | **جدید** | Axios service برای ۴ endpoint |
| `FrontEnd/src/feature-module/student/analytics/LearningAnalytics.tsx` | **جدید** | صفحه کامل داشبورد با رادار و خط‌نمودار |
| `FrontEnd/src/feature-module/router/all_routes.tsx` | تغییر | اضافه کردن `studentAnalytics` |
| `FrontEnd/src/feature-module/router/router.link.tsx` | تغییر | route جدید با `RoleRoute` |
| `FrontEnd/src/core/common/data/json/student-sidebar.tsx` | تغییر | آیتم «تحلیل یادگیری» در منو |
| `FrontEnd/src/feature-module/student/student-certificates/student-certificates.tsx` | تغییر | ویجت `SkillBreakdownWidget` در مودال گواهینامه |
