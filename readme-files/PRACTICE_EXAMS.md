# Practice Exams Feature - مستندات جامع

## 📖 فهرست مطالب
1. [معرفی کلی](#معرفی-کلی)
2. [سه بهبودی اضافه‌شده](#سه-بهبودی-اضافه‌شده)
3. [معماری سیستم](#معماری-سیستم)
4. [ساختار دیتابیس](#ساختار-دیتابیس)
5. [Frontend Implementation](#frontend-implementation)
6. [Backend Implementation](#backend-implementation)
7. [API Endpoints](#api-endpoints)
8. [جریان کاری کامل](#جریان-کاری-کامل)
9. [راه‌اندازی و نصب](#راه‌اندازی-و-نصب)
10. [تست کردن](#تست-کردن)

---

## معرفی کلی

### هدف
سیستم Practice Exams امکانی برای دانشجویان فراهم می‌کند تا:
- آزمون‌های تمرینی برای مهارت‌های ضعیفشان انجام دهند
- نتایج تفصیلی و بازخورد فوری دریافت کنند
- پیشرفت خود را دنبال کنند

### مزایا
✅ افزایش یادگیری موثر  
✅ شناسایی دقیق نقاط ضعف  
✅ تمرین هدفمند و متمرکز  
✅ پیگیری پیشرفت در طول زمان  

---

## سه بهبودی اضافه‌شده

### 1️⃣ Pagination برای لیست دوره‌ها

#### مسئله
```
اگر دانشجو در 50 دوره ثبت‌نام کرده باشد:
❌ صفحه بسیار بلند می‌شود
❌ لود شدن کند است
❌ تجربه کاربری ضعیف
```

#### حل
```
✅ نمایش 5 دوره در هر صفحه
✅ دکمه‌های "قبلی" و "بعدی"
✅ شماره‌های صفحات قابل کلیک
✅ صفحه سریع و تمیز
```

#### کد (Frontend)
```typescript
// PracticeExams.tsx
const COURSES_PER_PAGE = 5;

// صفحه 1: دوره 0-4
// صفحه 2: دوره 5-9
const paginatedCourses = weakSkillsData.slice(
  (coursesPage - 1) * COURSES_PER_PAGE,
  coursesPage * COURSES_PER_PAGE,
);

const totalPages = Math.ceil(weakSkillsData.length / COURSES_PER_PAGE);

// Pagination UI
<nav>
  <button 
    onClick={() => setCoursesPage(Math.max(1, coursesPage - 1))}
    disabled={coursesPage === 1}
  >
    قبلی
  </button>
  
  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
    <button 
      key={page}
      onClick={() => setCoursesPage(page)}
      className={coursesPage === page ? 'active' : ''}
    >
      {page}
    </button>
  ))}
  
  <button 
    onClick={() => setCoursesPage(Math.min(totalPages, coursesPage + 1))}
    disabled={coursesPage === totalPages}
  >
    بعدی
  </button>
</nav>
```

#### نمایش
```
صفحه 1              صفحه 2              صفحه 3
┌───────────┐      ┌───────────┐      ┌───────────┐
│ دوره 1    │      │ دوره 6    │      │ دوره 11   │
│ دوره 2    │      │ دوره 7    │      │ دوره 12   │
│ دوره 3    │      │ دوره 8    │      │ دوره 13   │
│ دوره 4    │      │ دوره 9    │      │ دوره 14   │
│ دوره 5    │      │ دوره 10   │      │ دوره 15   │
│           │      │           │      │           │
│◄قبلی [1][2][3]│بعدی ►      │بعدی ►│
└───────────┘      └───────────┘      └───────────┘
```

#### فایل
📁 `frontend/src/feature-module/Student/practice-exams/PracticeExams.tsx`  
📍 خطوط: 130-180

---

### 2️⃣ نمایش نتایج تفصیلی

#### مسئله
```
قبل از بهبودی:
❌ فقط نمره کلی نمایش داده می‌شود
❌ دانشجو نمی‌دید کدام سوالات غلط است
❌ هیچ فرصت یادگیری از غلط‌ها
```

#### حل
```
✅ نمایش نمره و درصد
✅ تعداد پاسخ‌های درست و غلط
✅ Status: موفق/نامموفق
✅ تاریخ تکمیل
```

#### نمایش صفحه نتایج
```
┌─────────────────────────────────────┐
│  نتایج آزمون تمرینی                 │
│  دوره: ریاضی | مهارت: جبر           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│          نمره شما                    │
│                                     │
│            75%                      │
│        (۷۵/۱۰۰ امتیاز)           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │███████████████░░░░░░░░░░░░│   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      خلاصه نتایج                     │
├─────────────────────────────────────┤
│ تعداد سوالات: 10                    │
│ پاسخ‌های درست: 8 ✓                  │
│ پاسخ‌های غلط: 2 ✗                   │
│ درصد موفقیت: 75%                   │
│ Status: ✅ موفق (≥70%)            │
│ تاریخ: ۱۴۰۲/۶/۲                  │
└─────────────────────────────────────┘

[بازگشت] [چاپ]
```

#### کد (Frontend)
```typescript
// PracticeExamResult.tsx
const PracticeExamResult = () => {
  const [result, setResult] = useState<ResultDetail | null>(null);
  
  useEffect(() => {
    const loadResult = async () => {
      const data = await practiceExamsService.getPracticeExamResultDetails(resultId);
      setResult(data);
    };
    loadResult();
  }, [resultId]);
  
  if (!result) return <Loading />;
  
  return (
    <div>
      {/* نمایش نمره */}
      <div className="score-display">
        <div className="percentage">{result.percentage}%</div>
        <div className="points">{result.score}/{result.maxScore}</div>
      </div>
      
      {/* خلاصه آمار */}
      <div className="stats">
        <div className="stat">
          <label>تعداد سوالات</label>
          <value>{result.totalQuestions}</value>
        </div>
        <div className="stat">
          <label>پاسخ‌های درست</label>
          <value className="success">{result.correctCount}</value>
        </div>
        <div className="stat">
          <label>پاسخ‌های غلط</label>
          <value className="danger">{result.wrongCount}</value>
        </div>
        <div className="stat">
          <label>Status</label>
          <badge className={result.isPassed ? 'success' : 'danger'}>
            {result.isPassed ? '✅ موفق' : '❌ نامموفق'}
          </badge>
        </div>
      </div>
      
      {/* دکمه‌ها */}
      <button onClick={() => navigate('/practice-exams')}>بازگشت</button>
      <button onClick={() => window.print()}>چاپ</button>
    </div>
  );
};
```

#### فایل
📁 `frontend/src/feature-module/Student/practice-exams/PracticeExamResult.tsx`  
📍 کامل فایل (200 خط)

---

### 3️⃣ حداقل 10 سوال برای تمرین

#### مسئله
```
❌ دانشجویان می‌توانستند تمرین 1-5 سوالی انجام دهند
❌ این تمرین واقعی نیست
❌ نتایج قابل‌اعتماد نیستند
```

#### حل
```
✅ بررسی Backend: اگر < 10 سوال → خطا
✅ Default questionCount = 10
✅ تمرین واقعی و موثر
```

#### الگوریتم (Backend)
```
درخواست تمرین
    ↓
Backend checks
    ├─ آیا دانشجو در دوره ثبت‌نام کرده؟
    │  └─ خیر → Forbidden Error
    ├─ آیا سوالات موجود هستند؟
    │  └─ خیر → Not Found Error
    ├─ اگر skillTag: فیلتر کردن
    ├─ ⭐ آیا >= 10 سوال موجود است؟
    │  ├─ خیر → BadRequest Error
    │  └─ بله → ادامه
    ├─ شافل کردن (randomize)
    ├─ انتخاب 10 سوال
    └─ فرمت‌کردن و برگرداندن
```

#### کد (Backend)
```typescript
// practice-exams.service.ts
async generatePracticeExam(
  studentId: number,
  courseId: number,
  skillTag?: string,
  questionCount: number = 10,  // ⭐ Default = 10
) {
  // 1. بررسی ثبت‌نام
  const enrollment = await this.prisma.enrollments.findFirst({
    where: { Student_Id: studentId, Course_Id: courseId },
  });
  if (!enrollment) {
    throw new ForbiddenException('شما در این دوره ثبت‌نام نکرده‌اید.');
  }

  // 2. دریافت تمام آزمون‌های دوره
  const quizzes = await this.prisma.quizzes.findMany({
    where: { Course_Id: courseId },
    include: {
      QuizQuestions: {
        include: { QuizChoices: true },
      },
    },
  });

  if (quizzes.length === 0) {
    throw new NotFoundException('هیچ آزمونی برای این دوره وجود ندارد.');
  }

  // 3. استخراج تمام سوالات
  let allQuestions: any[] = [];
  for (const quiz of quizzes) {
    allQuestions = [...allQuestions, ...quiz.QuizQuestions];
  }

  // 4. فیلتر براساس skillTag
  if (skillTag && skillTag.trim()) {
    allQuestions = allQuestions.filter(
      (q) =>
        q.SkillTag &&
        q.SkillTag.trim().toLowerCase() === skillTag.trim().toLowerCase(),
    );
  }

  if (allQuestions.length === 0) {
    throw new BadRequestException(
      'هیچ سوالی برای این مهارت/دوره وجود ندارد.',
    );
  }

  // 5. ⭐ بررسی حداقل 10 سوال - KEY CHECK
  if (allQuestions.length < 10) {
    throw new BadRequestException(
      `برای ایجاد آزمون تمرینی، حداقل ۱۰ سوال نیاز است. فقط ${allQuestions.length} سوال دردسترس است.`,
    );
  }

  // 6. شافل و انتخاب
  const shuffled = this.shuffleArray(allQuestions).slice(
    0,
    Math.min(questionCount, allQuestions.length),
  );

  // 7. فرمت‌کردن
  return shuffled.map((q) => ({
    id: q.Id,
    questionText: q.QuestionText,
    skillTag: q.SkillTag || 'سایر',
    choices: q.QuizChoices.map((c: any) => ({
      id: c.Id,
      text: c.ChoiceText,
    })),
    score: Number(q.Score),
  }));
}
```

#### خطا (اگر کمتر از 10 سوال باشد)
```json
{
  "statusCode": 400,
  "message": "برای ایجاد آزمون تمرینی، حداقل ۱۰ سوال نیاز است. فقط 5 سوال دردسترس است.",
  "error": "Bad Request"
}
```

#### فایل
📁 `backend/src/practice-exams/practice-exams.service.ts`  
📍 خطوط: 70-90

---

## معماری سیستم

### نمودار لایه‌های معماری

```
┌────────────────────────────────────────────────┐
│            Frontend (React)                    │
│                                                │
│  PracticeExams.tsx                             │
│  ├─ لیست دوره‌ها (5 در صفحه)                │
│  ├─ مهارت‌های ضعیف                             │
│  └─ جدول نتایج                                 │
│                                                │
│  PracticeExamTake.tsx                          │
│  ├─ نمایش سوالات (یکی در میان)               │
│  ├─ ناوبری قبلی/بعدی                         │
│  └─ دکمه ارسال                                 │
│                                                │
│  PracticeExamResult.tsx                        │
│  ├─ نمایش نتایج تفصیلی                         │
│  ├─ آمار و نمره                                │
│  └─ دکمه‌های چاپ و بازگشت                    │
└────────────────┬─────────────────────────────┘
                 │ HTTP JSON
┌────────────────▼─────────────────────────────┐
│          Frontend Service                     │
│      practice-exams.service.ts                │
│                                                │
│  - getWeakSkillsByCoursesForStudent()         │
│  - generatePracticeExam()                     │
│  - submitPracticeExam()                       │
│  - getPracticeExamResults()                   │
│  - getPracticeExamResultDetails()             │
└────────────────┬─────────────────────────────┘
                 │ REST API
┌────────────────▼─────────────────────────────┐
│         Backend (NestJS)                      │
│                                                │
│  Controller:                                   │
│  GET  /weak-skills                            │
│  POST /generate                               │
│  POST /submit                                 │
│  GET  /results                                │
│  GET  /results/:id                            │
└────────────────┬─────────────────────────────┘
                 │ Prisma ORM
┌────────────────▼─────────────────────────────┐
│         Backend Service                       │
│      practice-exams.service.ts                │
│                                                │
│  - getWeakSkillsByStudent()                   │
│  - generatePracticeExam()                     │
│  - submitPracticeExam()                       │
│  - calculateScore()                           │
│  - shuffleArray()                             │
└────────────────┬─────────────────────────────┘
                 │ SQL Queries
┌────────────────▼─────────────────────────────┐
│       Database (SQL Server)                   │
│                                                │
│  Tables:                                       │
│  - Users                                      │
│  - Courses                                    │
│  - Enrollments                                │
│  - Quizzes                                    │
│  - QuizQuestions                              │
│  - QuizChoices                                │
│  - StudentAnswers                             │
│  - PracticeExamResults ⭐ NEW                 │
└──────────────────────────────────────────────┘
```

---

## ساختار دیتابیس

### جدول جدید: PracticeExamResults

```sql
CREATE TABLE [dbo].[PracticeExamResults] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Student_Id] INT NOT NULL,
    [Course_Id] INT NOT NULL,
    [SkillTag] NVARCHAR(200),
    [Score] DECIMAL(5,2) NOT NULL,
    [MaxScore] DECIMAL(5,2) NOT NULL,
    [CorrectCount] INT NOT NULL,
    [TotalQuestions] INT NOT NULL,
    [AnswerDetails] NVARCHAR(MAX) NOT NULL,
    [CompletedAt] DATETIME NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT [PK_PracticeExamResults] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_PracticeExamResults_Users] 
        FOREIGN KEY ([Student_Id]) REFERENCES [dbo].[Users]([Id]),
    CONSTRAINT [FK_PracticeExamResults_Courses] 
        FOREIGN KEY ([Course_Id]) REFERENCES [dbo].[Courses]([Id])
);

CREATE INDEX [IX_PracticeExamResults_Student] 
    ON [dbo].[PracticeExamResults]([Student_Id]);
CREATE INDEX [IX_PracticeExamResults_Course] 
    ON [dbo].[PracticeExamResults]([Course_Id]);
```

### ستون‌های جدول

| ستون | نوع | توضیح | مثال |
|------|------|-------|------|
| `Id` | INT | شناسه منحصر (PK, Identity) | 125 |
| `Student_Id` | INT | شناسه دانشجو (FK) | 17 |
| `Course_Id` | INT | شناسه دوره (FK) | 1 |
| `SkillTag` | NVARCHAR(200) | برچسب مهارت | "جبر" |
| `Score` | DECIMAL(5,2) | نمره کسب‌شده | 75.00 |
| `MaxScore` | DECIMAL(5,2) | نمره کل | 100.00 |
| `CorrectCount` | INT | تعداد درست | 8 |
| `TotalQuestions` | INT | تعداد کل | 10 |
| `AnswerDetails` | NVARCHAR(MAX) | JSON تفاصیل | `[{...}]` |
| `CompletedAt` | DATETIME | تاریخ تکمیل | 2026-09-02 |

### مثال داده

```sql
INSERT INTO PracticeExamResults 
(Student_Id, Course_Id, SkillTag, Score, MaxScore, CorrectCount, TotalQuestions, AnswerDetails, CompletedAt)
VALUES 
(17, 1, 'جبر', 75.00, 100.00, 8, 10, 
'[{"questionId":45,"userChoiceId":101,"correctChoiceId":101,"isCorrect":true}]',
'2026-09-02 12:00:00');
```

---

## Frontend Implementation

### فایل‌های Frontend

#### 1. PracticeExams.tsx (صفحه اصلی)

**وظیفه:** نمایش دوره‌ها، مهارت‌های ضعیف، و نتایج

**State:**
```typescript
const [activeTab, setActiveTab] = useState('weak-skills');     // Tab active
const [selectedCourse, setSelectedCourse] = useState(null);     // دوره انتخابی
const [weakSkillsData, setWeakSkillsData] = useState([]);       // لیست مهارت‌های ضعیف
const [practiceResults, setPracticeResults] = useState([]);    // نتایج تمرین‌ها
const [coursesPage, setCoursesPage] = useState(1);             // صفحه فعلی
const [loading, setLoading] = useState(true);                  // حالت بارگذاری
const [error, setError] = useState(null);                      // پیغام خطا
```

**متدهای کلیدی:**
```typescript
// بارگذاری داده‌ها
const loadData = async () => {
  const weakSkills = await practiceExamsService.getWeakSkillsByCoursesForStudent();
  const results = await practiceExamsService.getPracticeExamResults();
  setWeakSkillsData(weakSkills);
  setPracticeResults(results);
};

// شروع تمرین
const handleGeneratePracticeExam = async (courseId, skillTag) => {
  setGenerating(true);
  const response = await practiceExamsService.generatePracticeExam(
    courseId, skillTag, 10
  );
  localStorage.setItem('practiceExamData', JSON.stringify({
    questions: response,
    courseId,
    skillTag
  }));
  navigate('/student/practice-exams/take/1');
};
```

**تب‌ها:**
- **مهارت‌های ضعیف:** لیست دوره‌ها (با pagination)، مهارت‌های ضعیف، دکمه شروع تمرین
- **نتایج تمرین:** جدول نتایج قبلی

---

#### 2. PracticeExamTake.tsx (تمرین)

**وظیفه:** نمایش سوالات و پذیرش پاسخ‌ها

**State:**
```typescript
const [questions, setQuestions] = useState([]);                // سوالات
const [answers, setAnswers] = useState([]);                    // پاسخ‌های دانشجو
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // سوال فعلی
const [submitting, setSubmitting] = useState(false);           // حالت ارسال
```

**ویژگی‌ها:**
- بررسی حداقل 10 سوال (خطا اگر < 10)
- نمایش سوال یکی در میان
- ناوبری قبلی/بعدی
- نوار پیشرفت
- شبکه پیش‌نمایش سوالات
- دکمه تکمیل و ارسال

**کد:**
```typescript
const loadPracticeExam = async () => {
  const storedData = localStorage.getItem('practiceExamData');
  const examData = JSON.parse(storedData);
  const practiceQuestions = examData.questions || [];

  // ⭐ بررسی حداقل 10 سوال
  if (practiceQuestions.length < 10) {
    setError(
      `برای ایجاد آزمون تمرینی، حداقل ۱۰ سوال نیاز است. فقط ${practiceQuestions.length} سوال دردسترس است.`,
    );
    return;
  }

  setQuestions(practiceQuestions);
  const initialAnswers = practiceQuestions.map(q => ({
    questionId: q.id,
    choiceId: null,
  }));
  setAnswers(initialAnswers);
};

const handleSubmit = async () => {
  const validAnswers = answers
    .filter(a => a.choiceId !== null)
    .map(a => ({
      questionId: a.questionId,
      choiceId: a.choiceId as number
    }));
  
  const response = await practiceExamsService.submitPracticeExam(
    courseId,
    validAnswers,
    skillTag || undefined,
  );
  
  navigate(`/student/practice-exams/result/${response.id}`);
};
```

---

#### 3. PracticeExamResult.tsx (نتایج)

**وظیفه:** نمایش نتایج تفصیلی

**State:**
```typescript
const [result, setResult] = useState<ResultDetail | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

**نمایش:**
- نمره درصد (75%)
- نمره نقطه (75/100)
- آمار: تعداد کل، درست، غلط
- Status: موفق/نامموفق
- دکمه‌ها: بازگشت، چاپ

**کد:**
```typescript
useEffect(() => {
  const loadResultDetails = async () => {
    const response = await practiceExamsService.getPracticeExamResultDetails(resultId);
    setResult(response);
  };
  loadResultDetails();
}, [resultId]);

return (
  <div>
    <h2>نتایج آزمون تمرینی</h2>
    <div className="score-display">
      <div className="percentage">{result.percentage}%</div>
      <div className="stats">
        <div>نمره: {result.score}/{result.maxScore}</div>
        <div>درست: {result.correctCount}/{result.totalQuestions}</div>
        <div>{result.isPassed ? '✅ موفق' : '❌ نامموفق'}</div>
      </div>
    </div>
  </div>
);
```

---

#### 4. practice-exams.scss

**Styling:**
```scss
.practice-exams-header {
  margin-bottom: 2rem;
  
  h2 {
    font-size: 2rem;
    color: #333;
    display: flex;
    align-items: center;
  }
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  button {
    padding: 1rem;
    text-align: right;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    transition: all 0.3s;
    
    &:hover,
    &.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }
  }
}

.skill-card {
  padding: 1.5rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  
  .progress {
    margin: 1rem 0;
  }
}

.score-display {
  text-align: center;
  font-size: 3rem;
  font-weight: bold;
  color: #007bff;
  margin: 2rem 0;
}
```

---

## Backend Implementation

### practice-exams.service.ts

#### متد 1: getWeakSkillsByStudent()

```typescript
async getWeakSkillsByStudent(studentId: number) {
  // 1. دریافت enrollments
  const enrollments = await this.prisma.enrollments.findMany({
    where: { Student_Id: studentId },
    include: { Courses: true }
  });

  const weakSkillsByCourse: WeakSkillByCourse[] = [];

  // 2. برای هر enrollment
  for (const enrollment of enrollments) {
    // دریافت تمام آزمون‌های دوره
    const quizzes = await this.prisma.quizzes.findMany({
      where: { Course_Id: enrollment.Course_Id },
      include: {
        QuizQuestions: true
      }
    });

    // جمع‌آوری تمام سوالات
    let allQuestions = [];
    for (const quiz of quizzes) {
      allQuestions.push(...quiz.QuizQuestions);
    }

    // محاسبه مهارت‌های ضعیف
    const skillGroups = {};
    for (const question of allQuestions) {
      const skillTag = question.SkillTag || 'سایر';
      if (!skillGroups[skillTag]) {
        skillGroups[skillTag] = { questions: [], correctAnswers: 0 };
      }
      skillGroups[skillTag].questions.push(question.Id);
    }

    // دریافت پاسخ‌های دانشجو
    const studentAnswers = await this.prisma.studentAnswers.findMany({
      where: {
        Student_Id: studentId,
        QuizQuestion: { SkillTag: { not: null } }
      },
      include: { QuizQuestion: true, SelectedChoice: true }
    });

    // محاسبه درصد صحیح برای هر مهارت
    const weakSkills = [];
    for (const [skillTag, data] of Object.entries(skillGroups)) {
      const answersForSkill = studentAnswers.filter(
        a => a.QuizQuestion.SkillTag === skillTag
      );
      const correctAnswers = answersForSkill.filter(
        a => a.SelectedChoice.IsCorrect
      ).length;
      const percentage = answersForSkill.length > 0
        ? (correctAnswers / answersForSkill.length) * 100
        : 0;

      if (percentage < 60) {  // مهارت ضعیف اگر < 60%
        weakSkills.push({
          tag: skillTag,
          percentage,
          correct: correctAnswers,
          total: answersForSkill.length
        });
      }
    }

    weakSkillsByCourse.push({
      courseId: enrollment.Course_Id,
      courseTitle: enrollment.Courses.Title,
      hasAttemptedMainQuiz: true,
      weakSkills,
      allCourseSkills: Object.keys(skillGroups)
    });
  }

  return weakSkillsByCourse;
}
```

#### متد 2: generatePracticeExam()

```typescript
// (توضیح داده شده قبل‌تر در بخش "حداقل 10 سوال")
// کد کامل در بالا موجود است
```

#### متد 3: submitPracticeExam()

```typescript
async submitPracticeExam(
  studentId: number,
  courseId: number,
  answers: SubmitPracticeExamDTO[],
  skillTag?: string,
) {
  // 1. دریافت تمام سوالات + پاسخ صحیح
  const questions = await this.getQuestionWithAnswers(courseId, skillTag);

  // 2. محاسبه نمره
  let score = 0;
  let correctCount = 0;
  const answerDetails = [];

  for (const answer of answers) {
    const question = questions.find(q => q.Id === answer.questionId);
    if (!question) continue;

    const isCorrect = question.correctChoiceId === answer.choiceId;
    
    if (isCorrect) {
      score += Number(question.Score);
      correctCount++;
    }

    answerDetails.push({
      questionId: question.Id,
      userChoiceId: answer.choiceId,
      correctChoiceId: question.correctChoiceId,
      isCorrect,
    });
  }

  // 3. ذخیره‌کردن در دیتابیس
  const result = await this.prisma.practiceExamResults.create({
    data: {
      Student_Id: studentId,
      Course_Id: courseId,
      SkillTag: skillTag,
      Score: new Decimal(score),
      MaxScore: new Decimal(100),
      CorrectCount: correctCount,
      TotalQuestions: answers.length,
      AnswerDetails: JSON.stringify(answerDetails),
      CompletedAt: new Date(),
    }
  });

  return result;
}
```

#### متد 4: getPracticeExamResults()

```typescript
async getPracticeExamResults(studentId: number, courseId?: number) {
  const where: any = { Student_Id: studentId };
  if (courseId) {
    where.Course_Id = courseId;
  }

  const results = await this.prisma.practiceExamResults.findMany({
    where,
    include: { Courses: true },
    orderBy: { CompletedAt: 'desc' }
  });

  return results.map(r => ({
    id: r.Id,
    courseId: r.Course_Id,
    courseTitle: r.Courses.Title,
    skillTag: r.SkillTag,
    score: Number(r.Score),
    maxScore: Number(r.MaxScore),
    percentage: (Number(r.Score) / Number(r.MaxScore)) * 100,
    totalQuestions: r.TotalQuestions,
    correctCount: r.CorrectCount,
    wrongCount: r.TotalQuestions - r.CorrectCount,
    isPassed: (Number(r.Score) / Number(r.MaxScore)) * 100 >= 70,
    completedAt: r.CompletedAt
  }));
}
```

#### متد 5: getPracticeExamResultDetails()

```typescript
async getPracticeExamResultDetails(resultId: number, studentId: number) {
  const result = await this.prisma.practiceExamResults.findFirst({
    where: {
      Id: resultId,
      Student_Id: studentId
    },
    include: { Courses: true }
  });

  if (!result) {
    throw new NotFoundException('نتیجه یافت نشد');
  }

  return {
    id: result.Id,
    courseId: result.Course_Id,
    courseTitle: result.Courses.Title,
    skillTag: result.SkillTag,
    score: Number(result.Score),
    maxScore: Number(result.MaxScore),
    percentage: (Number(result.Score) / Number(result.MaxScore)) * 100,
    totalQuestions: result.TotalQuestions,
    correctCount: result.CorrectCount,
    wrongCount: result.TotalQuestions - result.CorrectCount,
    isPassed: (Number(result.Score) / Number(result.MaxScore)) * 100 >= 70,
    completedAt: result.CompletedAt
  };
}
```

---

## API Endpoints

### GET /practice-exams/weak-skills
**دریافت مهارت‌های ضعیف دانشجو**

```http
GET /api/practice-exams/weak-skills
Authorization: Bearer {token}
```

**پاسخ (200):**
```json
[
  {
    "courseId": 1,
    "courseTitle": "ریاضی",
    "hasAttemptedMainQuiz": true,
    "weakSkills": [
      {
        "tag": "جبر",
        "percentage": 55.0,
        "correct": 3,
        "total": 5
      }
    ]
  }
]
```

---

### POST /practice-exams/generate
**ایجاد آزمون تمرینی (حداقل 10 سوال)**

```http
POST /api/practice-exams/generate
Content-Type: application/json

{
  "courseId": 1,
  "skillTag": "جبر"
}
```

**پاسخ (201):**
```json
[
  {
    "id": 45,
    "questionText": "۲x + ۵ = ۱۵ را حل کنید",
    "skillTag": "جبر",
    "choices": [
      {"id": 101, "text": "x = 5"},
      {"id": 102, "text": "x = 10"}
    ],
    "score": 10.0
  }
]
```

**خطا (400):**
```json
{
  "statusCode": 400,
  "message": "برای ایجاد آزمون تمرینی، حداقل ۱۰ سوال نیاز است. فقط 5 سوال دردسترس است.",
  "error": "Bad Request"
}
```

---

### POST /practice-exams/submit
**ارسال پاسخ‌ها و ذخیره نتایج**

```http
POST /api/practice-exams/submit
Content-Type: application/json

{
  "courseId": 1,
  "answers": [
    {"questionId": 45, "choiceId": 101},
    {"questionId": 46, "choiceId": 200}
  ],
  "skillTag": "جبر"
}
```

**پاسخ (201):**
```json
{
  "id": 125,
  "studentId": 17,
  "courseId": 1,
  "skillTag": "جبر",
  "score": 75.0,
  "maxScore": 100.0,
  "correctCount": 8,
  "totalQuestions": 10,
  "completedAt": "2026-09-02T12:30:00Z"
}
```

---

### GET /practice-exams/results
**دریافت تمام نتایج دانشجو**

```http
GET /api/practice-exams/results?courseId=1
Authorization: Bearer {token}
```

**پاسخ (200):**
```json
[
  {
    "id": 125,
    "courseId": 1,
    "courseTitle": "ریاضی",
    "skillTag": "جبر",
    "score": 75.0,
    "maxScore": 100.0,
    "percentage": 75.0,
    "totalQuestions": 10,
    "correctCount": 8,
    "wrongCount": 2,
    "isPassed": true,
    "completedAt": "2026-09-02T12:30:00Z"
  }
]
```

---

### GET /practice-exams/results/:id
**دریافت جزئیات یک نتیجه**

```http
GET /api/practice-exams/results/125
Authorization: Bearer {token}
```

**پاسخ (200):**
```json
{
  "id": 125,
  "courseId": 1,
  "courseTitle": "ریاضی",
  "skillTag": "جبر",
  "score": 75.0,
  "maxScore": 100.0,
  "percentage": 75.0,
  "totalQuestions": 10,
  "correctCount": 8,
  "wrongCount": 2,
  "isPassed": true,
  "completedAt": "2026-09-02T12:30:00Z"
}
```

---

## جریان کاری کامل

### سناریو: دانشجوی نام "فاطمه" تمرین می‌کند

```
┌─ مرحله 1: صفحه اصلی ─────────────────────────────┐
│                                                  │
│ Frontend: PracticeExams.tsx                      │
│ - بارگذاری مهارت‌های ضعیف                        │
│ - نمایش 5 دوره (Pagination)                     │
│ - نمایش جدول نتایج قبلی                         │
│                                                  │
│ Backend Query:                                   │
│ GET /weak-skills                                │
│ → دریافت enrollments                            │
│ → محاسبه درصد برای هر مهارت                      │
│ → فیلتر مهارت‌های < 60%                         │
│                                                  │
│ Response:                                        │
│ [{                                              │
│   courseId: 1,                                  │
│   courseTitle: "ریاضی",                         │
│   weakSkills: [                                 │
│     { tag: "جبر", percentage: 55.0 }           │
│   ]                                             │
│ }]                                              │
└──────────────────────────────────────────────────┘

┌─ مرحله 2: فاطمه "شروع تمرین جبر" را کلیک می‌کند ─┐
│                                                  │
│ Frontend: handleGeneratePracticeExam()           │
│ POST /generate                                  │
│ {                                               │
│   courseId: 1,                                  │
│   skillTag: "جبر"                               │
│ }                                               │
└──────────────────────────────────────────────────┘

┌─ مرحله 3: Backend ایجاد می‌کند ──────────────────┐
│                                                  │
│ Service: generatePracticeExam()                  │
│                                                  │
│ 1. بررسی ثبت‌نام: ✓ OK                          │
│ 2. دریافت آزمون‌های دوره: 5 آزمون               │
│ 3. استخراج سوالات: 45 سوال                      │
│ 4. فیلتر "جبر": 15 سوال                        │
│ 5. ⭐ بررسی: >= 10؟ YES ✓                      │
│ 6. شافل: randomize                             │
│ 7. انتخاب: 10 سوال تصادفی                     │
│ 8. فرمت: [Question, Question, ...]             │
│                                                  │
│ Response: [10 × Question Objects]               │
└──────────────────────────────────────────────────┘

┌─ مرحله 4: Frontend ذخیره و نمایش ────────────────┐
│                                                  │
│ localStorage.setItem('practiceExamData', ...)   │
│ navigate('/practice-exams/take/1')              │
│                                                  │
│ Frontend: PracticeExamTake.tsx                   │
│ - بارگذاری سوالات از localStorage               │
│ - ⭐ بررسی: >= 10 سوال؟ YES ✓                  │
│ - نمایش سوال 1/10                              │
│ - ناوبری و جواب‌دهی                              │
└──────────────────────────────────────────────────┘

┌─ مرحله 5: فاطمه 10 سوال را جواب می‌دهد ─────────┐
│                                                  │
│ Frontend: PracticeExamTake.tsx                   │
│                                                  │
│ سوال 1: ۲x + ۵ = ۱۵?                           │
│         جواب: x = 5 ✓                          │
│                                                  │
│ سوال 2: ۳x - ۲ = ۱۰?                          │
│         جواب: x = 3 ✗ (درست: x = 4)          │
│                                                  │
│ ... (8 سوال دیگر) ...                           │
│                                                  │
│ سوال 10: ...                                     │
│          جواب: ... ✓                           │
│                                                  │
│ answers[] = [                                   │
│   {questionId: 45, choiceId: 101},             │
│   {questionId: 46, choiceId: 200},             │
│   ...                                          │
│ ]                                               │
└──────────────────────────────────────────────────┘

┌─ مرحله 6: فاطمه "تکمیل و ارسال" می‌کند ─────────┐
│                                                  │
│ Frontend: handleSubmit()                         │
│ POST /submit                                    │
│ {                                               │
│   courseId: 1,                                  │
│   answers: [10 × answer objects],              │
│   skillTag: "جبر"                               │
│ }                                               │
└──────────────────────────────────────────────────┘

┌─ مرحله 7: Backend محاسبه و ذخیره می‌کند ────────┐
│                                                  │
│ Service: submitPracticeExam()                    │
│                                                  │
│ 1. دریافت تمام سوالات + جواب صحیح               │
│ 2. محاسبه نمره:                                 │
│    - سوال 1: ✓ 10 نقطه → total = 10            │
│    - سوال 2: ✗ 0 نقطه → total = 10             │
│    - سوال 3: ✓ 10 نقطه → total = 20            │
│    - ...                                       │
│    - سوال 10: ✓ 10 نقطه → total = 80          │
│                                                  │
│    (مثال: 8 درست = 80 نقطه)                    │
│                                                  │
│ 3. ذخیره‌کردن:                                  │
│    INSERT INTO PracticeExamResults              │
│    (Student_Id, Course_Id, SkillTag,           │
│     Score, MaxScore, CorrectCount, ...)        │
│    VALUES (17, 1, 'جبر', 80, 100, 8, ...)     │
│                                                  │
│ Response:                                        │
│ {                                               │
│   id: 125,                                      │
│   score: 80.0,                                  │
│   correctCount: 8                               │
│ }                                               │
└──────────────────────────────────────────────────┘

┌─ مرحله 8: فاطمه نتایج را می‌بیند ────────────────┐
│                                                  │
│ Frontend: navigate('/practice-exams/result/125')│
│                                                  │
│ PracticeExamResult.tsx                           │
│ GET /results/125                                │
│                                                  │
│ نمایش:                                           │
│ ┌─────────────────────────────┐                │
│ │     نتایج تمرینی              │                │
│ ├─────────────────────────────┤                │
│ │         80%                 │                │
│ │    (80/100 امتیاز)          │                │
│ ├─────────────────────────────┤                │
│ │ تعداد سوالات: 10             │                │
│ │ درست: 8 ✓                    │                │
│ │ غلط: 2 ✗                     │                │
│ │ Status: ✅ موفق (≥70%)     │                │
│ └─────────────────────────────┘                │
│                                                  │
│ [بازگشت] [چاپ]                                 │
└──────────────────────────────────────────────────┘
```

---

## راه‌اندازی و نصب

### 1. Database Migration

```powershell
# اجرای SQL Script برای ایجاد جدول
# فایل: backend\prisma\migrations\add_practice_exam_results.sql

# یا از طریق Prisma:
cd backend
npx prisma db push
```

### 2. Backend Setup

```powershell
cd backend

# نصب dependencies
npm install

# build
npm run build

# شروع
npm run start
```

### 3. Frontend Setup

```powershell
cd frontend

# نصب dependencies
npm install

# build
npm run build

# یا development
npm start
```

### 4. تایید نصب

```powershell
# بررسی Frontend
# http://localhost:3000/student/practice-exams

# بررسی Backend
# curl http://localhost:3001/api/practice-exams/weak-skills

# نتیجه موفق:
# ✅ صفحه لود می‌شود
# ✅ دوره‌ها نمایش داده می‌شوند
# ✅ Pagination کار می‌کند
```

---

## تست کردن

### تست Manual

#### تست 1: Pagination
```
1. http://localhost:3000/student/practice-exams
2. به صفحه 2 برو: [1][2][3]
3. ✓ باید دوره‌های 6-10 نمایش بدهد
```

#### تست 2: خطای حداقل 10 سوال
```
1. مهارتی انتخاب کن که < 10 سوال داشته باشد
2. ✓ باید خطا دریافت کنی:
   "حداقل 10 سوال نیاز است. فقط 5 سوال دردسترس است."
```

#### تست 3: تمرین موفق
```
1. مهارتی انتخاب کن که >= 10 سوال داشته باشد
2. ✓ صفحه تمرین باید لود شود
3. 10 سوال را جواب بده
4. ✓ نتایج باید نمایش داده شوند:
   - نمره درصد
   - تعداد درست/غلط
   - Status
```

### تست Automated (اختیاری)

```typescript
// Frontend Test
describe('PracticeExams', () => {
  it('should display pagination with 5 courses per page', () => {
    render(<PracticeExams />);
    const courses = screen.getAllByTestId('course-item');
    expect(courses.length).toBeLessThanOrEqual(5);
  });
});

// Backend Test
describe('generatePracticeExam', () => {
  it('should throw error if < 10 questions', async () => {
    const result = await service.generatePracticeExam(1, 1, 'skill');
    expect(result).toThrow(BadRequestException);
  });
});
```

---

## خلاصه نهایی

### ✅ چه چیزی اضافه شد

| ویژگی | توضیح | فایل |
|------|-------|------|
| **Pagination** | 5 دوره در صفحه | PracticeExams.tsx |
| **نتایج تفصیلی** | نمره، درصد، تعداد | PracticeExamResult.tsx |
| **حداقل 10 سوال** | Validation Backend | practice-exams.service.ts |

### ✅ فایل‌های ایجاد‌شده

**Frontend:**
- `PracticeExams.tsx` (250 lines)
- `PracticeExamTake.tsx` (220 lines)
- `PracticeExamResult.tsx` (200 lines)
- `practice-exams.scss`

**Backend:**
- `practice-exams.service.ts` (200+ lines)
- `practice-exams.controller.ts` (5 endpoints)

**Database:**
- `add_practice_exam_results.sql` (migration)

### ✅ حالت Build

✅ Frontend: Success (0 errors)  
✅ Backend: Success (0 errors)  
✅ Database: Ready  

### 📝 فایل‌های مستندات

- **این فایل:** توضیح کامل همه چیز

---

**نسخه:** 1.0  
**تاریخ:** ۱۴۰۲/۶/۲  
**وضعیت:** ✅ تکمیل‌شده
