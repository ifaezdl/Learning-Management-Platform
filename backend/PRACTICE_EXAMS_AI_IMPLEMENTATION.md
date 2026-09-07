# Practice Exams AI Integration - Implementation Guide

## Overview

This document describes the integration of the Qwen3-4B AI model into the Practice Exams feature for generating contextual questions with skill tags.

## Architecture

### Key Components

#### 1. **AI Service** (`src/ai/ai.service.ts`)
Centralized service for all AI interactions with the Qwen model.

**Methods:**
- `generateQuestionsForCourse(course, count)` - Generate general course questions
- `generateQuestionsForSkill(course, skillTag, count)` - Generate skill-specific questions
- `validateQuestionQuality(questions, expectedSkillTag)` - Validate question quality
- `throwIfValidationFails(questions, expectedSkillTag)` - Throw error if validation fails

**Features:**
- Encapsulates API communication with Qwen model
- Builds contextual prompts based on course metadata (outcomes, prerequisites, lessons)
- Implements JSON extraction with robust error handling
- Validates all generated questions against quality standards
- Supports both general and skill-specific question generation

#### 2. **Practice Exams Service** (`src/practice-exams/practice-exams.service.ts`)
Enhanced to use AI for question generation instead of database queries.

**Key Changes:**
- Injected `AiService` dependency
- `generatePracticeExam()` now calls AI to generate questions
- Uses negative IDs for AI-generated questions (to distinguish from DB questions)
- `submitPracticeExam()` handles both AI-generated and database questions
- Validates skill tag matching for practice exams

#### 3. **Practice Exams Controller** (`src/practice-exams/practice-exams.controller.ts`)
Updated with better documentation and parameter validation.

**Enhancements:**
- Added comprehensive API documentation
- Query parameter validation (1-20 questions, default 10)
- Trim skill tags to ensure clean input
- Better error responses

### Question Structure

Generated questions follow this structure:

```json
{
  "id": -1,
  "questionText": "سوال درباره مهارت خاص",
  "skillTag": "حلقه های تکرار",
  "choices": [
    { "id": -101, "text": "گزینه اول" },
    { "id": -102, "text": "گزینه دوم" },
    { "id": -103, "text": "گزینه سوم" },
    { "id": -104, "text": "گزینه چهارم" }
  ],
  "score": 1,
  "isGenerated": true
}
```

**Negative IDs Scheme:**
- Question ID: `-(index + 1)` (e.g., -1, -2, -3)
- Choice ID: `-(questionIndex + 1) * 100 - (choiceIndex + 1)`
  - Example: -101 (question 1, choice 1), -102 (question 1, choice 2)

### Skill Tags (Key Innovation)

Skill tags are 2-4 Persian words that identify the specific skill being tested.

**Examples:**
- "حلقه های تکرار" (Loops)
- "مدیریت حافظه" (Memory Management)
- "بازگشت به عقب" (Recursion)
- "مرتب سازی" (Sorting)

**Importance:**
- Each question tagged with specific skill for targeted practice
- Students get weak skills analysis from quiz attempts
- Practice exams can be filtered by skill tag
- Enables progress tracking per skill

## API Endpoints

### 1. Get Weak Skills
```
GET /practice-exams/weak-skills
Authorization: Bearer <token>
```

Returns skills where student scored < 70% on recent quizzes.

### 2. Generate Practice Exam
```
POST /practice-exams/courses/:courseId/generate
Authorization: Bearer <token>
Query Parameters:
  - skillTag (optional): "حلقه های تکرار"
  - questionCount (optional): 1-20, default 10
```

Generates questions via AI. If skillTag provided, all questions test that skill.

### 3. Submit Exam
```
POST /practice-exams/courses/:courseId/submit
Authorization: Bearer <token>
Query Parameters:
  - skillTag (optional): for filtering results

Body:
{
  "answers": [
    {
      "questionId": -1,
      "choiceId": 0,
      "questionText": "متن سوال",
      "correctChoiceIndex": 0
    }
  ]
}
```

For AI-generated questions:
- `questionId`: negative (e.g., -1, -2)
- `choiceId`: choice index (0-3)
- `correctChoiceIndex`: index of correct choice

### 4. Get Results
```
GET /practice-exams/results?courseId=1
Authorization: Bearer <token>
```

Returns all practice exam results.

### 5. Get Result Details
```
GET /practice-exams/results/:resultId
Authorization: Bearer <token>
```

Returns full details including questions and answers.

## Question Validation Rules

All questions are validated against these criteria:

| Criterion | Min | Max | Notes |
|-----------|-----|-----|-------|
| Question Text | 10 chars | 500 chars | Must be substantive |
| Skill Tag Words | 2 | 4 | e.g., "حلقه های تکرار" |
| Choices | 2 | 6 | Typically 4 |
| Correct Choices | Exactly 1 | - | Single-choice questions |
| Choice Text | 2 chars | 200 chars | Clear and concise |
| Skill Tag Match | - | - | Must match expected tag if provided |

## Prompt Structure

### Course Questions Prompt
```
System: یک طراح آزمون حرفه‌ای هستی...
User: عنوان دوره: [title]
      دسته‌بندی: [category]
      سطح: [level]
      توضیح: [description]
      اهداف یادگیری: [outcomes]
      ...
```

### Skill-Specific Prompt
```
System: یک طراح آزمون حرفه‌ای متمرکز بر یک مهارت خاص...
        مهم: تمام سوالات باید تنها مهارت "[skillTag]" را بسنجند
User: [course info]
      مهارت مورد تمرین: [skillTag]
```

## Error Handling

### API Errors
- `400 Bad Request`: Invalid input, validation failed
- `403 Forbidden`: Student not enrolled
- `404 Not Found`: Course not found

### Validation Errors
- Question text too short/long
- Invalid skill tag format
- Missing correct choice
- Multiple correct choices

### AI Errors
- Connection failure: "اتصال به سرویس هوش مصنوعی برقرار نشد"
- Invalid response: "پاسخ هوش مصنوعی JSON معتبر نبود"
- No valid questions: "هیچ سوال معتبری تولید نشد"

## Testing

### Using REST Client (VS Code)
See `test-practice-exams.http` for example requests.

### Manual Testing Steps

1. **Setup**
   - Ensure student is enrolled in a course
   - Have valid JWT token
   - Qwen API is accessible

2. **Test General Generation**
   ```bash
   POST /practice-exams/courses/1/generate?questionCount=3
   ```

3. **Test Skill-Specific Generation**
   ```bash
   POST /practice-exams/courses/1/generate?skillTag=حلقه های تکرار&questionCount=3
   ```

4. **Test Submission**
   - Generate exam
   - Submit answers with correct IDs
   - Verify score calculation

5. **Test Results**
   - Retrieve results
   - Check detail page
   - Verify progress comparison

## Database Considerations

### PracticeExamResults Table
- `SkillTag`: Optional filter for results
- `AnswerDetails`: JSON string with detailed answer info
- `Score`, `MaxScore`: For scoring
- `CompletedAt`: Timestamp for progress tracking

### Note on AI-Generated Questions
- **Not stored in database** - generated on-demand
- Only results are stored
- Allows for truly personalized practice
- No need to maintain question bank

## Environment Variables

Required:
```
AI_API_URL=http://92.246.145.99:1234/v1/chat/completions
AI_MODEL_NAME=qwen/qwen3-4b
```

## Performance Considerations

- Question generation: ~2-5 seconds per request
- Validation: <100ms
- Database operations: <200ms
- Typical response time: 3-6 seconds

## Future Enhancements

1. **Caching**: Cache frequently generated skill tags
2. **Batch Generation**: Pre-generate some questions
3. **Custom Prompts**: Allow instructors to customize generation prompts
4. **Analytics**: Track which skills need most practice
5. **Difficulty Levels**: Generate questions by difficulty
6. **Feedback**: AI-generated explanations for wrong answers

## Troubleshooting

### Questions not generated
- Check AI_API_URL is correct
- Verify course has complete metadata
- Ensure skill tag is valid (2-4 Persian words)

### Validation fails
- Check question text length
- Verify skill tag format
- Ensure exactly 4 choices with 1 correct

### Scoring issues
- Verify choiceId matches choice index
- Check correctChoiceIndex is provided for AI questions
- Ensure answer parsing is correct

## References

- Qwen Model: [Alibaba Qwen](https://github.com/QwenLM/Qwen)
- OpenAI API Format: [OpenAI Docs](https://platform.openai.com/docs/api-reference)
- Practice Exams Schema: See `prisma/schema.prisma`
