const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// شبیه‌سازی دقیق الگوریتم recommendation برای studentId=13
async function debug() {
  const studentId = 13; // دانشجو سیستم

  // Step 1: getCandidateCourses
  const enrollments = await prisma.enrollments.findMany({
    where: { Student_Id: studentId },
    select: { Course_Id: true }
  });
  const enrolledIds = enrollments.map(e => e.Course_Id);
  console.log('Enrolled course IDs:', enrolledIds);

  const candidates = await prisma.courses.findMany({
    where: {
      IsPublished: true,
      Id: enrolledIds.length > 0 ? { notIn: enrolledIds } : undefined
    },
    select: { Id: true, Title: true }
  });
  console.log('Candidates:', candidates.map(c => `${c.Id}:${c.Title}`));

  // Step 2: مستقیم insert کن (بدون امتیازدهی) تا ببینیم insert کار میکنه
  if (candidates.length > 0) {
    const testCourse = candidates[0];
    console.log('\nTrying to insert recommendation for course:', testCourse.Title);
    
    // حذف قبلی
    const deleted = await prisma.courseRecommendations.deleteMany({
      where: { Student_Id: studentId, Course_Id: testCourse.Id }
    });
    console.log('Deleted existing:', deleted.count);

    // insert جدید
    try {
      const created = await prisma.courseRecommendations.create({
        data: {
          Student_Id: studentId,
          Course_Id: testCourse.Id,
          Score: 42.5,
          Reason: 'تست مستقیم',
          MatchedSkillTags: '[]',
          Status: 'Active',
        }
      });
      console.log('Created recommendation Id:', created.Id);
      
      // پاک‌سازی
      await prisma.courseRecommendations.delete({ where: { Id: created.Id } });
      console.log('Cleaned up test record.');
    } catch (e) {
      console.error('INSERT FAILED:', e.message);
    }
  }

  // Step 3: چک همه دانشجویان
  console.log('\n=== Checking all students ===');
  const allStudents = await prisma.users.findMany({
    where: { Role_Id: 1 },
    select: { Id: true, Email: true }
  });
  for (const s of allStudents) {
    const enr = await prisma.enrollments.findMany({
      where: { Student_Id: s.Id },
      select: { Course_Id: true }
    });
    const eIds = enr.map(e => e.Course_Id);
    const cands = await prisma.courses.count({
      where: {
        IsPublished: true,
        Id: eIds.length > 0 ? { notIn: eIds } : undefined
      }
    });
    const recs = await prisma.courseRecommendations.count({
      where: { Student_Id: s.Id, Status: 'Active' }
    });
    console.log(`Student ${s.Id} (${s.Email}): enrolled=${eIds.length}, candidates=${cands}, activeRecs=${recs}`);
  }

  await prisma.$disconnect();
}

debug().catch(e => {
  console.error(e);
  process.exit(1);
});
