# مستندات پیاده‌سازی: سیستم توصیه‌گر دوره و تحلیل روند یادگیری

**پروژه:** EduCore LMS  
**تاریخ:** مرداد ۱۴۰۵  
**استک:** NestJS 11 + Prisma 5 + SQL Server | React 19 + Redux Toolkit + Ant Design + ApexCharts

---

## فهرست مطالب

1. [مرور کلی](#مرور-کلی)
2. [تغییرات پایگاه داده](#تغییرات-پایگاه-داده)
3. [بک‌اند — ماژول Recommendations](#بک‌اند--ماژول-recommendations)
4. [بک‌اند — گسترش ماژول Analytics](#بک‌اند--گسترش-ماژول-analytics)
5. [فرانت‌اند — سرویس‌ها](#فرانت‌اند--سرویس‌ها)
6. [فرانت‌اند — کامپوننت‌های جدید](#فرانت‌اند--کامپوننت‌های-جدید)
7. [فرانت‌اند — تغییرات صفحات موجود](#فرانت‌اند--تغییرات-صفحات-موجود)
8. [تست‌های واحد](#تست‌های-واحد)
9. [فایل‌های تغییریافته](#فایل‌های-تغییریافته)
10. [راهنمای دفاع پایان‌نامه](#راهنمای-دفاع-پایان‌نامه)

---

## مرور کلی

دو فیچر اصلی اضافه شد:

| فیچر | توضیح |
|---|---|
| **سیستم توصیه‌گر دوره** | بر اساس مهارت‌های ضعیف دانشجو، سطح تحصیلی، و دسته‌بندی دوره‌های قبلی، دوره بعدی مناسب را پیشنهاد می‌دهد |
| **تحلیل روند یادگیری** | با رگرسیون خطی روی نمرات آزمون‌ها، روند یادگیری هر دانشجو را صعودی / نزولی / ثابت اعلام می‌کند |

**چرا این رویکرد؟**
- الگوریتم **content-based hybrid** به جای collaborative filtering انتخاب شد چون با چند صد دانشجو، collaborative filtering دچار cold-start می‌شود
- رگرسیون خطی ساده به جای مدل پیچیده‌تر انتخاب شد چون تعداد نمونه (آزمون هر دانشجو) کم است و رگرسیون خطی پایدارتر و قابل تفسیرتر است
- نقش LLM **فقط در تولید زبان طبیعی توضیح** (لایه ارائه) است، نه در منطق تصمیم‌گیری

---

## تغییرات پایگاه داده

**فایل:** `backend/prisma/schema.prisma`

### مدل جدید: `CourseRecommendations`

```prisma
model CourseRecommendations {
  Id               Int      @id @default(autoincrement())
  Student_Id       Int
  Course_Id        Int
  Score            Decimal  @db.Decimal(5, 2)   -- امتیاز 0 تا 100
  Reason           String?  @db.NVarChar(500)   -- توضیح فارسی تولیدشده توسط LLM
  MatchedSkillTags String?  @db.NVarChar(500)   -- JSON آرایه تگ‌های مهارتی ضعیف که دوره پوشش می‌دهد
  Status           String   @default("Active")  -- Active | Dismissed | Enrolled
  GeneratedAt      DateTime @default(now())
  Users            Users    @relation(...)
  Courses          Courses  @relation(...)
}
```

**منطق Status:**
- `Active` → پیشنهاد فعال، نمایش داده می‌شود
- `Dismissed` → دانشجو «علاقه‌مند نیستم» زده، دیگر نمایش داده نمی‌شود
- `Enrolled` → دانشجو در همان دوره ثبت‌نام کرد (معیار ارزیابی کیفیت توصیه‌گر)

**این جدول برای کش کردن** پیشنهادهاست تا الگوریتم در هر بار مراجعه دوباره اجرا نشود.

### Relations اضافه‌شده
- به مدل `Users`: `CourseRecommendations[]`
- به مدل `Courses`: `CourseRecommendations[]`

```bash
# دستور اجرا شده
npx prisma db push
npx prisma generate
```

---

## بک‌اند — ماژول Recommendations

**مسیر:** `backend/src/recommendations/`

### فایل‌های ایجادشده

```
backend/src/recommendations/
├── recommendations.service.ts
├── recommendations.controller.ts
├── recommendations.module.ts
├── recommendations.service.spec.ts
└── dto/
    └── refresh-recommendations.dto.ts
```

---

### الگوریتم امتیازدهی (recommendations.service.ts)

تابع `scoreCourse(profile, course)` — کاملاً pure و بدون وابستگی به Prisma.

| مؤلفه | وزن | منطق محاسبه |
|---|---|---|
| **Skill Gap Match** | 45% | نسبت همپوشانی بین مهارت‌های ضعیف دانشجو (درصد < 50) و SkillTag‌های سوالات دوره |
| **Level Progression** | 25% | فاصله سطح دوره از سطح ایده‌آل (avgLevel + 1)، کاهش نمایی با `Math.exp(-diff)` |
| **Category Affinity** | 20% | اگر `categoryId` دوره در لیست دسته‌بندی‌های قبلی دانشجو باشد: 100، در غیر این صورت: 0 |
| **Course Quality** | 10% | نرمالایز `AverageRating` از 0-5 به 0-100 |

امتیاز نهایی با `Math.min(100, Math.max(0, total))` در بازه [0, 100] نگه داشته می‌شود.

**فیلتر کاندیداها:**
- دوره‌هایی که دانشجو قبلاً ثبت‌نام کرده → حذف
- دوره‌های منتشرنشده (`IsPublished = false`) → حذف

---

### تولید توضیح فارسی با LLM

همان الگوی `quiz.service.ts` با `AI_API_URL` (Qwen3-4b):

```typescript
// اگر LLM در دسترس نبود یا خطا داد:
const fallback = `این دوره روی مهارت‌های ${tags.join('، ')} تمرکز دارد که در آزمون‌های شما نیاز به تقویت دارند.`;
```

هیچ‌وقت fail نمی‌کند — اگر LLM خطا داد، از fallback استفاده می‌شود.

---

### Endpointها

| Method | Endpoint | توضیح | دسترسی |
|---|---|---|---|
| GET | `/recommendations/students/me` | لیست پیشنهادهای فعال (از کش یا محاسبه جدید) | Student (role=1) |
| POST | `/recommendations/refresh` | اجبار به محاسبه مجدد | Student (role=1) |
| POST | `/recommendations/:id/dismiss` | تغییر Status به Dismissed | Student (مالک رکورد) |
| GET | `/recommendations/students/:studentId/history` | تاریخچه + نرخ تبدیل به ثبت‌نام | Student (خودش) / Admin |

---

### کش و Trigger خودکار

**کش (24 ساعت):**
```
GET /students/me
    ↓
کش موجود و کمتر از 24 ساعت؟ → برگردان
                              ↓ (خیر)
            محاسبه جدید → ذخیره در DB → برگردان
```

**Trigger خودکار در `quiz.service.ts`:**
بعد از صدور موفق گواهینامه، **خارج از تراکنش Prisma اصلی**، یک فراخوانی async fire-and-forget:

```typescript
// در submitQuiz، بعد از await this.prisma.$transaction(...)
if (isPassed) {
  this.recommendationsService
    .refresh(studentId, 5)
    .catch((err) => console.warn(`Failed to refresh...`, err));
}
```

این الگو تراکنش اصلی را سبک نگه می‌دارد و اگر refresh شکست، گواهینامه تحت تأثیر نمی‌گیرد.

---

### ماژول

```typescript
// recommendations.module.ts
@Module({
  imports: [PrismaModule, AnalyticsModule],  // AnalyticsModule برای groupBySkill
  exports: [RecommendationsService],          // برای inject در QuizModule
})
```

`QuizModule` هم به‌روزرسانی شد تا `RecommendationsModule` را import کند.

---

## بک‌اند — گسترش ماژول Analytics

**فایل:** `backend/src/analytics/analytics.service.ts`

### تابع جدید: `classifyTrend`

```typescript
classifyTrend(scores: { date: Date; percentage: number }[]): TrendClassification
```

**الگوریتم — رگرسیون خطی ساده (Least Squares):**

```
x = شماره آزمون (0, 1, 2, ...)
y = درصد نمره

slope = (n·Σxy - Σx·Σy) / (n·Σx² - (Σx)²)

slope > +2  →  صعودی
slope < -2  →  نزولی
[-2, +2]    →  ثابت
n < 2       →  داده کافی نیست
```

**چرا آستانه ±2؟** یعنی بین هر آزمون متوالی باید حداقل 2 واحد درصد تغییر باشد تا روند معنادار محسوب شود.

**Output:**
```typescript
{
  status: 'صعودی' | 'نزولی' | 'ثابت' | 'داده کافی نیست',
  slope: number,        // شیب دقیق
  description?: string  // توضیح متنی
}
```

---

### Endpointهای جدید در `analytics.controller.ts`

| Method | Endpoint | توضیح | دسترسی |
|---|---|---|---|
| GET | `/analytics/students/:studentId/trend?courseId=` | روند یک دانشجو | مدرس صاحب دوره / ادمین / خودِ دانشجو |
| GET | `/analytics/courses/:courseId/trend-overview` | روند همه دانشجویان یک دوره، مرتب از نزولی‌ترین | مدرس صاحب دوره / ادمین |

**Ownership check** در هر دو endpoint اعمال می‌شود:
- دانشجو فقط روند خودش را می‌بیند
- مدرس باید `courseId` مشخص کند و مالک آن دوره باشد
- ادمین همه را می‌بیند

---

## فرانت‌اند — سرویس‌ها

### فایل جدید: `FrontEnd/src/services/recommendations.service.ts`

```typescript
class RecommendationsService {
  getMyRecommendations(): Promise<CourseRecommendation[]>
  refreshRecommendations(topN?: number): Promise<void>
  dismissRecommendation(id: number): Promise<void>
  getHistory(studentId: number): Promise<RecommendationHistoryResponse>
}
```

**Types اصلی:**
```typescript
interface CourseRecommendation {
  id: number;
  courseId: number;
  score: number;           // 0-100
  reason: string | null;   // توضیح LLM
  matchedSkillTags: string[];
  status: string;
  course: {
    title, thumbnail, price, averageRating, category, level, ...
  };
}
```

---

### گسترش `FrontEnd/src/services/analytics.service.ts`

Types جدید:
```typescript
interface TrendClassification {
  status: 'صعودی' | 'نزولی' | 'ثابت' | 'داده کافی نیست';
  slope: number;
  description?: string;
}

interface StudentTrendSummary {
  studentId, firstName, lastName, avatar,
  trendStatus, slope, quizCount, latestScore
}
```

متدهای جدید:
```typescript
getStudentTrend(studentId, courseId?): Promise<StudentTrendResponse>
getCourseTrendOverview(courseId): Promise<CourseTrendOverviewResponse>
```

---

## فرانت‌اند — کامپوننت‌های جدید

### ۱. RecommendedCourses.tsx

**مسیر:** `FrontEnd/src/feature-module/student/recommendations/RecommendedCourses.tsx`

**ظاهر:** کارت‌های افقی در گرید دو ستونه

هر کارت شامل:
- تصویر بندانگشتی دوره
- **بج امتیاز** (0-100) با گرادیان بنفش
- عنوان دوره (لینک به صفحه دوره)
- **بج‌های تگ مهارتی** که این دوره پوشش می‌دهد (نارنجی)
- یک جمله توضیح از LLM
- امتیاز و سطح دوره
- **دکمه «مشاهده دوره»** (آبی)
- **دکمه ✕ «علاقه‌مند نیستم»** (dismiss)

**حالت‌های خاص:**
- در حال بارگذاری → spinner
- لیست خالی → پیام راهنما + دکمه بررسی مجدد
- پس از dismiss → کارت بلافاصله از لیست حذف می‌شود

---

### ۲. TrendBadge.tsx

**مسیر:** `FrontEnd/src/feature-module/Instructor/instructor-analytics/TrendBadge.tsx`

**ظاهر در سلول جدول:**

```
🟢 صعودی  [sparkline ▲]
🔴 نزولی  [sparkline ▼]
⚪ ثابت   [sparkline —]
— داده کافی نیست
```

**Sparkline:** نمودار خطی کوچک (60×24 px) از 5 نمره آخر با ApexCharts، بدون محور.

**کلیک روی بج → مودال جزئیات:**
- اطلاعیه رنگی با وضعیت روند و شیب دقیق
- نمودار خطی کامل تمام آزمون‌ها
- جدول نمرات با تاریخ و رنگ‌بندی قبول/مردود

---

## فرانت‌اند — تغییرات صفحات موجود

### ۱. LearningAnalytics.tsx (داشبورد دانشجو)

**تغییر:** اضافه شدن بخش «دوره‌های پیشنهادی برای شما» بین WeakSkillsSummary و چارت‌ها

```tsx
{/* Weak skills summary text */}
{!loadingSkills && skills.length > 0 && <WeakSkillsSummary skills={skills} />}

{/* ---- دوره‌های پیشنهادی ---- */}    ← جدید
<div className="mb-4">
  <RecommendedCourses />
</div>

<div className="row">  {/* radar + line charts */}
```

---

### ۲. InstructorCourseAnalytics.tsx (پرتال مدرس)

**تغییرات:**

۱. Import جدید: `StudentTrendSummary`, `TrendBadge`

۲. State جدید:
```typescript
const [trendMap, setTrendMap] = useState<Map<number, StudentTrendSummary>>(new Map());
```

۳. در `handleCourseChange` — دریافت موازی:
```typescript
const [data, trendOverview] = await Promise.all([
  analyticsService.getCourseStudentAnalytics(Number(val)),
  analyticsService.getCourseTrendOverview(Number(val)).catch(() => null),
]);
// ساختن Map از studentId به اطلاعات روند
```

۴. ستون جدید «روند یادگیری» در جدول:
```
| دانشجو | پیشرفت دوره | نمره آزمون | روند یادگیری ← جدید | وضعیت | گواهینامه |
```

---

### ۳. all_routes.tsx

```typescript
// route جدید اضافه شد
studentRecommendations: "/student/recommendations",
```

---

## تست‌های واحد

**نتیجه نهایی: 46 تست — همه PASS ✅**

```
Test Suites: 2 passed, 2 total
Tests:       46 passed, 46 total
Time:        ~2s
```

---

### analytics.service.spec.ts — تست‌های جدید classifyTrend

| تست | توضیح |
|---|---|
| آرایه خالی | باید `'داده کافی نیست'` برگرداند |
| یک نقطه | باید `'داده کافی نیست'` برگرداند |
| همه نمرات یکسان | باید `'ثابت'` با slope=0 برگرداند |
| سری صعودی واضح (20,40,60,80,100) | باید `'صعودی'` با slope>2 برگرداند |
| سری نزولی واضح (100,80,60,40,20) | باید `'نزولی'` با slope<-2 برگرداند |
| سری تقریباً صاف (50,51,49,50) | باید `'ثابت'` برگرداند |
| ورودی بدون ترتیب تاریخ | باید ابتدا sort کند، نتیجه یکسان |
| دقیقاً دو نقطه داده | باید slope صحیح محاسبه کند |

---

### recommendations.service.spec.ts — تست‌های کامل

**scoreCourse (تابع pure):**

| تست | توضیح |
|---|---|
| Skill Gap Match — با تطابق | امتیاز بالاتر از بدون تطابق |
| Skill Gap Match — matchedSkillTags | تگ‌های درست پر می‌شود |
| Level Progression — سطح ایده‌آل | سطح بالاتر بهترین امتیاز دارد |
| Course Quality — rating بالاتر | امتیاز بیشتر می‌گیرد |
| Category Affinity — هم‌دسته | امتیاز بالاتر از دسته متفاوت |
| دوره بدون SkillTag | matchedSkillTags خالی است |
| دانشجوی بدون آزمون | امتیاز در بازه [0,100] باقی می‌ماند |
| امتیاز نهایی | همیشه در [0,100] |

**ownership + business logic:**

| تست | توضیح |
|---|---|
| getRecommendations — ForbiddenException | دانشجوی دیگری نمی‌تواند ببیند |
| getRecommendations — ادمین | ادمین همه را می‌بیند |
| dismiss — NotFoundException | رکورد ناموجود خطا می‌دهد |
| dismiss — ForbiddenException | دانشجوی دیگری نمی‌تواند dismiss کند |
| dismiss — مالک | مالک می‌تواند dismiss کند |
| markAsEnrolled | Status Active به Enrolled تغییر می‌کند |
| getHistory — ForbiddenException | دانشجوی دیگری تاریخچه نمی‌بیند |
| getHistory — conversionRate | نرخ تبدیل درست محاسبه می‌شود |

---

## فایل‌های تغییریافته

### فایل‌های جدید

```
backend/src/recommendations/
├── recommendations.service.ts       ← الگوریتم scoring + LLM + CRUD
├── recommendations.controller.ts    ← 4 endpoint
├── recommendations.module.ts        ← تعریف ماژول
├── recommendations.service.spec.ts  ← 23 تست واحد
└── dto/refresh-recommendations.dto.ts

FrontEnd/src/
├── services/recommendations.service.ts
└── feature-module/
    ├── student/recommendations/RecommendedCourses.tsx
    └── Instructor/instructor-analytics/TrendBadge.tsx
```

### فایل‌های تغییریافته

```
backend/
├── prisma/schema.prisma                     ← مدل CourseRecommendations
├── src/app.module.ts                        ← import RecommendationsModule
├── src/analytics/analytics.service.ts      ← تابع classifyTrend + 2 متد جدید
├── src/analytics/analytics.controller.ts   ← 2 endpoint روند
├── src/analytics/analytics.service.spec.ts ← 8 تست classifyTrend
├── src/quiz/quiz.service.ts                 ← inject RecommendationsService + trigger
└── src/quiz/quiz.module.ts                  ← import RecommendationsModule

FrontEnd/src/
├── services/analytics.service.ts                               ← types + 2 متد جدید
├── feature-module/student/analytics/LearningAnalytics.tsx      ← اضافه RecommendedCourses
├── feature-module/Instructor/instructor-analytics/
│   └── InstructorCourseAnalytics.tsx                           ← ستون روند + trendMap
└── feature-module/router/all_routes.tsx                        ← studentRecommendations route
```

---

## راهنمای دفاع پایان‌نامه

### سوال: چرا content-based hybrid و نه collaborative filtering؟
**جواب:** در مقیاس چند صد دانشجو، collaborative filtering دچار **cold-start problem** می‌شود — دانشجویانی که تازه ثبت‌نام کرده‌اند یا دوره‌های کمی گذرانده‌اند، داده کافی برای محاسبه شباهت با دیگران ندارند. رویکرد content-based ما فقط به **پروفایل خودِ دانشجو** وابسته است و از اولین آزمون کار می‌کند.

---

### سوال: الگوریتم چطور کار می‌کند؟
**جواب:** یک امتیاز ترکیبی از 4 مؤلفه:
1. دوره تا چه حد **مهارت‌های ضعیف** دانشجو را پوشش می‌دهد؟ (45%)
2. **سطح دوره** یک پله بالاتر از میانگین دوره‌های قبلی است؟ (25%)
3. **دسته‌بندی دوره** با علایق قبلی دانشجو مطابقت دارد؟ (20%)
4. **کیفیت دوره** (میانگین امتیاز کاربران) چقدر است؟ (10%)

---

### سوال: نقش LLM کجاست؟
**جواب:** LLM **هیچ نقشی در تصمیم‌گیری** ندارد. الگوریتم scoring کاملاً قطعی و قابل ردیابی است. LLM فقط یک **جمله توضیحی فارسی طبیعی** تولید می‌کند تا کاربر بفهمد چرا این دوره پیشنهاد شده. اگر LLM در دسترس نبود، یک توضیح قالبی جایگزین می‌شود.

---

### سوال: چطور کیفیت توصیه‌گر را می‌سنجید؟
**جواب:** نرخ تبدیل `Status=Enrolled / Total Active`. وقتی دانشجو یک دوره پیشنهادی را واقعاً انتخاب می‌کند و ثبت‌نام می‌کند، وضعیت آن رکورد به `Enrolled` تغییر می‌کند. این عدد در endpoint `GET /recommendations/students/:id/history` قابل مشاهده است.

---

### سوال: چرا رگرسیون خطی برای روند؟
**جواب:** تعداد آزمون هر دانشجو در یک دوره معمولاً **کمتر از 10** است. مدل‌های پیچیده‌تر (LSTM، polynomial regression) روی داده کم **overfit** می‌شوند. رگرسیون خطی روی n نقطه کوچک، پایدارترین و قابل‌تفسیرترین نتیجه را می‌دهد — شیب یک عدد واحد است که هر کسی می‌تواند توضیح دهد.

---

### معیار ارزیابی قابل گزارش در فصل نتایج

```
نرخ تبدیل = (تعداد پیشنهادهایی که دانشجو در آن ثبت‌نام کرد) / (کل پیشنهادهای Active قدیمی‌تر از X روز) × 100
```

این عدد نشان می‌دهد سیستم توصیه‌گر چقدر دقیق عمل کرده است.
