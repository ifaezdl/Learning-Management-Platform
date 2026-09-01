# 📚 سیستم آزمون‌های تمرینی (Practice Exams)

## 📖 مقدمه

این مستند توضیح جامع و دقیق درباره سیستم آزمون‌های تمرینی است که برای دانشجویان طراحی شده است. دانشجویان می‌توانند بر اساس مهارت‌های ضعیف خود، آزمون‌های تمرینی انجام دهند و پیشرفت خود را پیگیری کنند.

---

## 🎯 اهداف و ویژگی‌ها

### اهداف اصلی:
1. **شناسایی مهارت‌های ضعیف**: سیستم مهارت‌های ضعیف دانشجو را بر اساس نتایج آزمون‌های اصلی تشخیص می‌دهد
2. **تمرین هدفمند**: دانشجویان می‌توانند برای بهبود مهارت‌های خاص، آزمون‌های تمرینی بگذرانند
3. **پیگیری پیشرفت**: مقایسه نتایج آزمون‌های متوالی برای دیدن روند بهبود
4. **آمادگی برای آزمون‌های اصلی**: دانشجویانی که هنوز در آزمون اصلی شرکت نکرده‌اند، می‌توانند از آزمون‌های تمرینی برای آمادگی استفاده کنند

### ویژگی‌های اصلی:
- ✅ دریافت خودکار مهارت‌های ضعیف به تفکیک دوره
- ✅ تولید آزمون‌های تمرینی براساس مهارت‌های ضعیف
- ✅ نمایش نتایج به‌صورت فوری
- ✅ مقایسه پیشرفت نسبت به آزمون قبلی
- ✅ رابط کاربری جذاب و کاربرپسند
- ✅ پشتیبانی از صفحات مختلف (تب‌ها)

---

## 🏗️ معماری و ساختار

### Backend

#### 1. **فایل Service** (`practice-exams.service.ts`)
خدماتی که در backend اجرا می‌شوند:

```typescript
// 1. دریافت مهارت‌های ضعیف دانشجو
getWeakSkillsByCoursesForStudent(studentId)

// 2. تولید آزمون تمرینی
generatePracticeExam(studentId, courseId, skillTag?, questionCount?)

// 3. ثبت نتیجه آزمون
submitPracticeExam(studentId, courseId, answers, skillTag?)

// 4. دریافت لیست نتایج
getPracticeExamResults(studentId, courseId?)

// 5. دریافت تفاصیل یک نتیجه
getPracticeExamResultDetails(resultId, studentId)

// 6. مقایسه پیشرفت
comparePracticeExamProgress(studentId, courseId, skillTag?)
```

#### 2. **فایل Controller** (`practice-exams.controller.ts`)
Endpoints API:

| Route | Method | توضیح |
|-------|--------|--------|
| `/practice-exams/weak-skills` | GET | دریافت مهارت‌های ضعیف |
| `/practice-exams/courses/:courseId/generate` | POST | تولید آزمون تمرینی |
| `/practice-exams/courses/:courseId/submit` | POST | ثبت نتیجه |
| `/practice-exams/results` | GET | لیست نتایج |
| `/practice-exams/results/:resultId` | GET | جزئیات نتیجه |
| `/practice-exams/courses/:courseId/progress-comparison` | GET | مقایسه پیشرفت |

#### 3. **Prisma Schema** (`schema.prisma`)
جدول جدید برای ذخیره نتایج:

```prisma
model PracticeExamResults {
  Id               Int       @id
  Student_Id       Int
  Course_Id        Int
  SkillTag         String?
  Score            Decimal
  MaxScore         Decimal
  CorrectCount     Int
  TotalQuestions   Int
  AnswerDetails    String    // JSON
  CompletedAt      DateTime
  
  Users            Users     @relation(...)
  Courses          Courses   @relation(...)
}
```

#### 4. **Module** (`practice-exams.module.ts`)
ثبت module در NestJS:
- Services و Controllers
- Imports: PrismaModule

### Frontend

#### 1. **Service** (`practice-exams.service.ts`)
توابع برای ارتباط با API:

```typescript
// دریافت مهارت‌های ضعیف
getWeakSkillsByCoursesForStudent()

// تولید آزمون
generatePracticeExam(courseId, skillTag?, questionCount?)

// ثبت نتیجه
submitPracticeExam(courseId, answers, skillTag?)

// دریافت نتایج
getPracticeExamResults(courseId?)

// جزئیات نتیجه
getPracticeExamResultDetails(resultId)

// مقایسه پیشرفت
comparePracticeExamProgress(courseId, skillTag?)
```

#### 2. **کامپوننت‌های React**

##### **PracticeExams.tsx** (صفحه اصلی)
- **دو تب اصلی:**
  1. **مهارت‌های ضعیف و تمرین**: نمایش مهارت‌های ضعیف و تولید آزمون‌های تمرینی
  2. **نتایج آزمون‌های تمرینی**: لیست تمام آزمون‌های تمرینی انجام‌شده

- **بخش‌های اصلی:**
  - انتخاب دوره از لیست
  - نمایش مهارت‌های ضعیف برای هر دوره
  - دکمه‌های تمرین برای هر مهارت
  - جدول نتایج با اطلاعات کامل

```
┌─────────────────────────────────────────────┐
│          آزمون‌های تمرینی                   │
├─────────────────┬─────────────────────────────┤
│                 │   تب 1: مهارت‌های ضعیف    │
│ لیست دوره‌ها    │   - انتخاب دوره            │
│                 │   - نمایش مهارت‌های ضعیف  │
│                 │   - دکمه‌های تمرین         │
│                 │                            │
│                 │   تب 2: نتایج              │
│                 │   - جدول نتایج             │
└─────────────────┴─────────────────────────────┘
```

##### **PracticeExamTake.tsx** (صفحه تکمیل آزمون)
- صفحه سوال‌به‌سوال
- نمایش سوال و گزینه‌ها
- دکمه‌های ناوبری (قبلی/بعدی)
- نقشه سوالات برای مشاهده وضعیت
- معلومات آزمون در کناره

```
┌────────────────────────────────────────┬──────────────────┐
│                                        │                  │
│  سوال: 1 از 5                          │  نقشه سوالات    │
│                                        │  [1][2][3][4][5] │
│  [متن سوال]                            │                  │
│                                        │  جواب‌دادی: 3/5 │
│  ○ گزینه 1                             │  بی‌جواب: 2/5   │
│  ○ گزینه 2                             │                  │
│  ○ گزینه 3                             │                  │
│  ○ گزینه 4                             │                  │
│                                        │  اطلاعات:        │
│  [قبلی] ............ [بعدی]            │  • تعداد: 5      │
│                                        │  • مهارت: xxx    │
└────────────────────────────────────────┴──────────────────┘
```

##### **PracticeExamResult.tsx** (صفحه نتایج)
- نمایش نتیجه نهایی
- درصد و امتیاز
- مقایسه با آزمون قبلی
- جزئیات پاسخ‌ها
- دکمه‌های عملیات (بازگشت/تمرین بیشتر)

```
┌──────────────────────────────────┬───────────────────┐
│     نتیجه آزمون تمرینی           │  مقایسه پیشرفت   │
│                                  │                   │
│  [درصد بزرگ: 85٪]                │  آزمون قبلی: 70٪ │
│                                  │  آزمون فعلی: 85٪ │
│  ✓ قبول                          │                   │
│  17 / 20 صحیح                    │  بهبود: +15٪     │
│                                  │  روند: صعودی     │
│  [جدول جزئیات پاسخ‌ها]           │                   │
│                                  │                   │
└──────────────────────────────────┴───────────────────┘
```

#### 3. **Routing** (`all_routes.tsx`, `router.link.tsx`)
سه route اضافه‌شده:
```typescript
studentPracticeExams: "/student/practice-exams"
studentPracticeExamsTake: "/student/practice-exams/take"
studentPracticeExamsResult: "/student/practice-exams/result/:resultId"
```

#### 4. **Styling** (`practice-exams.scss`)
استایل‌های کامل شامل:
- رنگ‌های گرادیانت حرفه‌ای
- Responsive design
- Hover effects و Transitions
- Animations

---

## 📊 جریان کاری (Workflow)

### 1️⃣ **مرحله اول: ورود به صفحه**
```
دانشجو
  ↓
صفحه آزمون‌های تمرینی (PracticeExams.tsx)
  ↓
API Call: GET /practice-exams/weak-skills
  ↓
بارگذاری مهارت‌های ضعیف و نتایج قبلی
```

### 2️⃣ **مرحله دوم: انتخاب مهارت و تولید آزمون**
```
دانشجو انتخاب می‌کند: دوره + مهارت (یا تمام مهارت‌ها)
  ↓
دکمه "تمرین" کلیک
  ↓
API Call: POST /practice-exams/courses/:courseId/generate
  ↓
سوالات تولید می‌شوند
  ↓
ناوبری به صفحه تکمیل آزمون (PracticeExamTake.tsx)
```

### 3️⃣ **مرحله سوم: تکمیل آزمون**
```
صفحه تکمیل آزمون (PracticeExamTake.tsx)
  ↓
دانشجو جواب‌های سوالات را انتخاب می‌کند
  ↓
دکمه "تکمیل و ثبت" کلیک
  ↓
API Call: POST /practice-exams/courses/:courseId/submit
  ↓
نتیجه ذخیره می‌شود
```

### 4️⃣ **مرحله چهارم: مشاهده نتایج**
```
صفحه نتایج (PracticeExamResult.tsx)
  ↓
API Calls:
  • GET /practice-exams/results/:resultId
  • GET /practice-exams/courses/:courseId/progress-comparison
  ↓
نمایش نتیجه، مقایسه و جزئیات
```

---

## 🔧 تکنیک‌های استفاده‌شده

### Backend
- **NestJS**: Framework
- **Prisma**: ORM و دسترسی به دیتابیس
- **TypeScript**: Type safety
- **Decorators**: JWT Auth, Roles

### Frontend
- **React**: UI Framework
- **TypeScript**: Type safety
- **React Router**: Navigation
- **Axios**: API Calls
- **SCSS**: Styling
- **React Hot Toast**: Notifications

### Database
- **SQL Server**: پایگاه داده
- **Prisma Schema**: تعریف مدل‌ها

---

## 💾 ذخیره‌سازی داده‌ها

### جدول PracticeExamResults
```sql
CREATE TABLE PracticeExamResults (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Student_Id INT NOT NULL,
    Course_Id INT NOT NULL,
    SkillTag NVARCHAR(200),
    Score DECIMAL(5,2),
    MaxScore DECIMAL(5,2),
    CorrectCount INT,
    TotalQuestions INT,
    AnswerDetails NVARCHAR(MAX),  -- JSON
    CompletedAt DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (Student_Id) REFERENCES Users(Id),
    FOREIGN KEY (Course_Id) REFERENCES Courses(Id),
    INDEX IX_Student ON Student_Id,
    INDEX IX_Course ON Course_Id
)
```

---

## 🎨 رابط کاربری

### صفحه اصلی (PracticeExams)
- **Header**: عنوان و توضیح
- **Tabs**: مهارت‌های ضعیف | نتایج
- **Sidebar (چپ)**: لیست دوره‌ها
- **Main Content (راست)**: مهارت‌های ضعیف یا نتایج

### صفحه تکمیل (PracticeExamTake)
- **Header**: شماره سوال و مهارت
- **Main**: سوال و گزینه‌ها
- **Sidebar (راست)**: نقشه سوالات و اطلاعات

### صفحه نتایج (PracticeExamResult)
- **Score Circle**: درصد بزرگ و وضعیت
- **Stats**: صحیح/غلط
- **Answer Table**: جزئیات پاسخ‌ها
- **Progress Card**: مقایسه با آزمون قبلی

---

## 🚀 نحوه استفاده

### برای دانشجو

1. **ورود به صفحه Practice Exams**
   - سایدبار → آزمون‌های تمرینی

2. **مشاهده مهارت‌های ضعیف**
   - تب "مهارت‌های ضعیف و تمرین"
   - انتخاب دوره از لیست چپ
   - مشاهده مهارت‌های ضعیف

3. **شروع آزمون تمرینی**
   - کلیک بر دکمه "تمرین" برای یک مهارت
   - یا کلیک "آزمون برای تمام مهارت‌ها"

4. **تکمیل آزمون**
   - جواب هر سوال را انتخاب کنید
   - از نقشه سوالات برای ناوبری استفاده کنید
   - دکمه "تکمیل و ثبت" را کلیک کنید

5. **مشاهده نتایج**
   - درصد و امتیاز نمایش داده می‌شود
   - مقایسه با آزمون قبلی
   - پیشنهادات برای بهبود

---

## 📈 نمونه داده‌ها

### مهارت‌های ضعیف
```json
{
  "courseId": 1,
  "courseTitle": "برنامه‌نویسی پایتون",
  "weakSkills": [
    {
      "tag": "حلقه‌های تکرار",
      "percentage": 45,
      "correct": 9,
      "total": 20
    },
    {
      "tag": "توابع",
      "percentage": 60,
      "correct": 12,
      "total": 20
    }
  ],
  "hasAttemptedMainQuiz": true,
  "allCourseSkills": ["متغیرها", "حلقه‌ها", "توابع", "کلاس‌ها"]
}
```

### نتیجه آزمون تمرینی
```json
{
  "id": 1,
  "courseId": 1,
  "courseTitle": "برنامه‌نویسی پایتون",
  "score": 17,
  "maxScore": 20,
  "isPassed": true,
  "totalQuestions": 5,
  "correctCount": 4,
  "wrongCount": 1,
  "percentage": 85
}
```

### مقایسه پیشرفت
```json
{
  "hasComparison": true,
  "previousResult": {
    "percentage": 70,
    "correctCount": 7,
    "totalQuestions": 10,
    "date": "2026-08-25"
  },
  "latestResult": {
    "percentage": 85,
    "correctCount": 17,
    "totalQuestions": 20,
    "date": "2026-09-01"
  },
  "improvement": 15,
  "trend": "صعودی",
  "message": "تبریک! شما 15٪ بهتر شدید."
}
```

---

## 🔐 امنیت و اعتبارسنجی

### Backend
- ✅ Roles Guard: فقط دانشجویان (Role 1) می‌توانند دسترسی داشته باشند
- ✅ Ownership Check: دانشجو فقط می‌تواند نتایج خود را ببیند
- ✅ Enrollment Check: دانشجو باید در دوره ثبت‌نام کرده باشد
- ✅ Input Validation: اعتبارسنجی تمام پارامترهای ورودی

### Frontend
- ✅ Protected Routes: صفحات فقط برای دانشجویان دسترسی‌پذیر
- ✅ Token Validation: JWT token برای احراز هویت
- ✅ Error Handling: مدیریت خطاهای API

---

## 📱 Responsive Design

تمام صفحات برای تمام اندازه‌های صفحه بهینه‌شده‌اند:
- **Desktop**: تمام بخش‌ها به‌صورت افقی
- **Tablet**: تنظیم فونت‌ها و فاصله‌ها
- **Mobile**: Single Column Layout

---

## 🐛 عیب‌یابی و مشکلات عام

### مشکل: آزمون‌های تمرینی ظاهر نمی‌شوند
**راه‌حل:**
- بررسی اینکه دانشجو در دوره ثبت‌نام کرده است
- بررسی اینکه دوره دارای آزمون است

### مشکل: مهارت‌های ضعیف خالی هستند
**راه‌حل:**
- بررسی اینکه دانشجو در آزمون اصلی شرکت کرده است
- اگر نه، تمام مهارت‌های دوره برای تمرین پیشنهاد می‌شود

### مشکل: خطای "دسترسی مجاز نیست"
**راه‌حل:**
- ورود دوباره به حساب
- بررسی اینکه Token معتبر است

---

## 📚 فایل‌های اصلی

### Backend
- `backend/src/practice-exams/practice-exams.service.ts`
- `backend/src/practice-exams/practice-exams.controller.ts`
- `backend/src/practice-exams/practice-exams.module.ts`
- `backend/prisma/schema.prisma`
- `backend/src/app.module.ts`

### Frontend
- `frontend/src/services/practice-exams.service.ts`
- `frontend/src/feature-module/Student/practice-exams/PracticeExams.tsx`
- `frontend/src/feature-module/Student/practice-exams/PracticeExamTake.tsx`
- `frontend/src/feature-module/Student/practice-exams/PracticeExamResult.tsx`
- `frontend/src/feature-module/Student/practice-exams/practice-exams.scss`
- `frontend/src/feature-module/router/all_routes.tsx`
- `frontend/src/feature-module/router/router.link.tsx`
- `frontend/src/core/common/data/json/student-sidebar.tsx`

---

## 🔄 مراحل نصب و راه‌اندازی

### 1. Backend

```bash
# 1. Migration برای ایجاد جدول جدید
npx prisma migrate dev --name add_practice_exams

# 2. تولید Prisma Client
npx prisma generate

# 3. شروع سرور
npm run start:dev
```

### 2. Frontend

```bash
# تمام dependencies قبلاً نصب هستند
# فقط Compile کنید
npm run build
```

---

## 📊 گزارش و آمار

### Endpoints API (6 عدد)
| # | Endpoint | Method | نقش |
|---|----------|--------|-----|
| 1 | `/weak-skills` | GET | دریافت مهارت‌های ضعیف |
| 2 | `/courses/:id/generate` | POST | تولید آزمون |
| 3 | `/courses/:id/submit` | POST | ثبت نتیجه |
| 4 | `/results` | GET | لیست نتایج |
| 5 | `/results/:id` | GET | جزئیات نتیجه |
| 6 | `/courses/:id/progress-comparison` | GET | مقایسه پیشرفت |

### React Components (3 عدد)
- PracticeExams.tsx (صفحه اصلی + 2 تب)
- PracticeExamTake.tsx (صفحه تکمیل)
- PracticeExamResult.tsx (صفحه نتایج)

### Database Tables (1 عدد)
- PracticeExamResults

---

## ✨ نکات اضافی

### مزایای این سیستم:
1. ✅ **تمرین هدفمند**: دانشجویان روی مهارت‌های ضعیف تمرکز می‌کنند
2. ✅ **بازخورد فوری**: نتایج فوری پس از تکمیل
3. ✅ **مقایسه پیشرفت**: دیدن روند بهبود
4. ✅ **انگیزه**: تشویق دانشجویان برای تمرین بیشتر
5. ✅ **آمادگی بهتر**: آمادگی بیشتر برای آزمون‌های اصلی

### بهبودهای آینده:
- [ ] تحلیل‌های پیشرفته‌تر
- [ ] سازمان‌بندی بیشتر آزمون‌های تمرینی
- [ ] Export نتایج به PDF
- [ ] مقایسه با متوسط کلاس
- [ ] توصیه‌های شخصی‌سازی‌شده

---

## 📞 تماس و پشتیبانی

برای هرگونه سوال یا مشکل، لطفاً با توسعه‌دهنده تماس بگیرید.

---

## 📝 تاریخچه نسخه‌ها

| نسخه | تاریخ | توضیح |
|------|-------|--------|
| 1.0 | 1 سپتامبر 2026 | نسخه اولیه |

---

**تاریخ ایجاد**: 1 سپتامبر 2026
**وضعیت**: ✅ فعال و در حال استفاده
