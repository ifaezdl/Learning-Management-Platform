# Testing Guide: Practice Exam Results and Answer Sheet Display

## Prerequisites
- Backend running on `http://localhost:3001`
- Frontend running on `http://localhost:3000`
- Student user account logged in
- Course with practice exams available
- AI service (Qwen model) accessible at configured URL

## Test Case 1: Complete Practice Exam with AI-Generated Questions

### Steps:
1. Log in as student
2. Navigate to `/student/practice-exams`
3. Select a course from the list
4. Click the card to view available practice options
5. Click "ایجاد آزمون تمرینی" (Create Practice Exam)
6. If prompted for skill selection, select a skill or leave blank for general questions
7. Observe: 5-10 questions should load with Persian skill tags

### Expected Results:
- ✅ Questions display properly with skill tags
- ✅ Each question shows 4 multiple-choice options
- ✅ Questions are labeled as "سوال 1", "سوال 2", etc.

### If This Fails:
- **Error message about AI service**: Check backend AI service configuration
- **Timeout on question loading**: Verify AI service is running and accessible
- **No questions displayed**: Check browser console for API errors

---

## Test Case 2: Submit Exam and View Result Page

### Steps (continuing from Test Case 1):
1. Select an answer for each question by clicking on an option
2. You should see a progress indicator (e.g., "4/10 سوال پاسخ داده شده")
3. Click "ثبت نتیجه" (Submit Result) button
4. Observe the page behavior

### Expected Results:
- ✅ Page shows loading spinner briefly
- ✅ Automatically navigates to `/student/practice-exams/result/[ID]`
- ✅ Result page loads with score and statistics

### If Navigation Fails:
- **Stays on exam page with error**: Check browser console for API submission errors
- **404 on result page**: Verify the result ID in URL exists in database
- **Data doesn't display**: Check Network tab in DevTools to verify API response includes data

---

## Test Case 3: Result Page Display

### Steps (on result page):
1. Verify page header displays:
   - Score circle with percentage (e.g., "75%")
   - Status text ("عالی", "خوب", "متوسط", or "نیاز به تلاش بیشتر")
   - Color gradient appropriate to score (green for high, red for low)

2. Check statistics boxes display:
   - نمره (Score): e.g., "75 / 100"
   - صحیح (Correct): Count of correct answers
   - غلط (Wrong): Count of incorrect answers
   - وضعیت (Status): "✅ قبول" or "❌ رد"

3. Verify "نمایش پاسخنامه" button exists

### Expected Results:
- ✅ All statistics are accurate and match the exam submission
- ✅ Score percentage is calculated correctly
- ✅ Status is appropriate (قبول if ≥70%, رد if <70%)
- ✅ Skill tag displays if one was selected

### If Statistics Don't Display:
- **NaN or undefined values**: Check API response for null fields
- **Wrong counts**: Verify answer scoring logic in backend
- **Missing skill tag**: Confirm skill tag was passed during generation

---

## Test Case 4: Answer Sheet Toggle and Display

### Steps:
1. On result page, click "نمایش پاسخنامه" (Show Answer Sheet) button
2. Verify button text changes to "مخفی کردن پاسخنامه" (Hide Answer Sheet)
3. Scroll down to see the answer sheet

### Expected Results:
- ✅ Button text toggles correctly
- ✅ Answer sheet section appears/disappears smoothly
- ✅ "پاسخنامه تفصیلی" (Detailed Answer Sheet) heading displays

### If Answer Sheet Doesn't Show:
- **Section not visible**: Check CSS, may need to scroll
- **Empty or broken styling**: Check browser console for CSS errors
- **No questions in sheet**: **This is the main issue we fixed** - if it still happens:
  - Check Network tab → API response from `/practice-exams/results/[ID]`
  - Response should include `questions` array with items
  - If empty, backend method is still failing

---

## Test Case 5: Answer Sheet Content - Correct Answers

### Steps:
1. Find a question you answered correctly (look for "✅ صحیح" badge)
2. Verify the question displays:
   - Question number (سوال 1, سوال 2, etc.)
   - Full question text
   - Skill tag badge (e.g., "حلقه‌های تکرار")
   - Green check mark "✅ صحیح"

3. Click on the question to expand it
4. Verify expanded view shows:
   - "پاسخ شما:" (Your Answer) in green background
   - Only your answer choice text displayed (no "پاسخ صحیح" since you're correct)
   - "تمام گزینه‌ها:" (All Choices) section showing all 4 options

### Expected Results:
- ✅ Question displays with correct formatting
- ✅ Green badge shows "✅ صحیح"
- ✅ Expanded view shows your answer in green highlight
- ✅ All choices visible with checkmarks on correct one

### If Content Missing:
- **Questions don't expand**: Check browser console for JavaScript errors
- **Choice text blank or placeholder**: This indicates the fix didn't work - AI question data not being retrieved
- **Wrong choice marked as correct**: Answer scoring logic issue in backend

---

## Test Case 6: Answer Sheet Content - Wrong Answers

### Steps:
1. Find a question you answered incorrectly (look for "❌ غلط" badge)
2. Verify the question displays:
   - Question number
   - Full question text
   - Skill tag badge
   - Red X mark "❌ غلط"

3. Click on the question to expand it
4. Verify expanded view shows TWO sections:
   - "پاسخ شما:" (Your Answer) in RED background
   - "پاسخ صحیح:" (Correct Answer) in GREEN background
   - "تمام گزینه‌ها:" (All Choices) section

### Expected Results:
- ✅ Question displays with correct formatting
- ✅ Red badge shows "❌ غلط"
- ✅ Your incorrect answer shows in red
- ✅ Correct answer shows separately in green
- ✅ All choices visible with:
   - ✅ on the correct choice
   - ❌ on your incorrect choice
   - Other choices unmarked

### Critical Test Points (Most Likely to Fail):
- **"پاسخ صحیح" section doesn't appear**: This means the choice data wasn't retrieved
- **Wrong choice marked as correct**: Scoring or choice reconstruction failed
- **Choice text is generic (e.g., "گزینه 1 (صحیح)")**: This is EXPECTED for AI questions as choice text is reconstructed

---

## Test Case 7: Return to Practice Exams List

### Steps:
1. Click "بازگشت" (Back) button on result page
2. Verify navigation back to `/student/practice-exams`
3. Click on "نتایج آزمون‌های تمرینی" tab if available
4. Locate the exam you just completed
5. Verify it shows:
   - Date/time
   - Score
   - Percentage
   - Status (passed/failed)

### Expected Results:
- ✅ Navigation works smoothly
- ✅ Exam appears in history
- ✅ Can click the row to open result detail page again
- ✅ Result page still displays correctly on second visit

---

## Test Case 8: Multiple Question Types

### Steps (if mixed DB and AI questions available):
1. Take an exam that might have both DB and AI questions
2. Submit and view results
3. Expand multiple questions
4. Mix of questions should display correctly

### Expected Results:
- ✅ All questions visible regardless of source
- ✅ No distinction needed - both types work identically
- ✅ Choices display correctly for both types

---

## Debugging Checklist If Tests Fail

### 1. Empty Answer Sheet Questions Array
**Symptom:** "پاسخنامه تفصیلی" header shows but no questions appear

**Debug Steps:**
```bash
# Check browser DevTools Network tab:
# Find request to: GET /practice-exams/results/[ID]
# Response should have "questions": [...]

# If questions array is empty or missing:
# - The backend method getPracticeExamResultDetails is failing
# - Check backend logs for errors
# - Verify AnswerDetails JSON is being stored correctly
```

### 2. Choice Text Is Generic
**Symptom:** Choices show "گزینه 1", "گزینه 2", instead of real text

**Analysis:**
- This is EXPECTED for AI-generated questions since we only store `correctChoiceIndex`
- The actual choice text is not stored (ephemeral - only used during exam)
- For this to be improved, we'd need to store all 4 choice texts in AnswerDetails
- Current implementation is acceptable - shows student got question X wrong/right

### 3. Incorrect Answer Evaluation
**Symptom:** Answers marked correct that should be wrong or vice versa

**Debug Steps:**
```bash
# Check browser DevTools Network tab response:
# Verify isCorrect field matches expected result
# Check which choiceId was submitted vs correctChoiceIndex

# This indicates issue in submitPracticeExam scoring logic
```

### 4. Navigation Not Working
**Symptom:** After clicking "ثبت نتیجه", no navigation or error appears

**Debug Steps:**
```bash
# Browser console: Check for JavaScript errors
# Network tab: Verify POST /practice-exams/courses/[ID]/submit succeeds
# Response should include "id": [resultId]
# If missing, check backend logs
```

### 5. API Returns 404 on Result Page
**Symptom:** When accessing `/student/practice-exams/result/[ID]`

**Debug Steps:**
```bash
# Verify result was created: Check database for PracticeExamResults record
# Verify resultId in URL matches database ID
# Check Student_Id ownership - must match logged-in user
```

---

## Performance Notes

### Expected Response Times:
- Generate questions: 10-30 seconds (waiting for AI model)
- Submit exam: < 2 seconds
- Load result page: < 1 second (if questions stored properly)
- Expand answer sheet: instant

### If Response Times Are Slow:
- Result page load slow: Database query for large result may be slow
- Answer sheet slow to expand: May indicate too many questions or JavaScript issue

---

## Success Criteria

The practice exam result page feature is working correctly when:

1. ✅ User can generate practice exams with 5-10 AI-generated questions
2. ✅ After submission, automatically navigates to result detail page
3. ✅ Result page displays score, percentage, and statistics correctly
4. ✅ "نمایش پاسخنامه" button toggles answer sheet visibility
5. ✅ All completed questions appear in answer sheet
6. ✅ Questions expand to show detailed answer information
7. ✅ Correct answers show in green, incorrect in red
8. ✅ Skill tags display for each question
9. ✅ Student can navigate back to exam list and revisit results
10. ✅ Second visit to result page still displays all data correctly

When all criteria are met, the feature is fully operational!
