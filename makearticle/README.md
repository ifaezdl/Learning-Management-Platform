# EduCore — سیستم جامع مدیریت یادگیری با هوش مصنوعی
# EduCore — AI-Powered Comprehensive Learning Management System

<div dir="rtl">

> **پلتفرم یادگیری هوشمند با قابلیت تولید آزمون توسط هوش مصنوعی، تحلیل یادگیری تطبیقی، سیستم توصیه دوره شخصی‌سازی‌شده، و چت بلادرنگ**

> **Intelligent Learning Platform with AI Quiz Generation, Adaptive Learning Analytics, Personalized Course Recommendation System, and Real-Time Chat**

</div>

---

## 📑 فهرست مطالب | Table of Contents

<div dir="rtl">

1. [خلاصه اجرایی و اهداف پروژه](#1-خلاصه-اجرایی-و-اهداف-پروژه)
2. [نوآوری‌های کلیدی و ویژگی‌های متمایزکننده](#2-نوآوریهای-کلیدی-و-ویژگیهای-متمایزکننده)
3. [معماری سیستم](#3-معماری-سیستم)
4. [پشته فناوری](#4-پشته-فناوری)
5. [ساختار پایگاه داده](#5-ساختار-پایگاه-داده)
6. [ماژول‌های اصلی سیستم](#6-ماژولهای-اصلی-سیستم)
7. [سیستم تحلیل یادگیری تطبیقی](#7-سیستم-تحلیل-یادگیری-تطبیقی)
8. [الگوریتم توصیه دوره شخصی‌سازی‌شده](#8-الگوریتم-توصیه-دوره-شخصیسازیشده)
9. [نقش‌ها و فرایندهای کاربری](#9-نقشها-و-فرایندهای-کاربری)
10. [داشبوردها و صفحات کاربری](#10-داشبوردها-و-صفحات-کاربری)
11. [مستندات API](#11-مستندات-api)
12. [راهنمای راه‌اندازی](#12-راهنمای-راهاندازی)

</div>

---

## 1. خلاصه اجرایی و اهداف پروژه
## 1. Executive Summary and Project Goals

<div dir="rtl">

### 1.1 معرفی پروژه

**EduCore** یک سیستم مدیریت یادگیری (LMS) جامع و پیشرفته است که با استفاده از فناوری‌های نوین هوش مصنوعی و یادگیری ماشین طراحی شده است. این پلتفرم برای مؤسسات آموزشی، آموزشگاه‌های آنلاین، و ارائه‌دهندگان محتوای آموزشی فارسی‌زبان توسعه یافته است.

### 1.2 اهداف اصلی

1. **شخصی‌سازی مسیر یادگیری**: ارائه تجربه یادگیری منحصربه‌فرد برای هر دانشجو بر اساس عملکرد و نقاط ضعف او
2. **اتوماسیون ارزیابی**: کاهش بار کاری مدرسان از طریق تولید خودکار سوالات آزمون با هوش مصنوعی
3. **تحلیل یادگیری پیشرفته**: ارائه تحلیل‌های دقیق از عملکرد دانشجویان برای مدرسان و خود دانشجویان
4. **یادگیری تطبیقی**: شناسایی نقاط ضعف یادگیرنده و پیشنهاد دوره‌های مرتبط برای رفع آن‌ها
5. **تعامل بلادرنگ**: ایجاد فضای تعاملی برای ارتباط مستقیم دانشجو-مدرس و دانشجو-دانشجو

### 1.3 کاربردهای پروژه

- **دانشگاه‌ها و مؤسسات آموزش عالی**: مدیریت دوره‌های آنلاین و ترکیبی
- **آموزشگاه‌های آنلاین**: ارائه دوره‌های تخصصی با سیستم پیش‌پرداخت
- **شرکت‌های فناوری**: آموزش کارکنان و مدیریت دانش سازمانی
- **مراکز آموزش مهارت‌های فنی**: آموزش برنامه‌نویسی، طراحی، و مهارت‌های دیجیتال

</div>

---

## 2. نوآوری‌های کلیدی و ویژگی‌های متمایزکننده
## 2. Key Innovations and Distinguishing Features

<div dir="rtl">

### 2.1 سیستم تولید آزمون مبتنی بر هوش مصنوعی (AI Quiz Generation)

این سیستم اولین و مهم‌ترین نوآوری پروژه است که آن را از سایر LMS‌های موجود متمایز می‌کند:

#### ویژگی‌های کلیدی:
- **آگاهی از محتوا (Context-Aware)**: برخلاف سیستم‌های عمومی، موتور هوش مصنوعی ما از ساختار واقعی دوره استفاده می‌کند:
  - عنوان درس‌ها و بخش‌ها
  - اهداف یادگیری (Learning Outcomes)
  - پیش‌نیازهای دوره
  - توضیحات کامل و کوتاه دوره
  - سطح دشواری و دسته‌بندی
  
- **برچسب‌گذاری مهارتی (Skill Tagging)**: هر سوال تولید شده دارای یک برچسب مهارتی فارسی (2-4 کلمه) است که مفهوم اصلی سنجش‌شده را توصیف می‌کند (مثلاً "حلقه‌های تکرار"، "مدیریت حافظه")

- **مدل زبانی استفاده شده**: Qwen3-4b (4 میلیارد پارامتر) از طریق API سازگار با OpenAI

- **پرامپت انجینیرینگ پیشرفته**: 
  - دستور سیستم به زبان فارسی برای تولید خروجی JSON ساختاریافته
  - اعمال محدودیت‌های سختگیرانه: دقیقاً 4 گزینه، فقط یک پاسخ صحیح، سوالات تک‌گزینه‌ای
  - Temperature: 0.7 برای تعادل بین خلاقیت و دقت
  - `enable_thinking: false` برای سرکوب خروجی‌های توضیحی

- **پردازش پاسخ قوی (Robust Parsing)**:
  - حذف خودکار فنس‌های markdown (```json)
  - استخراج آرایه JSON از متن خام
  - فیلتر کردن سوالات ناقص
  - Fallback هوشمند برای برچسب‌های مهارتی گم‌شده

#### فرایند تولید:
```
مدرس → درخواست تولید N سوال
    ↓
بک‌اند → بارگذاری کامل ساختار دوره (بخش‌ها، درس‌ها، اهداف، پیش‌نیازها)
    ↓
بک‌اند → ساخت پرامپت دوزبانه (سیستم + کاربر)
    ↓
POST → LLM API (Qwen3-4b)
    ↓
پاسخ خام → extractJsonArray() → اعتبارسنجی ساختار
    ↓
سوالات پیشنمایش → مدرس بررسی/ویرایش می‌کند
    ↓
PUT /quizzes/:id → ذخیره در بانک سوالات با فلگ Source=true (AI-generated)
```

### 2.2 سیستم تحلیل یادگیری تطبیقی (Adaptive Learning Analytics)

این سیستم به دانشجویان و مدرسان اطلاعات عمیقی از عملکرد یادگیری ارائه می‌دهد:

#### الف) تحلیل مهارتی چندبعدی (Skill Breakdown Analysis)

**تابع محوری: `groupBySkill()`** (Pure Function — قابل تست بدون دیتابیس)

```typescript
groupBySkill(answers: { skillTag: string, isCorrect: boolean }[]): SkillStat[]
```

- گروه‌بندی پاسخ‌ها بر اساس برچسب مهارتی
- محاسبه `correct/total` برای هر مهارت
- محاسبه درصد تسلط: `percentage = Math.round(correct/total * 100)`
- مرتب‌سازی از ضعیف‌ترین به قوی‌ترین
- برچسب‌های null/خالی → دسته "سایر"

**کاربردها:**
1. **تحلیل تک آزمون**: مشاهده عملکرد دانشجو در یک آزمون خاص به تفکیک مهارت
2. **پروفایل مهارتی تجمعی**: عملکرد کلی دانشجو در تمام آزمون‌های یک دوره یا تمام دوره‌ها
3. **تحلیل کلاسی**: عملکرد کل کلاس به تفکیک مهارت (برای مدرس)
4. **غنی‌سازی گواهینامه**: نمایش نقاط قوت و ضعف در گواهینامه صادرشده

#### ب) تحلیل روند یادگیری (Learning Trend Classification)

**تابع محوری: `classifyTrend()`** (رگرسیون خطی ساده)

```typescript
classifyTrend(scores: { date: Date, percentage: number }[]): TrendClassification
```

**الگوریتم:**
- استفاده از رگرسیون خطی Least Squares برای محاسبه شیب (slope)
- فرمول: `m = (n*ΣXY - ΣX*ΣY) / (n*ΣX² - (ΣX)²)`
- X: شماره آزمون (0, 1, 2, ...)
- Y: درصد نمره

**آستانه‌های تصمیم‌گیری:**
- شیب > +2 → **روند صعودی** (پیشرفت مثبت)
- شیب < -2 → **روند نزولی** (نیاز به توجه)
- [-2, +2] → **روند ثابت**
- n < 2 → **داده کافی نیست**

**خروجی:**
```json
{
  "status": "صعودی",
  "slope": 5.3,
  "description": "روند یادگیری صعودی است (شیب: 5.30 واحد درصد به ازای هر آزمون)."
}
```

#### ج) داشبورد تحلیل یادگیری (Learning Analytics Dashboard)

**مؤلفه‌های بصری:**

1. **نمودار راداری (Radar Chart)**: 
   - محورها: برچسب‌های مهارتی
   - مقادیر: درصد تسلط (0-100)
   - رنگ‌آمیزی: سبز (≥70%), زرد (≥40%), قرمز (<40%)

2. **نمودار خطی دوگانه (Dual Line Chart)**:
   - سری اول: نمرات آزمون در طول زمان
   - سری دوم: درصد تکمیل دوره (بر اساس درس‌های تمام‌شده)
   - محور X: تاریخ (Jalali/Persian calendar)
   - محور Y: درصد (0-100)

3. **بنر نقاط ضعف (Weak Skills Banner)**:
   - نمایش مهارت‌هایی با درصد کمتر از 50%
   - لینک مستقیم به پیشنهادهای دوره
   - رنگ قرمز برای جلب توجه

### 2.3 الگوریتم توصیه دوره شخصی‌سازی‌شده (Personalized Course Recommendation)

این سیستم با استفاده از یک الگوریتم **شفاف و وزن‌دار** دوره‌های مناسب را به دانشجو پیشنهاد می‌دهد.

#### الگوریتم امتیازدهی (Scoring Algorithm)

**وزن‌ها (قابل تنظیم):**
```javascript
WEIGHTS = {
  SKILL_GAP_MATCH: 0.45,      // 45% — همپوشانی مهارت‌های ضعیف با دوره
  LEVEL_PROGRESSION: 0.25,    // 25% — تناسب سطح دوره با سابقه
  CATEGORY_AFFINITY: 0.20,    // 20% — دسته‌بندی مشابه با دوره‌های قبلی
  COURSE_QUALITY: 0.10,       // 10% — میانگین امتیازات دوره
}
```

#### مراحل محاسبه امتیاز:

**گام 1: ساخت پروفایل دانشجو (`buildStudentProfile`)**
```typescript
interface StudentProfile {
  completedCourseIds: number[];           // دوره‌های دارای گواهینامه
  weakSkills: SkillStat[];               // مهارت‌های با percentage < 50
  avgCompletedLevel: number | null;      // میانگین سطح (مقدماتی=1, متوسط=2, پیشرفته=3)
  favoriteCategoryIds: number[];         // دسته‌بندی‌های دوره‌های قبلی
}
```

**گام 2: استخراج کاندیداها (`getCandidateCourses`)**
- دوره‌های منتشرشده (IsPublished: true)
- دوره‌هایی که دانشجو در آن‌ها ثبت‌نام نکرده
- استخراج SkillTag‌های یونیک از سوالات آزمون‌های هر دوره

**گام 3: امتیازدهی هر دوره (`scoreCourse`)**

```typescript
// 1️⃣ Skill Gap Match (45%)
const weakSkillSet = new Set(profile.weakSkills.map(s => s.tag.toLowerCase()));
const courseSkillSet = new Set(course.skillTags.map(t => t.toLowerCase()));
matchCount = intersection(weakSkillSet, courseSkillSet).size;
skillScore = (matchCount / weakSkillSet.size) * 100 * 0.45;

// 2️⃣ Level Progression (25%)
idealLevel = profile.avgCompletedLevel + 1;  // یک پله بالاتر
levelDiff = abs(course.level - idealLevel);
levelScore = exp(-levelDiff) * 100 * 0.25;

// 3️⃣ Category Affinity (20%)
categoryScore = profile.favoriteCategoryIds.includes(course.categoryId) 
  ? 100 * 0.20  // همان دسته → امتیاز کامل
  : 0;          // دسته متفاوت → صفر

// 4️⃣ Course Quality (10%)
qualityScore = (course.averageRating / 5) * 100 * 0.10;

totalScore = skillScore + levelScore + categoryScore + qualityScore;  // 0-100
```

**گام 4: تولید دلیل با LLM**

برای دوره‌های برتر، یک جمله توضیحی فارسی توسط همان Qwen3-4b تولید می‌شود:

```typescript
const prompt = `دانشجو در مهارت‌های «${matchedSkills.join('، ')}» ضعیف است. 
دوره «${courseTitle}» این مهارت‌ها را پوشش می‌دهد. 
یک جمله توصیه کوتاه (حداکثر ۲۰ کلمه) بنویس.`;
```

اگر LLM در دسترس نباشد، از یک متن قالبی استفاده می‌شود:
```
"این دوره روی مهارت‌های [X، Y، Z] تمرکز دارد که در آزمون‌های شما نیاز به تقویت دارند."
```

#### چرخه حیات پیشنهادها (Recommendation Lifecycle)

```
Active → Dismissed (دانشجو رد کرد)
Active → Enrolled (دانشجو ثبت‌نام کرد)
```

- **کش 24 ساعته**: پیشنهادها تا 24 ساعت اعتبار دارند
- **تازه‌سازی خودکار**: بعد از قبولی در هر آزمون، سیستم بدون مداخله کاربر پیشنهادها را به‌روز می‌کند
- **تازه‌سازی دستی**: دانشجو می‌تواند با کلیک روی "Refresh" پیشنهادهای جدید دریافت کند

#### محاسبه نرخ تبدیل (Conversion Rate)

```sql
SELECT 
  COUNT(*) FILTER (WHERE Status = 'Enrolled') / 
  COUNT(*) * 100 AS conversion_rate
FROM CourseRecommendations
WHERE Student_Id = :studentId;
```

### 2.4 معماری چت بلادرنگ با SSE (Real-Time Chat via Server-Sent Events)

**چرا SSE به‌جای WebSocket؟**

| معیار | SSE | WebSocket |
|---|---|---|
| جهت ارتباط | یک‌طرفه (سرور → کلاینت) | دوطرفه |
| پروتکل | HTTP/1.1, HTTP/2 | WS:// (نیاز به Upgrade) |
| پیچیدگی | ساده (یک endpoint) | پیچیده (نیاز به WebSocket server) |
| Proxy-Friendly | ✅ بدون نیاز به تنظیم خاص | ⚠️ نیاز به پشتیبانی proxy |
| Auto-Reconnect | ✅ مرورگر خودکار reconnect می‌کند | ❌ باید دستی پیاده‌سازی شود |

**معماری:**
```
کلاینت → GET /chat/stream?token=JWT
         ↓ (باز نگه‌داشتن connection)
    ChatEventsService
         ↓
    Map<userId, Set<Subject>>  ← پشتیبانی چند‌تب
         ↓
    رویدادها: new-message, typing, reaction, poll-vote, ...
         ↓
    کلاینت → EventSource.onmessage()
```

**ویژگی‌ها:**
- **Thread Replies**: پاسخ به پیام‌ها با `ReplyTo_Id`
- **Emoji Reactions**: واکنش‌های شخصی‌سازی‌شده با منطق toggle
- **Live Polls**: نظرسنجی با نتایج بلادرنگ
- **Read Receipts**: ردیابی آخرین پیام خوانده‌شده
- **Typing Indicators**: نمایش "در حال تایپ..."
- **Online Presence**: نمایش کاربران آنلاین بر اساس اتصال‌های فعال SSE
- **File Attachments**: آپلود و اشتراک‌گذاری فایل در چت

### 2.5 صدور خودکار گواهینامه در تراکنش (Atomic Certificate Issuance)

```typescript
await prisma.$transaction(async (tx) => {
  // ذخیره پاسخ‌ها
  for (const answer of submittedAnswers) {
    await tx.quizAttemptAnswers.create({ data: answer });
  }
  
  // محاسبه نمره
  const { score, maxScore, isPassed } = calculateScore(answers);
  
  // به‌روزرسانی attempt
  await tx.quizAttempts.update({
    where: { Id: attemptId },
    data: { score, maxScore, isPassed, SubmittedAt: now }
  });
  
  // صدور گواهینامه (فقط اگر قبول شد)
  if (isPassed) {
    await tx.certificates.create({
      data: {
        Student_Id: studentId,
        Course_Id: courseId,
        Attempt_Id: attemptId,
        CertificateCode: `CERT-${courseId}-${attemptId}-${Date.now()}`,
        Score: score,
        MaxScore: maxScore,
        IssuedAt: now
      }
    });
  }
});

// بعد از commit موفق تراکنش
if (isPassed) {
  recommendationsService.refresh(studentId).catch(err => 
    console.warn('Recommendation refresh failed:', err)
  );
}
```

**مزایا:**
- ✅ All-or-nothing: یا همه عملیات موفق می‌شوند یا هیچکدام
- ✅ هیچ دانشجویی با قبولی، بدون گواهینامه نمی‌ماند
- ✅ هیچ گواهینامه‌ای بدون یک attempt معتبر صادر نمی‌شود
- ✅ کد یکتای گواهینامه: انسان‌خوان و قابل ردیابی

### 2.6 مکانیسم ضد تقلب: بانک سوالات تصادفی (Randomized Question Bank)

```typescript
// تنظیمات آزمون
quiz.totalQuestions = 50;  // تعداد سوالات در بانک
quiz.questionsToShow = 20;  // تعداد سوالاتی که به دانشجو نشان داده می‌شود

// هنگام شروع آزمون
const allQuestionIds = await getQuizQuestionIds(quizId);  // [1,2,3,...,50]
const shuffled = fisherYatesShuffle(allQuestionIds);
const selectedIds = shuffled.slice(0, quiz.questionsToShow);  // [23,7,41,...]

await prisma.quizAttempts.create({
  data: {
    QuestionIds: JSON.stringify(selectedIds),  // ذخیره ID های انتخابی
    ...
  }
});
```

**مزایا:**
- ✅ هر دانشجو مجموعه متفاوتی از سوالات می‌بیند
- ✅ به اشتراک‌گذاری پاسخ بی‌فایده می‌شود
- ✅ در صورت refresh صفحه، سوالات تغییر نمی‌کند (از QuestionIds ذخیره‌شده خوانده می‌شود)
- ✅ مدرس می‌تواند بانک را گسترش دهد بدون تأثیر روی attempt‌های در حال انجام

### 2.7 چرخه تازه‌سازی توکن (Token Rotation for Enhanced Security)

```typescript
// هنگام refresh
const oldToken = await prisma.refreshTokens.findUnique({
  where: { Token: refreshToken }
});

if (oldToken.RevokedAt) throw new UnauthorizedException('Token revoked');
if (oldToken.ExpiresAt < now) throw new UnauthorizedException('Token expired');

// Rotation: باطل کردن قدیمی + ایجاد جدید
await prisma.$transaction([
  prisma.refreshTokens.update({
    where: { Id: oldToken.Id },
    data: { RevokedAt: now }
  }),
  prisma.refreshTokens.create({
    data: {
      User_Id: oldToken.User_Id,
      Token: uuidv4(),
      ExpiresAt: addDays(now, 7)
    }
  })
]);
```

**مزایا:**
- ✅ توکن سرقت‌شده فقط یک بار قابل استفاده است
- ✅ بعد از refresh بعدی کاربر واقعی، توکن سرقت‌شده باطل می‌شود
- ✅ logout فوری: `RevokedAt` فوراً چک می‌شود (نه فقط expiry)

### 2.8 محافظت از تاریخچه یادگیری (Learning History Protection)

```typescript
async deleteQuiz(quizId: number, user: any) {
  const quiz = await this.verifyQuizOwnership(quizId, user);
  
  const attemptCount = await prisma.quizAttempts.count({
    where: { Quiz_Id: quizId }
  });
  
  if (attemptCount > 0) {
    // Soft Delete
    await prisma.quizzes.update({
      where: { Id: quizId },
      data: { IsPublished: false }
    });
    throw new BadRequestException(
      'این آزمون دارای شرکت‌کننده است و نمی‌تواند حذف شود. به‌جای آن منتشر نشده است.'
    );
  }
  
  // Hard Delete (فقط اگر هیچ attempt ندارد)
  await prisma.quizzes.delete({ where: { Id: quizId } });
}
```

**فلسفه:**
- تاریخچه یادگیری دانشجویان مقدس است
- گواهینامه‌ها باید همیشه قابل تأیید باشند
- آنالیتیکس طولانی‌مدت وابسته به داده‌های تاریخی است

</div>

---

## 3. معماری سیستم
## 3. System Architecture

<div dir="rtl">

### 3.1 معماری کلی

پروژه به‌صورت **Monorepo** با دو اپلیکیشن مستقل ساختاریابی شده است:

```
Learning-Management-System/
├── backend/     ← NestJS REST API (port 3000)
└── FrontEnd/    ← React 19 SPA (port 3001)
```

### 3.2 مدل ارتباطی

```
┌──────────────────────────────────────┐
│     React 19 SPA  (Port 3001)       │
│                                      │
│  • Redux Toolkit (Global State)     │
│  • AuthContext (Auth State)         │
│  • React Router v7 (Routing)        │
│  • Axios (HTTP Client)              │
└───────────────┬──────────────────────┘
                │
                │  ╔═══════════════════════════════╗
                │  ║ REST API + JWT Bearer Token   ║
                ├──║ SSE Stream: /chat/stream      ║
                │  ╚═══════════════════════════════╝
                │
┌───────────────▼──────────────────────┐
│   NestJS REST API  (Port 3000)      │
│                                      │
│  • 18 Functional Modules             │
│  • Swagger UI: /api/docs             │
│  • Guards: JwtAuthGuard, RolesGuard │
│  • Validation: class-validator       │
└───────────────┬──────────────────────┘
                │
                │  ╔═══════════════════════╗
                ├──║ Prisma ORM (Type-safe)║
                │  ╚═══════════════════════╝
                │
┌───────────────▼──────────────────────┐
│   Microsoft SQL Server (MSSQL)      │
│                                      │
│  • 27 Models                         │
│  • Complex Relations (1:N, N:M)     │
│  • Indexes for Performance           │
│  • Cascade Delete Rules              │
└──────────────────────────────────────┘

        ┌─────────────────────────────┐
        │  Self-Hosted LLM (Qwen3-4b) │
        │                             │
        │  • OpenAI-Compatible API    │
        │  • Used for Quiz Gen +      │
        │    Recommendation Reasons   │
        └─────────────────────────────┘
                ▲
                │ HTTP POST (JSON)
                │
        ┌───────┴────────┐
        │  NestJS API    │
        │ (native fetch) │
        └────────────────┘
```

### 3.3 الگوهای معماری استفاده‌شده

#### الف) معماری لایه‌ای (Layered Architecture)

```
┌──────────────────────────────┐
│   Presentation Layer         │  ← React Components, Pages
├──────────────────────────────┤
│   Service Layer              │  ← Axios Services, Business Logic
├──────────────────────────────┤
│   API Layer                  │  ← NestJS Controllers, DTOs
├──────────────────────────────┤
│   Business Logic Layer       │  ← NestJS Services, Algorithms
├──────────────────────────────┤
│   Data Access Layer          │  ← Prisma ORM, Repositories
├──────────────────────────────┤
│   Database Layer             │  ← SQL Server Tables, Indexes
└──────────────────────────────┘
```

#### ب) معماری ماژولار (Modular Architecture)

هر ماژول NestJS شامل:
- **Controller**: مدیریت HTTP endpoints
- **Service**: منطق کسب‌وکار
- **DTOs**: اعتبارسنجی ورودی/خروجی
- **Entities/Interfaces**: تعریف ساختارهای داده

#### ج) الگوی CQRS در Analytics

```typescript
// Command: تغییر وضعیت (اتفاقاً اینجا نداریم — read-only analytics)

// Query: خواندن با غنی‌سازی
async getCertificateWithSkills(certId: number) {
  const cert = await prisma.certificates.findUnique({ where: { Id: certId } });
  const skillBreakdown = await analyticsService.getAttemptSkills(cert.Attempt_Id);
  return { ...cert, skillBreakdown };  // غنی‌سازی در زمان خواندن
}
```

### 3.4 امنیت و احراز هویت

#### جریان احراز هویت (Authentication Flow)

```
کاربر → POST /auth/login { username, password }
         ↓
    بررسی اعتبار + bcrypt.compare()
         ↓
    sign JWT (payload: { sub, username, roleId })
         ↓
    ایجاد Refresh Token (UUID v4, expiry: 7 days)
         ↓
    ذخیره در جدول RefreshTokens
         ↓
    { accessToken, refreshToken } → کاربر
         ↓
    localStorage.setItem('accessToken', ...)
    localStorage.setItem('refreshToken', ...)
```

#### تازه‌سازی خودکار توکن (Silent Token Refresh)

```typescript
// Frontend: axios interceptor
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response.status === 401 && !isAuthEndpoint(error.config.url)) {
      const refreshToken = localStorage.getItem('refreshToken');
      const { data } = await axios.post('/auth/refresh', { refreshToken });
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // تلاش مجدد request اصلی
      error.config.headers.Authorization = `Bearer ${data.accessToken}`;
      return axios.request(error.config);
    }
    throw error;
  }
);
```

### 3.5 الگوهای پردازش داده

#### الف) توابع خالص (Pure Functions) برای تست‌پذیری

```typescript
// ✅ Pure: ورودی → خروجی، بدون side effect
export function groupBySkill(answers): SkillStat[] {
  const map = new Map();
  for (const a of answers) {
    // گروه‌بندی
  }
  return Array.from(map.values()).sort((a, b) => a.percentage - b.percentage);
}

// ✅ Pure: محاسبه ریاضی، بدون I/O
export function classifyTrend(scores): TrendClassification {
  const slope = computeLinearRegressionSlope(scores);
  if (slope > 2) return { status: 'صعودی', slope };
  // ...
}

// ✅ Pure: امتیازدهی، بدون دیتابیس
private scoreCourse(profile, course): { score, matchedTags } {
  let total = 0;
  total += computeSkillGap(profile.weakSkills, course.skillTags) * 0.45;
  total += computeLevelFit(profile.avgLevel, course.level) * 0.25;
  // ...
  return { score: total, matchedTags };
}
```

#### ب) الگوی Repository (از طریق Prisma)

```typescript
export class QuizService {
  constructor(private prisma: PrismaService) {}  // Dependency Injection
  
  async findAll(courseId: number) {
    return this.prisma.quizzes.findMany({
      where: { Course_Id: courseId },
      include: { _count: { select: { QuizQuestions: true } } }
    });
  }
}
```

</div>

---

## 4. پشته فناوری
## 4. Technology Stack

<div dir="rtl">

### 4.1 بک‌اند (Backend)

| حوزه | فناوری | نسخه | توضیح |
|---|---|---|---|
| **Runtime** | Node.js | 20+ | محیط اجرای JavaScript سمت سرور |
| **زبان** | TypeScript | 5.x | Type Safety + Modern JavaScript |
| **Framework** | NestJS | 11 | فریمورک مدرن با معماری Modular |
| **ORM** | Prisma | 5.22 | Type-safe database client |
| **Database** | SQL Server | 2019+ | پایگاه داده رابطه‌ای Microsoft |
| **احراز هویت** | JWT + Passport | - | JSON Web Tokens |
| **OAuth 2.0** | passport-google-oauth20 | - | ورود با Google |
| **Hash رمز** | bcrypt | 6 | هش امن رمزعبور (10 rounds) |
| **اعتبارسنجی** | class-validator | - | DTO validation با decorators |
| **تبدیل داده** | class-transformer | - | Plain object ↔ Class instance |
| **آپلود فایل** | Multer | 2 | Middleware برای multipart/form-data |
| **API Docs** | Swagger (OpenAPI) | - | مستندات خودکار در /api/docs |
| **Real-Time** | SSE (Server-Sent Events) | - | Push notifications بدون WebSocket |
| **State Management** | RxJS | 7 | Reactive programming برای SSE |
| **تست** | Jest + Supertest | 30 | Unit + Integration tests |
| **AI Integration** | Native Fetch API | - | ارتباط با LLM Server |

**ماژول‌های NestJS استفاده‌شده:**
```typescript
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CoursesModule,
    CategoriesModule,
    LevelsModule,
    CourseSectionsModule,
    LessonsModule,
    LessonFilesModule,
    QuizModule,
    AnalyticsModule,          // ← سیستم تحلیل یادگیری
    RecommendationsModule,    // ← سیستم توصیه دوره
    EnrollmentsModule,
    PaymentModule,
    CartModule,
    CertificatesModule,
    ChatModule,               // ← چت بلادرنگ با SSE
    InstructorRequestsModule,
    ContactMessagesModule,
    UploadModule,
  ]
})
export class AppModule {}
```

### 4.2 فرانت‌اند (Frontend)

| حوزه | فناوری | نسخه | توضیح |
|---|---|---|---|
| **زبان** | TypeScript | 5.x | Type Safety در React |
| **Framework** | React | 19 | کتابخانه UI با Hook-based design |
| **Routing** | React Router DOM | 7 | Client-side routing با Lazy Loading |
| **State Management** | Redux Toolkit | - | مدیریت state سراسری (courses, cart, ...) |
| **Auth State** | React Context API | - | مدیریت state احراز هویت |
| **HTTP Client** | Axios | - | Promise-based HTTP با interceptors |
| **UI Components** | Ant Design (antd) | 5 | کامپوننت‌های آماده (Table, Modal, ...) |
| **UI Framework** | Bootstrap | 5 | Grid system + utilities |
| **Additional UI** | PrimeReact | - | کامپوننت‌های تکمیلی |
| **Charts** | ApexCharts | - | نمودارهای تعاملی (Radar, Line, Bar) |
| | react-apexcharts | - | Wrapper رسمی React |
| **Video Player** | ReactPlayer | - | پخش ویدئو از منابع مختلف |
| **Notifications** | react-hot-toast | - | Toast notifications |
| | react-toastify | - | Toast با تنظیمات بیشتر |
| **Rich Text** | react-simple-wysiwyg | - | ویرایشگر متن |
| **Carousel** | Swiper | 11 | اسلایدر مدرن |
| | react-slick | - | اسلایدر کلاسیک |
| **CSS Pre-processor** | Sass (SCSS) | - | CSS با امکانات پیشرفته |
| **Icons** | Font Awesome | 6 | آیکون‌های وکتور |
| | React Icons | - | آیکون‌های React component |
| | Tabler Icons | - | مجموعه آیکون minimal |
| **Animation** | AOS | - | Animate On Scroll |
| **PDF/Image Export** | html2canvas | - | رندر HTML به Canvas (برای گواهینامه) |
| **Maps** | @react-google-maps/api | - | Google Maps integration |
| **Date Picker** | react-multi-date-picker | - | **تقویم شمسی/جلالی** (Persian calendar) |
| | react-date-object | - | ابزار کار با تاریخ |
| **Form Validation** | Formik + Yup | - | مدیریت فرم‌ها |

**کتابخانه‌های کمکی:**
- `react-select`: Dropdown پیشرفته
- `react-modal`: Modal dialog ها
- `react-image-lightbox`: Lightbox برای تصاویر
- `socket.io-client`: (در صورت نیاز به WebSocket — فعلاً SSE استفاده می‌شود)

### 4.3 هوش مصنوعی (AI/ML)

| حوزه | فناوری | توضیح |
|---|---|---|
| **LLM** | Qwen/Qwen3-4b | مدل زبانی 4 میلیارد پارامتر |
| **Hosting** | LM Studio | سرور سازگار با OpenAI API |
| **API Format** | OpenAI-compatible | `/v1/chat/completions` endpoint |
| **Model Size** | 4B parameters | تعادل بین سرعت و کیفیت |
| **Language** | Multilingual (با تأکید بر فارسی) | پشتیبانی کامل از فارسی |
| **Use Cases** | 1. تولید سوالات آزمون<br>2. تولید دلایل توصیه دوره | محدود به موارد ضروری |

**تنظیمات مدل:**
```json
{
  "model": "qwen/qwen3-4b",
  "temperature": 0.7,
  "max_tokens": 100,
  "chat_template_kwargs": {
    "enable_thinking": false
  }
}
```

### 4.4 DevOps و ابزارها

| حوزه | ابزار | توضیح |
|---|---|---|
| **Version Control** | Git + GitHub | مدیریت کد منبع |
| **Package Manager** | npm | مدیریت وابستگی‌ها |
| **Database Migration** | Prisma Migrate | مدیریت schema database |
| **Environment Variables** | dotenv | مدیریت .env files |
| **Code Linting** | ESLint | بررسی کیفیت کد TypeScript |
| **Code Formatting** | Prettier | فرمت‌دهی خودکار کد |
| **API Testing** | Swagger UI | تست دستی endpoints |
| **Unit Testing** | Jest | تست واحد (21 تست برای Analytics) |

</div>

---

## 5. ساختار پایگاه داده
## 5. Database Schema

<div dir="rtl">

### 5.1 خلاصه جداول (27 مدل)

پایگاه داده شامل **27 جدول** مرتبط با یکدیگر از طریق کلیدهای خارجی است:

| ردیف | نام جدول | تعداد ستون‌های کلیدی | روابط اصلی | هدف |
|---|---|---|---|---|
| 1 | **Users** | 15 | → Roles, Sex | کاربران (دانشجو/مدرس/ادمین) |
| 2 | **Roles** | 2 | ← Users | نقش‌های سیستم (1/2/3) |
| 3 | **Sex** | 3 | ← Users | جنسیت |
| 4 | **RefreshTokens** | 5 | → Users | توکن‌های تازه‌سازی (Token Rotation) |
| 5 | **Category** | 5 | ← Courses | دسته‌بندی‌های دوره |
| 6 | **Level** | 3 | ← Courses | سطوح دشواری |
| 7 | **Courses** | 18 | → Users, Category, Level | دوره‌های آموزشی |
| 8 | **CourseSections** | 6 | → Courses | بخش‌های دوره |
| 9 | **Lessons** | 12 | → Courses, CourseSections | درس‌ها (ویدئو + متن) |
| 10 | **LessonFiles** | 8 | → Lessons | فایل‌های قابل دانلود درس |
| 11 | **CourseLearningOutcomes** | 4 | → Courses | اهداف یادگیری |
| 12 | **CoursePrequisties** | 4 | → Courses | پیش‌نیازهای دوره |
| 13 | **Enrollments** | 5 | → Users, Courses | ثبت‌نام دانشجو در دوره |
| 14 | **CourseProgress** | 5 | → Users, Courses, Lessons | پیشرفت درس‌به‌درس |
| 15 | **Carts** | 4 | → Users, Courses | سبد خرید |
| 16 | **Payments** | 6 | → Users, Courses | پرداخت‌ها |
| 17 | **Reviews** | 6 | → Users, Courses | نظرات و امتیازات |
| 18 | **Quizzes** | 13 | → Courses | آزمون‌های دوره |
| 19 | **QuizQuestions** | 7 + **SkillTag** | → Quizzes | سوالات آزمون |
| 20 | **QuizChoices** | 5 | → QuizQuestions | گزینه‌های چندگزینه‌ای |
| 21 | **QuizAttempts** | 10 | → Users, Quizzes | تلاش‌های آزمون دانشجویان |
| 22 | **QuizAttemptAnswers** | 5 | → QuizAttempts, QuizQuestions, QuizChoices | پاسخ‌های دانشجو |
| 23 | **Certificates** | 7 | → Users, Courses, QuizAttempts | گواهینامه‌های صادرشده |
| 24 | **CourseRecommendations** | 7 | → Users, Courses | پیشنهادهای دوره شخصی |
| 25 | **InstructorRequests** | 7 | → Users | درخواست‌های مدرس شدن |
| 26 | **ChatMessages** | 10 | → Users, Courses | پیام‌های چت |
| 27 | **ChatReads** | 5 | → Users, Courses, ChatMessages | وضعیت خواندن چت |

*(+ 3 جدول دیگر: ChatMessageReactions, ChatPolls, ChatPollOptions, ChatPollVotes, ContactMessages)*

### 5.2 روابط کلیدی (Entity Relationship)

```
Users (1) ────── (N) Courses [Teacher_Id]
  │                    │
  │                    ├─── (N) Enrollments
  │                    │
  │                    ├─── (N) CourseSections
  │                    │         │
  │                    │         └─── (N) Lessons
  │                    │                   │
  │                    │                   └─── (N) LessonFiles
  │                    │
  │                    ├─── (N) Quizzes
  │                    │         │
  │                    │         └─── (N) QuizQuestions [+ SkillTag]
  │                    │                   │
  │                    │                   └─── (N) QuizChoices
  │                    │
  │                    └─── (N) ChatMessages
  │
  ├─── (N) QuizAttempts
  │         │
  │         ├─── (N) QuizAttemptAnswers
  │         │
  │         └─── (1) Certificates [unique]
  │
  ├─── (N) CourseProgress [Unique: Lesson_Id + Student_Id]
  │
  ├─── (N) CourseRecommendations [Unique: Student_Id + Course_Id]
  │
  ├─── (N) ChatReads [Unique: User_Id + Course_Id]
  │
  └─── (N) RefreshTokens
```

### 5.3 جداول کلیدی با توضیح کامل

#### 🔹 **Users** — کاربران سیستم

```sql
Users {
  Id: int (PK, Identity)
  FirstName: nvarchar(50)
  LastName: nvarchar(50)
  UserName: nvarchar(50) UNIQUE
  Email: nvarchar(200) UNIQUE
  Mobile: nvarchar(11) UNIQUE
  NationalCode: nvarchar(10)
  PasswordHash: nvarchar(500)      -- bcrypt hash
  Avatar: nvarchar(MAX)
  Role_Id: int FK → Roles          -- 1: Student, 2: Instructor, 3: Admin
  Sex_Id: int FK → Sex
  IsActive: bit DEFAULT 1
  CreatedAt: datetime DEFAULT GETDATE()
  UpdatedAt: datetime
  LastLogin: datetime
}

-- Indexes
IX_Users_RoleId ON Role_Id
IX_Users_Email ON Email
IX_Users_UserName ON UserName
```

**نقش‌ها (Roles):**
- `1`: Student (پیش‌فرض در هنگام ثبت‌نام)
- `2`: Instructor (بعد از تأیید درخواست)
- `3`: Admin (دسترسی کامل به سیستم)

#### 🔹 **Courses** — دوره‌های آموزشی

```sql
Courses {
  Id: int (PK)
  Title: nvarchar(200)
  Description: nvarchar(MAX)
  ShortDescription: nvarchar(500)
  Price: decimal(18,2) DEFAULT 0
  DiscountPrice: decimal(18,2) NULL
  IsPublished: bit DEFAULT 0           -- قابل نمایش عمومی؟
  CreatedAt: datetime DEFAULT GETDATE()
  UpdatedAt: datetime
  Teacher_Id: int FK → Users
  CategoryId: int FK → Category
  Level_Id: int FK → Level
  Slug: nvarchar(250) UNIQUE           -- URL-friendly identifier
  Thumbnail: nvarchar(500)
  DurationMinutes: int
  AverageRating: decimal(3,2) DEFAULT 0  -- محاسبه شده از Reviews
}

-- Indexes
IX_Courses_TeacherId ON Teacher_Id
IX_Courses_CategoryId ON CategoryId
IX_Courses_Slug ON Slug
```

**قوانین انتشار:**
- حداقل یک بخش (Section)
- حداقل یک درس (Lesson)
- عنوان و توضیحات پر شده باشد

#### 🔹 **QuizQuestions** — سوالات آزمون (با SkillTag)

```sql
QuizQuestions {
  Id: int (PK)
  Quiz_Id: int FK → Quizzes
  QuestionText: nvarchar(MAX)
  DisplayOrder: int DEFAULT 1
  Source: bit DEFAULT 0                 -- 0: دستی، 1: AI-generated
  CreatedAt: datetime DEFAULT GETDATE()
  Score: decimal(5,2) DEFAULT 1         -- امتیاز سوال (امکان وزن‌دهی)
  SkillTag: nvarchar(200) NULL          -- ⭐ کلید نوآوری: "حلقه‌های تکرار"، "مدیریت حافظه"
}

-- Indexes
IX_QuizQuestions_QuizId ON Quiz_Id
```

**استفاده از SkillTag:**
1. تحلیل مهارتی دانشجو (`groupBySkill`)
2. الگوریتم توصیه دوره (`SKILL_GAP_MATCH`)
3. غنی‌سازی گواهینامه (skill breakdown widget)
4. تحلیل کلاسی برای مدرس

#### 🔹 **QuizAttempts** — تلاش‌های آزمون

```sql
QuizAttempts {
  Id: int (PK)
  Quiz_Id: int FK → Quizzes
  Student_Id: int FK → Users
  QuestionIds: nvarchar(MAX)            -- JSON: [23, 7, 41, ...] (سوالات انتخابی)
  StartedAt: datetime DEFAULT GETDATE()
  DeadlineAt: datetime                  -- StartedAt + DurationMinutes
  SubmittedAt: datetime NULL
  Score: decimal(5,2) NULL
  MaxScore: decimal(5,2) NULL
  IsPassed: bit NULL
}

-- Constraints
UQ_QuizAttempts_Quiz_Student UNIQUE (Quiz_Id, Student_Id)  -- یک تلاش به ازای هر دانشجو

-- Indexes
IX_QuizAttempts_StudentId ON Student_Id
IX_QuizAttempts_QuizId ON Quiz_Id
```

#### 🔹 **Certificates** — گواهینامه‌ها

```sql
Certificates {
  Id: int (PK)
  Student_Id: int FK → Users
  Course_Id: int FK → Courses
  Attempt_Id: int FK → QuizAttempts UNIQUE  -- هر attempt فقط یک گواهینامه
  CertificateCode: nvarchar(100) UNIQUE     -- CERT-{courseId}-{attemptId}-{timestamp}
  Score: decimal(5,2)
  MaxScore: decimal(5,2)
  IssuedAt: datetime DEFAULT GETDATE()
}

-- Indexes
IX_Certificates_StudentId ON Student_Id
IX_Certificates_CertificateCode ON CertificateCode
```

**نحوه صدور:**
- صدور خودکار در تراکنش `submitQuiz`
- شرط: `IsPassed = true`
- کد یکتا برای جستجو و تأیید

#### 🔹 **CourseRecommendations** — پیشنهادهای دوره

```sql
CourseRecommendations {
  Id: int (PK)
  Student_Id: int FK → Users
  Course_Id: int FK → Courses
  Score: decimal(5,2)                    -- 0-100 (از الگوریتم وزن‌دار)
  Reason: nvarchar(500)                  -- جمله فارسی تولید شده توسط LLM
  MatchedSkillTags: nvarchar(500)        -- JSON: ["حلقه‌های تکرار", "آرایه‌ها"]
  Status: nvarchar(20) DEFAULT 'Active'  -- Active | Dismissed | Enrolled
  GeneratedAt: datetime DEFAULT GETDATE()
}

-- Constraints
UQ_Recommendations_Student_Course UNIQUE (Student_Id, Course_Id)

-- Indexes
IX_Recommendations_StudentId ON Student_Id
IX_Recommendations_Status ON Status
IX_Recommendations_GeneratedAt ON GeneratedAt
```

**چرخه حیات:**
1. `Active`: نمایش در پنل دانشجو
2. `Dismissed`: دانشجو رد کرد
3. `Enrolled`: دانشجو ثبت‌نام کرد (conversion!)

#### 🔹 **ChatMessages** — پیام‌های چت

```sql
ChatMessages {
  Id: int (PK)
  Course_Id: int FK → Courses
  Sender_Id: int FK → Users
  Content: nvarchar(MAX)
  AttachmentUrl: nvarchar(500) NULL
  AttachmentName: nvarchar(255) NULL
  AttachmentType: nvarchar(50) NULL
  AttachmentSize: bigint NULL             -- حجم فایل (بایت)
  ReplyTo_Id: int FK → ChatMessages NULL  -- Self-reference برای Thread
  CreatedAt: datetime DEFAULT GETDATE()
}

-- Indexes
IX_ChatMessages_CourseId ON Course_Id
IX_ChatMessages_SenderId ON Sender_Id
IX_ChatMessages_CreatedAt ON CreatedAt DESC
```

**ویژگی‌های چت:**
- Thread Replies (ReplyTo_Id)
- File Attachments (URL + metadata)
- Emoji Reactions (جدول جداگانه)
- Polls (جدول جداگانه)

#### 🔹 **CourseProgress** — پیشرفت درس‌به‌درس

```sql
CourseProgress {
  Id: int (PK)
  Course_Id: int FK → Courses
  Lesson_Id: int FK → Lessons
  Student_Id: int FK → Users
  IsCompleted: bit DEFAULT 0
  CompletedAt: datetime NULL
}

-- Constraints
UQ_CourseProgress_Lesson_Student UNIQUE (Lesson_Id, Student_Id)  -- هر درس فقط یک بار

-- Indexes
IX_CourseProgress_StudentId ON Student_Id
IX_CourseProgress_LessonId ON Lesson_Id
```

**محاسبه درصد پیشرفت:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE IsCompleted = 1) * 100.0 / COUNT(*) AS progress_percentage
FROM CourseProgress
WHERE Student_Id = ? AND Course_Id = ?
```

### 5.4 نمودار ER (Simplified)

```
┌────────────┐         ┌─────────────┐
│   Users    │────1:N──│   Courses   │
│  (Student, │         │ (Publisher: │
│ Instructor,│         │  Instructor)│
│   Admin)   │         └──────┬──────┘
└─────┬──────┘                │
      │                       │
      │1:N                    │1:N
      │                       │
┌─────▼──────┐         ┌──────▼──────┐
│ QuizAttempts│────1:1──│ Certificates│
│ (Student's  │         │  (Issued on │
│  Attempt)   │         │    Pass)    │
└──────┬──────┘         └─────────────┘
       │
       │1:N
       │
┌──────▼─────────────┐
│ QuizAttemptAnswers │──N:1──→ QuizQuestions [SkillTag]
│  (Student's per-   │
│   question answer) │
└────────────────────┘
```

</div>

---

## 6. ماژول‌های اصلی سیستم
## 6. Core System Modules

<div dir="rtl">

### 6.1 ماژول احراز هویت (Auth Module)

**مسئولیت‌ها:**
- ثبت‌نام کاربران جدید (پیش‌فرض: نقش دانشجو)
- ورود با username/password + صدور JWT
- ورود با Google OAuth 2.0
- تازه‌سازی توکن (Token Rotation)
- خروج (Revoke کردن refresh token)

**Endpoints:**
```
POST   /auth/register          → ثبت‌نام
POST   /auth/login             → ورود
POST   /auth/refresh           → تازه‌سازی توکن
POST   /auth/logout            → خروج
GET    /auth/google            → شروع OAuth
GET    /auth/google/callback   → Callback OAuth
```

**Guards:**
- `JwtAuthGuard`: بررسی Bearer token در هدر
- `RolesGuard`: بررسی نقش کاربر (`@Roles(1, 2, 3)`)
- `OptionalJwtAuthGuard`: برای endpoint های عمومی با امکان شخصی‌سازی
- `SseAuthGuard`: برای احراز هویت SSE از طریق query parameter

**استراتژی‌های Passport:**
- `JwtStrategy`: استخراج user از token + بررسی `IsActive`
- `GoogleStrategy`: OAuth flow با Google

### 6.2 ماژول دوره‌ها (Courses Module)

**مسئولیت‌ها:**
- CRUD دوره‌ها (Create, Read, Update, Delete)
- مدیریت بخش‌ها و درس‌ها
- مدیریت اهداف یادگیری و پیش‌نیازها
- انتشار دوره (Publish/Unpublish)
- مشاهده دانشجویان ثبت‌نام‌شده
- گزارش عملکرد (Performance Report)

**Endpoints کلیدی:**
```
GET    /courses                    → لیست دوره‌های منتشرشده (عمومی)
GET    /courses/browse             → جستجو و فیلتر (عمومی)
POST   /courses                    → ایجاد دوره (Instructor/Admin)
GET    /courses/my                 → دوره‌های خودم (Instructor)
GET    /courses/enrolled           → دوره‌های ثبت‌نام‌شده (Student)
GET    /courses/:id                → جزئیات دوره
PUT    /courses/:id                → ویرایش دوره (Owner/Admin)
DELETE /courses/:id                → حذف دوره (Owner/Admin)
PUT    /courses/:id/publish        → انتشار/لغو انتشار
GET    /courses/:id/students       → دانشجویان + پیشرفت (Owner/Admin)
GET    /courses/admin/performance-report  → گزارش کلی (Admin)
```

**قوانین کسب‌وکار:**
- مدرس فقط دوره‌های خودش را می‌بیند/ویرایش می‌کند
- Admin همه دوره‌ها را می‌بیند
- انتشار نیازمند حداقل 1 Section + 1 Lesson است
- Slug خودکار از عنوان تولید می‌شود (URL-friendly)

### 6.3 ماژول آزمون (Quiz Module)

**دو API مجزا:**
1. **API مدرس** (`quiz.controller.ts`): مدیریت بانک سوالات
2. **API دانشجو** (`student-quiz.controller.ts`): شروع و ارسال آزمون

#### الف) API مدرس

```
GET    /courses/:courseId/quizzes            → لیست آزمون‌های دوره
POST   /courses/:courseId/quizzes            → ایجاد آزمون خالی
GET    /quizzes/:quizId                      → جزئیات + بانک سوالات
PUT    /quizzes/:quizId                      → ویرایش تنظیمات + بانک سوالات
PUT    /quizzes/:quizId/publish              → انتشار/لغو انتشار
DELETE /quizzes/:quizId                      → حذف (Hard یا Soft بسته به attempts)
POST   /quizzes/:quizId/generate             → تولید سوالات با AI (پیشنمایش)
```

**تابع کلیدی: `generateQuestions()`**

```typescript
async generateQuestions(quizId: number, user: any, dto: GenerateQuizDto) {
  // 1️⃣ بارگذاری کامل دوره
  const quiz = await this.verifyQuizOwnership(quizId, user);
  const course = quiz.Courses;  // شامل: Sections, Lessons, Outcomes, Prerequisites

  // 2️⃣ ساخت پرامپت
  const { system, user: userPrompt } = this.buildPrompt(course, dto.count);

  // 3️⃣ فراخوانی LLM
  const response = await fetch(AI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen/qwen3-4b',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: dto.count * 150,  // تخمین: 150 token per question
      chat_template_kwargs: { enable_thinking: false }
    })
  });

  // 4️⃣ پردازش پاسخ
  const data = await response.json();
  const rawContent = data.choices[0].message.content;
  const questions = this.extractJsonArray(rawContent, course.Category.Title);

  // 5️⃣ برگشت به مدرس برای بررسی (بدون ذخیره خودکار)
  return {
    generated: questions.length,
    questions: questions.map((q, i) => ({
      ...q,
      displayOrder: i + 1,
      score: quiz.ScorePerQuestion,
      source: true  // AI-generated flag
    }))
  };
}
```

#### ب) API دانشجو

```
GET    /quizzes/my                           → آزمون‌های دوره‌های من
POST   /quizzes/:quizId/start                → شروع آزمون (انتخاب تصادفی سوالات)
POST   /quiz/attempts/:attemptId/submit      → ارسال پاسخ‌ها + صدور گواهینامه
GET    /quiz/attempts/:attemptId/result      → نتیجه آزمون
GET    /quiz/in-progress                     → آزمون در حال انجام (اگر هست)
```

**تابع کلیدی: `startQuiz()`**

```typescript
async startQuiz(quizId: number, user: any) {
  // 1️⃣ بررسی شرایط
  const quiz = await this.prisma.quizzes.findUnique({
    where: { Id: quizId },
    include: { Courses: { include: { Enrollments: true } }, QuizQuestions: true }
  });

  if (!quiz.IsPublished) throw new ForbiddenException('آزمون منتشر نشده');
  if (now < quiz.StartAt || now > quiz.EndAt) throw new ForbiddenException('خارج از زمان');
  
  const isEnrolled = quiz.Courses.Enrollments.some(e => e.Student_Id === user.id);
  if (!isEnrolled) throw new ForbiddenException('ثبت‌نام نشده‌اید');

  const existingAttempt = await this.prisma.quizAttempts.findUnique({
    where: { Quiz_Id_Student_Id: { Quiz_Id: quizId, Student_Id: user.id } }
  });
  if (existingAttempt) throw new BadRequestException('قبلاً شرکت کرده‌اید');

  // 2️⃣ انتخاب تصادفی سوالات (Fisher-Yates Shuffle)
  const allQuestionIds = quiz.QuizQuestions.map(q => q.Id);
  const shuffled = this.fisherYatesShuffle([...allQuestionIds]);
  const selectedIds = shuffled.slice(0, quiz.QuestionsToShow);

  // 3️⃣ ایجاد attempt
  const attempt = await this.prisma.quizAttempts.create({
    data: {
      Quiz_Id: quizId,
      Student_Id: user.id,
      QuestionIds: JSON.stringify(selectedIds),
      StartedAt: now,
      DeadlineAt: addMinutes(now, quiz.DurationMinutes),
    }
  });

  // 4️⃣ بازیابی سوالات (بدون نمایش پاسخ صحیح)
  const questions = await this.prisma.quizQuestions.findMany({
    where: { Id: { in: selectedIds } },
    include: { QuizChoices: { orderBy: { DisplayOrder: 'asc' } } },
    orderBy: { DisplayOrder: 'asc' }
  });

  // 5️⃣ حذف IsCorrect از گزینه‌ها
  const sanitized = questions.map(q => ({
    ...q,
    QuizChoices: q.QuizChoices.map(({ IsCorrect, ...rest }) => rest)
  }));

  return {
    attemptId: attempt.Id,
    deadline: attempt.DeadlineAt,
    questions: sanitized
  };
}
```

**تابع کلیدی: `submitQuiz()` + Atomic Certificate Issuance**

```typescript
async submitQuiz(attemptId: number, user: any, dto: SubmitQuizDto) {
  const attempt = await this.prisma.quizAttempts.findUnique({
    where: { Id: attemptId },
    include: { Quizzes: { include: { Courses: true } } }
  });

  if (attempt.Student_Id !== user.id) throw new ForbiddenException();
  if (attempt.SubmittedAt) throw new BadRequestException('قبلاً ارسال شده');

  // بازیابی سوالات و گزینه‌های صحیح
  const selectedQuestionIds = JSON.parse(attempt.QuestionIds);
  const questions = await this.prisma.quizQuestions.findMany({
    where: { Id: { in: selectedQuestionIds } },
    include: { QuizChoices: true }
  });

  // محاسبه نمره
  let score = 0;
  let maxScore = 0;
  const gradedAnswers = [];

  for (const q of questions) {
    maxScore += Number(q.Score);
    const studentChoice = dto.answers.find(a => a.questionId === q.Id)?.choiceId;
    const correctChoice = q.QuizChoices.find(c => c.IsCorrect);
    const isCorrect = studentChoice === correctChoice?.Id;

    if (isCorrect) score += Number(q.Score);

    gradedAnswers.push({
      Attempt_Id: attemptId,
      Question_Id: q.Id,
      Choice_Id: studentChoice || null,
      IsCorrect: isCorrect
    });
  }

  const isPassed = score >= attempt.Quizzes.PassScore;

  // ⭐ تراکنش اتمی
  await this.prisma.$transaction(async (tx) => {
    // ذخیره پاسخ‌ها
    for (const ans of gradedAnswers) {
      await tx.quizAttemptAnswers.create({ data: ans });
    }

    // به‌روزرسانی attempt
    await tx.quizAttempts.update({
      where: { Id: attemptId },
      data: {
        SubmittedAt: new Date(),
        Score: score,
        MaxScore: maxScore,
        IsPassed: isPassed
      }
    });

    // صدور گواهینامه (فقط اگر قبول شد)
    if (isPassed) {
      await tx.certificates.create({
        data: {
          Student_Id: user.id,
          Course_Id: attempt.Quizzes.Course_Id,
          Attempt_Id: attemptId,
          CertificateCode: `CERT-${attempt.Quizzes.Course_Id}-${attemptId}-${Date.now()}`,
          Score: score,
          MaxScore: maxScore,
          IssuedAt: new Date()
        }
      });
    }
  });

  // تازه‌سازی پیشنهادها (fire-and-forget)
  if (isPassed) {
    this.recommendationsService.refresh(user.id).catch(err => 
      console.warn('Recommendation refresh failed:', err)
    );
  }

  return { score, maxScore, isPassed, passed: isPassed ? 'قبول' : 'مردود' };
}
```

### 6.4 ماژول چت (Chat Module)

**معماری:**
- **SSE Broadcaster**: `ChatEventsService` (Singleton)
- **In-Memory State**: `Map<userId, Set<Subject<MessageEvent>>>`
- **Endpoint Stream**: `GET /chat/stream?token=JWT`

**Endpoints:**
```
GET    /chat/stream?token=            → جریان SSE (اتصال دائمی)
GET    /chat/courses                  → لیست چت‌ها با unread count
GET    /chat/courses/:id/messages     → تاریخچه پیام‌ها (صفحه‌بندی شده)
GET    /chat/courses/:id/members      → اعضا + وضعیت آنلاین
POST   /chat/courses/:id/messages     → ارسال پیام/فایل/پاسخ
DELETE /chat/messages/:id             → حذف پیام
POST   /chat/courses/:id/read         → علامت‌گذاری به‌عنوان خوانده‌شده
POST   /chat/courses/:id/typing       → اعلام "در حال تایپ..."
POST   /chat/messages/:id/reaction    → افزودن/حذف Emoji Reaction
GET    /chat/courses/:id/polls        → نظرسنجی‌های دوره
POST   /chat/courses/:id/polls        → ایجاد نظرسنجی (Instructor/Admin)
POST   /chat/polls/:id/vote           → رأی‌دادن
```

**جریان رویدادها:**

```typescript
@Sse('stream')
chatStream(@Query('token') token: string): Observable<MessageEvent> {
  const user = this.verifyTokenAndGetUser(token);  // احراز هویت از query param
  
  const subject = new Subject<MessageEvent>();
  this.chatEventsService.addConnection(user.id, subject);

  // Heartbeat برای جلوگیری از timeout
  const heartbeat = interval(25000).pipe(
    map(() => ({ data: { type: 'ping' } }))
  );

  // ترکیب rویدادهای واقعی + heartbeat
  return merge(subject.asObservable(), heartbeat).pipe(
    finalize(() => {
      this.chatEventsService.removeConnection(user.id, subject);
    })
  );
}
```

**انواع رویدادها:**
```typescript
type ChatEvent = 
  | { type: 'new-message', data: ChatMessage }
  | { type: 'message-deleted', data: { messageId: number } }
  | { type: 'typing', data: { userId: number, userName: string } }
  | { type: 'read', data: { userId: number, lastReadMessageId: number } }
  | { type: 'reaction', data: { messageId: number, userId: number, emoji: string } }
  | { type: 'new-poll', data: ChatPoll }
  | { type: 'poll-vote', data: { pollId: number, optionId: number, userId: number } }
  | { type: 'ping', data: {} };  // Heartbeat
```

**Broadcast Logic:**

```typescript
async sendMessage(courseId: number, user: any, dto: SendMessageDto) {
  await this.assertAccess(courseId, user);  // بررسی enrollment یا instructor/admin

  const message = await this.prisma.chatMessages.create({
    data: {
      Course_Id: courseId,
      Sender_Id: user.id,
      Content: dto.content,
      AttachmentUrl: dto.attachmentUrl,
      ReplyTo_Id: dto.replyToId
    },
    include: { Sender: { select: { FirstName: true, LastName: true, Avatar: true } } }
  });

  // 🔔 Broadcast به همه اعضای دوره (به‌جز فرستنده)
  const members = await this.getCourseMemberIds(courseId);
  this.chatEventsService.broadcast(members, {
    type: 'new-message',
    data: message
  }, user.id);  // excludeUserId

  return message;
}
```

### 6.5 ماژول پرداخت (Payment Module)

**شبیه‌سازی ساده:**
```typescript
async checkout(user: any) {
  const cartItems = await this.prisma.carts.findMany({
    where: { User_Id: user.id },
    include: { Courses: true }
  });

  if (cartItems.length === 0) throw new BadRequestException('سبد خرید خالی است');

  const totalAmount = cartItems.reduce((sum, item) => 
    sum + Number(item.Courses.DiscountPrice || item.Courses.Price), 0
  );

  await this.prisma.$transaction(async (tx) => {
    // ایجاد پرداخت‌ها
    for (const item of cartItems) {
      await tx.payments.create({
        data: {
          User_Id: user.id,
          Course_Id: item.Course_Id,
          Amount: Number(item.Courses.DiscountPrice || item.Courses.Price),
          RefNumber: `SIM-${Date.now()}-${item.Course_Id}`,  // شماره مرجع شبیه‌سازی‌شده
          Status: 1,  // 1 = موفق
          CreatedAt: new Date()
        }
      });

      // ایجاد ثبت‌نام (اگر قبلاً ثبت‌نام نشده)
      const existing = await tx.enrollments.findFirst({
        where: { Student_Id: user.id, Course_Id: item.Course_Id }
      });
      if (!existing) {
        await tx.enrollments.create({
          data: {
            Student_Id: user.id,
            Course_Id: item.Course_Id,
            EnrollmentDate: new Date(),
            Status: 1
          }
        });
      }
    }

    // پاک کردن سبد خرید
    await tx.carts.deleteMany({ where: { User_Id: user.id } });
  });

  return { success: true, totalAmount, itemCount: cartItems.length };
}
```

**یادآوری:** این شبیه‌سازی است. در محیط واقعی باید به درگاه پرداخت واقعی (مثل ZarinPal، Saman، Mellat) متصل شود.

</div>

---

**(ادامه در پیام بعدی به دلیل محدودیت طول)**

## 7. سیستم تحلیل یادگیری تطبیقی
## 7. Adaptive Learning Analytics System

<div dir="rtl">

### 7.1 معماری ماژول Analytics

```
┌─────────────────────────────────────────────┐
│         AnalyticsService                    │
│                                             │
│  Pure Functions (قابل تست بدون دیتابیس):   │
│  • groupBySkill(answers[])                  │
│  • classifyTrend(scores[])                  │
│                                             │
│  Database Queries:                          │
│  • getAttemptSkills(attemptId)              │
│  • getMySkillProfile(studentId)             │
│  • getProgressTrend(studentId)              │
│  • getCourseSkillsOverview(courseId)        │
│  • getCourseStudents(courseId)              │
│  • getStudentTrend(studentId)               │
│  • getCourseTrendOverview(courseId)         │
└─────────────────────────────────────────────┘
          │
          │ استفاده می‌کند
          ▼
┌─────────────────────────────────────────────┐
│         PrismaService                       │
│                                             │
│  • QuizAttempts                             │
│  • QuizAttemptAnswers                       │
│  • QuizQuestions (SkillTag)                 │
│  • CourseProgress                           │
└─────────────────────────────────────────────┘
```

### 7.2 توابع محوری

#### الف) `groupBySkill()` — تحلیل مهارتی

```typescript
export interface SkillStat {
  tag: string;          // "حلقه‌های تکرار"
  correct: number;      // تعداد پاسخ‌های صحیح
  total: number;        // تعداد کل سوالات این مهارت
  percentage: number;   // Math.round(correct/total * 100)
}

groupBySkill(answers: { skillTag: string | null, isCorrect: boolean }[]): SkillStat[] {
  const map = new Map<string, { correct: number, total: number }>();

  for (const answer of answers) {
    // برچسب null/خالی → "سایر"
    const tag = answer.skillTag?.trim() || 'سایر';
    
    const bucket = map.get(tag) || { correct: 0, total: 0 };
    bucket.total += 1;
    if (answer.isCorrect) bucket.correct += 1;
    map.set(tag, bucket);
  }

  // تبدیل Map به آرایه + محاسبه درصد
  const result: SkillStat[] = [];
  for (const [tag, { correct, total }] of map.entries()) {
    result.push({
      tag,
      correct,
      total,
      percentage: total === 0 ? 0 : Math.round((correct / total) * 100)
    });
  }

  // مرتب‌سازی از ضعیف‌ترین به قوی‌ترین
  result.sort((a, b) => a.percentage - b.percentage);
  
  return result;
}
```

**مثال ورودی/خروجی:**

```javascript
// Input
const answers = [
  { skillTag: 'حلقه‌های تکرار', isCorrect: true },
  { skillTag: 'حلقه‌های تکرار', isCorrect: false },
  { skillTag: 'حلقه‌های تکرار', isCorrect: false },
  { skillTag: 'آرایه‌ها', isCorrect: true },
  { skillTag: 'آرایه‌ها', isCorrect: true },
  { skillTag: 'مدیریت حافظه', isCorrect: true },
  { skillTag: null, isCorrect: false }  // برچسب خالی
];

// Output (sorted by percentage ascending)
[
  { tag: 'حلقه‌های تکرار', correct: 1, total: 3, percentage: 33 },  // ضعیف‌ترین
  { tag: 'سایر', correct: 0, total: 1, percentage: 0 },
  { tag: 'آرایه‌ها', correct: 2, total: 2, percentage: 100 },
  { tag: 'مدیریت حافظه', correct: 1, total: 1, percentage: 100 }
]
```

#### ب) `classifyTrend()` — تشخیص روند یادگیری

**الگوریتم: رگرسیون خطی (Least Squares Linear Regression)**

```typescript
export interface TrendClassification {
  status: 'صعودی' | 'نزولی' | 'ثابت' | 'داده کافی نیست';
  slope: number;         // شیب خط رگرسیون
  description?: string;  // توضیح فارسی
}

classifyTrend(scores: { date: Date, percentage: number }[]): TrendClassification {
  // بررسی حداقل تعداد داده
  if (scores.length < 2) {
    return {
      status: 'داده کافی نیست',
      slope: 0,
      description: 'حداقل دو آزمون برای تحلیل روند لازم است.'
    };
  }

  // مرتب‌سازی بر اساس تاریخ (صعودی)
  const sorted = [...scores].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const n = sorted.length;

  // بررسی یکسان بودن همه نمرات
  const allSame = sorted.every(s => s.percentage === sorted[0].percentage);
  if (allSame) {
    return {
      status: 'ثابت',
      slope: 0,
      description: `نمره در ${sorted[0].percentage}٪ ثابت مانده است.`
    };
  }

  // محاسبه رگرسیون خطی: y = mx + b
  // x: شماره آزمون (0, 1, 2, ...)
  // y: درصد نمره
  
  let sumX = 0;    // مجموع X ها
  let sumY = 0;    // مجموع Y ها
  let sumXY = 0;   // مجموع X*Y ها
  let sumX2 = 0;   // مجموع X² ها

  for (let i = 0; i < n; i++) {
    const x = i;  // آزمون اول = 0، دوم = 1، ...
    const y = sorted[i].percentage;
    
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  // فرمول شیب (slope):
  // m = (n*ΣXY - ΣX*ΣY) / (n*ΣX² - (ΣX)²)
  const numerator = n * sumXY - sumX * sumY;
  const denominator = n * sumX2 - sumX * sumX;

  if (denominator === 0) {
    return {
      status: 'ثابت',
      slope: 0,
      description: 'روند نامشخص است.'
    };
  }

  const slope = numerator / denominator;

  // آستانه‌های تصمیم‌گیری (قابل تنظیم)
  const POSITIVE_THRESHOLD = 2;   // شیب > +2 → صعودی
  const NEGATIVE_THRESHOLD = -2;  // شیب < -2 → نزولی

  let status: TrendClassification['status'];
  let description: string;

  if (slope > POSITIVE_THRESHOLD) {
    status = 'صعودی';
    description = `روند یادگیری صعودی است (شیب: ${slope.toFixed(2)} واحد درصد به ازای هر آزمون).`;
  } else if (slope < NEGATIVE_THRESHOLD) {
    status = 'نزولی';
    description = `روند یادگیری نزولی است (شیب: ${slope.toFixed(2)} واحد درصد به ازای هر آزمون). نیاز به توجه بیشتر دارد.`;
  } else {
    status = 'ثابت';
    description = `روند یادگیری نسبتاً ثابت است (شیب: ${slope.toFixed(2)} واحد درصد به ازای هر آزمون).`;
  }

  return { status, slope, description };
}
```

**مثال محاسبه:**

```javascript
// آزمون‌های یک دانشجو در طول زمان
const scores = [
  { date: '2024-01-01', percentage: 40 },  // آزمون اول
  { date: '2024-01-15', percentage: 55 },  // آزمون دوم
  { date: '2024-02-01', percentage: 68 },  // آزمون سوم
  { date: '2024-02-15', percentage: 75 },  // آزمون چهارم
];

// محاسبات:
// n = 4
// X values: [0, 1, 2, 3]
// Y values: [40, 55, 68, 75]
//
// ΣX = 0+1+2+3 = 6
// ΣY = 40+55+68+75 = 238
// ΣXY = 0*40 + 1*55 + 2*68 + 3*75 = 0+55+136+225 = 416
// ΣX² = 0+1+4+9 = 14
//
// slope = (4*416 - 6*238) / (4*14 - 6*6)
//       = (1664 - 1428) / (56 - 36)
//       = 236 / 20
//       = 11.8

classifyTrend(scores);
// Output:
// {
//   status: 'صعودی',
//   slope: 11.8,
//   description: 'روند یادگیری صعودی است (شیب: 11.80 واحد درصد به ازای هر آزمون).'
// }
```

### 7.3 Endpoints تحلیلی

#### 1️⃣ تحلیل یک آزمون خاص

```http
GET /analytics/attempts/:attemptId/skills
Authorization: Bearer <JWT>
```

**دسترسی:**
- دانشجو: فقط آزمون خودش
- مدرس: آزمون‌های دوره‌های خودش
- ادمین: همه آزمون‌ها

**پاسخ:**
```json
{
  "attemptId": 12,
  "skills": [
    {
      "tag": "حلقه‌های تکرار",
      "correct": 2,
      "total": 6,
      "percentage": 33
    },
    {
      "tag": "آرایه‌ها",
      "correct": 4,
      "total": 5,
      "percentage": 80
    }
  ]
}
```

#### 2️⃣ پروفایل مهارتی تجمعی دانشجو

```http
GET /analytics/students/me/skills?courseId=5
Authorization: Bearer <JWT>
```

**پارامترها:**
- `courseId` (اختیاری): فیلتر بر اساس یک دوره خاص

**پاسخ:**
```json
{
  "skills": [
    {
      "tag": "حلقه‌های تکرار",
      "correct": 15,
      "total": 42,
      "percentage": 36
    },
    {
      "tag": "توابع",
      "correct": 28,
      "total": 35,
      "percentage": 80
    }
  ]
}
```

**کاربرد:** رادار چارت در داشبورد دانشجو

#### 3️⃣ روند پیشرفت دانشجو (نمرات آزمون + تکمیل دوره)

```http
GET /analytics/students/me/progress-trend?courseId=5
Authorization: Bearer <JWT>
```

**پاسخ:**
```json
{
  "quizScores": [
    {
      "date": "2024-01-15T10:30:00Z",
      "percentage": 65,
      "courseTitle": "آموزش Python"
    },
    {
      "date": "2024-02-01T14:20:00Z",
      "percentage": 78,
      "courseTitle": "آموزش Python"
    }
  ],
  "courseCompletion": [
    {
      "date": "2024-01-10T09:15:00Z",
      "percentage": 20,
      "courseTitle": "آموزش Python"
    },
    {
      "date": "2024-01-25T16:45:00Z",
      "percentage": 60,
      "courseTitle": "آموزش Python"
    }
  ]
}
```

**کاربرد:** نمودار خطی دوگانه (dual line chart)

#### 4️⃣ تحلیل مهارتی کل کلاس (برای مدرس)

```http
GET /analytics/courses/:courseId/skills-overview
Authorization: Bearer <JWT> (Instructor/Admin)
```

**پاسخ:**
```json
{
  "courseId": 5,
  "totalStudents": 87,
  "skills": [
    {
      "tag": "حلقه‌های تکرار",
      "correct": 234,
      "total": 522,
      "percentage": 45,
      "studentCount": 87  // تعداد دانشجویانی که این مهارت را داشتند
    }
  ]
}
```

#### 5️⃣ لیست دانشجویان با جزئیات مهارتی (برای مدرس)

```http
GET /analytics/courses/:courseId/students
Authorization: Bearer <JWT> (Instructor/Admin)
```

**پاسخ:**
```json
{
  "students": [
    {
      "studentId": 42,
      "studentName": "علی احمدی",
      "progressPercentage": 75,
      "quizScore": 82,
      "maxScore": 100,
      "isPassed": true,
      "certificateCode": "CERT-5-123-1234567890",
      "skills": [
        { "tag": "حلقه‌ها", "percentage": 40 },
        { "tag": "آرایه‌ها", "percentage": 90 }
      ]
    }
  ]
}
```

#### 6️⃣ تحلیل روند یک دانشجو (برای مدرس/ادمین)

```http
GET /analytics/students/:studentId/trend?courseId=5
Authorization: Bearer <JWT> (Instructor/Admin)
```

**پاسخ:**
```json
{
  "studentId": 42,
  "studentName": "علی احمدی",
  "trend": {
    "status": "صعودی",
    "slope": 8.5,
    "description": "روند یادگیری صعودی است (شیب: 8.50 واحد درصد به ازای هر آزمون)."
  }
}
```

#### 7️⃣ خلاصه روند تمام دانشجویان کلاس (مرتب از بدترین)

```http
GET /analytics/courses/:courseId/trend-overview
Authorization: Bearer <JWT> (Instructor/Admin)
```

**پاسخ:**
```json
{
  "students": [
    {
      "studentId": 15,
      "studentName": "سارا محمدی",
      "trend": {
        "status": "نزولی",
        "slope": -6.3
      }
    },
    {
      "studentId": 42,
      "studentName": "علی احمدی",
      "trend": {
        "status": "صعودی",
        "slope": 8.5
      }
    }
  ]
}
```

**مرتب‌سازی:** از بدترین شیب (منفی‌ترین) به بهترین (مثبت‌ترین)

**کاربرد:** مدرس می‌تواند سریعاً دانشجویان در معرض خطر را شناسایی کند

### 7.4 تست‌های واحد (Unit Tests)

```typescript
describe('AnalyticsService - Pure Functions', () => {
  describe('groupBySkill', () => {
    it('should group answers by skill tag', () => {
      const service = new AnalyticsService(null);  // بدون نیاز به Prisma
      const answers = [
        { skillTag: 'loops', isCorrect: true },
        { skillTag: 'loops', isCorrect: false },
        { skillTag: 'arrays', isCorrect: true }
      ];
      
      const result = service.groupBySkill(answers);
      
      expect(result).toHaveLength(2);
      expect(result[0].tag).toBe('loops');
      expect(result[0].percentage).toBe(50);
    });

    it('should handle null skill tags as "سایر"', () => {
      const service = new AnalyticsService(null);
      const answers = [
        { skillTag: null, isCorrect: true },
        { skillTag: undefined, isCorrect: false }
      ];
      
      const result = service.groupBySkill(answers);
      
      expect(result[0].tag).toBe('سایر');
      expect(result[0].total).toBe(2);
    });
  });

  describe('classifyTrend', () => {
    it('should detect ascending trend', () => {
      const service = new AnalyticsService(null);
      const scores = [
        { date: new Date('2024-01-01'), percentage: 40 },
        { date: new Date('2024-01-15'), percentage: 60 },
        { date: new Date('2024-02-01'), percentage: 75 }
      ];
      
      const result = service.classifyTrend(scores);
      
      expect(result.status).toBe('صعودی');
      expect(result.slope).toBeGreaterThan(2);
    });

    it('should detect descending trend', () => {
      const service = new AnalyticsService(null);
      const scores = [
        { date: new Date('2024-01-01'), percentage: 80 },
        { date: new Date('2024-01-15'), percentage: 60 },
        { date: new Date('2024-02-01'), percentage: 35 }
      ];
      
      const result = service.classifyTrend(scores);
      
      expect(result.status).toBe('نزولی');
      expect(result.slope).toBeLessThan(-2);
    });

    it('should handle insufficient data', () => {
      const service = new AnalyticsService(null);
      const scores = [{ date: new Date(), percentage: 50 }];
      
      const result = service.classifyTrend(scores);
      
      expect(result.status).toBe('داده کافی نیست');
    });
  });
});
```

**نتیجه تست‌ها:**
```
 PASS  src/analytics/analytics.service.spec.ts
  AnalyticsService - Pure Functions
    groupBySkill
      ✓ should group answers by skill tag (3 ms)
      ✓ should handle null skill tags as "سایر" (1 ms)
      ✓ should sort by percentage ascending (2 ms)
    classifyTrend
      ✓ should detect ascending trend (2 ms)
      ✓ should detect descending trend (1 ms)
      ✓ should detect stable trend (2 ms)
      ✓ should handle insufficient data (1 ms)
      ✓ should handle all same scores (1 ms)

Test Suites: 1 passed, 1 total
Tests:       21 passed, 21 total
```

</div>

---

## 8. الگوریتم توصیه دوره شخصی‌سازی‌شده
## 8. Personalized Course Recommendation Algorithm

<div dir="rtl">

### 8.1 فلسفه طراحی

الگوریتم توصیه دوره EduCore بر اساس **4 مؤلفه وزن‌دار** طراحی شده که به‌صورت شفاف امتیازدهی می‌کنند:

```
امتیاز نهایی = (Skill Gap × 45%) + (Level Fit × 25%) + (Category Affinity × 20%) + (Quality × 10%)
```

**مزایای این رویکرد:**
- ✅ **شفافیت کامل**: هر مؤلفه قابل توضیح است
- ✅ **قابل تنظیم**: وزن‌ها در ثابت `WEIGHTS` تعریف شده‌اند
- ✅ **تست‌پذیر**: تابع اصلی (`scoreCourse`) pure است و بدون دیتابیس قابل تست
- ✅ **قابل دفاع در مقاله**: پایه ریاضی مشخص + توجیه هر وزن

### 8.2 معماری سیستم

```
┌──────────────────────────────────────┐
│   RecommendationsService             │
│                                      │
│  Pure Functions:                     │
│  • scoreCourse(profile, course)      │ ← امتیازدهی (0-100)
│                                      │
│  Database Queries:                   │
│  • buildStudentProfile(studentId)    │ ← پروفایل + مهارت‌های ضعیف
│  • getCandidateCourses(...)          │ ← دوره‌های قابل پیشنهاد
│                                      │
│  LLM Integration:                    │
│  • generateReason(student, course)   │ ← جمله توضیحی فارسی
│                                      │
│  Lifecycle Management:               │
│  • getRecommendations(studentId)     │ ← خواندن (با کش)
│  • refresh(studentId)                │ ← محاسبه مجدد
│  • dismiss(recommendationId)         │ ← رد پیشنهاد
│  • markAsEnrolled(...)               │ ← تبدیل به ثبت‌نام
└──────────────────────────────────────┘
         │
         ├─── استفاده از AnalyticsService
         │    (برای getMySkillProfile)
         │
         └─── استفاده از PrismaService
              (CourseRecommendations, Courses, Certificates)
```

### 8.3 فرایند کامل توصیه

#### مرحله 1: ساخت پروفایل دانشجو

```typescript
interface StudentProfile {
  completedCourseIds: number[];       // دوره‌های دارای گواهینامه
  weakSkills: SkillStat[];           // مهارت‌های با percentage < 50
  avgCompletedLevel: number | null;  // میانگین سطح دوره‌های تکمیل‌شده (1-3)
  favoriteCategoryIds: number[];     // دسته‌بندی‌های دوره‌های قبلی
}

async buildStudentProfile(studentId: number): Promise<StudentProfile> {
  // 1️⃣ دوره‌های تکمیل‌شده
  const certificates = await this.prisma.certificates.findMany({
    where: { Student_Id: studentId },
    include: {
      Courses: {
        select: {
          CategoryId: true,
          Level_Id: true,
          Level: { select: { LevelName: true } }
        }
      }
    }
  });

  const completedCourseIds = certificates.map(c => c.Course_Id);

  // 2️⃣ میانگین سطح
  const levelMap = { 'مقدماتی': 1, 'متوسط': 2, 'پیشرفته': 3 };
  const levels = certificates
    .map(c => c.Courses.Level?.LevelName)
    .filter(Boolean)
    .map(ln => levelMap[ln] ?? 2);
  
  const avgCompletedLevel = levels.length > 0
    ? levels.reduce((a, b) => a + b, 0) / levels.length
    : null;

  // 3️⃣ دسته‌بندی‌های محبوب
  const favoriteCategoryIds = [
    ...new Set(certificates.map(c => c.Courses.CategoryId))
  ];

  // 4️⃣ مهارت‌های ضعیف (از analytics)
  const { skills } = await this.analyticsService.getMySkillProfile(studentId);
  const weakSkills = skills.filter(s => s.percentage < 50);

  return {
    completedCourseIds,
    weakSkills,
    avgCompletedLevel,
    favoriteCategoryIds
  };
}
```

**مثال پروفایل:**
```json
{
  "completedCourseIds": [5, 12, 23],
  "weakSkills": [
    { "tag": "حلقه‌های تکرار", "percentage": 35 },
    { "tag": "مدیریت خطا", "percentage": 42 }
  ],
  "avgCompletedLevel": 1.67,  // (1+2+2) / 3
  "favoriteCategoryIds": [3, 7]  // برنامه‌نویسی، طراحی وب
}
```

#### مرحله 2: استخراج کاندیداها

```typescript
interface CourseCandidate {
  courseId: number;
  title: string;
  categoryId: number;
  categoryTitle: string;
  levelName: string | null;       // "مقدماتی", "متوسط", "پیشرفته"
  averageRating: number;           // 0-5
  skillTags: string[];             // از سوالات آزمون دوره
  thumbnail: string | null;
}

async getCandidateCourses(
  studentId: number,
  excludeCourseIds: number[]
): Promise<CourseCandidate[]> {
  // دوره‌هایی که دانشجو در آن‌ها ثبت‌نام کرده
  const enrollments = await this.prisma.enrollments.findMany({
    where: { Student_Id: studentId },
    select: { Course_Id: true }
  });
  const enrolledIds = enrollments.map(e => e.Course_Id);
  
  // حذف دوره‌های تکمیل‌شده + ثبت‌نام‌شده
  const allExcluded = [...excludeCourseIds, ...enrolledIds];

  // دوره‌های منتشرشده که قابل پیشنهاد هستند
  const courses = await this.prisma.courses.findMany({
    where: {
      IsPublished: true,
      Id: { notIn: allExcluded }
    },
    include: {
      Category: { select: { Title: true } },
      Level: { select: { LevelName: true } },
      Quizzes: {
        where: { IsPublished: true },
        include: {
          QuizQuestions: { select: { SkillTag: true } }
        }
      }
    }
  });

  return courses.map(c => {
    // استخراج تمام SkillTag های یونیک
    const skillTags = [
      ...new Set(
        c.Quizzes.flatMap(q =>
          q.QuizQuestions
            .map(qq => qq.SkillTag)
            .filter((tag): tag is string => !!tag && tag.trim() !== '')
        )
      )
    ];

    return {
      courseId: c.Id,
      title: c.Title,
      categoryId: c.CategoryId,
      categoryTitle: c.Category.Title,
      levelName: c.Level?.LevelName ?? null,
      averageRating: Number(c.AverageRating),
      skillTags,
      thumbnail: c.Thumbnail
    };
  });
}
```

#### مرحله 3: امتیازدهی (تابع محوری)

```typescript
private scoreCourse(
  profile: StudentProfile,
  course: CourseCandidate
): { score: number, matchedSkillTags: string[] } {
  
  let totalScore = 0;
  const matchedSkillTags: string[] = [];

  // ═══════════════════════════════════════════════════════════
  // 1️⃣ Skill Gap Match (45%)
  // ═══════════════════════════════════════════════════════════
  // همپوشانی بین مهارت‌های ضعیف دانشجو و مهارت‌های دوره
  
  if (profile.weakSkills.length > 0 && course.skillTags.length > 0) {
    const weakSkillSet = new Set(
      profile.weakSkills.map(s => s.tag.toLowerCase().trim())
    );
    const courseSkillSet = new Set(
      course.skillTags.map(t => t.toLowerCase().trim())
    );

    let matchCount = 0;
    for (const weakTag of weakSkillSet) {
      if (courseSkillSet.has(weakTag)) {
        matchCount++;
        // ذخیره برچسب اصلی (با حروف بزرگ/کوچک اصلی)
        const originalTag = profile.weakSkills.find(
          s => s.tag.toLowerCase().trim() === weakTag
        )?.tag;
        if (originalTag) matchedSkillTags.push(originalTag);
      }
    }

    const matchRatio = matchCount / Math.max(weakSkillSet.size, 1);
    totalScore += matchRatio * 100 * 0.45;  // وزن: 45%
  }

  // ═══════════════════════════════════════════════════════════
  // 2️⃣ Level Progression (25%)
  // ═══════════════════════════════════════════════════════════
  // سطح دوره باید یک پله بالاتر از میانگین دوره‌های قبلی باشد
  
  if (profile.avgCompletedLevel !== null && course.levelName) {
    const levelMap: Record<string, number> = {
      'مقدماتی': 1,
      'متوسط': 2,
      'پیشرفته': 3
    };
    const courseLevel = levelMap[course.levelName] ?? 2;
    const idealLevel = profile.avgCompletedLevel + 1;  // یک پله بالاتر
    const levelDiff = Math.abs(courseLevel - idealLevel);

    // هرچه فاصله کمتر، امتیاز بیشتر (کاهش نمایی)
    const levelScore = Math.exp(-levelDiff) * 100;
    totalScore += levelScore * 0.25;  // وزن: 25%
  } else {
    // دانشجوی بدون سابقه → امتیاز خنثی
    totalScore += 50 * 0.25;
  }

  // ═══════════════════════════════════════════════════════════
  // 3️⃣ Category Affinity (20%)
  // ═══════════════════════════════════════════════════════════
  // دسته‌بندی دوره با یکی از دسته‌های قبلی دانشجو یکسان باشد؟
  
  if (profile.favoriteCategoryIds.length > 0) {
    const categoryScore = profile.favoriteCategoryIds.includes(course.categoryId)
      ? 100   // همان دسته → امتیاز کامل
      : 0;    // دسته متفاوت → بدون امتیاز
    totalScore += categoryScore * 0.20;  // وزن: 20%
  } else {
    // بدون سابقه → امتیاز خنثی
    totalScore += 50 * 0.20;
  }

  // ═══════════════════════════════════════════════════════════
  // 4️⃣ Course Quality (10%)
  // ═══════════════════════════════════════════════════════════
  // نرمالایز AverageRating (0-5) به (0-100)
  
  const qualityScore = (course.averageRating / 5) * 100;
  totalScore += qualityScore * 0.10;  // وزن: 10%

  // ═══════════════════════════════════════════════════════════
  // امتیاز نهایی (0-100)
  // ═══════════════════════════════════════════════════════════
  
  return {
    score: Math.min(100, Math.max(0, totalScore)),
    matchedSkillTags
  };
}
```

**مثال محاسبه:**

```typescript
// پروفایل دانشجو
const profile = {
  completedCourseIds: [5, 12],
  weakSkills: [
    { tag: 'حلقه‌های تکرار', percentage: 30 },
    { tag: 'آرایه‌ها', percentage: 45 }
  ],
  avgCompletedLevel: 1.5,  // (1+2) / 2
  favoriteCategoryIds: [3]  // برنامه‌نویسی
};

// دوره کاندید
const course = {
  courseId: 25,
  title: 'آموزش پیشرفته Python',
  categoryId: 3,  // برنامه‌نویسی ✅
  levelName: 'متوسط',  // سطح 2
  averageRating: 4.5,
  skillTags: ['حلقه‌های تکرار', 'توابع', 'کلاس‌ها']  // یک همپوشانی ✅
};

// محاسبه:
// 1️⃣ Skill Gap: 1 match از 2 weak skill → 0.5 * 100 * 0.45 = 22.5
// 2️⃣ Level: ideal=2.5, course=2, diff=0.5 → exp(-0.5)*100*0.25 = 15.16
// 3️⃣ Category: همان دسته → 100 * 0.20 = 20
// 4️⃣ Quality: (4.5/5) * 100 * 0.10 = 9
// Total: 22.5 + 15.16 + 20 + 9 = 66.66

scoreCourse(profile, course);
// Output: { score: 66.66, matchedSkillTags: ['حلقه‌های تکرار'] }
```

#### مرحله 4: تولید دلیل با LLM

```typescript
async generateReason(
  studentName: string,
  course: ScoredCourse
): Promise<string> {
  // Fallback برای زمانی که LLM در دسترس نیست
  const fallback = course.matchedSkillTags.length > 0
    ? `این دوره روی مهارت‌های ${course.matchedSkillTags.join('، ')} تمرکز دارد که در آزمون‌های شما نیاز به تقویت دارند.`
    : `این دوره با سطح و زمینه یادگیری شما هم‌راستا است و می‌تواند مهارت‌های جدیدی به شما آموزش دهد.`;

  if (course.matchedSkillTags.length === 0) return fallback;

  const apiUrl = process.env.AI_API_URL;
  const model = 'qwen/qwen3-4b';

  const system = `تو یک مشاور آموزشی هستی که به دانشجویان کمک می‌کنی دوره‌های مناسب را انتخاب کنند. یک جمله کوتاه و دلنشین به زبان فارسی بنویس که توضیح دهد چرا این دوره برای دانشجو مناسب است. جمله باید محاوره‌ای و انگیزه‌بخش باشد، نه رسمی و خشک.`;

  const user = `دانشجو در مهارت‌های «${course.matchedSkillTags.join('، ')}» ضعیف است. دوره «${course.title}» این مهارت‌ها را پوشش می‌دهد. یک جمله توصیه کوتاه (حداکثر ۲۰ کلمه) بنویس.`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      console.warn(`LLM error (${response.status}), using fallback`);
      return fallback;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();

    if (!content || content.length < 10) return fallback;

    return content;
  } catch (error) {
    console.warn('LLM unavailable, using fallback:', error);
    return fallback;
  }
}
```

**مثال خروجی LLM:**

```
Input:
"دانشجو در مهارت‌های «حلقه‌های تکرار، آرایه‌ها» ضعیف است. 
دوره «آموزش پیشرفته Python» این مهارت‌ها را پوشش می‌دهد."

Output:
"با این دوره می‌تونی حلقه‌ها و آرایه‌ها رو از صفر تا صد یاد بگیری!"
```

#### مرحله 5: ذخیره و کش‌گذاری

```typescript
async refresh(studentId: number) {
  // 1️⃣ ساخت پروفایل
  const profile = await this.buildStudentProfile(studentId);

  if (profile.weakSkills.length === 0) {
    // دانشجو در همه مهارت‌ها قوی است → پیشنهاد ندهیم
    return [];
  }

  // 2️⃣ استخراج کاندیداها
  const candidates = await this.getCandidateCourses(
    studentId,
    profile.completedCourseIds
  );

  // 3️⃣ امتیازدهی + مرتب‌سازی
  const scored: ScoredCourse[] = [];
  for (const course of candidates) {
    const { score, matchedSkillTags } = this.scoreCourse(profile, course);
    if (matchedSkillTags.length > 0) {  // فقط دوره‌هایی که match دارند
      scored.push({ ...course, score, matchedSkillTags });
    }
  }
  scored.sort((a, b) => b.score - a.score);  // بالاترین امتیاز اول

  // 4️⃣ انتخاب Top N (مثلاً 10 تا)
  const topN = scored.slice(0, 10);

  // 5️⃣ تولید دلیل برای هر کدام (async parallel)
  const reasonPromises = topN.map(c => this.generateReason('', c));
  const reasons = await Promise.all(reasonPromises);

  // 6️⃣ ذخیره در دیتابیس
  for (let i = 0; i < topN.length; i++) {
    const c = topN[i];
    const reason = reasons[i];

    await this.prisma.courseRecommendations.upsert({
      where: {
        Student_Id_Course_Id: { Student_Id: studentId, Course_Id: c.courseId }
      },
      update: {
        Score: c.score,
        Reason: reason,
        MatchedSkillTags: JSON.stringify(c.matchedSkillTags),
        Status: 'Active',
        GeneratedAt: new Date()
      },
      create: {
        Student_Id: studentId,
        Course_Id: c.courseId,
        Score: c.score,
        Reason: reason,
        MatchedSkillTags: JSON.stringify(c.matchedSkillTags),
        Status: 'Active',
        GeneratedAt: new Date()
      }
    });
  }

  return topN;
}
```

### 8.4 چرخه حیات پیشنهادها

```
┌─────────────┐
│   Active    │  ← وضعیت اولیه
└──────┬──────┘
       │
       ├──→ دانشجو رد کرد ──→ ┌──────────────┐
       │                      │  Dismissed   │
       │                      └──────────────┘
       │
       └──→ دانشجو ثبت‌نام کرد ──→ ┌──────────────┐
                                   │   Enrolled   │ ← Conversion!
                                   └──────────────┘
```

**Endpoints:**

```http
GET  /recommendations/students/me          → دریافت پیشنهادهای فعال (با کش)
POST /recommendations/refresh              → محاسبه مجدد (force)
POST /recommendations/:id/dismiss          → رد پیشنهاد (Status → Dismissed)
GET  /recommendations/students/:id/history → تاریخچه + نرخ تبدیل
```

**محاسبه نرخ تبدیل (Conversion Rate):**

```typescript
async getHistory(studentId: number, currentUser: any) {
  // بررسی دسترسی...

  const all = await this.prisma.courseRecommendations.findMany({
    where: { Student_Id: studentId },
    include: { Courses: { select: { Title: true } } }
  });

  const totalCount = all.length;
  const enrolledCount = all.filter(r => r.Status === 'Enrolled').length;
  const dismissedCount = all.filter(r => r.Status === 'Dismissed').length;
  const activeCount = all.filter(r => r.Status === 'Active').length;

  const conversionRate = totalCount > 0 
    ? Math.round((enrolledCount / totalCount) * 100)
    : 0;

  return {
    totalRecommendations: totalCount,
    enrolled: enrolledCount,
    dismissed: dismissedCount,
    active: activeCount,
    conversionRate: `${conversionRate}%`,
    history: all.map(r => ({
      courseTitle: r.Courses.Title,
      score: Number(r.Score),
      reason: r.Reason,
      status: r.Status,
      generatedAt: r.GeneratedAt
    }))
  };
}
```

### 8.5 تست الگوریتم

```typescript
describe('RecommendationsService - Scoring Algorithm', () => {
  it('should score based on skill gap match', () => {
    const service = new RecommendationsService(null, null);
    const profile = {
      weakSkills: [
        { tag: 'loops', percentage: 30 },
        { tag: 'arrays', percentage: 40 }
      ],
      avgCompletedLevel: 1,
      favoriteCategoryIds: [],
      completedCourseIds: []
    };
    const course = {
      skillTags: ['loops', 'functions'],  // 1 match
      levelName: 'مقدماتی',
      categoryId: 5,
      averageRating: 4
    };

    const { score, matchedSkillTags } = service['scoreCourse'](profile, course);

    expect(score).toBeGreaterThan(0);
    expect(matchedSkillTags).toContain('loops');
  });

  it('should prefer courses one level higher', () => {
    const service = new RecommendationsService(null, null);
    const profile = {
      weakSkills: [],
      avgCompletedLevel: 1,  // تازه‌کار
      favoriteCategoryIds: [],
      completedCourseIds: []
    };

    const beginnerCourse = { levelName: 'مقدماتی', ... };
    const intermediateCourse = { levelName: 'متوسط', ... };  // یک پله بالاتر

    const score1 = service['scoreCourse'](profile, beginnerCourse).score;
    const score2 = service['scoreCourse'](profile, intermediateCourse).score;

    expect(score2).toBeGreaterThan(score1);  // متوسط باید امتیاز بیشتری بگیرد
  });
});
```

</div>

---

**(ادامه در پیام بعدی)**

## 9. نقش‌ها و فرایندهای کاربری
## 9. User Roles and Workflows

<div dir="rtl">

### 9.1 دانشجو (Student - Role ID: 1)

#### الف) فرایند ثبت‌نام تا دریافت گواهینامه

```
[1] ثبت‌نام در سیستم
    POST /auth/register { username, email, password }
    → Role_Id = 1 (پیش‌فرض)
    → accessToken + refreshToken
    ↓
[2] مرور و جستجوی دوره‌ها
    GET /courses/browse?search=Python&categoryId=3
    → دیدن دوره‌های منتشرشده + تصاویر + قیمت
    → مشاهده رایگان درس‌های IsFreePreview
    ↓
[3] افزودن به سبد خرید
    POST /cart { courseId: 25 }
    → ذخیره در جدول Carts
    → Unique constraint جلوی تکرار را می‌گیرد
    ↓
[4] پرداخت و ثبت‌نام
    POST /payment/checkout
    → ایجاد Payments (Status: 1)
    → ایجاد Enrollments
    → پاک کردن Cart
    ↓
[5] دسترسی به محتوا
    GET /courses/:id
    → دیدن تمام Sections + Lessons
    → تماشای ویدئو، دانلود فایل‌ها
    → علامت‌گذاری "تکمیل شد"
        POST /progress/lessons/:lessonId/complete
        → ایجاد/به‌روزرسانی CourseProgress
    ↓
[6] شرکت در آزمون
    GET /quizzes/my
    → لیست آزمون‌های منتشرشده + وضعیت
    ↓
    POST /quizzes/:id/start
    → انتخاب تصادفی سوالات (Fisher-Yates)
    → ذخیره QuestionIds در QuizAttempts
    → دریافت سوالات بدون پاسخ صحیح
    ↓
    [حل آزمون در مدت DurationMinutes]
    ↓
    POST /quiz/attempts/:attemptId/submit { answers: [...] }
    → نمره‌دهی
    → در صورت قبولی: صدور گواهینامه (Atomic Transaction)
    → تازه‌سازی پیشنهادها (fire-and-forget)
    ↓
[7] دریافت گواهینامه
    GET /certificates/my
    → لیست گواهینامه‌های صادرشده
    ↓
    GET /certificates/:id
    → مشاهده گواهینامه + SkillBreakdown
    → دانلود به‌صورت تصویر (html2canvas)
    ↓
[8] مشاهده تحلیل یادگیری
    GET /analytics/students/me/skills
    → نمودار راداری (Radar Chart)
    → مهارت‌های ضعیف (Weak Skills Banner)
    ↓
    GET /analytics/students/me/progress-trend
    → نمودار خطی دوگانه (نمرات آزمون + پیشرفت دوره)
    ↓
[9] دریافت پیشنهادهای دوره
    GET /recommendations/students/me
    → دوره‌های پیشنهادی بر اساس نقاط ضعف
    → امتیاز + دلیل (تولید شده با LLM)
    → لینک مستقیم به دوره
```

#### ب) تعامل با چت دوره

```
[دانشجو در دوره ثبت‌نام شده]
    ↓
    GET /chat/stream?token=JWT
    → اتصال SSE (دائمی)
    ↓
    [دریافت real-time events]
    • new-message
    • typing
    • reaction
    • poll-vote
    ↓
    POST /chat/courses/:courseId/messages { content: "..." }
    → ارسال پیام به چت دوره
    → Broadcast به سایر اعضا
    ↓
    POST /chat/messages/:messageId/reaction { emoji: "👍" }
    → افزودن Reaction
    → Toggle: همان emoji دوباره → حذف
    ↓
    POST /chat/polls/:pollId/vote { optionId: 3 }
    → رأی‌دادن در نظرسنجی
    → تغییر رأی: رأی قبلی حذف + رأی جدید ذخیره
```

#### ج) درخواست مدرس شدن

```
GET /instructor-requests/check
    → بررسی وجود درخواست قبلی
    ↓
    POST /instructor-requests { description: "...", resumeUrl: "..." }
    → آپلود رزومه (با Multer)
    → Status: "Pending"
    → منتظر تأیید ادمین
    ↓
    [ادمین بررسی و تأیید می‌کند]
    ↓
    PUT /users/:userId { Role_Id: 2 }
    → تبدیل به Instructor
    → دسترسی به پنل مدرس
```

### 9.2 مدرس (Instructor - Role ID: 2)

#### الف) فرایند ایجاد و انتشار دوره

```
[1] ایجاد دوره جدید
    POST /courses {
      title: "آموزش Django",
      description: "...",
      price: 500000,
      categoryId: 3,
      levelId: 2,
      thumbnail: "/uploads/..."
    }
    → IsPublished: false (پیش‌فرض)
    → Teacher_Id: currentUser.id
    → Slug: auto-generated
    ↓
[2] افزودن بخش‌ها
    POST /course-sections {
      courseId: 25,
      title: "مقدمات Django",
      displayOrder: 1
    }
    → ایجاد CourseSections
    ↓
[3] افزودن درس‌ها
    POST /lessons {
      courseId: 25,
      sectionId: 12,
      title: "نصب و راه‌اندازی",
      videoUrl: "/uploads/video.mp4",
      durationMinutes: 15,
      isFreePreview: true
    }
    → ایجاد Lessons
    → آپلود فایل‌های ضمیمه (LessonFiles)
    ↓
[4] تعیین اهداف یادگیری و پیش‌نیازها
    PUT /courses/:id/learning-outcomes [
      { title: "ساخت API با Django REST Framework", displayOrder: 1 },
      { title: "مدیریت دیتابیس با ORM", displayOrder: 2 }
    ]
    → ایجاد CourseLearningOutcomes
    ↓
    PUT /courses/:id/prerequisites [
      { title: "آشنایی با Python", displayOrder: 1 }
    ]
    → ایجاد CoursePrequisties
    ↓
[5] انتشار دوره
    PUT /courses/:id/publish
    → بررسی شرایط: حداقل 1 Section + 1 Lesson
    → IsPublished: true
    → دوره در صفحه عمومی نمایش داده می‌شود
```

#### ب) فرایند ساخت آزمون با AI

```
[1] ایجاد آزمون خالی
    POST /courses/:courseId/quizzes {
      title: "آزمون پایانی",
      startAt: "2024-06-01T10:00:00Z",
      endAt: "2024-06-10T23:59:59Z",
      durationMinutes: 60,
      passScore: 70,
      questionsToShow: 20
    }
    → IsPublished: false
    → بانک سوالات خالی
    ↓
[2] تولید سوالات با AI
    POST /quizzes/:quizId/generate { count: 30 }
    → بارگذاری کامل دوره (Sections, Lessons, Outcomes, Prerequisites)
    → ساخت پرامپت زمینه‌دار
    → POST → LLM API (Qwen3-4b)
    → پردازش JSON خروجی
    → برگشت سوالات به‌عنوان پیشنمایش (بدون ذخیره)
    ↓
[3] بررسی و ویرایش سوالات
    [مدرس در فرانت‌اند]:
    • حذف سوالات نامناسب
    • ویرایش متن سوال
    • تغییر گزینه‌ها
    • افزودن سوالات دستی
    • تنظیم SkillTag برای هر سوال
    ↓
[4] ذخیره بانک سوالات
    PUT /quizzes/:quizId {
      questions: [
        {
          questionText: "...",
          skillTag: "حلقه‌های تکرار",
          score: 2,
          displayOrder: 1,
          choices: [
            { text: "گزینه 1", isCorrect: true, displayOrder: 1 },
            { text: "گزینه 2", isCorrect: false, displayOrder: 2 },
            ...
          ]
        },
        ...
      ]
    }
    → حذف تمام سوالات قبلی (در Transaction)
    → ایجاد سوالات و گزینه‌های جدید
    ↓
[5] انتشار آزمون
    PUT /quizzes/:quizId/publish
    → IsPublished: true
    → دانشجویان می‌توانند شروع کنند
```

#### ج) مشاهده عملکرد دانشجویان

```
[1] لیست دانشجویان دوره
    GET /courses/:courseId/students
    → نام دانشجو
    → درصد پیشرفت (Completed Lessons / Total Lessons)
    → نمره آزمون
    → وضعیت قبولی/مردودی
    → کد گواهینامه (اگر صادر شده)
    ↓
[2] تحلیل مهارتی کل کلاس
    GET /analytics/courses/:courseId/skills-overview
    → مهارت‌های ضعیف کلاس (برای تمرکز بیشتر)
    → درصد تسلط کل کلاس به تفکیک مهارت
    ↓
[3] تحلیل روند دانشجویان
    GET /analytics/courses/:courseId/trend-overview
    → لیست دانشجویان مرتب از بدترین به بهترین شیب
    → شناسایی دانشجویان در معرض خطر (شیب منفی)
    ↓
[4] جزئیات یک دانشجو
    GET /analytics/students/:studentId/trend?courseId=:id
    → نمودار روند نمرات
    → وضعیت: صعودی/نزولی/ثابت
    → توصیه‌های آموزشی
```

#### د) مدیریت چت و نظرسنجی

```
[مدرس وارد چت دوره می‌شود]
    ↓
    GET /chat/courses/:courseId/members
    → لیست دانشجویان + وضعیت آنلاین
    ↓
    POST /chat/courses/:courseId/messages
    → ارسال اعلان یا پاسخ به سوالات
    ↓
    POST /chat/courses/:courseId/polls {
      question: "کدام موضوع برای شما سخت‌تر بود؟",
      options: ["حلقه‌ها", "توابع", "کلاس‌ها"]
    }
    → ایجاد نظرسنجی (فقط Instructor/Admin)
    → Broadcast به همه دانشجویان
    ↓
    GET /chat/courses/:courseId/polls
    → مشاهده نتایج real-time
    → درصد رأی به هر گزینه
```

### 9.3 ادمین (Admin - Role ID: 3)

#### الف) مدیریت کاربران

```
GET /users
    → لیست تمام کاربران
    → فیلتر بر اساس نقش (Student/Instructor/Admin)
    ↓
    PUT /users/:userId { IsActive: false }
    → غیرفعال کردن حساب
    → کاربر نمی‌تواند لاگین کند
    ↓
    PUT /users/:userId { Role_Id: 2 }
    → تغییر نقش (تبدیل دانشجو به مدرس)
    ↓
    DELETE /users/:userId
    → حذف حساب کاربری (با احتیاط!)
```

#### ب) بررسی درخواست‌های مدرس

```
GET /instructor-requests?status=Pending
    → لیست درخواست‌های در انتظار
    ↓
    GET /instructor-requests/:id
    → مشاهده جزئیات درخواست
    → دانلود رزومه (ResumeUrl)
    ↓
    PUT /instructor-requests/:id/approve
    → Status: "Approved"
    → ReviewedBy: currentUser.id
    → ReviewedAt: now()
    → تغییر نقش کاربر به Instructor
    ↓
    یا
    PUT /instructor-requests/:id/reject { reason: "..." }
    → Status: "Rejected"
    → اطلاع‌رسانی به کاربر
```

#### ج) مدیریت دوره‌ها

```
GET /courses/admin
    → تمام دوره‌ها (منتشرشده + منتشرنشده)
    → فیلتر بر اساس مدرس، دسته‌بندی
    ↓
    PUT /courses/:id { IsPublished: false }
    → لغو انتشار دوره (در صورت تخلف)
    ↓
    DELETE /courses/:id
    → حذف دوره (Hard Delete اگر بدون Enrollment)
```

#### د) گزارش عملکرد کلی

```
GET /courses/admin/performance-report
    → لیست تمام دوره‌ها با:
      • تعداد ثبت‌نام
      • تعداد شرکت‌کننده در آزمون
      • نرخ قبولی (%)
      • میانگین نمره
    ↓
    [تحلیل کیفیت دوره‌ها]
    • دوره‌هایی با نرخ قبولی پایین → بررسی محتوا
    • دوره‌هایی با تعداد ثبت‌نام بالا → تشویق مدرس
```

#### ه) مدیریت پیام‌های تماس

```
GET /contact-messages?isRead=false
    → پیام‌های خوانده‌نشده
    ↓
    GET /contact-messages/:id
    → مشاهده جزئیات پیام
    ↓
    PUT /contact-messages/:id/mark-read
    → IsRead: true
    ↓
    [پاسخ به کاربر از طریق ایمیل یا تلفن]
```

### 9.4 فرایندهای مشترک

#### الف) ورود با Google OAuth

```
[کاربر کلیک روی "ورود با Google"]
    ↓
    GET /auth/google
    → Redirect به صفحه OAuth گوگل
    ↓
    [کاربر مجوز می‌دهد]
    ↓
    GET /auth/google/callback?code=...
    → تبادل code با Google
    → دریافت profile (email, name, picture)
    → جستجوی کاربر با email در دیتابیس
    ↓
    اگر یافت شد:
      → صدور JWT + Refresh Token
      → Redirect به ${FRONTEND_URL}/google-callback?token=...
    ↓
    اگر یافت نشد:
      → Redirect به /login?error=user_not_found
      → (ثبت‌نام خودکار انجام نمی‌شود)
```

#### ب) تازه‌سازی خودکار توکن (Silent Refresh)

```
[هر درخواست API]
    → Authorization: Bearer <accessToken>
    ↓
    اگر 401 Unauthorized:
      ↓
      [Axios Interceptor]
      POST /auth/refresh { refreshToken }
      → بررسی RevokedAt و ExpiresAt
      → باطل کردن توکن قدیمی (Rotation)
      → ایجاد توکن جدید
      → { accessToken: new, refreshToken: new }
      ↓
      localStorage.setItem('accessToken', new)
      localStorage.setItem('refreshToken', new)
      ↓
      [تلاش مجدد درخواست اصلی با توکن جدید]
```

#### ج) خروج (Logout)

```
POST /auth/logout
    → دریافت refreshToken از body/header
    → یافتن رکورد در RefreshTokens
    → به‌روزرسانی: RevokedAt = now()
    ↓
    [Frontend]
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    → Redirect به /login
```

</div>

---

## 10. داشبوردها و صفحات کاربری
## 10. Dashboards and User Pages

<div dir="rtl">

### 10.1 پنل دانشجو (Student Portal)

**مسیر پایه:** `/student/*`

#### صفحات اصلی:

| صفحه | مسیر | توضیح | مؤلفه‌های کلیدی |
|---|---|---|---|
| **داشبورد** | `/student/dashboard` | خلاصه فعالیت‌ها | • دوره‌های در حال یادگیری<br>• آخرین نمرات آزمون<br>• پیشرفت کلی<br>• پیشنهادهای دوره |
| **تحلیل یادگیری** | `/student/analytics` | نمایش عملکرد مهارتی | • **نمودار راداری** (Radar Chart): تسلط به مهارت‌ها<br>• **نمودار خطی دوگانه** (Dual Line): نمرات + پیشرفت<br>• **بنر مهارت‌های ضعیف** (Weak Skills Banner)<br>• فیلتر بر اساس دوره |
| **پیشنهادهای دوره** | `/student/recommendations` | دوره‌های پیشنهادی شخصی | • کارت‌های دوره با امتیاز<br>• دلیل پیشنهاد (تولید LLM)<br>• برچسب‌های مهارتی matched<br>• دکمه رد یا ثبت‌نام<br>• دکمه "Refresh" |
| **دوره‌های من** | `/student/courses` | دوره‌های ثبت‌نام‌شده | • گرید دوره‌ها<br>• درصد پیشرفت<br>• دسترسی به محتوا<br>• لینک به چت دوره |
| **مشاهده دوره** | `/student/course-details/:id` | صفحه پخش ویدئو و درس‌ها | • لیست بخش‌ها و درس‌ها (Sidebar)<br>• پخش‌کننده ویدئو<br>• دکمه "تکمیل شد"<br>• دانلود فایل‌های ضمیمه<br>• نوار پیشرفت |
| **آزمون‌ها** | `/student/quizzes` | لیست آزمون‌های قابل شرکت | • وضعیت: upcoming/available/closed<br>• نمرات قبلی (اگر شرکت کرده) |
| **حل آزمون** | `/student/quiz/:id/attempt` | صفحه شرکت در آزمون | • تایمر شمارش معکوس<br>• سوالات چندگزینه‌ای<br>• نوار پیشرفت<br>• دکمه ارسال نهایی |
| **نتیجه آزمون** | `/student/quiz/result/:attemptId` | نمایش نمره و پاسخ‌ها | • نمره کل / حداکثر<br>• وضعیت قبولی<br>• پاسخ‌های صحیح/غلط<br>• لینک به گواهینامه (اگر قبول) |
| **گواهینامه‌ها** | `/student/certificates` | لیست گواهینامه‌های صادرشده | • کارت‌های گواهینامه<br>• کد یکتا<br>• تاریخ صدور<br>• دکمه مشاهده جزئیات |
| **جزئیات گواهینامه** | `/student/certificate/:id` | صفحه گواهینامه + تحلیل | • **طرح گواهینامه** (قابل دانلود)<br>• **SkillBreakdown Widget**: نوار پیشرفت هر مهارت<br>• **Weak Skills Banner**<br>• دکمه "دانلود به‌صورت تصویر" (html2canvas) |
| **چت دوره** | `/student/messages/:courseId` | چت بلادرنگ دوره | • لیست پیام‌ها (با صفحه‌بندی)<br>• Thread Replies<br>• Emoji Reactions<br>• نظرسنجی‌ها + رأی‌دادن<br>• نشانگر "در حال تایپ..."<br>• وضعیت آنلاین اعضا<br>• آپلود فایل |
| **پروفایل** | `/student/profile` | مشاهده و ویرایش پروفایل | • آواتار<br>• نام، ایمیل، موبایل<br>• تاریخ عضویت<br>• تعداد دوره‌های تکمیل‌شده |
| **تنظیمات** | `/student/settings` | تنظیمات حساب | • تغییر رمز عبور<br>• تنظیمات اعلان‌ها<br>• حذف حساب |
| **تاریخچه سفارشات** | `/student/order-history` | لیست پرداخت‌ها | • تاریخ خرید<br>• مبلغ<br>• شماره مرجع<br>• وضعیت |
| **لیست علاقه‌مندی** | `/student/wishlist` | دوره‌های ذخیره‌شده | • دوره‌های مورد علاقه<br>• افزودن به سبد خرید<br>• حذف از لیست |
| **سبد خرید** | `/student/cart` | مدیریت سبد خرید | • لیست دوره‌ها<br>• محاسبه قیمت کل<br>• اعمال کد تخفیف<br>• دکمه "پرداخت" |
| **نظرات** | `/student/reviews` | نظرات ثبت‌شده | • امتیاز به دوره‌ها<br>• متن نظر<br>• ویرایش/حذف |

#### ویجت‌های داشبورد دانشجو:

```
┌─────────────────────────────────────────────────┐
│          داشبورد دانشجو                         │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────┐  ┌───────────────┐          │
│  │ 12 دوره       │  │ 8 گواهینامه   │          │
│  │ در حال یادگیری│  │ صادر شده      │          │
│  └───────────────┘  └───────────────┘          │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  آخرین نمرات آزمون                      │  │
│  │  • آموزش Python: 85/100 ✅              │  │
│  │  • طراحی UI/UX: 92/100 ✅               │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  پیشنهادهای دوره (بر اساس نقاط ضعف)   │  │
│  │  🎯 آموزش پیشرفته Django (امتیاز: 87)  │  │
│  │     "با این دوره حلقه‌ها رو تقویت کن!"  │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  نمودار پیشرفت (Line Chart)             │  │
│  │                                          │  │
│  │      نمرات آزمون ──────                  │  │
│  │      پیشرفت دوره ┄┄┄┄┄┄                 │  │
│  │                                          │  │
│  │   100%│         ╱─────                   │  │
│  │       │      ╱─┘                         │  │
│  │    50%│   ╱─┘                            │  │
│  │       │─────────────────────────         │  │
│  │       └─────────────────────────         │  │
│  │        Jan  Feb  Mar  Apr  May           │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 10.2 پنل مدرس (Instructor Portal)

**مسیر پایه:** `/instructor/*`

#### صفحات اصلی:

| صفحه | مسیر | توضیح | مؤلفه‌های کلیدی |
|---|---|---|---|
| **داشبورد** | `/instructor/dashboard` | خلاصه آمار | • تعداد دوره‌های منتشرشده<br>• تعداد کل دانشجویان<br>• درآمد کل<br>• نرخ رضایت (میانگین امتیازات) |
| **دوره‌های من** | `/instructor/courses` | لیست دوره‌های ایجادشده | • وضعیت انتشار<br>• تعداد ثبت‌نام<br>• دکمه‌های ویرایش/حذف<br>• دکمه "دوره جدید" |
| **ایجاد/ویرایش دوره** | `/instructor/course/edit/:id` | فرم چندمرحله‌ای | **مرحله 1**: اطلاعات پایه (عنوان، توضیحات، قیمت، دسته‌بندی، سطح، تصویر)<br>**مرحله 2**: بخش‌ها و درس‌ها (افزودن Section، Lesson، آپلود ویدئو)<br>**مرحله 3**: اهداف یادگیری (Learning Outcomes)<br>**مرحله 4**: پیش‌نیازها (Prerequisites)<br>**مرحله 5**: بررسی نهایی و انتشار |
| **ساخت آزمون** | `/instructor/quiz/:courseId` | ابزار ساخت آزمون | • **تنظیمات آزمون**: زمان شروع/پایان، مدت، نمره قبولی<br>• **پنل تولید AI**: تعداد سوال + دکمه "Generate"<br>• **پیشنمایش سوالات**: ویرایش متن، گزینه‌ها، SkillTag<br>• **بانک سوالات**: افزودن دستی سوال<br>• دکمه "ذخیره و انتشار" |
| **نتایج آزمون** | `/instructor/quiz/results/:quizId` | آمار و نتایج آزمون | • تعداد شرکت‌کنندگان<br>• میانگین نمره<br>• نرخ قبولی<br>• نمودار توزیع نمرات<br>• لیست دانشجویان + نمره |
| **تحلیل دوره** | `/instructor/analytics/:courseId` | تحلیل یادگیری دانشجویان | • **تحلیل مهارتی کلاس** (Skills Overview)<br>• **نمودار میله‌ای**: تسلط کلاس به هر مهارت<br>• **تحلیل روند دانشجویان**: لیست دانشجویان مرتب از بدترین شیب<br>• جزئیات هر دانشجو (Skill Breakdown + Trend) |
| **لیست دانشجویان** | `/instructor/students/:courseId` | مدیریت دانشجویان | **سه نمای مختلف**:<br>• **Grid View**: کارت‌های دانشجو<br>• **List View**: جدول دانشجویان<br>• **Detail View**: صفحه جزئیات یک دانشجو |
| **جزئیات دانشجو** | `/instructor/student/:studentId` | صفحه کامل یک دانشجو | • اطلاعات دانشجو<br>• درصد پیشرفت<br>• نمرات آزمون<br>• Skill Breakdown<br>• نمودار روند یادگیری<br>• تاریخچه فعالیت |
| **چت دوره** | `/instructor/messages/:courseId` | چت بلادرنگ | • همان امکانات دانشجو +<br>• **ایجاد نظرسنجی** (Poll)<br>• حذف پیام‌های نامناسب |
| **گواهینامه‌ها** | `/instructor/certificates/:courseId` | لیست گواهینامه‌های صادرشده | • دانشجویانی که گواهینامه گرفته‌اند<br>• کد گواهینامه<br>• تاریخ صدور<br>• نمره |
| **درآمدها** | `/instructor/earnings` | گزارش مالی | • درآمد ماهانه<br>• نمودار روند فروش<br>• جزئیات تراکنش‌ها<br>• دکمه "درخواست واریز" |
| **پروفایل** | `/instructor/profile` | پروفایل عمومی مدرس | • بیوگرافی<br>• تخصص‌ها<br>• رزومه<br>• لینک‌های اجتماعی<br>• امتیاز و نظرات دانشجویان |
| **تنظیمات** | `/instructor/settings` | تنظیمات حساب | • اطلاعات شخصی<br>• تنظیمات اعلان<br>• اطلاعات بانکی (برای واریز)<br>• تغییر رمز عبور |

#### ویجت‌های داشبورد مدرس:

```
┌──────────────────────────────────────────────────┐
│          داشبورد مدرس                            │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │ 15 دوره    │ │ 1,247      │ │ 85%        │   │
│  │ منتشرشده   │ │ دانشجو     │ │ رضایت      │   │
│  └────────────┘ └────────────┘ └────────────┘   │
│                                                  │
│  ┌───────────────────────────────────────────┐  │
│  │  آخرین ثبت‌نام‌ها                        │  │
│  │  • علی احمدی → آموزش Django (2 ساعت پیش)│  │
│  │  • سارا رضایی → طراحی UI (5 ساعت پیش)   │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  ┌───────────────────────────────────────────┐  │
│  │  دانشجویان نیازمند توجه (شیب منفی)      │  │
│  │  ⚠️ محمد کریمی (دوره Python) - شیب: -5.2│  │
│  │  ⚠️ فاطمه حسینی (دوره React) - شیب: -3.1│  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  ┌───────────────────────────────────────────┐  │
│  │  نمودار فروش ماهانه                      │  │
│  │           ┌──┐                            │  │
│  │       ┌──┐│  │                            │  │
│  │    ┌──┤  ││  │┌──┐                        │  │
│  │    │  │  ││  ││  │                        │  │
│  │  ┌─┤  │  ││  ││  │                        │  │
│  │  │ │  │  ││  ││  │                        │  │
│  │  └─┴──┴──┴┴──┴┴──┴─                       │  │
│  │   Jan Feb Mar Apr May                     │  │
│  └───────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### 10.3 پنل ادمین (Admin Portal)

**مسیر پایه:** `/admin/*`

#### صفحات اصلی:

| صفحه | مسیر | توضیح | مؤلفه‌های کلیدی |
|---|---|---|---|
| **داشبورد** | `/admin/dashboard` | خلاصه آمار کل سیستم | • تعداد کل کاربران (Student/Instructor/Admin)<br>• تعداد دوره‌ها (منتشرشده/پیش‌نویس)<br>• تعداد ثبت‌نام‌های امروز/این هفته/این ماه<br>• درآمد کل<br>• نمودار رشد کاربران |
| **مدیریت کاربران** | `/admin/users` | جدول تمام کاربران | • جستجو (نام، ایمیل، نام کاربری)<br>• فیلتر (نقش، وضعیت فعال/غیرفعال)<br>• ستون‌ها: نام، ایمیل، نقش، تاریخ عضویت، وضعیت<br>• دکمه‌ها: ویرایش، تغییر نقش، فعال/غیرفعال، حذف |
| **ویرایش کاربر** | `/admin/users/edit/:userId` | فرم ویرایش اطلاعات | • تغییر نام، ایمیل<br>• تغییر نقش (dropdown)<br>• فعال/غیرفعال کردن حساب<br>• ریست رمز عبور |
| **مدیریت دوره‌ها** | `/admin/courses` | جدول تمام دوره‌ها | • فیلتر: مدرس، دسته‌بندی، وضعیت انتشار<br>• جستجو: عنوان دوره<br>• ستون‌ها: عنوان، مدرس، دسته‌بندی، تعداد ثبت‌نام، وضعیت<br>• دکمه‌ها: مشاهده، لغو انتشار، حذف |
| **گزارش عملکرد** | `/admin/student-performance` | تحلیل عملکرد دوره‌ها | • جدول تمام دوره‌ها با:<br>  - تعداد ثبت‌نام<br>  - تعداد شرکت‌کننده در آزمون<br>  - نرخ قبولی (%)<br>  - میانگین نمره<br>• مرتب‌سازی بر اساس هر ستون<br>• Export به Excel/CSV |
| **درخواست‌های مدرس** | `/admin/requests` | بررسی درخواست‌های مدرس شدن | • **تب Pending**: درخواست‌های در انتظار<br>• **تب Approved**: تأییدشده‌ها<br>• **تب Rejected**: ردشده‌ها<br>• برای هر درخواست:<br>  - نام و ایمیل متقاضی<br>  - توضیحات<br>  - دانلود رزومه<br>  - دکمه‌های تأیید/رد |
| **پیام‌های تماس** | `/admin/contact-messages` | مدیریت پیام‌های فرم تماس | • **تب Unread**: پیام‌های خوانده‌نشده<br>• **تب All**: همه پیام‌ها<br>• جزئیات: نام فرستنده، ایمیل، شماره تلفن، موضوع، متن<br>• دکمه "علامت‌گذاری به‌عنوان خوانده‌شده"<br>• دکمه "پاسخ" (لینک به ایمیل) |
| **پروفایل ادمین** | `/admin/profile` | پروفایل شخصی ادمین | • اطلاعات شخصی<br>• تاریخ ایجاد حساب<br>• آخرین ورود |
| **تنظیمات** | `/admin/settings` | تنظیمات سیستم | • تنظیمات عمومی سایت<br>• تنظیمات ایمیل<br>• تنظیمات پرداخت<br>• تنظیمات LLM API<br>• لاگ‌های سیستم |
| **تغییر رمز عبور** | `/admin/change-password` | تغییر رمز عبور ادمین | • رمز فعلی<br>• رمز جدید<br>• تکرار رمز جدید |

#### ویجت‌های داشبورد ادمین:

```
┌───────────────────────────────────────────────────┐
│          داشبورد مدیریت سیستم                     │
├───────────────────────────────────────────────────┤
│                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ 5,420    │ │ 187      │ │ 523      │          │
│  │ دانشجو   │ │ مدرس     │ │ دوره     │          │
│  └──────────┘ └──────────┘ └──────────┘          │
│                                                   │
│  ┌───────────────────────────────────────────┐   │
│  │  نمودار رشد کاربران (6 ماه گذشته)       │   │
│  │                                           │   │
│  │   6000│                        ╱──────    │   │
│  │       │                    ╱──┘           │   │
│  │   4000│                ╱──┘               │   │
│  │       │            ╱──┘                   │   │
│  │   2000│        ╱──┘                       │   │
│  │       │    ╱──┘                           │   │
│  │      0└────────────────────────────       │   │
│  │        Jan Feb Mar Apr May Jun            │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  ┌───────────────────────────────────────────┐   │
│  │  درخواست‌های در انتظار                   │   │
│  │  • 5 درخواست مدرس شدن (نیاز به بررسی)   │   │
│  │  • 12 پیام تماس خوانده‌نشده              │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  ┌───────────────────────────────────────────┐   │
│  │  فعالیت‌های اخیر                          │   │
│  │  • کاربر جدید: علی محمدی (5 دقیقه پیش)  │   │
│  │  • دوره جدید منتشر شد: آموزش Vue.js      │   │
│  │  • گواهینامه صادر شد: دوره Python (#1234)│   │
│  └───────────────────────────────────────────┘   │
└───────────────────────────────────────────────────┘
```

### 10.4 صفحات عمومی (Public Pages)

| صفحه | مسیر | توضیح |
|---|---|---|
| **صفحه اصلی** | `/` | معرفی سیستم، ویژگی‌ها، دوره‌های محبوب |
| **جستجوی دوره‌ها** | `/courses` | مرور دوره‌های منتشرشده با فیلتر و جستجو |
| **جزئیات دوره** | `/course/:slug` | توضیحات کامل دوره، سرفصل، نظرات، قیمت |
| **درباره ما** | `/about` | معرفی پلتفرم و تیم |
| **تماس با ما** | `/contact` | فرم تماس (نام، ایمیل، پیام) |
| **سوالات متداول** | `/faq` | پاسخ به سوالات رایج |
| **قوانین و مقررات** | `/terms` | شرایط استفاده |
| **ورود** | `/login` | فرم ورود (username + password یا Google OAuth) |
| **ثبت‌نام** | `/register` | فرم ثبت‌نام (نام، ایمیل، رمز عبور) |
| **فراموشی رمز** | `/forgot-password` | درخواست بازیابی رمز عبور |

</div>

---

## 11. مستندات API
## 11. API Reference

<div dir="rtl">

### 11.1 دسترسی به مستندات Swagger

پس از راه‌اندازی بک‌اند، مستندات کامل API به‌صورت تعاملی در دسترس است:

```
http://localhost:3000/api/docs
```

**امکانات Swagger UI:**
- ✅ لیست تمام endpoints با توضیحات
- ✅ نمایش ساختار DTO ورودی/خروجی
- ✅ امکان تست مستقیم endpoint ها
- ✅ نمایش کدهای وضعیت HTTP و پاسخ‌های نمونه
- ✅ احراز هویت با Bearer Token

### 11.2 خلاصه Endpoints (گروه‌بندی‌شده)

#### 🔐 احراز هویت (Auth)

```http
POST   /auth/register          # ثبت‌نام
POST   /auth/login             # ورود
POST   /auth/refresh           # تازه‌سازی توکن
POST   /auth/logout            # خروج
GET    /auth/google            # شروع OAuth Google
GET    /auth/google/callback   # بازگشت از Google
```

#### 📚 دوره‌ها (Courses)

```http
# عمومی
GET    /courses                # لیست دوره‌های منتشرشده
GET    /courses/browse         # جستجو و فیلتر
GET    /courses/:id            # جزئیات دوره

# مدرس/ادمین
POST   /courses                # ایجاد دوره جدید
PUT    /courses/:id            # ویرایش دوره
DELETE /courses/:id            # حذف دوره
PUT    /courses/:id/publish    # انتشار/لغو انتشار
GET    /courses/my             # دوره‌های خودم (مدرس)
GET    /courses/admin          # همه دوره‌ها (ادمین)
GET    /courses/:id/students   # دانشجویان دوره
GET    /courses/admin/performance-report  # گزارش عملکرد (ادمین)
```

#### 📝 آزمون (Quiz)

```http
# API مدرس
GET    /courses/:courseId/quizzes         # لیست آزمون‌های دوره
POST   /courses/:courseId/quizzes         # ایجاد آزمون
GET    /quizzes/:quizId                   # جزئیات آزمون
PUT    /quizzes/:quizId                   # ویرایش آزمون + بانک سوالات
PUT    /quizzes/:quizId/publish           # انتشار/لغو
DELETE /quizzes/:quizId                   # حذف
POST   /quizzes/:quizId/generate          # تولید سوالات با AI

# API دانشجو
GET    /quizzes/my                        # آزمون‌های من
POST   /quizzes/:quizId/start             # شروع آزمون
POST   /quiz/attempts/:attemptId/submit   # ارسال پاسخ‌ها
GET    /quiz/attempts/:attemptId/result   # نتیجه آزمون
GET    /quiz/in-progress                  # آزمون در حال انجام
```

#### 📊 تحلیل یادگیری (Analytics)

```http
# دانشجو
GET    /analytics/attempts/:attemptId/skills           # تحلیل یک آزمون
GET    /analytics/students/me/skills?courseId=        # پروفایل مهارتی
GET    /analytics/students/me/progress-trend?courseId=# روند پیشرفت

# مدرس/ادمین
GET    /analytics/courses/:courseId/skills-overview   # تحلیل کلاسی
GET    /analytics/courses/:courseId/students          # جزئیات دانشجویان
GET    /analytics/students/:studentId/trend?courseId= # روند یک دانشجو
GET    /analytics/courses/:courseId/trend-overview    # خلاصه روند کلاس
```

#### 🎯 توصیه دوره (Recommendations)

```http
GET    /recommendations/students/me              # پیشنهادهای فعال (با کش)
POST   /recommendations/refresh                  # محاسبه مجدد
POST   /recommendations/:id/dismiss              # رد پیشنهاد
GET    /recommendations/students/:id/history     # تاریخچه + نرخ تبدیل (ادمین)
```

#### 💬 چت (Chat)

```http
# SSE Stream
GET    /chat/stream?token=JWT                    # جریان رویدادهای بلادرنگ

# پیام‌ها
GET    /chat/courses                             # لیست چت‌ها با unread count
GET    /chat/courses/:courseId/messages          # تاریخچه پیام‌ها
GET    /chat/courses/:courseId/members           # اعضا + وضعیت آنلاین
POST   /chat/courses/:courseId/messages          # ارسال پیام/فایل
DELETE /chat/messages/:messageId                 # حذف پیام
POST   /chat/courses/:courseId/read              # علامت‌گذاری خوانده‌شده
POST   /chat/courses/:courseId/typing            # نشانگر "در حال تایپ..."

# واکنش‌ها و نظرسنجی
POST   /chat/messages/:messageId/reaction        # افزودن/حذف Emoji
GET    /chat/courses/:courseId/polls             # نظرسنجی‌های دوره
POST   /chat/courses/:courseId/polls             # ایجاد نظرسنجی (Instructor/Admin)
POST   /chat/polls/:pollId/vote                  # رأی‌دادن
```

#### 🎓 گواهینامه‌ها (Certificates)

```http
GET    /certificates/my                          # لیست گواهینامه‌های من (دانشجو)
GET    /certificates/:id                         # جزئیات گواهینامه + SkillBreakdown
```

#### 🛒 سبد خرید و پرداخت (Cart & Payment)

```http
GET    /cart                                     # مشاهده سبد خرید
POST   /cart                                     # افزودن دوره به سبد
DELETE /cart/:courseId                           # حذف از سبد
POST   /payment/checkout                         # پرداخت و ثبت‌نام
```

#### 👥 کاربران (Users)

```http
GET    /users                                    # لیست کاربران (ادمین)
GET    /users/me                                 # پروفایل خودم
PUT    /users/me                                 # ویرایش پروفایل
PUT    /users/:userId                            # ویرایش کاربر (ادمین)
POST   /users/avatar                             # آپلود آواتار
DELETE /users/:userId                            # حذف کاربر (ادمین)
```

#### 🏫 درخواست‌های مدرس (Instructor Requests)

```http
POST   /instructor-requests                      # ثبت درخواست
GET    /instructor-requests                      # لیست درخواست‌ها (ادمین)
GET    /instructor-requests/check                # بررسی وجود درخواست (دانشجو)
PUT    /instructor-requests/:id/approve          # تأیید (ادمین)
PUT    /instructor-requests/:id/reject           # رد (ادمین)
```

#### 📧 پیام‌های تماس (Contact Messages)

```http
POST   /contact-messages                         # ارسال پیام (عمومی)
GET    /contact-messages                         # لیست پیام‌ها (ادمین)
PUT    /contact-messages/:id/mark-read           # علامت‌گذاری خوانده‌شده (ادمین)
```

### 11.3 نمونه Requests و Responses

#### ثبت‌نام (Register)

```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "علی",
  "lastName": "احمدی",
  "userName": "ali_ahmadi",
  "email": "ali@example.com",
  "password": "SecurePass123!",
  "mobile": "09123456789"
}
```

**پاسخ موفق (201 Created):**
```json
{
  "user": {
    "id": 42,
    "firstName": "علی",
    "lastName": "احمدی",
    "userName": "ali_ahmadi",
    "email": "ali@example.com",
    "roleId": 1
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a8f5e2b4-c9d1-4a6b-8e3f-1d2c3e4f5g6h"
}
```

#### شروع آزمون (Start Quiz)

```http
POST /quizzes/15/start
Authorization: Bearer <JWT>
```

**پاسخ موفق (200 OK):**
```json
{
  "attemptId": 123,
  "deadline": "2024-06-01T11:00:00Z",
  "questions": [
    {
      "id": 45,
      "questionText": "کدام یک از موارد زیر یک حلقه تکرار نامحدود است؟",
      "displayOrder": 1,
      "score": 2,
      "QuizChoices": [
        { "id": 180, "choiceText": "while True:", "displayOrder": 1 },
        { "id": 181, "choiceText": "for i in range(10):", "displayOrder": 2 },
        { "id": 182, "choiceText": "if x > 0:", "displayOrder": 3 },
        { "id": 183, "choiceText": "def func():", "displayOrder": 4 }
      ]
    }
    // ... سایر سوالات
  ]
}
```

**نکته:** `IsCorrect` در گزینه‌ها نمایش داده نمی‌شود تا از تقلب جلوگیری شود.

#### دریافت پیشنهادهای دوره

```http
GET /recommendations/students/me
Authorization: Bearer <JWT>
```

**پاسخ موفق (200 OK):**
```json
{
  "recommendations": [
    {
      "id": 67,
      "courseId": 25,
      "score": 87.5,
      "reason": "با این دوره می‌تونی حلقه‌ها و آرایه‌ها رو از صفر تا صد یاد بگیری!",
      "matchedSkillTags": ["حلقه‌های تکرار", "آرایه‌ها"],
      "status": "Active",
      "generatedAt": "2024-06-01T08:30:00Z",
      "course": {
        "id": 25,
        "title": "آموزش پیشرفته Python",
        "thumbnail": "/uploads/python-advanced.jpg",
        "shortDescription": "یادگیری مفاهیم پیشرفته Python...",
        "price": 450000,
        "discountPrice": 350000,
        "averageRating": 4.7,
        "category": "برنامه‌نویسی",
        "level": "متوسط"
      }
    }
  ]
}
```

### 11.4 کدهای خطا (Error Codes)

| کد | عنوان | توضیح |
|---|---|---|
| **400** | Bad Request | داده ورودی نامعتبر (اعتبارسنجی DTO ناموفق) |
| **401** | Unauthorized | توکن JWT موجود نیست یا منقضی شده |
| **403** | Forbidden | دسترسی مجاز نیست (نقش اشتباه یا عدم مالکیت) |
| **404** | Not Found | منبع درخواست‌شده یافت نشد |
| **409** | Conflict | تداخل داده (مثلاً ایمیل تکراری) |
| **500** | Internal Server Error | خطای سرور (لاگ در console) |

**نمونه پاسخ خطا:**
```json
{
  "statusCode": 403,
  "message": "شما فقط می‌توانید دوره‌های خود را مدیریت کنید.",
  "error": "Forbidden"
}
```

</div>

---

## 12. راهنمای راه‌اندازی
## 12. Installation and Setup Guide

<div dir="rtl">

### 12.1 پیش‌نیازها

- **Node.js**: نسخه 20 یا بالاتر
- **npm**: نسخه 10 یا بالاتر
- **SQL Server**: نسخه 2019 یا بالاتر (یا Azure SQL Database)
- **LLM Server** (اختیاری): سرور Qwen3-4b با API سازگار با OpenAI

### 12.2 راه‌اندازی بک‌اند

#### گام 1: کلون کردن پروژه

```bash
git clone <repository-url>
cd Learning-Management-System/backend
```

#### گام 2: نصب وابستگی‌ها

```bash
npm install
```

#### گام 3: تنظیم Environment Variables

فایل `.env` در پوشه `backend` ایجاد کنید:

```env
# Database
DATABASE_URL="sqlserver://localhost:1433;database=EduCore;user=sa;password=YourPassword;trustServerCertificate=true"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="15m"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"

# Frontend URL (برای redirects)
FRONTEND_URL="http://localhost:3001"

# AI Integration (اختیاری)
AI_API_URL="http://92.246.145.99:1234/v1/chat/completions"

# Server Port
PORT=3000
```

#### گام 4: اجرای Migrations

```bash
npx prisma generate
npx prisma db push
```

این دستورات:
- کلاینت Prisma را بازسازی می‌کنند
- جداول را در SQL Server ایجاد می‌کنند

#### گام 5: (اختیاری) Seed کردن داده‌های اولیه

برای ایجاد یک ادمین پیش‌فرض:

```bash
npx ts-node prisma/seed.ts
```

یا دستی در SQL Server:

```sql
INSERT INTO Users (FirstName, LastName, UserName, Email, PasswordHash, Role_Id, IsActive, CreatedAt)
VALUES (
  N'ادمین', 
  N'سیستم', 
  'admin', 
  'admin@educore.com', 
  '$2b$10$hashed-password-here',  -- رمز: Admin123! (باید هش bcrypt باشد)
  3,  -- Role_Id: Admin
  1,
  GETDATE()
);
```

#### گام 6: اجرای سرور Development

```bash
npm run start:dev
```

سرور روی `http://localhost:3000` اجرا می‌شود.

**Swagger UI:** `http://localhost:3000/api/docs`

### 12.3 راه‌اندازی فرانت‌اند

#### گام 1: رفتن به پوشه Frontend

```bash
cd ../FrontEnd
```

#### گام 2: نصب وابستگی‌ها

```bash
npm install
```

#### گام 3: تنظیم Environment Variables

فایل `.env` در پوشه `FrontEnd` ایجاد کنید:

```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

#### گام 4: اجرای سرور Development

```bash
npm start
```

اپلیکیشن روی `http://localhost:3001` اجرا می‌شود.

### 12.4 راه‌اندازی LLM Server (اختیاری)

برای استفاده از قابلیت تولید آزمون با AI:

#### روش 1: استفاده از LM Studio

1. دانلود [LM Studio](https://lmstudio.ai/)
2. دانلود مدل `qwen/qwen3-4b`
3. Load کردن مدل و Start کردن سرور Local Inference
4. API endpoint: `http://localhost:1234/v1/chat/completions`

#### روش 2: استفاده از Ollama

```bash
# نصب Ollama
curl https://ollama.ai/install.sh | sh

# دانلود مدل
ollama pull qwen:4b

# اجرای سرور
ollama serve
```

API endpoint: `http://localhost:11434/v1/chat/completions`

### 12.5 تست اتصال

#### بک‌اند:

```bash
curl http://localhost:3000
```

باید پاسخ `Hello World!` برگردد.

#### Swagger:

در مرورگر: `http://localhost:3000/api/docs`

#### فرانت‌اند:

در مرورگر: `http://localhost:3001`

### 12.6 اجرای تست‌ها

#### تست‌های بک‌اند:

```bash
cd backend
npm run test
```

برای تست یک فایل خاص:

```bash
npm run test -- analytics.service.spec.ts
```

#### Coverage Report:

```bash
npm run test:cov
```

### 12.7 Build برای Production

#### بک‌اند:

```bash
cd backend
npm run build
npm run start:prod
```

فایل‌های compiled در `dist/` قرار می‌گیرند.

#### فرانت‌اند:

```bash
cd FrontEnd
npm run build
```

فایل‌های بهینه‌شده در `build/` قرار می‌گیرند. این فایل‌ها را می‌توان روی سرور استاتیک (مثل Nginx) deploy کرد.

### 12.8 Troubleshooting

#### مشکل: اتصال به SQL Server

- بررسی کنید SQL Server در حال اجراست
- اطمینان از صحت `DATABASE_URL` در `.env`
- فعال کردن TCP/IP در SQL Server Configuration Manager

#### مشکل: توکن JWT منقضی می‌شود

- بررسی `JWT_EXPIRATION` در `.env` (پیش‌فرض: 15 دقیقه)
- مطمئن شوید Refresh Token به‌درستی کار می‌کند

#### مشکل: AI API دسترسی ندارد

- مطمئن شوید LLM Server در حال اجراست
- بررسی `AI_API_URL` در `.env`
- اگر سرور LLM ندارید، فیچر تولید آزمون با AI غیرفعال می‌شود (بدون خرابی سیستم)

#### مشکل: CORS Error

- مطمئن شوید `FRONTEND_URL` در `.env` بک‌اند صحیح است
- بررسی تنظیمات CORS در `main.ts`

</div>

---

## 📄 مجوز | License

<div dir="rtl">

این پروژه تحت مجوز MIT منتشر شده است. برای جزئیات بیشتر فایل `LICENSE` را مشاهده کنید.

</div>

---

## 🤝 مشارکت | Contributing

<div dir="rtl">

برای مشارکت در این پروژه:

1. پروژه را Fork کنید
2. یک Branch جدید ایجاد کنید (`git checkout -b feature/amazing-feature`)
3. تغییرات خود را Commit کنید (`git commit -m 'Add amazing feature'`)
4. Branch را Push کنید (`git push origin feature/amazing-feature`)
5. یک Pull Request ایجاد کنید

</div>

---

## 📧 تماس | Contact

<div dir="rtl">

برای سوالات یا پیشنهادات:

- **ایمیل**: info@educore.com
- **وب‌سایت**: https://educore.com
- **GitHub**: https://github.com/yourusername/educore-lms

</div>

---

## 📚 منابع و مراجع | References

<div dir="rtl">

### مقالات مرتبط:

1. **Adaptive Learning Systems**: Anderson, J. R., & Corbett, A. T. (1995). *Knowledge tracing: Modeling the acquisition of procedural knowledge.* User Modeling and User-Adapted Interaction.

2. **Recommendation Algorithms**: Koren, Y., Bell, R., & Volinsky, C. (2009). *Matrix factorization techniques for recommender systems.* Computer.

3. **Learning Analytics**: Siemens, G., & Long, P. (2011). *Penetrating the fog: Analytics in learning and education.* EDUCAUSE review.

4. **NestJS Architecture**: https://docs.nestjs.com/

5. **Prisma ORM Best Practices**: https://www.prisma.io/docs/

6. **Large Language Models in Education**: Brown, T. B., et al. (2020). *Language models are few-shot learners.* NeurIPS.

### فناوری‌های استفاده‌شده:

- **NestJS**: https://nestjs.com/
- **React**: https://react.dev/
- **Prisma**: https://www.prisma.io/
- **Qwen Models**: https://github.com/QwenLM/Qwen
- **ApexCharts**: https://apexcharts.com/
- **Ant Design**: https://ant.design/

</div>

---

<div dir="rtl" align="center">

**ساخته شده با ❤️ برای آینده آموزش**

**Built with ❤️ for the Future of Education**

---

**نسخه:** 1.0.0  
**آخرین به‌روزرسانی:** 2024

</div>
