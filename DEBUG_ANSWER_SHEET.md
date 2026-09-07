# راهنمای Debug پاسخنامه خالی

اگر پاسخنامه هنوز خالی است، این مراحل را دنبال کنید:

## مرحله 1: بررسی Network Response

1. صفحه نتایج را باز کن
2. F12 بزن → Network tab
3. "نمایش پاسخنامه" دکمه را کلیک کن
4. جستجو برای request به `/practice-exams/results/[ID]`
5. Response tab را بزن
6. جواب را بررسی کن:

**باید ببینی:**
```json
{
  "questions": [
    {
      "questionId": -1,
      "questionText": "...",
      "skillTag": "...",
      "isCorrect": true,
      "choices": [
        {"id": -101, "text": "...", "isCorrect": false},
        {"id": -102, "text": "...", "isCorrect": true},
        ...
      ]
    },
    // سوالات دیگر
  ]
}
```

**اگر `questions` خالی است:** ❌ مشکل backend است
**اگر `questions` پر است:** ✅ مشکل frontend است

---

## مرحله 2: اگر Questions خالی است (Backend Problem)

### 2.1 بررسی Database
```sql
SELECT 
  Id, 
  CorrectCount, 
  AnswerDetails,
  TotalQuestions
FROM PracticeExamResults
WHERE Id = [resultId]
ORDER BY CompletedAt DESC
LIMIT 1;
```

**ببین:**
- `AnswerDetails` خالی است یا نه؟
- اگر خالی: submitPracticeExam مشکل دارد ❌
- اگر پر است: getPracticeExamResultDetails مشکل دارد ❌

### 2.2 اگر AnswerDetails پر است
Backend logs را بررسی کن:
```
Error in getPracticeExamResultDetails
```

احتمالات:
- **سوالات DB پیدا نشوند:** خط 504 میرفت return null (حل شده است!)
- **JSON parse error:** AnswerDetails corrupt است
- **Database query error:** مشکل در Prisma query

---

## مرحله 3: اگر Questions پر است (Frontend Problem)

### 3.1 Console Errors
F12 بزن → Console tab
خطا دیده میشود؟

احتمالی خطاها:
- `Cannot read property 'map' of undefined` - choices تعریف نشده
- `answerDetails is null` - API response null است
- `React warning` - dependency issue

### 3.2 State Debugging
Browser Console:
```javascript
// درون PracticeExamResult component
const [result, setResult] = useState(null);
console.log('Result data:', result);
console.log('Questions:', result?.questions);
console.log('Questions length:', result?.questions?.length);
```

باید ببینی:
```
Result data: {...}
Questions: [{...}, {...}, ...]
Questions length: 5
```

---

## مرحله 4: اگر هنوز مشکل است

### 4.1 صفحه را refresh کن
F5 یا Ctrl+R
دوباره تست کن

### 4.2 Browser Cache
F12 → Storage → Clear Site Data
دوباره refresh کن

### 4.3 Backend Restart
اگر تغییرات انجام شده:
```bash
cd backend
npm run build
# Restart server
```

### 4.4 Frontend Restart
اگر تغییرات انجام شده:
```bash
cd FrontEnd
npm start
```

---

## مرحله 5: تست جزئی

### 5.1 یک سوال AI ایجاد کن
نه یک آزمون کامل - فقط یک سوال

### 5.2 جواب داروا بده
دقیق یک سوال

### 5.3 نتایج را ببین
آیا یک سوال نمایش داده شد؟

اگر بله: مشکل فقط چند سوال است
اگر نه: مشکل root-level است

---

## Detailed Logging

Backend logs اضافه کنید (موقتی):

```typescript
// getPracticeExamResultDetails میں
console.log('answerDetails:', answerDetails);
console.log('dbQuestionIds:', dbQuestionIds);
console.log('enrichedQuestions:', enrichedQuestions);
```

Frontend logs اضافه کنید (موقتی):

```typescript
// PracticeExamResult میں
useEffect(() => {
  console.log('Result:', result);
  console.log('Questions:', result?.questions);
}, [result]);
```

---

## Troubleshooting Checklist

- [ ] Network response میں questions پر است؟
- [ ] Database میں AnswerDetails پر است؟
- [ ] Browser console خالی از error است؟
- [ ] React DevTools نے state صحیح نشان داد؟
- [ ] صفحه refresh شده است؟
- [ ] Backend rebuild شده است؟
- [ ] Frontend restart شده است؟

---

## اگر هنوز مشکل است

به من رپورت کن:
1. Network response (پر یا خالی؟)
2. Database AnswerDetails (پر یا خالی؟)
3. Console errors (هیچی نیست یا خطا؟)
4. مرحله تست (کدام مرحله شکست خورد؟)

این اطلاعات root cause را شناسایی خواهد کرد!
