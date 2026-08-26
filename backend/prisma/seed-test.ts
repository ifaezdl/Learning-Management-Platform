/**
 * seed-recommendation-test-data.ts
 * ---------------------------------------------------------------------------
 * دیتای تست برای بررسی دستی دو فیچر:
 *   1) سیستم پیشنهاددهنده دوره (Recommendations)
 *   2) تحلیل روند یادگیری (Trend Analysis)
 *
 * سناریو برای یک دانشجوی تستی می‌سازد:
 *   - یک دوره‌ی «گذرانده‌شده» (Course A) با ۵ آزمون هفتگی، هرکدام با ۴ سوال
 *     تگ‌دار (SkillTag)، به‌گونه‌ای که:
 *       - نمره کلی هر هفته صعودی باشد (۲۵٪ → ۵۰٪ → ۷۵٪ → ۷۵٪ → ۱۰۰٪)
 *         => برای تست «روند یادگیری: صعودی»
 *       - مهارت «حلقه‌های تکرار» در بیشتر آزمون‌ها غلط باشد (۲۰٪ درست)
 *         => برای تست «مهارت ضعیف» در پروفایل تحلیلی
 *   - سه دوره‌ی «کاندید پیشنهاد» که ثبت‌نام نشده‌اند:
 *       Course B: هم‌دسته + سطح یک‌پله بالاتر + دقیقاً روی مهارت ضعیف تمرکز دارد
 *                 (باید بالاترین امتیاز پیشنهاد را بگیرد)
 *       Course C: هم‌دسته اما مهارت‌های نامرتبط (امتیاز متوسط)
 *       Course D: دسته‌بندی متفاوت + امتیاز بالا (تست وزن پایین‌تر افینیتی دسته)
 *
 * نحوه اجرا:
 *   1) این فایل را داخل پوشه backend پروژه کپی کن (مثلاً backend/prisma/seed-test.ts)
 *   2) مطمئن شو bcrypt و ts-node نصب هستند (احتمالاً از قبل هستند):
 *        npm install --save-dev ts-node
 *   3) قبل از اجرا یک بار جدول Roles را چک کن که Id=1 دقیقاً «دانشجو/Student»
 *      و Id=2 «مدرس/Instructor» باشد (طبق مستندات پروژه این پیش‌فرض درسته،
 *      ولی اگه فرق داشت مقادیر STUDENT_ROLE_ID / INSTRUCTOR_ROLE_ID پایین رو عوض کن):
 *        SELECT * FROM Roles;
 *   4) اجرا:
 *        npx ts-node -r dotenv/config prisma/seed-test.ts
 *      (اگه dotenv نصب نیست: npm install --save-dev dotenv)
 *
 * این اسکریپت idempotent نیست — هر بار اجرا کنی دیتای جدید (با یوزرنیم/ایمیل
 * جدید بر اساس RUN_TAG) می‌سازه تا با اجرای قبلی تداخل نکنه.
 * ---------------------------------------------------------------------------
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// اگه Roleهای پروژه‌ات با این آیدی‌ها فرق داره، همینجا عوضشون کن
const STUDENT_ROLE_ID = 1;
const INSTRUCTOR_ROLE_ID = 2;

// هر بار اجرا یه تگ زمانی می‌گیره تا یوزرنیم/ایمیل/اسلاگ تکراری نشه
const RUN_TAG = Date.now().toString().slice(-6);

const STUDENT_PASSWORD = 'Test@12345'; // برای لاگین دستی از فرانت استفاده کن

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function findOrCreateCategory(title: string) {
  const existing = await prisma.category.findFirst({ where: { Title: title } });
  if (existing) return existing;
  return prisma.category.create({
    data: { Title: title, Description: `دسته‌بندی تستی: ${title}` },
  });
}

async function findOrCreateLevel(levelName: string) {
  const existing = await prisma.level.findFirst({
    where: { LevelName: levelName },
  });
  if (existing) return existing;
  return prisma.level.create({ data: { LevelName: levelName } });
}

/** ساخت یک دوره کامل با یک بخش و یک درس (حداقلی، فقط برای معتبر بودن دوره) */
async function createCourse(opts: {
  title: string;
  slug: string;
  teacherId: number;
  categoryId: number;
  levelId: number;
  avgRating: number;
  shortDesc: string;
}) {
  const course = await prisma.courses.create({
    data: {
      Title: opts.title,
      Description: opts.shortDesc,
      ShortDescription: opts.shortDesc,
      Slug: opts.slug,
      Price: 0,
      IsPublished: true,
      Teacher_Id: opts.teacherId,
      CategoryId: opts.categoryId,
      Level_Id: opts.levelId,
      AverageRating: opts.avgRating,
      DurationMinutes: 120,
    },
  });

  const section = await prisma.courseSections.create({
    data: { Course_Id: course.Id, Title: 'بخش اول', DisplayOrder: 1 },
  });

  await prisma.lessons.create({
    data: {
      Course_Id: course.Id,
      Section_Id: section.Id,
      Title: 'درس مقدماتی',
      SortOrder: 1,
      IsPublished: true,
      IsFreePreview: true,
      DurationMinutes: 15,
    },
  });

  return course;
}

/** ساخت یک آزمون با ۴ سوال تگ‌دار (هر سوال ۴ گزینه، یکی درست) */
async function createQuizWithQuestions(
  courseId: number,
  title: string,
  questions: {
    text: string;
    skillTag: string;
    correctChoiceIndex: number;
    choices: string[];
  }[],
) {
  const quiz = await prisma.quizzes.create({
    data: {
      Course_Id: courseId,
      Title: title,
      IsPublished: true,
      QuestionsToShow: questions.length,
      ShowAllQuestions: true,
      PassScore: 2, // از ۴
      DurationMinutes: 20,
    },
  });

  const createdQuestions: {
    id: number;
    correctChoiceId: number;
    choiceIds: number[];
  }[] = [];

  for (const q of questions) {
    const question = await prisma.quizQuestions.create({
      data: {
        Quiz_Id: quiz.Id,
        QuestionText: q.text,
        SkillTag: q.skillTag,
        Score: 1,
        Source: false,
      },
    });

    const choiceIds: number[] = [];
    let correctChoiceId = 0;
    for (let i = 0; i < q.choices.length; i++) {
      const choice = await prisma.quizChoices.create({
        data: {
          Question_Id: question.Id,
          ChoiceText: q.choices[i],
          IsCorrect: i === q.correctChoiceIndex,
          DisplayOrder: i + 1,
        },
      });
      choiceIds.push(choice.Id);
      if (i === q.correctChoiceIndex) correctChoiceId = choice.Id;
    }

    createdQuestions.push({ id: question.Id, correctChoiceId, choiceIds });
  }

  return { quiz, createdQuestions };
}

/** ثبت یک attempt کامل با پاسخ‌های مشخص (آرایه‌ای از booleanها: آیا آن سوال درست پاسخ داده شد) */
async function submitAttempt(
  quizId: number,
  studentId: number,
  createdQuestions: {
    id: number;
    correctChoiceId: number;
    choiceIds: number[];
  }[],
  correctness: boolean[],
  submittedAt: Date,
) {
  const questionIds = createdQuestions.map((q) => q.id);
  const score = correctness.filter(Boolean).length;

  const attempt = await prisma.quizAttempts.create({
    data: {
      Quiz_Id: quizId,
      Student_Id: studentId,
      QuestionIds: JSON.stringify(questionIds),
      StartedAt: submittedAt,
      DeadlineAt: new Date(submittedAt.getTime() + 20 * 60 * 1000),
      SubmittedAt: submittedAt,
      Score: score,
      MaxScore: createdQuestions.length,
      IsPassed: score >= 2,
    },
  });

  for (let i = 0; i < createdQuestions.length; i++) {
    const q = createdQuestions[i];
    const isCorrect = correctness[i];
    // اگه درست جواب داده: گزینه درست رو انتخاب کن. اگه غلط: اولین گزینه غلط رو انتخاب کن
    const wrongChoiceId = q.choiceIds.find((id) => id !== q.correctChoiceId)!;
    await prisma.quizAttemptAnswers.create({
      data: {
        Attempt_Id: attempt.Id,
        Question_Id: q.id,
        Choice_Id: isCorrect ? q.correctChoiceId : wrongChoiceId,
        IsCorrect: isCorrect,
      },
    });
  }

  return attempt;
}

async function main() {
  console.log('در حال ساخت دیتای تست...\n');

  // ---------- کاربران ----------
  const passwordHash = await bcrypt.hash(STUDENT_PASSWORD, 10);

  const teacher = await prisma.users.create({
    data: {
      FirstName: 'مدرس',
      LastName: `تستی ${RUN_TAG}`,
      UserName: `test_teacher_${RUN_TAG}`,
      Email: `test.teacher.${RUN_TAG}@educore.test`,
      Mobile: `0912${RUN_TAG}1`,
      PasswordHash: passwordHash,
      Role_Id: INSTRUCTOR_ROLE_ID,
      IsActive: true,
    },
  });

  const student = await prisma.users.create({
    data: {
      FirstName: 'دانشجو',
      LastName: `تستی ${RUN_TAG}`,
      UserName: `test_student_${RUN_TAG}`,
      Email: `test.student.${RUN_TAG}@educore.test`,
      Mobile: `0912${RUN_TAG}2`,
      PasswordHash: passwordHash,
      Role_Id: STUDENT_ROLE_ID,
      IsActive: true,
    },
  });

  console.log(
    `دانشجوی تستی ساخته شد → UserName: ${student.UserName} | Password: ${STUDENT_PASSWORD}`,
  );

  // ---------- دسته‌بندی و سطح ----------
  const catProgramming = await findOrCreateCategory('برنامه‌نویسی');
  const catDesign = await findOrCreateCategory('طراحی وب');

  const levelBeginner = await findOrCreateLevel('مبتدی');
  const levelIntermediate = await findOrCreateLevel('متوسط');
  const levelAdvanced = await findOrCreateLevel('پیشرفته');

  // ---------- Course A: دوره‌ای که دانشجو گذرانده (برای ساخت پروفایل مهارتی + روند) ----------
  const courseA = await createCourse({
    title: `برنامه‌نویسی پایتون - مقدماتی (تست ${RUN_TAG})`,
    slug: `python-beginner-test-${RUN_TAG}`,
    teacherId: teacher.Id,
    categoryId: catProgramming.Id,
    levelId: levelBeginner.Id,
    avgRating: 4.3,
    shortDesc: 'دوره مقدماتی پایتون برای تست سیستم تحلیل و پیشنهاددهنده',
  });

  await prisma.enrollments.create({
    data: {
      Student_Id: student.Id,
      Course_Id: courseA.Id,
      Status: 1,
      EnrollmentDate: daysAgo(40),
    },
  });

  // تعریف ۴ سوال با تگ مهارتی ثابت، در ۵ آزمون هفتگی تکرار می‌شن
  const skillQuestionsTemplate = [
    {
      text: 'خروجی این حلقه for چیست؟',
      skillTag: 'حلقه‌های تکرار',
      correctChoiceIndex: 0,
      choices: ['گزینه درست', 'گزینه ۲', 'گزینه ۳', 'گزینه ۴'],
    },
    {
      text: 'کدام گزینه تعریف صحیح تابع است؟',
      skillTag: 'توابع',
      correctChoiceIndex: 1,
      choices: ['گزینه ۱', 'گزینه درست', 'گزینه ۳', 'گزینه ۴'],
    },
    {
      text: 'مدیریت حافظه در پایتون چگونه انجام می‌شود؟',
      skillTag: 'مدیریت حافظه',
      correctChoiceIndex: 2,
      choices: ['گزینه ۱', 'گزینه ۲', 'گزینه درست', 'گزینه ۴'],
    },
    {
      text: 'مفهوم شی‌گرایی به چه معناست؟',
      skillTag: 'شی‌گرایی',
      correctChoiceIndex: 3,
      choices: ['گزینه ۱', 'گزینه ۲', 'گزینه ۳', 'گزینه درست'],
    },
  ];

  // correctness هر هفته برای ۴ سوال به ترتیب: [loops, functions, memory, oop]
  // روند نمره کلی: 25% → 50% → 75% → 75% → 100% (صعودی واضح)
  // "حلقه‌های تکرار" فقط هفته آخر درسته → 20% کل → مهارت ضعیف پایدار
  const weeklyPlan: { daysAgoSubmit: number; correctness: boolean[] }[] = [
    { daysAgoSubmit: 28, correctness: [false, false, false, true] }, // 25%
    { daysAgoSubmit: 21, correctness: [false, false, true, true] }, // 50%
    { daysAgoSubmit: 14, correctness: [false, true, true, true] }, // 75%
    { daysAgoSubmit: 7, correctness: [false, true, true, true] }, // 75%
    { daysAgoSubmit: 1, correctness: [true, true, true, true] }, // 100%
  ];

  for (let week = 0; week < weeklyPlan.length; week++) {
    const { quiz, createdQuestions } = await createQuizWithQuestions(
      courseA.Id,
      `آزمون هفته ${week + 1}`,
      skillQuestionsTemplate,
    );
    await submitAttempt(
      quiz.Id,
      student.Id,
      createdQuestions,
      weeklyPlan[week].correctness,
      daysAgo(weeklyPlan[week].daysAgoSubmit),
    );
    console.log(
      `  آزمون هفته ${week + 1} ثبت شد — نمره: ${weeklyPlan[week].correctness.filter(Boolean).length}/4`,
    );
  }

  // ---------- Course B: کاندید ایده‌آل (هم‌دسته + سطح بالاتر + دقیقاً روی مهارت ضعیف) ----------
  const courseB = await createCourse({
    title: `برنامه‌نویسی پایتون - پیشرفته: تسلط بر حلقه‌ها (تست ${RUN_TAG})`,
    slug: `python-loops-advanced-test-${RUN_TAG}`,
    teacherId: teacher.Id,
    categoryId: catProgramming.Id,
    levelId: levelIntermediate.Id, // یک پله بالاتر از Course A
    avgRating: 4.7,
    shortDesc:
      'این دوره باید بالاترین امتیاز پیشنهاد رو بگیره چون دقیقا مهارت ضعیف دانشجو رو پوشش می‌ده',
  });
  // یک آزمون نمونه با تگ‌های همان مهارت ضعیف، فقط برای اینکه SkillTagهای دوره در سیستم قابل تشخیص باشه
  await createQuizWithQuestions(courseB.Id, 'آزمون ورودی', [
    {
      text: 'حلقه while چه تفاوتی با for دارد؟',
      skillTag: 'حلقه‌های تکرار',
      correctChoiceIndex: 0,
      choices: ['درست', '۲', '۳', '۴'],
    },
    {
      text: 'nested loop یعنی چه؟',
      skillTag: 'حلقه‌های تکرار',
      correctChoiceIndex: 0,
      choices: ['درست', '۲', '۳', '۴'],
    },
    {
      text: 'break و continue چه تفاوتی دارند؟',
      skillTag: 'حلقه‌های تکرار',
      correctChoiceIndex: 0,
      choices: ['درست', '۲', '۳', '۴'],
    },
    {
      text: 'list comprehension چیست؟',
      skillTag: 'توابع',
      correctChoiceIndex: 0,
      choices: ['درست', '۲', '۳', '۴'],
    },
  ]);

  // ---------- Course C: هم‌دسته، اما مهارت‌های نامرتبط ----------
  const courseC = await createCourse({
    title: `برنامه‌نویسی پایتون - پایگاه داده (تست ${RUN_TAG})`,
    slug: `python-database-test-${RUN_TAG}`,
    teacherId: teacher.Id,
    categoryId: catProgramming.Id,
    levelId: levelIntermediate.Id,
    avgRating: 4.0,
    shortDesc:
      'هم‌دسته با دوره اول ولی مهارتی که پوشش میده مرتبط با ضعف دانشجو نیست',
  });
  await createQuizWithQuestions(courseC.Id, 'آزمون ورودی', [
    {
      text: 'SQL Join چیست؟',
      skillTag: 'پایگاه داده',
      correctChoiceIndex: 0,
      choices: ['درست', '۲', '۳', '۴'],
    },
    {
      text: 'نرمال‌سازی یعنی چه؟',
      skillTag: 'پایگاه داده',
      correctChoiceIndex: 0,
      choices: ['درست', '۲', '۳', '۴'],
    },
    {
      text: 'ایندکس‌گذاری چیست؟',
      skillTag: 'پایگاه داده',
      correctChoiceIndex: 0,
      choices: ['درست', '۲', '۳', '۴'],
    },
    {
      text: 'ACID یعنی چه؟',
      skillTag: 'پایگاه داده',
      correctChoiceIndex: 0,
      choices: ['درست', '۲', '۳', '۴'],
    },
  ]);

  // ---------- Course D: دسته‌بندی متفاوت، امتیاز بالا ----------
  const courseD = await createCourse({
    title: `طراحی رابط کاربری - مقدماتی (تست ${RUN_TAG})`,
    slug: `ui-design-test-${RUN_TAG}`,
    teacherId: teacher.Id,
    categoryId: catDesign.Id,
    levelId: levelBeginner.Id,
    avgRating: 4.9,
    shortDesc:
      'دسته‌بندی کاملاً متفاوت، برای تست اینکه صرف امتیاز بالا کافی نیست',
  });
  await createQuizWithQuestions(courseD.Id, 'آزمون ورودی', [
    {
      text: 'اصول رنگ‌شناسی در UI چیست؟',
      skillTag: 'طراحی رابط کاربری',
      correctChoiceIndex: 0,
      choices: ['درست', '۲', '۳', '۴'],
    },
    {
      text: 'Wireframe چیست؟',
      skillTag: 'طراحی رابط کاربری',
      correctChoiceIndex: 0,
      choices: ['درست', '۲', '۳', '۴'],
    },
    {
      text: 'Figma برای چه استفاده می‌شود؟',
      skillTag: 'طراحی رابط کاربری',
      correctChoiceIndex: 0,
      choices: ['درست', '۲', '۳', '۴'],
    },
    {
      text: 'Responsive design یعنی چه؟',
      skillTag: 'طراحی رابط کاربری',
      correctChoiceIndex: 0,
      choices: ['درست', '۲', '۳', '۴'],
    },
  ]);

  console.log('\n✅ دیتای تست با موفقیت ساخته شد.\n');
  console.log('خلاصه:');
  console.log(
    `  دانشجو: ${student.UserName} / ${STUDENT_PASSWORD}  (Id: ${student.Id})`,
  );
  console.log(
    `  Course A (گذرانده‌شده، ۵ آزمون هفتگی): Id=${courseA.Id} — "${courseA.Title}"`,
  );
  console.log(
    `  Course B (کاندید ایده‌آل پیشنهاد):     Id=${courseB.Id} — "${courseB.Title}"`,
  );
  console.log(
    `  Course C (هم‌دسته، مهارت نامرتبط):     Id=${courseC.Id} — "${courseC.Title}"`,
  );
  console.log(
    `  Course D (دسته متفاوت، رتبه بالا):     Id=${courseD.Id} — "${courseD.Title}"`,
  );
  console.log('\nانتظار برای تست دستی:');
  console.log(
    '  - GET /analytics/students/me/skills (با توکن این دانشجو) → "حلقه‌های تکرار" باید پایین‌ترین درصد (۲۰٪) رو نشون بده',
  );
  console.log(
    '  - GET /analytics/students/me/progress-trend → روند صعودی (25→50→75→75→100)',
  );
  console.log(
    '  - GET /recommendations/students/me → Course B باید بالاترین امتیاز رو داشته باشه، بعد C، بعد D',
  );
}

main()
  .catch((e) => {
    console.error('خطا در ساخت دیتای تست:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
