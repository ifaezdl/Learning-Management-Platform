const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
  const candidateIds = [21, 22];

  for (const courseId of candidateIds) {
    const course = await prisma.courses.findUnique({
      where: { Id: courseId },
      include: {
        Category: { select: { Title: true } },
        Level: { select: { LevelName: true } },
        Quizzes: {
          include: {
            QuizQuestions: { select: { Id: true, SkillTag: true } }
          }
        }
      }
    });

    if (!course) continue;

    console.log(`\n=== Course: ${course.Title} (Id=${courseId}) ===`);
    console.log(`Category: ${course.Category?.Title}, Level: ${course.Level?.LevelName}`);
    console.log(`Total Quizzes: ${course.Quizzes.length}`);

    for (const quiz of course.Quizzes) {
      const skillTags = quiz.QuizQuestions.map(q => q.SkillTag).filter(Boolean);
      console.log(`  Quiz Id=${quiz.Id}, IsPublished=${quiz.IsPublished}, Questions=${quiz.QuizQuestions.length}`);
      console.log(`  SkillTags: [${skillTags.join(', ')}]`);
    }

    // بررسی امتیاز‌دهی دستی
    const allSkillTags = [
      ...new Set(
        course.Quizzes
          .filter(q => q.IsPublished)
          .flatMap(q => q.QuizQuestions.map(qq => qq.SkillTag).filter(Boolean))
      )
    ];
    console.log(`Published quiz skillTags: [${allSkillTags.join(', ')}]`);
  }

  // چک SkillGap Match دستی
  const studentWeakSkills = [
    'طبقه‌بندی الگوریتم‌ها',
    'رگرسیون و پیش‌بینی',
    'ارزیابی مدل',
    'پیش‌پردازش داده',
    'درخت تصمیم',
    'خوشه‌بندی',
    'بیش‌برازش',
    'SVM و هسته‌ها'
  ];
  console.log('\n=== Student weak skills ===');
  console.log(studentWeakSkills);

  await prisma.$disconnect();
}

debug().catch(e => {
  console.error(e);
  process.exit(1);
});
