# Practice Exams - برای بحث با ChatGPT

## Prompt برای ChatGPT

```
من یک فیچر جدید برای سیستم LMS پیاده‌سازی کردم به نام "Practice Exams" که شامل سه بهبودی است.

**سه ویژگی اصلی:**

1. **Pagination برای دوره‌ها**
   - نمایش 5 دوره در هر صفحه
   - الگوریتم: Array Slicing با O(1) complexity
   - formula: startIndex = (page - 1) * 5, endIndex = startIndex + 5
   - مقصد: صفحات سریع‌تر و UX بهتر

2. **نمایش نتایج تفصیلی**
   - محاسبه: totalScore, percentage, correctCount, wrongCount
   - الگوریتم: Weighted Average
   - formula: percentage = (totalScore / maxScore) * 100
   - مقصد: دانشجو می‌داند دقیقا کجا اشتباه کرد

3. **حداقل 10 سوال برای تمرین**
   - Validation: اگر < 10 سوال → Error
   - الگوریتم: Guard Clause + Fisher-Yates Shuffle
   - مقصد: نتایج آماری معتبر و تمرین واقعی

**الگوریتم‌های استفاده شده:**

- Array Slicing (Pagination)
- Weighted Average (Score Calculation)
- Fisher-Yates Shuffle (Randomization)
- Filtering (Select relevant questions)
- Reduce Operation (Accumulation)

**معماری:**

```
Frontend (React Components)
    ↓ HTTP JSON
Backend (NestJS Service)
    ↓ Prisma ORM
Database (SQL Server)
    ↓
PracticeExamResults Table
```

**جریان کار:**

1. شناسایی مهارت‌های ضعیف: Query تمام پاسخ‌های دانشجو، محاسبه درصد، فیلتر < 60%
2. نمایش Pagination: نمایش 5 دوره، دکمه‌های صفحه‌بندی
3. انتخاب مهارت: دانشجو مهارتی برای تمرین انتخاب می‌کند
4. ایجاد تمرین: بررسی >= 10 سوال، شافل کردن، انتخاب 10 سوال
5. نمایش سوالات: یکی در میان نمایش، پذیرش پاسخ‌ها
6. محاسبه نتایج: برای هر سوال: اگر درست → score += 10
7. ذخیره‌کردن: INSERT into PracticeExamResults table
8. نمایش نتیجه: نمره، درصد، تعداد درست/غلط، Status

**Backend Methods:**

1. generatePracticeExam(studentId, courseId, skillTag, questionCount=10)
   - الگوریتم: Validation → Filter → Shuffle → Select
   - زمان: O(n log n) برای shuffle

2. submitPracticeExam(studentId, courseId, answers, skillTag)
   - الگوریتم: محاسبه نمره برای هر جواب
   - زمان: O(m) که m = تعداد پاسخ‌ها (10)

3. getWeakSkillsByStudent(studentId)
   - الگوریتم: Group by skill → Sum correct → Calculate percentage
   - زمان: O(n) که n = تعداد پاسخ‌ها

**Database:**

جدول جدید: PracticeExamResults
- Id (PK, int)
- Student_Id (FK)
- Course_Id (FK)
- SkillTag (varchar)
- Score (decimal)
- MaxScore (decimal)
- CorrectCount (int)
- TotalQuestions (int)
- AnswerDetails (JSON - nvarchar(max))
- CompletedAt (datetime)

Indexes:
- IX_Student (برای جستجو سریع)
- IX_Course (برای جستجو سریع)

سوالاتی که دارم:
1. آیا این الگوریتم‌ها بهینه‌اند؟
2. آیا complexity تحلیل درست است؟
3. آیا معماری تناسب دارد؟
4. چگونه می‌تونم این رو بهتر کنم؟
```

---

## توضیحات تفصیلی برای ChatGPT

### 1. Pagination الگوریتم

```
Input: 50 course, COURSES_PER_PAGE = 5, currentPage = 2

Process:
  startIndex = (2 - 1) * 5 = 5
  endIndex = 5 + 5 = 10
  result = courses[5:10]

Output: [course6, course7, course8, course9, course10]

Time Complexity: O(1) - just calculation
Space Complexity: O(1) - constant size array (5)
```

### 2. Score Calculation الگوریتم

```
Input: 
  answers = [
    {questionId: 1, correct: true, score: 10},
    {questionId: 2, correct: false, score: 0},
    {questionId: 3, correct: true, score: 10},
    ... (10 items)
  ]

Process:
  totalScore = 0
  correctCount = 0
  
  for answer in answers:
    if answer.isCorrect:
      totalScore += 10
      correctCount++
  
  // After loop:
  totalScore = 80
  correctCount = 8
  
  percentage = (80 / 100) * 100 = 80%
  isPassed = 80% >= 70% = true

Output: {score: 80, percentage: 80, correctCount: 8, isPassed: true}

Time Complexity: O(n) where n = number of questions (10)
Space Complexity: O(1) - just variables
```

### 3. Shuffling الگوریتم (Fisher-Yates)

```
Input: [q1, q2, q3, q4, q5]

Process (Fisher-Yates):
  i = 4: j = random(0-4) = 2, swap(q5, q3) → [q1, q2, q5, q4, q3]
  i = 3: j = random(0-3) = 1, swap(q4, q2) → [q1, q4, q5, q2, q3]
  i = 2: j = random(0-2) = 0, swap(q5, q1) → [q5, q4, q1, q2, q3]
  i = 1: j = random(0-1) = 1, swap(q4, q4) → [q5, q4, q1, q2, q3]

Output: [q5, q4, q1, q2, q3] (randomly shuffled)

Time Complexity: O(n) - single pass
Space Complexity: O(n) - need copy of array
Better than: sorting O(n log n)
```

### 4. Weak Skills Detection

```
Input: 
  studentAnswers = [
    {skillTag: "algebra", isCorrect: true},
    {skillTag: "algebra", isCorrect: false},
    {skillTag: "algebra", isCorrect: true},
    {skillTag: "algebra", isCorrect: false},
    {skillTag: "algebra", isCorrect: true}
  ]

Process:
  Group by skillTag:
  algebra: [T, F, T, F, T]
  
  Calculate percentage:
  3 correct / 5 total = 60%
  
  Filter weak skills (< 60%):
  // No results for algebra (60% = threshold)

Time Complexity: O(n) - single pass with grouping
Space Complexity: O(m) where m = number of unique skills
```

### 5. Validation Logic

```
Input: 15 questions for skill "algebra"

Check:
  if (15 < 10):
    throw Error("Minimum 10 required, only 15 available")
  else:
    continue

This is Guard Clause pattern - early exit if condition fails

Time Complexity: O(1)
Space Complexity: O(1)
```

---

## سوالات مشخص برای ChatGPT

### سوال 1: بهینه‌سازی Pagination
```
من برای Pagination از array slicing استفاده می‌کنم.
آیا این بهینه‌ترین روش است یا می‌تونم از Cursor-based Pagination استفاده کنم؟

کد موجود:
const paginatedCourses = allCourses.slice((page-1)*5, page*5);

آیا باید از Database pagination استفاده کنم؟
SELECT * FROM courses LIMIT 5 OFFSET (page-1)*5
```

### سوال 2: Score Calculation
```
فعلا score رو با یک حلقه محاسبه می‌کنم.
آیا می‌تونم از reduce استفاده کنم؟
آیا خط‌خوری (caching) لازم است؟

const total = answers.reduce((sum, a) => sum + (a.isCorrect ? 10 : 0), 0);
```

### سوال 3: Shuffling Performance
```
Fisher-Yates از O(n) time می‌گذره.
برای 15 سوال خوب است، اما اگر 1000 سوال باشد؟
آیا باید از partial shuffle استفاده کنم؟

const shuffled = answers
  .map((q, i) => ({sort: Math.random(), q}))
  .sort((a, b) => a.sort - b.sort)
  .map(x => x.q)
  .slice(0, 10);
```

### سوال 4: Database Indexing
```
من نیاز دارم سریع query بزنم:
- SELECT * FROM PracticeExamResults WHERE Student_Id = 5
- SELECT * FROM PracticeExamResults WHERE Course_Id = 1 AND SkillTag = 'algebra'

آیا این indexes بهینه هستند؟
CREATE INDEX IX_Student ON PracticeExamResults(Student_Id);
CREATE INDEX IX_Course_Skill ON PracticeExamResults(Course_Id, SkillTag);
```

### سوال 5: API Design
```
من 5 endpoint دارم:
- GET /weak-skills
- POST /generate (صدایش حدود 2 ثانیه طول می‌کشد)
- POST /submit
- GET /results
- GET /results/:id

آیا باید caching اضافه کنم؟
آیا rate limiting لازم است؟
```

---

## کوپی‌کنید و در ChatGPT بپرسید

```
من یک سیستم Practice Exams برای LMS پیاده‌سازی کردم.

**سه ویژگی:**

1. Pagination - 5 دوره/صفحه (Array Slicing O(1))
2. Detailed Results - نمره، درصد، تعداد (Weighted Average)
3. Min 10 Questions - Validation (Guard Clause)

**Backend Algorithms:**

```typescript
// 1. Score Calculation
let score = 0;
for (const answer of answers) {
  if (isCorrect(answer)) score += 10;
}
const percentage = (score / 100) * 100;

// 2. Shuffling
for (let i = array.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [array[i], array[j]] = [array[j], array[i]];
}

// 3. Filtering
const weakSkills = answers
  .filter(a => calculatePercentage(a) < 60);

// 4. Validation
if (questions.length < 10) {
  throw new Error("Minimum 10 required");
}
```

**سوالات:**

1. آیا این الگوریتم‌ها بهینه‌اند برای 10 سوال؟
2. آیا می‌تونم بهتر بگیرم؟
3. آیا complexity analysis درست است؟
4. نصیحتت چیه برای مقیاس‌پذیری؟
```

---

## خلاصه برای ارائه به استاد

```
Practice Exams ویژگی‌ای برای LMS است که:

1. **شناسایی خودکار** مهارت‌های ضعیف (< 60%)
2. **تمرین هدفمند** برای هر مهارت
3. **نتایج تفصیلی** برای یادگیری

**Algorithms Used:**
- Pagination: Array Slicing O(1)
- Score: Weighted Average O(n)
- Shuffle: Fisher-Yates O(n)
- Filter: O(n)
- Validation: O(1)

**Architecture:**
Frontend → Backend → Database

**User Flow:**
Select Skill → Shuffle 10 Questions → Answer → Calculate → Save → Display Results

**Database:**
New table PracticeExamResults with 10 fields + 2 indexes
```
