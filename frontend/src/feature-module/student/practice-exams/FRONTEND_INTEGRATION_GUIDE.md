# Practice Exams Frontend Integration Guide - AI Questions

## Overview

The Practice Exams frontend has been updated to seamlessly work with AI-generated questions from the Qwen3-4B model. This guide explains the changes and how the system handles both AI-generated and database questions.

## Key Changes

### 1. **PracticeQuestion Interface Update**
```typescript
export interface PracticeQuestion {
  id: number;
  questionText: string;
  skillTag: string;
  choices: { id: number; text: string }[];
  score: number;
  isGenerated?: boolean; // NEW: Flag for AI-generated questions
}
```

### 2. **Answer Structure Enhancement**
```typescript
interface Answer {
  questionId: number;
  choiceId: number | null;
  questionText?: string; // NEW: For AI questions
  correctChoiceIndex?: number; // NEW: For AI questions
}
```

### 3. **Service Method Updates**

**generatePracticeExam**
- Now receives AI-generated questions with negative IDs
- Example response:
```json
[
  {
    "id": -1,
    "questionText": "متن سوال",
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
]
```

**submitPracticeExam**
- Updated to handle both AI-generated and database questions
- For AI questions, includes additional metadata:
```typescript
async submitPracticeExam(
  courseId: number,
  answers: Array<{
    questionId: number;
    choiceId: number;
    questionText?: string; // For AI questions
    correctChoiceIndex?: number; // For AI questions
  }>,
  skillTag?: string
)
```

## Component Updates

### PracticeExams.tsx
**No major changes needed** - Component already:
- Shows weak skills from AI analysis
- Triggers exam generation when "شروع تمرین" clicked
- Stores exam data in localStorage
- Navigates to exam taking component

### PracticeExamTake.tsx
**Key Updates:**

1. **Flexible Question Count**
   - Removed hardcoded 10-question minimum
   - Now supports 1-20 questions based on AI generation
   - Removed validation error for question count < 10

2. **AI Question Handling**
   - Detects AI-generated questions via negative ID
   - Initializes `correctChoiceIndex` (set to 0 by default)
   - Passes question metadata to API during submission

3. **Enhanced Submit Logic**
   ```typescript
   // For AI-generated questions, includes:
   ...(questionData?.isGenerated && {
     questionText: answerData.questionText,
     correctChoiceIndex: answerData.correctChoiceIndex,
   })
   ```

## Data Flow

### 1. User Initiates Practice Exam
```
Student clicks "شروع تمرین" for a skill
↓
generatePracticeExam API called
↓
Backend generates questions via Qwen AI
↓
Returns questions with negative IDs and isGenerated flag
↓
Frontend stores in localStorage
↓
Navigate to exam taking component
```

### 2. Taking the Exam
```
PracticeExamTake loads questions from localStorage
↓
Display questions one by one
↓
Student selects choices
↓
Frontend tracks choiceId (which is the choice index for AI questions)
↓
"تکمیل و ارسال" clicked
↓
Prepare answers with metadata for AI questions
↓
Submit to backend
```

### 3. Backend Processing
```
Backend receives answers
↓
Separates AI questions (negative ID) from DB questions (positive ID)
↓
For AI questions: compares choiceId with correctChoiceIndex
↓
For DB questions: looks up in database and validates
↓
Calculates total score and correctCount
↓
Stores results in PracticeExamResults table
↓
Returns result summary
```

## Question ID Scheme

### AI-Generated Questions
```
Question ID:    -(index + 1)    e.g., -1, -2, -3, -4, -5
Choice ID:      -(qIndex + 1) * 100 - (cIndex + 1)
  Example:      Question -2, Choice 3 → -203
```

### Database Questions
```
Question ID:    positive        e.g., 1, 2, 3, 4, 5
Choice ID:      positive        database choice ID
```

## Skill Tags and Question Quality

### What are Skill Tags?
Skill tags are 2-4 Persian words identifying the specific skill tested:
- "حلقه های تکرار" (Loops)
- "مدیریت حافظه" (Memory Management)
- "بازگشت به عقب" (Recursion)

### Quality Validation
All AI-generated questions pass validation for:
- Question text length (10-500 characters)
- Skill tag format (2-4 words)
- Exactly 4 choices with 1 correct answer
- Choice text validity

## Error Handling

### User-Facing Errors

**No Questions Generated**
```
خطا در تولید سوالات: هیچ سوال معتبری تولید نشد
```

**API Connection Failed**
```
خطا در تولید سوالات: اتصال به سرویس هوش مصنوعی برقرار نشد
```

**Submission Failed**
```
خطا در ثبت نتایج رخ داد
```

### Developer Debugging

Check browser console for:
- Network request failures
- JSON parse errors in localStorage
- Answer submission errors
- API response validation

## Performance Considerations

### Generation Speed
- Question generation: ~2-5 seconds per request
- Validation: <100ms
- Expected UX delay: 3-6 seconds

### Recommendation
- Show loading spinner while generating
- Disable buttons during submission
- Provide clear user feedback

## Testing Checklist

- [ ] Generate exam without skill tag (general questions)
- [ ] Generate exam with skill tag (filtered questions)
- [ ] Verify question display with skill tags
- [ ] Take exam and submit answers
- [ ] Check results and scores
- [ ] Verify skill tag in results
- [ ] Test progress comparison
- [ ] Check localStorage data format

## Example Workflow

```typescript
// 1. Generate exam
const questions = await practiceExamsService.generatePracticeExam(
  courseId,     // 1
  "حلقه های تکرار", // skill tag
  10             // question count
);

// Response with AI-generated questions:
[
  {
    id: -1,
    questionText: "متن سوال درباره حلقه های تکرار",
    skillTag: "حلقه های تکرار",
    choices: [
      { id: -101, text: "گزینه اول" },
      { id: -102, text: "گزینه دوم" },
      { id: -103, text: "گزینه سوم" },
      { id: -104, text: "گزینه چهارم" }
    ],
    score: 1,
    isGenerated: true
  },
  // ... more questions
]

// 2. Submit answers
const result = await practiceExamsService.submitPracticeExam(
  courseId,
  [
    {
      questionId: -1,
      choiceId: 0, // student chose first choice
      questionText: "متن سوال درباره حلقه های تکرار",
      correctChoiceIndex: 0 // if first choice was correct
    }
  ],
  "حلقه های تکرار"
);

// Response:
{
  id: 123,
  courseId: 1,
  courseTitle: "برنامه نویسی پیشرفته",
  score: 9,
  maxScore: 10,
  isPassed: true,
  totalQuestions: 10,
  correctCount: 9,
  wrongCount: 1,
  percentage: 90
}
```

## Browser Compatibility

- Modern browsers with ES6 support
- localStorage API required
- Supports RTL layout for Persian text

## Accessibility

- Semantic HTML for form controls
- Proper ARIA labels for radio buttons
- Keyboard navigation supported
- Screen reader compatible

## Future Enhancements

1. **Visual Indicators**
   - Show AI-generated badge on questions
   - Display skill tag color-coded by category

2. **Performance**
   - Implement question caching
   - Pre-generate common skill questions

3. **User Experience**
   - Save draft answers locally
   - Time-limit options
   - Difficulty selection

4. **Analytics**
   - Track time per question
   - Question difficulty analysis
   - Personalized recommendations

## Troubleshooting

### Questions not appearing
- Check localStorage for "practiceExamData"
- Verify API response format
- Check browser console for errors

### Submit fails
- Verify all answers have choiceId
- Check API endpoint connectivity
- Review error message in console

### Scoring issues
- For AI questions: verify correctChoiceIndex
- For DB questions: verify database integrity
- Check answer validation logic

## References

- Backend implementation: `backend/PRACTICE_EXAMS_AI_IMPLEMENTATION.md`
- API test file: `backend/test-practice-exams.http`
- Main service file: `FrontEnd/src/services/practice-exams.service.ts`
