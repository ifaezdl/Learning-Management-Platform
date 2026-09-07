# Practice Exams AI Integration - Architecture Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + TypeScript)                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────┐         ┌─────────────────────────────┐   │
│  │  PracticeExams.tsx  │         │  PracticeExamTake.tsx       │   │
│  │  (Main Component)   │         │  (Exam Taking Component)    │   │
│  │                     │         │                             │   │
│  │ - Show weak skills  │────┐    │ - Display questions         │   │
│  │ - Trigger exam gen  │    │    │ - Collect answers           │   │
│  │ - Navigate to exam  │    │    │ - Handle AI questions       │   │
│  └─────────────────────┘    │    │ - Submit exam               │   │
│           │                  │    │ - Show progress             │   │
│           │                  └───→│                             │   │
│           │                       └─────────────────────────────┘   │
│           │                                     │                   │
│           └─────────────┬──────────────────────┘                   │
│                         │                                           │
│           ┌─────────────▼─────────────────────┐                   │
│           │ PracticeExamsService              │                   │
│           │ (API Client)                      │                   │
│           │                                   │                   │
│           │ ✓ generatePracticeExam()         │                   │
│           │ ✓ submitPracticeExam()           │                   │
│           │ ✓ getWeakSkills()                │                   │
│           │ ✓ getResults()                   │                   │
│           └─────────────┬─────────────────────┘                   │
│                         │                                           │
│                         │ HTTP/Axios                               │
│                         │                                           │
│                         ▼                                           │
└─────────────────────────────────────────────────────────────────────┘
                          │
                          │ REST API
                          │
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (NestJS + TypeScript)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────┐      ┌─────────────────────────────────┐ │
│  │ PracticeExams        │      │  AI Module (NEW)                │ │
│  │ Controller           │      │                                 │ │
│  │                      │      │ ┌─────────────────────────────┐ │ │
│  │ GET /weak-skills     │      │ │  AiService                  │ │ │
│  │ POST /generate       │──────│ │                             │ │ │
│  │ POST /submit         │      │ │ - Generate Questions        │ │ │
│  │ GET /results         │      │ │ - Validate Quality          │ │ │
│  │                      │      │ │ - Build Prompts             │ │ │
│  └──────────┬───────────┘      │ │ - Extract JSON              │ │ │
│             │                   │ │ - Error Handling            │ │ │
│             │                   │ └────────────┬────────────────┘ │ │
│             │                   │              │                  │ │
│             ▼                   │              ▼                  │ │
│  ┌──────────────────────────────┼──────────────────────────────┐ │ │
│  │  PracticeExams Service       │  │ Qwen API Call (OpenAI)   │ │ │
│  │                              │  │ compatible format)       │ │ │
│  │ - generatePracticeExam()     │  │                          │ │ │
│  │   ├─ Fetch course metadata   │  │ Request:                 │ │ │
│  │   ├─ Call AI Service         │  │ - model: qwen/qwen3-4b  │ │ │
│  │   ├─ Return questions        │  │ - messages: [system,user]│ │ │
│  │   └─ Negative IDs for AI     │  │ - temperature: 0.7      │ │ │
│  │                              │  │                          │ │ │
│  │ - submitPracticeExam()       │  │ Response:                │ │ │
│  │   ├─ Separate AI (ID<0)      │  │ - choices[0].message    │ │ │
│  │   ├─ Separate DB (ID>0)      │  │   .content: JSON array   │ │ │
│  │   ├─ Score each              │  └──────────────────────────┘ │ │
│  │   └─ Store result            │                                │ │
│  │                              │                                │ │
│  │ - getWeakSkills()            │                                │ │
│  │ - getPracticeResults()       │                                │ │
│  └──────────┬───────────────────────────────────────────────────┘ │
│             │                                                       │ │
│             ▼                                                       │ │
│  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  Prisma ORM                                                  │ │ │
│  │  (Database Access Layer)                                     │ │ │
│  │                                                              │ │ │
│  │  ✓ Find courses with full metadata                          │ │ │
│  │  ✓ Find quiz questions and choices                          │ │ │
│  │  ✓ Create/Read PracticeExamResults                          │ │ │
│  │  ✓ Query quiz attempts for weak skills                      │ │ │
│  └──────────┬───────────────────────────────────────────────────┘ │ │
│             │                                                       │ │
│             ▼                                                       │ │
└─────────────────────────────────────────────────────────────────────┘
              │
              │ SQL Queries
              │
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE (SQL Server)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Tables Used:                                                        │
│  ├─ Courses (select: Title, Category, Level, Description)           │
│  ├─ CourseLearningOutcomes                                          │
│  ├─ CoursePrequisties                                               │
│  ├─ CourseSections & Lessons                                        │
│  ├─ Quizzes                                                         │
│  ├─ QuizQuestions (with SkillTag)                                   │
│  ├─ QuizChoices                                                     │
│  ├─ QuizAttempts & QuizAttemptAnswers (for weak skills)            │
│  ├─ PracticeExamResults (NEW data)                                  │
│  ├─ Enrollments (verify student enrollment)                         │
│  └─ Users (student/course relationship)                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagram

### Exam Generation Flow
```
Student Initiates Practice Exam
    │
    ▼
Frontend: Click "شروع تمرین" for skill
    │
    ├─ Load weak skills data
    │
    ├─ Call generatePracticeExam(courseId, skillTag?, count?)
    │
    ▼
Backend: Controller receives request
    │
    ├─ Validate student enrollment
    │
    ├─ Parse query parameters
    │
    ▼
Service: generatePracticeExam()
    │
    ├─ Fetch full course metadata with all relationships
    │
    ├─ Call AiService.generateQuestionsForSkill() or generateQuestionsForCourse()
    │
    ▼
AI Service: Generate Questions
    │
    ├─ Build system prompt (JSON format requirements)
    │
    ├─ Build user prompt (course context + skill tag)
    │
    ├─ Call Qwen API
    │
    ├─ Extract JSON array from response
    │
    ├─ Validate each question
    │   ├─ Check text length (10-500 chars)
    │   ├─ Check skill tag (2-4 words)
    │   ├─ Check 2-6 choices with 1 correct
    │   └─ Throw error if invalid
    │
    ▼
Service: Format Response
    │
    ├─ Assign negative IDs to AI questions
    │ (Example: -1, -2, -3, ...)
    │
    ├─ Assign negative IDs to choices
    │ (Example: -101, -102, -103, -104 for question -1)
    │
    ├─ Mark with isGenerated: true
    │
    ▼
Frontend: Receive Questions
    │
    ├─ Store in localStorage
    │
    ├─ Display with skill tag badge
    │
    ├─ Show loading indicator during generation
    │
    ▼
Student Takes Exam
```

### Exam Submission Flow
```
Student Clicks "تکمیل و ارسال"
    │
    ▼
Frontend: Prepare Answers
    │
    ├─ Filter only answered questions
    │
    ├─ For AI questions (ID < 0):
    │  ├─ Include: questionId
    │  ├─ Include: choiceId (choice index 0-3)
    │  ├─ Include: questionText
    │  └─ Include: correctChoiceIndex
    │
    ├─ For DB questions (ID > 0):
    │  ├─ Include: questionId
    │  └─ Include: choiceId (database choice ID)
    │
    ├─ Include: skillTag (if any)
    │
    ▼
Backend: Receive Submission
    │
    ├─ Validate student enrollment
    │
    ├─ Separate AI questions (ID < 0) from DB questions (ID > 0)
    │
    ▼
Scoring: AI Questions
    │
    ├─ For each AI question:
    │
    ├─ Compare choiceId with correctChoiceIndex
    │  ├─ If equal: +1 score, +1 correct
    │  └─ If not equal: 0 score, 0 correct
    │
    ▼
Scoring: DB Questions
    │
    ├─ Fetch question from database
    │
    ├─ Find correct choice
    │
    ├─ Compare student choice with correct choice
    │
    ├─ Add to score
    │
    ▼
Service: Calculate Results
    │
    ├─ totalScore = sum of all correct answers
    │
    ├─ maxScore = total question count (each = 1 point)
    │
    ├─ correctCount = count of correct answers
    │
    ├─ percentage = (score / maxScore) * 100
    │
    ├─ isPassed = percentage >= 70
    │
    ▼
Database: Store Result
    │
    ├─ Create PracticeExamResults entry:
    │  ├─ Student_Id
    │  ├─ Course_Id
    │  ├─ SkillTag (optional)
    │  ├─ Score
    │  ├─ MaxScore
    │  ├─ CorrectCount
    │  ├─ TotalQuestions
    │  ├─ AnswerDetails (JSON string)
    │  └─ CompletedAt (now)
    │
    ▼
Frontend: Display Results
    │
    ├─ Show score summary
    │
    ├─ Show percentage
    │
    ├─ Show pass/fail status
    │
    ├─ Show correct/wrong counts
    │
    ├─ Store result in history
    │
    ▼
Student Sees Results
```

## 🎯 ID Scheme Explanation

### Question IDs
```
AI-Generated Questions:
├─ Question 1: ID = -1
├─ Question 2: ID = -2
├─ Question 3: ID = -3
└─ Question 4: ID = -4

Database Questions:
├─ Question 1: ID = 1 (from DB)
├─ Question 2: ID = 2 (from DB)
├─ Question 3: ID = 15 (from DB)
└─ Question 4: ID = 42 (from DB)
```

### Choice IDs (for AI Questions)
```
For Question -1 (first AI question):
├─ Choice 1: ID = -101  (-(1+1)*100 - (0+1) = -101)
├─ Choice 2: ID = -102  (-(1+1)*100 - (1+1) = -102)
├─ Choice 3: ID = -103  (-(1+1)*100 - (2+1) = -103)
└─ Choice 4: ID = -104  (-(1+1)*100 - (3+1) = -104)

For Question -2 (second AI question):
├─ Choice 1: ID = -201
├─ Choice 2: ID = -202
├─ Choice 3: ID = -203
└─ Choice 4: ID = -204
```

## 🔌 Module Dependency Graph

```
┌─────────────────────────────────┐
│        App Module               │
├─────────────────────────────────┤
│                                 │
├─→ AiModule (NEW)                │
│   └─→ AiService                │
│                                 │
├─→ PracticeExamsModule           │
│   ├─→ PracticeExamsService      │
│   │   └─→ Imports: AiService   │
│   └─→ PracticeExamsController   │
│                                 │
├─→ PrismaModule                  │
│   └─→ PrismaService             │
│                                 │
└─→ [Other Modules...]           │
                                  │
└─────────────────────────────────┘
```

## 📊 Question Structure Diagram

### AI-Generated Question
```
{
  "id": -1,
  "questionText": "سوال درباره حلقه‌های تکرار",
  ↓
  "skillTag": "حلقه های تکرار" ← KEY FEATURE
  ↓
  "choices": [
    {
      "id": -101,
      "text": "گزینه اول"
    },
    {
      "id": -102,
      "text": "گزینه دوم",
      "isCorrect": true ← This is correct
    },
    {
      "id": -103,
      "text": "گزینه سوم"
    },
    {
      "id": -104,
      "text": "گزینه چهارم"
    }
  ],
  "score": 1,
  "isGenerated": true ← NEW FIELD
}
```

## 🔐 Validation Pipeline

```
AI Response (JSON String)
    │
    ▼
Extract JSON Array
    │
    ├─ Remove markdown backticks
    │
    ├─ Find [ and ]
    │
    ├─ Parse JSON
    │
    ▼
Filter Valid Questions
    │
    ├─ Has questionText (string)
    │
    ├─ Has skillTag (string)
    │
    ├─ Has choices (array)
    │
    ├─ Has ≥2 choices
    │
    ├─ Has exactly 1 correct choice
    │
    ▼
Validate Each Question
    │
    ├─ Question text: 10-500 chars
    │
    ├─ Skill tag: 2-4 Persian words
    │
    ├─ Choice text: 2-200 chars each
    │
    ├─ Choices count: 2-6 (prefer 4)
    │
    ├─ Exactly 1 isCorrect: true
    │
    ▼
Optional: Verify Skill Tag Match
    │
    ├─ If skill-specific generation:
    │
    ├─ Check each skillTag matches expected
    │
    ├─ Throw error if mismatch
    │
    ▼
Return Valid Questions
    │
    └─ All questions passed validation
```

## 🌐 External API Integration

```
┌─────────────────┐
│  Our System     │
└────────┬────────┘
         │
         │ HTTP POST
         │ Model: qwen/qwen3-4b
         │ Messages: [
         │   {role: system, content: prompt},
         │   {role: user, content: context}
         │ ]
         ▼
┌─────────────────────────────────────────┐
│  Qwen API (OpenAI-compatible)           │
│  http://92.246.145.99:1234/v1/chat/completions
├─────────────────────────────────────────┤
│                                         │
│  Qwen 3-4B Model                        │
│  (3-4 Billion parameters)              │
│  - Text understanding                   │
│  - Question generation                  │
│  - JSON formatting                      │
│  - Multi-language support              │
│                                         │
└────────┬────────────────────────────────┘
         │
         │ HTTP Response
         │ {
         │   choices: [{
         │     message: {
         │       content: "[{...}]"
         │     }
         │   }]
         │ }
         ▼
┌─────────────────┐
│  Our System     │
└─────────────────┘
  Parse & Validate
  Return to Frontend
```

## 📈 Performance Timeline

```
User Action                 Time
─────────────────────────────────
Click "شروع تمرین"          Instant
  ↓
API call sent              Instant
  ↓
AI generating              2-5 sec ⏳
  ├─ Validation            <100ms ✓
  ├─ Formatting            <50ms  ✓
  ↓
Response received          ~3-6 sec total
  ↓
Frontend display           Instant
  ↓
Student starts exam        Ready
```

## 🎉 Complete System Ready!

This architecture enables:
- ✅ AI-powered question generation
- ✅ Skill-based practice targeting
- ✅ Quality validation
- ✅ Personalized learning
- ✅ Progress tracking
- ✅ Real-time question creation

---

**Architecture Version**: 1.0
**Status**: ✅ Complete
**Ready for Deployment**: YES
