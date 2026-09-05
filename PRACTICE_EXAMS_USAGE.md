# Practice Exams - Usage Guide

## 🎯 User Journey

### Step 1: Navigate to Practice Exams
- User goes to sidebar and clicks **"آزمون های تمرینی"**
- Route: `/student/practice-exams`
- Page loads with sidebar + 3 tabs

### Step 2: View Weak Skills (Default Tab)
```
Left Panel (Courses):
├─ Course 1 (5 weak skills)
├─ Course 2 (0 weak skills)
├─ Course 3 (3 weak skills)
└─ [Pagination: 1 2 3 Next]

Right Panel (Skills):
├─ Skill A - 55% (3/5 correct) [شروع تمرین]
├─ Skill B - 62% (5/8 correct) [شروع تمرین]
└─ Skill C - 48% (2/4 correct) [شروع تمرین]
```

**Actions**:
- Click course → Select and view its skills
- Pagination buttons → Navigate through courses (5/page)
- Progress bar color indicates performance

### Step 3: Start Practice Exam
```
User clicks [شروع تمرین] for a skill
    ↓
Backend generates 10 random questions from that skill
    ↓
Navigate to: /student/practice-exams/take/1
    ↓
User answers 10 questions
    ↓
Submit answers
    ↓
Result saved to database
    ↓
Redirect to results or show score
```

### Step 4: View Practice Results (Tab 2)
```
Table of all completed practice exams:
┌─────────────────────────────────────────────────────────┐
│ Course | Skill | Questions | Score | %  | Date | View │
├─────────────────────────────────────────────────────────┤
│ Math   | Calc  │     10    │ 8/10  │ 80%│ 1400 │ 👁️  │
│ Math   | Alg   │     10    │ 7/10  │ 70%│ 1399 │ 👁️  │
│ Phys   | Mech  │     10    │ 6/10  │ 60%│ 1398 │ 👁️  │
└─────────────────────────────────────────────────────────┘
```

**Progress Bar Colors**:
- 🟢 Green: ≥70% (Pass)
- 🟡 Amber: 50-70% (Warning)
- 🔴 Red: <50% (Needs Work)

**Actions**:
- Click "View" (👁️) → Select that result
- Automatically switches to Tab 3 (Answer Sheet)

### Step 5: View Answer Sheet (Tab 3)
```
Header Statistics:
┌──────────────────────────────────┐
│ نمره: 8/10  │ درصد: 80%         │
│ درست: 8     │ Status: ✅ موفق   │
└──────────────────────────────────┘

Questions & Answers (Accordion):
┌─ Q1: معادله 2x + 5 = 15 را حل کنید [✓ درست]
│   ☑️ x = 3 (شما انتخاب کردید)
│   ☑️ x = 5 (صحیح)
│   ☐ x = 10
│
└─ Q2: مشتق x² چیست؟ [✗ غلط]
    ☐ 2x
    ☑️ 2x (صحیح)
    ☑️ x (شما انتخاب کردید)
    ☐ x²

[چاپ پاسخنامه] button
```

## 🛠️ Component Features

### Weak Skills Tab
| Feature | Description |
|---------|-------------|
| **Course List** | 5 courses per page, paginated |
| **Selection** | Click course to view its skills |
| **Skill Cards** | Display name, percentage, correct count |
| **Progress Bars** | Visual indication of weak areas |
| **Action Button** | Generate and start practice exam |

### Results Tab
| Feature | Description |
|---------|-------------|
| **Table View** | All exam attempts listed |
| **Sortable** | By date, score, skill (future) |
| **Color-Coded** | Results show pass/warn/fail |
| **Quick View** | Click view to see answer sheet |

### Answer Sheet Tab
| Feature | Description |
|---------|-------------|
| **Summary** | Score, percentage, pass/fail status |
| **Questions** | Expandable accordion format |
| **Highlighting** | Green (correct), Red (wrong) |
| **Print Button** | Export answer sheet to PDF |

## 📱 Responsive Behavior

### Desktop (lg breakpoint)
- Sidebar: 3 columns
- Main content: 9 columns
- Courses panel: 3 columns
- Skills panel: 9 columns
- All features visible

### Tablet (md breakpoint)
- Stack layouts
- Full width tables
- Pagination still visible
- Skills in 2 columns

### Mobile (sm breakpoint)
- Sidebar may collapse
- Single column layout
- Table becomes stacked
- Touch-friendly buttons

## 🎨 Styling Details

### Colors
```css
Primary: #667eea (Purple)
Secondary: #764ba2 (Dark Purple)
Success: #10b981 (Green)
Warning: #f59e0b (Amber)
Danger: #ef4444 (Red)
```

### Shadows
```css
Light: 0 2px 8px rgba(0,0,0,0.08)
Header: 0 10px 30px rgba(102, 126, 234, 0.15)
Button Hover: 0 4px 8px rgba(102, 126, 234, 0.3)
```

### Spacing
```css
Header Padding: 2rem
Card Padding: 1rem
Gap between items: 0.5rem - 1rem
```

## 🔗 Integration Points

### With Other Components
```
StudentSidebar
├─ Displays "آزمون های تمرینی" link
├─ Navigates to /student/practice-exams

ProfileCard
├─ Shows current user info
└─ Displayed below sidebar

PracticeExamsService
├─ getWeakSkillsByCoursesForStudent()
├─ generatePracticeExam()
├─ getPracticeExamResults()
└─ getPracticeExamResultDetails()
```

### Navigation Flow
```
Student Sidebar
    ↓
/student/practice-exams
    ↓
PracticeExams Component
    ├─ Tab 1: Weak Skills → Click "شروع تمرین"
    │   ↓
    │   Generates exam
    │   ↓
    │   /student/practice-exams/take/1
    │
    ├─ Tab 2: Results → Click "View"
    │   ↓
    │   Selects result
    │   ↓
    │   Auto-switches to Tab 3
    │
    └─ Tab 3: Answer Sheet
        └─ Display Q&A
        └─ Print option
```

## 🚀 Common Tasks

### Find Weak Skill for a Course
1. Click course name in left panel
2. View skills in right panel
3. Identify skills with low percentage
4. Click "شروع تمرین" to practice

### Compare Multiple Attempts
1. Go to "نتایج تمرین" tab
2. Scroll through table
3. Click "View" on each to see details
4. Compare percentages and scores

### Print Answer Sheet
1. View answer sheet for an exam
2. Click "چاپ پاسخنامه" button
3. Browser print dialog opens
4. Select printer and print

### Track Progress
1. Check weak skills frequently
2. Practice weak areas
3. View results to see improvement
4. Answer sheet shows what you got wrong

## 📊 Data Model

### PracticeExamResultItem
```typescript
{
  id: number;
  courseId: number;
  courseTitle: string;
  skillTag: string | null;
  score: number;           // e.g., 8
  maxScore: number;        // e.g., 10
  percentage: number;      // e.g., 80
  completedAt: string;     // ISO date
  totalQuestions: number;  // e.g., 10
  correctCount: number;    // e.g., 8
  wrongCount: number;      // e.g., 2
  isPassed: boolean;       // true if >= 70%
}
```

### WeakSkillByCourse
```typescript
{
  courseId: number;
  courseTitle: string;
  hasAttemptedMainQuiz: boolean;
  weakSkills: [
    {
      tag: string;
      percentage: number;
      correct: number;
      total: number;
    }
  ];
}
```

## ⚠️ Error Handling

### Loading State
- Shows spinner while fetching data
- Displays error message if API fails
- User can refresh page

### No Data States
- Weak Skills Tab: "خوب‌خبری! شما هیچ مهارت ضعیفی ندارید"
- Results Tab: "هنوز هیچ آزمون تمرینی تکمیل نشده‌ای ندارید"

### Answer Sheet Disabled
- Tab 3 is disabled until a result is selected
- Disabled button shows reduced opacity
- Clicking selected result enables it

## 🔄 State Updates

### On Page Load
```
1. Load weak skills → setWeakSkillsData()
2. Load results → setPracticeResults()
3. Select first course → setSelectedCourse()
4. Set first tab active → setActiveTab("weak-skills")
```

### On Generate Exam
```
1. Set generating = true
2. Call API: generatePracticeExam()
3. Save to localStorage
4. Navigate to /take page
5. User takes exam
6. After submit: result saved
7. Results list updated
```

### On View Answer Sheet
```
1. Click result row
2. setSelectedResult(result)
3. setActiveTab("answer-sheet")
4. Fetch detailed answers (if not in result)
5. Display AnswerSheet component
```

## 💡 Tips for Best Experience

1. **Practice Regularly**: Use weak skills tab often to target problem areas
2. **Track Progress**: Compare scores over time in results tab
3. **Review Mistakes**: Check answer sheet to see what you got wrong
4. **Print for Study**: Print answer sheets to study offline
5. **Focus on Weak Areas**: Higher frequency on skills with lower percentages

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| No courses showing | Wait for API response, refresh page |
| Answer sheet blank | Click result from Tab 2 first |
| Pagination not working | Ensure you have >5 courses |
| Print not working | Use Ctrl+P or browser print menu |
| Tabs not switching | Check browser console for errors |

---

**Last Updated**: September 2026  
**Version**: 1.0 (Redesigned)
