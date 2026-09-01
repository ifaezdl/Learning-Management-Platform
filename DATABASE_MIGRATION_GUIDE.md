# 🗄️ راهنمای Migration دیتابیس برای Practice Exams

## مشکل
جدول `PracticeExamResults` در دیتابیس وجود ندارد و باید ایجاد شود.

## راه حل

### گزینه 1: اجرای Prisma Migrate (توصیه شده)
```bash
cd backend
npx prisma migrate deploy
```

### گزینه 2: اجرای دستی SQL Query
اگر Prisma migrate کار نکرد، SQL query را دستی در SQL Server Management Studio اجرا کنید:

**مسیر فایل:**
```
backend/prisma/migrations/add_practice_exam_results.sql
```

**یا کپی این query و اجرا کنید:**

```sql
-- CreateTable PracticeExamResults
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
    [CompletedAt] DATETIME NOT NULL CONSTRAINT [DF_PracticeExamResults_CompletedAt] DEFAULT GETDATE(),
    CONSTRAINT [PK_PracticeExamResults] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_PracticeExamResults_Users] FOREIGN KEY ([Student_Id]) REFERENCES [dbo].[Users]([Id]) ON UPDATE NO ACTION,
    CONSTRAINT [FK_PracticeExamResults_Courses] FOREIGN KEY ([Course_Id]) REFERENCES [dbo].[Courses]([Id]) ON UPDATE NO ACTION
);

-- CreateIndex
CREATE INDEX [IX_PracticeExamResults_Student] ON [dbo].[PracticeExamResults]([Student_Id]);

-- CreateIndex
CREATE INDEX [IX_PracticeExamResults_Course] ON [dbo].[PracticeExamResults]([Course_Id]);
```

## مراحل اجرا در SQL Server Management Studio

1. **اتصال به دیتابیس**
   - Open SQL Server Management Studio
   - تماس با سرور: `92.246.145.99:50500`
   - انتخاب دیتابیس

2. **اجرای Query**
   - کپی کردن SQL query بالا
   - Paste در Query Editor
   - کلیک `Execute` (یا F5)

3. **تأیید**
   - اگر موفق باشد: `Commands completed successfully`
   - میتوانید `Object Explorer` → `Tables` را ببینید و `PracticeExamResults` وجود دارد

## بررسی اگر جدول ایجاد شد

```sql
SELECT * FROM [dbo].[PracticeExamResults]
```

اگر جدول خالی است ✅ موفق!

## اگر خطا دریافت کردید

### خطا: "Foreign Key constraint"
**راه حل:** اطمینان حاصل کنید که:
- جدول `Users` وجود دارد
- جدول `Courses` وجود دارد
- ستون `Id` در هر دو جدول موجود است

### خطا: "Table already exists"
**راه حل:** جدول قبلاً ایجاد شده است. میتوانید:
```sql
DROP TABLE [dbo].[PracticeExamResults];
```
و دوباره SQL را اجرا کنید.

## بعد از Migration

1. **Restart Backend Server**
```bash
npm run start:dev
```

2. **Test API**
```bash
GET /practice-exams/weak-skills
```

3. **میل نباید Error 500 دریافت کنید ✅

---

**تاریخ:** سپتامبر 2026
**Status:** فایل راهنما
