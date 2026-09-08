# Practice Exams - راهنمای جامع و فنی

## 📌 چرا این ویژگی ضروری است؟

### مسئله اصلی
در سیستم‌های یادگیری سنتی:
- دانشجویان فقط آزمون‌های کامل دوره را می‌دهند
- اگر یک مهارت ضعیف داشته باشند، باید کل دوره را دوباره تمرین کنند
- نتایج فقط نمره کلی را نشان می‌دهند
- عدم تمرین هدفمند برای مهارت‌های ضعیف

### حل پیشنهادی
یک سیستم Practice Exams که:
1. **شناسایی خودکار مهارت‌های ضعیف** - بر اساس تاریخ آزمون‌ها
2. **آزمون‌های هدفمند** - تمرین فقط برای مهارت‌های ضعیف
3. **بازخورد تفصیلی** - نمایش دقیق نقاط ضعف
4. **تمرین موثر** - حداقل 10 سوال برای تمرین واقعی

---

## 🔍 سه ویژگی اصلی - نحوه کار و چرا

### 1️⃣ Pagination برای دوره‌ها

#### چرا؟
```
مشکل: دانشجو در 50 دوره ثبت‌نام دارد
      ├─ صفحه 10 مگابایت است
      ├─ بارگذاری بسیار کند
      └─ تجربه کاربری بسیار ضعیف

حل: نمایش 5 دوره در هر صفحه
    ├─ صفحه سریع
    ├─ بارگذاری بهتر
    └─ ناوبری آسان
```

#### الگوریتم
```
Input: List of courses (مثال: 50 دوره)
       COURSES_PER_PAGE = 5

Step 1: محاسبه تعداد صفحات
        totalPages = ceil(50 / 5) = 10 صفحه

Step 2: صفحه الآن
        currentPage = 1

Step 3: دریافت دوره‌های صفحه فعلی
        startIndex = (1 - 1) * 5 = 0
        endIndex = 0 + 5 = 5
        courses[0:5] = [دوره1، دوره2، دوره3، دوره4، دوره5]

Step 4: نمایش دکمه‌ها
        [قبلی] [1][2][3][...][10] [بعدی]
        - دکمه "قبلی" غیر‌فعال (currentPage = 1)
        - دکمه "1" فعال (صفحه فعلی)

Step 5: جابه‌جایی به صفحه دوم
        currentPage = 2
        startIndex = (2 - 1) * 5 = 5
        endIndex = 5 + 5 = 10
        courses[5:10] = [دوره6، دوره7، دوره8، دوره9، دوره10]

Output: نمایش صفحه شده‌ی دوره‌ها
```

#### کد منطق
```typescript
const COURSES_PER_PAGE = 5;
const currentPage = 1;
const totalCourses = 50;

// محاسبه کل صفحات
const totalPages = Math.ceil(totalCourses / COURSES_PER_PAGE);  // 10

// محاسبه شاخص‌های شروع و پایان
const startIndex = (currentPage - 1) * COURSES_PER_PAGE;  // 0
const endIndex = startIndex + COURSES_PER_PAGE;           // 5

// برش دادن آرایه
const paginatedCourses = allCourses.slice(startIndex, endIndex);
// نتیجه: [دوره 1 تا 5]

// دکمه‌های صفحه‌بندی
for (let page = 1; page <= totalPages; page++) {
  const isActive = page === currentPage;
  const isDisabled = (page === 1 && currentPage === 1) || 
                     (page === totalPages && currentPage === totalPages);
  
  renderButton(page, isActive, isDisabled);
}
```

#### نفع
- صفحات سریع‌تر لود می‌شوند
- کاربر راحت‌تر ناوبری می‌کند
- RAM کمتری مصرف می‌شود

---

### 2️⃣ نمایش نتایج تفصیلی

#### چرا؟
```
مشکل: صرفا نمره نمایش داده می‌شود
      ├─ "نمره شما: 75" - این کافی نیست
      ├─ دانشجو نمی‌دند کدام سوالات غلط است
      ├─ نمی‌تواند از غلط‌ها یاد بگیرد
      └─ نمی‌داند چه مهارتی مشکل دارد

حل: نمایش تفصیلی نتایج
    ├─ نمره و درصد
    ├─ تعداد درست/غلط
    ├─ Status (موفق/نامموفق)
    ├─ تاریخ تکمیل
    └─ آمار‌های مفید
```

#### الگوریتم
```
Input: Student answers
       Quiz answers with correct answer keys

Step 1: محاسبه نمره
        for each student_answer in student_answers:
            if student_answer.choiceId == correct_answer.choiceId:
                score += question.score  // معمولا 10
                correct_count++
            else:
                wrong_count++

        example:
        سوال 1: درست ✓ → score = 10
        سوال 2: غلط ✗ → score = 0
        سوال 3: درست ✓ → score = 10
        ...
        سوال 10: درست ✓ → score = 10
        
        total_score = 80  (8 سوال × 10 امتیاز)
        total_questions = 10
        correct_count = 8

Step 2: محاسبه درصد
        percentage = (total_score / max_score) * 100
                   = (80 / 100) * 100
                   = 80%

Step 3: تعیین Status
        if percentage >= 70:
            status = "موفق" ✅
        else:
            status = "نامموفق" ❌

Step 4: محاسبه تعداد غلط
        wrong_count = total_questions - correct_count
                    = 10 - 8
                    = 2

Output: 
{
  score: 80,
  maxScore: 100,
  percentage: 80,
  correctCount: 8,
  wrongCount: 2,
  totalQuestions: 10,
  isPassed: true,
  completedAt: "2026-09-02T12:00:00Z"
}
```

#### کد منطق
```typescript
interface SubmitAnswer {
  questionId: number;
  choiceId: number;  // انتخاب شده توسط دانشجو
}

interface QuestionWithAnswer {
  id: number;
  correctChoiceId: number;  // پاسخ صحیح
  score: number;  // امتیاز این سوال (معمولا 10)
}

// محاسبه نمره
let totalScore = 0;
let correctCount = 0;
const detailedResults = [];

for (const answer of studentAnswers) {
  const question = questions.find(q => q.id === answer.questionId);
  
  // بررسی درست یا غلط
  const isCorrect = answer.choiceId === question.correctChoiceId;
  
  if (isCorrect) {
    totalScore += question.score;  // معمولا +10
    correctCount++;
  }
  
  // ذخیره‌کردن جزئیات
  detailedResults.push({
    questionId: answer.questionId,
    userAnswer: answer.choiceId,
    correctAnswer: question.correctChoiceId,
    isCorrect: isCorrect,
    earnedScore: isCorrect ? question.score : 0
  });
}

// محاسبه آمار نهایی
const maxScore = studentAnswers.length * 10;  // مثال: 10 سوال × 10 = 100
const percentage = (totalScore / maxScore) * 100;  // 80%
const wrongCount = studentAnswers.length - correctCount;  // 2
const isPassed = percentage >= 70;  // true

// نتیجه نهایی
const result = {
  totalScore,           // 80
  maxScore,             // 100
  percentage,           // 80
  correctCount,         // 8
  wrongCount,           // 2
  totalQuestions: studentAnswers.length,  // 10
  isPassed,             // true
  completedAt: new Date(),
  detailedResults       // برای نمایش تفصیلی
};

// ذخیره‌کردن در دیتابیس
database.save(result);
```

#### نفع
- دانشجو می‌داند دقیقا کجا اشتباه کرد
- می‌تواند از غلط‌ها یاد بگیرد
- معلم می‌تواند ضعف‌های دانشجو را ببیند
- نتایج قابل اعتماد‌تر است

---

### 3️⃣ حداقل 10 سوال برای تمرین

#### چرا؟
```
مشکل: دانشجویان می‌توانند 1 سوال تمرین کنند
      ├─ 1 سوال = 50% نمره (نمونه‌گیری بد)
      ├─ 5 سوال = می‌تواند حظ باشد
      ├─ نتایج غیر قابل اعتماد
      └─ تمرین واقعی نیست

حل: حداقل 10 سوال برای تمرین
    ├─ نمونه‌گیری آماری بهتر
    ├─ نتایج قابل اعتماد
    ├─ تمرین واقعی
    └─ یادگیری موثر
```

#### چرا 10؟ (نقطه نظر آماری)
```
تعداد سوالات | درستی نتیجه | نوع تمرین
1-2         | خیلی ضعیف  | شانسی
3-5         | ضعیف       | ناقص
6-9         | متوسط      | تقریبی
10+         | خوب        | معتبر
20+         | خیلی خوب   | دقیق

10 سوال = حداقل تعداد برای تمرین قابل اعتماد
```

#### الگوریتم
```
Input: 
  studentId: 17
  courseId: 1
  skillTag: "جبر"

Step 1: بررسی ثبت‌نام دانشجو
        enrollment = database.find(student=17, course=1)
        if enrollment is null:
            return ERROR: "شما در این دوره ثبت‌نام نکرده‌اید"

Step 2: دریافت تمام سوالات دوره
        quizzes = database.getQuizzes(courseId=1)
        // نتیجه: [آزمون 1، آزمون 2، آزمون 3]
        
        for quiz in quizzes:
            allQuestions += quiz.questions
        // نتیجه: [45 سوال کل]

Step 3: اگر skillTag = فیلتر کردن
        if skillTag == "جبر":
            filteredQuestions = filter(allQuestions, skill="جبر")
            // نتیجه: [15 سوال جبر]

Step 4: ⭐ بررسی حداقل 10 سوال (KEY POINT)
        if filteredQuestions.length < 10:
            return ERROR: 
            "حداقل 10 سوال نیاز است. فقط 15 سوال دردسترس است"
        
        // مثال: اگر فقط 5 سوال جبر باشد
        // ERROR: "حداقل 10 سوال نیاز است. فقط 5 دردسترس است"

Step 5: شافل کردن (Randomization)
        // الگوریتم Fisher-Yates Shuffle
        for i from n-1 down to 1:
            j = random(0 to i)
            swap(questions[i], questions[j])
        
        // نتیجه: [سوال_عشوایی_1، سوال_عشوایی_2، ...]

Step 6: انتخاب 10 سوال
        selectedQuestions = shuffledQuestions[0:10]
        // نتیجه: 10 سوال تصادفی از 15 سوال جبر

Step 7: فرمت‌کردن و برگرداندن
        return {
          questions: [
            {
              id: 45,
              text: "۲x + ۵ = ۱۵ را حل کنید",
              skillTag: "جبر",
              choices: [
                {id: 101, text: "x = 5"},
                {id: 102, text: "x = 10"}
              ]
            },
            ...
          ]
        }

Output: 10 سوال تصادفی آماده برای تمرین
```

#### کد منطق
```typescript
async function generatePracticeExam(
  studentId: number,
  courseId: number,
  skillTag?: string,
  questionCount: number = 10  // حداقل 10
) {
  // Step 1: بررسی ثبت‌نام
  const enrollment = await database.enrollments.findFirst({
    where: { studentId, courseId }
  });
  
  if (!enrollment) {
    throw new Error("شما در این دوره ثبت‌نام نکرده‌اید");
  }

  // Step 2: دریافت تمام سوالات
  const quizzes = await database.quizzes.findMany({
    where: { courseId },
    include: { questions: true }
  });

  let allQuestions = [];
  for (const quiz of quizzes) {
    allQuestions = [...allQuestions, ...quiz.questions];
  }

  // Step 3: فیلتر اگر skillTag موجود است
  if (skillTag) {
    allQuestions = allQuestions.filter(
      q => q.skillTag.toLowerCase() === skillTag.toLowerCase()
    );
  }

  // Step 4: ⭐ بررسی حداقل 10 سوال
  if (allQuestions.length < 10) {
    throw new Error(
      `حداقل 10 سوال نیاز است. فقط ${allQuestions.length} دردسترس است`
    );
  }

  // Step 5: شافل کردن
  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  const shuffled = shuffleArray(allQuestions);

  // Step 6: انتخاب questionCount سوال (معمولا 10)
  const selected = shuffled.slice(0, questionCount);

  // Step 7: فرمت‌کردن
  return selected.map(q => ({
    id: q.id,
    text: q.questionText,
    skillTag: q.skillTag,
    choices: q.choices.map(c => ({
      id: c.id,
      text: c.choiceText
    }))
  }));
}
```

#### نفع
- نتایج آماری معتبر
- تمرین واقعی برای مهارت
- عدم امکان شانسی شدن
- یادگیری موثر‌تر

---

## 🎯 جریان کاری کامل (End-to-End Flow)

### نمودار جریان
```
START
  │
  ├─ دانشجو وارد صفحه Practice Exams می‌شود
  │
  ├─ STEP 1: شناسایی مهارت‌های ضعیف
  │   ├─ دریافت تمام دوره‌های دانشجو
  │   ├─ برای هر دوره:
  │   │   ├─ دریافت تمام سوالات
  │   │   ├─ دریافت پاسخ‌های دانشجو
  │   │   ├─ محاسبه درصد صحیح برای هر مهارت
  │   │   └─ فیلتر مهارت‌های < 60%
  │   └─ نتیجه: لیست مهارت‌های ضعیف
  │
  ├─ STEP 2: نمایش Pagination
  │   ├─ نمایش 5 دوره در صفحه 1
  │   ├─ دکمه‌های صفحه‌بندی
  │   └─ دانشجو می‌تواند بین صفحات جابه‌جا شود
  │
  ├─ STEP 3: انتخاب دوره و مهارت
  │   ├─ دانشجو دوره‌ای را انتخاب می‌کند
  │   ├─ مهارت ضعیف‌ای را انتخاب می‌کند
  │   └─ دکمه "شروع تمرین" را کلیک می‌کند
  │
  ├─ STEP 4: ایجاد تمرین (Backend)
  │   ├─ بررسی >= 10 سوال؟
  │   │   ├─ خیر → خطا: "فقط X سوال"
  │   │   └─ بله → ادامه
  │   ├─ شافل کردن
  │   ├─ انتخاب 10 سوال تصادفی
  │   └─ نتیجه: 10 سوال
  │
  ├─ STEP 5: نمایش سوالات (Frontend)
  │   ├─ بارگذاری سوالات
  │   ├─ نمایش سوال 1/10
  │   ├─ دانشجو جواب‌ها را انتخاب می‌کند
  │   └─ ناوبری قبلی/بعدی
  │
  ├─ STEP 6: ارسال پاسخ‌ها (Backend)
  │   ├─ دریافت تمام پاسخ‌های دانشجو
  │   ├─ برای هر سوال:
  │   │   ├─ مقایسه با جواب صحیح
  │   │   ├─ محاسبه نمره
  │   │   └─ ثبت تفاصیل
  │   ├─ محاسبه نتایج نهایی
  │   └─ ذخیره‌کردن در دیتابیس
  │
  ├─ STEP 7: نمایش نتایج (Frontend)
  │   ├─ نمایش نمره درصد
  │   ├─ تعداد درست/غلط
  │   ├─ Status: موفق/نامموفق
  │   └─ دکمه‌های بازگشت و چاپ
  │
  └─ END
```

### مثال عملی
```
رویداد: دانشجوی نام "علی" تمرین می‌کند
─────────────────────────────────

STEP 1: صفحه اصلی
  ┌─ علی http://localhost:3000/practice-exams را باز می‌کند
  ├─ Frontend: GET /api/practice-exams/weak-skills
  ├─ Backend:
  │  ├─ Query: SELECT * FROM enrollments WHERE student_id = 5
  │  ├─ نتیجه: 3 دوره (ریاضی، فیزیک، شیمی)
  │  ├─ برای هر دوره: محاسبه مهارت‌های ضعیف
  │  └─ نتیجه نهایی:
  │     {
  │       courseId: 1,
  │       courseTitle: "ریاضی",
  │       weakSkills: [
  │         {tag: "جبر", percentage: 55.0},
  │         {tag: "هندسه", percentage: 45.0}
  │       ]
  │     }
  └─ Frontend: نمایش [ریاضی] [فیزیک] [شیمی] (Pagination)

STEP 2: انتخاب مهارت
  ┌─ علی دوره "ریاضی" را انتخاب می‌کند
  ├─ Frontend نمایش می‌دهد:
  │  ├─ [جبر - 55% - شروع تمرین]
  │  └─ [هندسه - 45% - شروع تمرین]
  └─ علی "شروع تمرین" برای جبر را کلیک می‌کند

STEP 3: ایجاد تمرین
  ┌─ Frontend: POST /api/practice-exams/generate
  │  {
  │    courseId: 1,
  │    skillTag: "جبر"
  │  }
  ├─ Backend:
  │  ├─ Query: SELECT * FROM quizzes WHERE course_id = 1
  │  ├─ نتیجه: 5 آزمون
  │  ├─ استخراج تمام سوالات: 45 سوال
  │  ├─ فیلتر "جبر": 15 سوال
  │  ├─ بررسی: 15 >= 10? ✓ YES
  │  ├─ شافل: [سوال_3, سوال_15, سوال_7, ...]
  │  ├─ انتخاب: [سوال_3, سوال_15, سوال_7, ..., سوال_21] (10 تا)
  │  └─ Response: 10 سوال
  └─ Frontend: نمایش صفحه تمرین

STEP 4: انجام تمرین
  ┌─ علی سوال 1/10 را می‌بیند:
  │  "۲x + ۵ = ۱۵ را حل کنید"
  │  [الف) x = 3]
  │  [ب) x = 5] ← علی این را انتخاب می‌کند
  │  [ج) x = 10]
  ├─ علی به سوال 2 می‌رود و این‌طور ادامه می‌دهد
  ├─ علی 10 سوال را تمام می‌کند
  └─ علی دکمه "تکمیل و ارسال" را کلیک می‌کند

STEP 5: محاسبه نتایج
  ┌─ Frontend: POST /api/practice-exams/submit
  │  {
  │    courseId: 1,
  │    answers: [
  │      {questionId: 3, choiceId: 150},    // ✓ درست
  │      {questionId: 15, choiceId: 200},   // ✗ غلط
  │      {questionId: 7, choiceId: 100},    // ✓ درست
  │      ... (10 item)
  │    ]
  │  }
  ├─ Backend:
  │  ├─ برای هر پاسخ:
  │  │  ├─ پاسخ 1: درست ✓ → score += 10 → total = 10
  │  │  ├─ پاسخ 2: غلط ✗ → score += 0 → total = 10
  │  │  ├─ پاسخ 3: درست ✓ → score += 10 → total = 20
  │  │  └─ ... (8 درست، 2 غلط)
  │  ├─ نتیجه: score = 80
  │  ├─ percentage = (80 / 100) * 100 = 80%
  │  ├─ isPassed = 80% >= 70% = true
  │  └─ INSERT INTO PracticeExamResults
  │     (student_id, course_id, skill_tag, score, ...)
  │     VALUES (5, 1, 'جبر', 80, ...)
  └─ Response: resultId = 125

STEP 6: نمایش نتایج
  ┌─ Frontend: navigate to /practice-exams/result/125
  ├─ Backend: GET /api/practice-exams/results/125
  ├─ نمایش:
  │  ┌─────────────────────┐
  │  │    نتایج تمرینی      │
  │  ├─────────────────────┤
  │  │        80%          │
  │  │   (80/100 امتیاز)   │
  │  ├─────────────────────┤
  │  │ درست: 8 ✓          │
  │  │ غلط: 2 ✗           │
  │  │ Status: ✅ موفق    │
  │  └─────────────────────┘
  └─ علی می‌داند جبرش را 80% متقن کرد ✓
```

---

## 🔧 فنی - الگوریتم‌های استفاده شده

### الگوریتم 1: Pagination (صفحه‌بندی)

**نام فنی:** Array Slicing  
**بدترین زمان:** O(1)  
**بهترین زمان:** O(1)  
**فضا:** O(COURSES_PER_PAGE) = O(5) = O(1)

```typescript
// Input: 50 دوره، صفحه 1
// Output: 5 دوره (0-4)

function paginate(array, page, itemsPerPage) {
  const start = (page - 1) * itemsPerPage;  // 0
  const end = start + itemsPerPage;         // 5
  return array.slice(start, end);           // [0:5]
}
```

### الگوریتم 2: Weighted Average (میانگین وزن‌دار)

**نام فنی:** Weighted Mean  
**استفاده:** محاسبه درصد مهارت

```typescript
// محاسبه درصد صحیح برای یک مهارت
// Input: 5 سوال جبر، 3 درست، 2 غلط
// Output: 60%

let totalScore = 0;
let totalWeight = 0;

for (const answer of answers) {
  if (isCorrect(answer)) {
    totalScore += answer.score;
  }
  totalWeight += answer.score;
}

const percentage = (totalScore / totalWeight) * 100;
// (30 / 50) * 100 = 60%
```

### الگوریتم 3: Fisher-Yates Shuffle (شافل)

**نام فنی:** Random Permutation  
**زمان:** O(n)  
**فضا:** O(n)

```typescript
// الگوریتم شافل کردن برای تصادفی‌سازی سوالات
// Input: [سوال_1، سوال_2، ...، سوال_15]
// Output: [سوال_7، سوال_2، سوال_14، ...]

function shuffleArray(array) {
  const shuffled = [...array];
  
  // از آخر تا اول بر روی
  for (let i = shuffled.length - 1; i > 0; i--) {
    // شاخص تصادفی از 0 تا i
    const j = Math.floor(Math.random() * (i + 1));
    
    // جابه‌جایی
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  
  return shuffled;
}

// مثال:
// Original:     [1, 2, 3, 4, 5]
// Step 1 (i=4): [1, 2, 3, 5, 4]
// Step 2 (i=3): [1, 5, 3, 2, 4]
// Step 3 (i=2): [1, 5, 3, 2, 4]
// Step 4 (i=1): [5, 1, 3, 2, 4]
// Result:       [5, 1, 3, 2, 4]
```

### الگوریتم 4: Filtering (فیلتر کردن)

**نام فنی:** Filter Operation  
**زمان:** O(n)  
**فضا:** O(k) که k = تعداد نتایج

```typescript
// فیلتر کردن سوالات برای یک مهارت خاص
// Input: 45 سوال، skillTag = "جبر"
// Output: 15 سوال (فقط جبر)

const filteredQuestions = allQuestions.filter(q => 
  q.skillTag.toLowerCase() === "جبر".toLowerCase()
);

// معادل:
const filteredQuestions = [];
for (const question of allQuestions) {
  if (question.skillTag === "جبر") {
    filteredQuestions.push(question);
  }
}
```

### الگوریتم 5: Validation (بررسی)

**نام فنی:** Guard Clause  
**زمان:** O(1)

```typescript
// بررسی حداقل 10 سوال
// اگر < 10 → Error
// اگر >= 10 → ادامه

if (questions.length < 10) {
  throw new Error(
    `حداقل 10 سوال نیاز است. فقط ${questions.length} دردسترس.`
  );
}

// این یک Guard Clause است
// یعنی اگر شرط تکمیل نشود، خارج می‌شود
```

### الگوریتم 6: Accumulation (جمع‌آوری)

**نام فنی:** Reduce Operation  
**زمان:** O(n)

```typescript
// جمع‌آوری نمرات برای نتیجه نهایی
// Input: [10, 0, 10, 10, 0, 10, 10, 10, 0, 10] (8 درست، 2 غلط)
// Output: 80

let totalScore = 0;

for (const score of scores) {
  totalScore += score;
}
// totalScore = 80

// یا به صورت Reduce:
const totalScore = scores.reduce((sum, score) => sum + score, 0);
```

---

## 📊 پیچیدگی زمانی (Time Complexity)

### برای هر عملیات

| عملیات | پیچیدگی | توضیح |
|-------|---------|-------|
| Pagination | O(1) | برش آرایه |
| Filter | O(n) | بررسی تمام سوالات |
| Shuffle | O(n) | تصادفی‌سازی |
| Calculate Score | O(m) | m = تعداد پاسخ‌ها (معمولا 10) |
| Save to DB | O(1) | یک INSERT |

### کل فلو
```
شناسایی مهارت‌های ضعیف: O(n) = 45 سوال
                         ↓
Pagination (نمایش):     O(1) = 5 دوره
                         ↓
Generate Exam:          O(n log n) = شافل کردن
                         ↓
Calculate Results:      O(m) = 10 سوال
                         ↓
Save to DB:            O(1)
```

---

## 💾 Database Flow

### Query برای شناسایی مهارت‌های ضعیف

```sql
-- Step 1: دریافت دوره‌های دانشجو
SELECT DISTINCT c.Id, c.Title
FROM Enrollments e
JOIN Courses c ON e.Course_Id = c.Id
WHERE e.Student_Id = 5;

-- نتیجه:
-- CourseId | Title
-- 1        | ریاضی
-- 2        | فیزیک


-- Step 2: دریافت سوالات و پاسخ‌های دانشجو
SELECT 
  qq.SkillTag,
  COUNT(*) as TotalAnswers,
  SUM(CASE WHEN qc.IsCorrect = 1 THEN 1 ELSE 0 END) as CorrectAnswers,
  (SUM(CASE WHEN qc.IsCorrect = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as Percentage
FROM QuizQuestions qq
JOIN StudentAnswers sa ON qq.Id = sa.QuizQuestion_Id
JOIN QuizChoices qc ON sa.SelectedChoice_Id = qc.Id
WHERE sa.Student_Id = 5 AND qq.Quiz_Id IN (
  SELECT q.Id FROM Quizzes q WHERE q.Course_Id = 1
)
GROUP BY qq.SkillTag;

-- نتیجه:
-- SkillTag | TotalAnswers | CorrectAnswers | Percentage
-- جبر      | 5            | 3              | 60%
-- هندسه    | 4            | 2              | 50%

-- Step 3: فیلتر مهارت‌های ضعیف (< 60%)
-- نتیجه: هندسه = 50%
```

### Query برای ذخیره‌کردن نتایج

```sql
INSERT INTO PracticeExamResults (
  Student_Id,
  Course_Id,
  SkillTag,
  Score,
  MaxScore,
  CorrectCount,
  TotalQuestions,
  AnswerDetails,
  CompletedAt
)
VALUES (
  5,                    -- Student_Id
  1,                    -- Course_Id (ریاضی)
  'جبر',                -- SkillTag
  80.00,                -- Score (8 درست × 10)
  100.00,               -- MaxScore (10 سوال × 10)
  8,                    -- CorrectCount
  10,                   -- TotalQuestions
  '[{...}]',            -- AnswerDetails (JSON)
  GETDATE()             -- CompletedAt
);

-- SELECT
SELECT * FROM PracticeExamResults WHERE Id = 125;
-- نتیجه: تمام اطلاعات نتیجه
```

---

## 🎓 خلاصه برای استاد

### نکات کلیدی برای توضیح

#### 1. مسئله
- دانشجویان نمی‌توانند برای مهارت‌های خاص تمرین کنند
- نتایج تفصیلی فراهم نیست
- تمرین‌های کوتاه غیر معتبر هستند

#### 2. حل
**Pagination:** صفحات منطقی برای ناوبری بهتر  
**Detailed Results:** نمایش دقیق نقاط ضعف  
**Minimum 10 Questions:** تمرین معتبر آماری  

#### 3. الگوریتم‌های استفاده شده
- **Array Slicing:** O(1) برای Pagination
- **Filtering:** O(n) برای انتخاب سوالات
- **Fisher-Yates Shuffle:** O(n) برای تصادفی‌سازی
- **Weighted Average:** محاسبه درصد دقیق
- **Validation:** بررسی شرایط الزام

#### 4. معماری
```
Frontend (React)
    ↓ HTTP JSON
Backend (NestJS)
    ↓ Prisma ORM
Database (SQL Server)
```

#### 5. جریان
```
1. شناسایی مهارت‌های ضعیف (Query)
2. نمایش Pagination (Frontend)
3. انتخاب مهارت و شروع
4. ایجاد تمرین (10 سوال)
5. نمایش سوالات
6. محاسبه نتایج
7. ذخیره‌کردن و نمایش
```

---

## 📝 برای ChatGPT - خلاصه فنی

### مقدمه
سیستم Practice Exams یک ویژگی است برای تمرین هدفمند دانشجویان. سه بهبودی اصلی: Pagination (5 دوره/صفحه)، نمایش نتایج تفصیلی، حداقل 10 سوال برای تمرین معتبر.

### الگوریتم‌های اصلی

1. **Pagination** - Array slicing O(1)
   - محاسبه: startIndex = (page-1) * 5
   - نتیجه: 5 دوره در هر صفحه

2. **Score Calculation** - Weighted average O(n)
   - totalScore = sum(correct_answers × score)
   - percentage = (totalScore / maxScore) × 100

3. **Question Shuffling** - Fisher-Yates O(n)
   - تصادفی‌سازی برای انتخاب 10 سوال تصادفی

4. **Weak Skills Detection** - Filtering O(n)
   - تمام پاسخ‌های دانشجو < 60% = ضعیف

5. **Validation** - Guard clause O(1)
   - اگر < 10 سوال موجود: Error
   - اگر >= 10: ادامه

### جریان
- شناسایی مهارت‌های ضعیف (Database Query)
- نمایش Pagination (Frontend)
- انتخاب مهارت
- ایجاد تمرین (Shuffle + Select)
- نمایش سوالات
- محاسبه نتایج
- ذخیره‌کردن

### معماری
Frontend → Backend Service → Database
3 لایه: Presentation, Business Logic, Data Access

---

**نسخه:** 2.0 (جامع و الگوریتم‌محور)  
**تاریخ:** ۱۴۰۲/۶/۲  
**وضعیت:** ✅ آماده برای استاد و ChatGPT
