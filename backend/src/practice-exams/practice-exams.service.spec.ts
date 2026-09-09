import { PracticeExamsService } from './practice-exams.service';

describe('PracticeExamsService generated-question grading', () => {
  const createService = () => {
    const prisma = {
      enrollments: {
        findFirst: jest.fn().mockResolvedValue({ Id: 1 }),
      },
      practiceExamResults: {
        create: jest.fn().mockImplementation(({ data }) => ({
          Id: 42,
          Score: data.Score,
          MaxScore: data.MaxScore,
          CorrectCount: data.CorrectCount,
          TotalQuestions: data.TotalQuestions,
        })),
      },
      courses: {
        findUnique: jest.fn().mockResolvedValue({ Title: 'دوره تست' }),
      },
    };

    return {
      prisma,
      service: new PracticeExamsService(prisma as any, {} as any),
    };
  };

  it('grades a generated answer by its stable negative choice id', async () => {
    const { prisma, service } = createService();

    const result = await service.submitPracticeExam(
      7,
      3,
      [
        {
          questionId: -1,
          choiceId: -102,
          questionText: 'کدام گزینه صحیح است؟',
          correctChoiceIndex: 1,
          choices: [
            { id: -101, text: 'گزینه غلط', choiceIndex: 0 },
            { id: -102, text: 'گزینه صحیح', choiceIndex: 1 },
            { id: -103, text: 'گزینه غلط دوم', choiceIndex: 2 },
            { id: -104, text: 'گزینه غلط سوم', choiceIndex: 3 },
          ],
        },
      ],
      'مهارت تست',
    );

    expect(result.correctCount).toBe(1);
    expect(result.score).toBe(1);

    const stored = prisma.practiceExamResults.create.mock.calls[0][0].data;
    const details = JSON.parse(stored.AnswerDetails);
    expect(details[0].studentChoiceId).toBe(-102);
    expect(details[0].isCorrect).toBe(true);
    expect(details[0].choices.find((choice: any) => choice.isCorrect).id).toBe(
      -102,
    );
  });

  it('does not mark a different generated choice as correct', async () => {
    const { service } = createService();

    const result = await service.submitPracticeExam(7, 3, [
      {
        questionId: -1,
        choiceId: -101,
        correctChoiceIndex: 1,
        choices: [
          { id: -101, text: 'گزینه انتخابی', choiceIndex: 0 },
          { id: -102, text: 'گزینه صحیح', choiceIndex: 1 },
        ],
      },
    ]);

    expect(result.correctCount).toBe(0);
    expect(result.score).toBe(0);
  });

  it('rejects incomplete grading metadata instead of recording all answers as wrong', async () => {
    const { prisma, service } = createService();

    await expect(
      service.submitPracticeExam(7, 3, [
        {
          questionId: -1,
          choiceId: -101,
          questionText: 'سوال با داده ناقص',
        },
      ]),
    ).rejects.toThrow('اطلاعات آزمون ناقص یا منقضی شده است');

    expect(prisma.practiceExamResults.create).not.toHaveBeenCalled();
  });

  it('falls back to published database questions when the AI service is unavailable', async () => {
    const prisma = {
      enrollments: { findFirst: jest.fn().mockResolvedValue({ Id: 1 }) },
      courses: {
        findUnique: jest.fn().mockResolvedValue({
          Id: 3,
          Title: 'دوره تست',
          Category: null,
          Level: null,
          CourseLearningOutcomes: [],
          CoursePrequisties: [],
          CourseSections: [],
        }),
      },
      quizQuestions: {
        findMany: jest.fn().mockResolvedValue([
          {
            Id: 11,
            QuestionText: 'یک سوال معتبر از بانک سوال',
            SkillTag: 'برنامه‌نویسی شی‌گرا',
            Score: 1,
            QuizChoices: [
              {
                Id: 101,
                ChoiceText: 'پاسخ درست',
                IsCorrect: true,
                DisplayOrder: 1,
              },
              {
                Id: 102,
                ChoiceText: 'پاسخ غلط',
                IsCorrect: false,
                DisplayOrder: 2,
              },
            ],
          },
        ]),
      },
    };
    const aiService = {
      generateQuestionsForSkill: jest
        .fn()
        .mockRejectedValue(new Error('سرویس هوش مصنوعی در دسترس نیست')),
    };
    const service = new PracticeExamsService(prisma as any, aiService as any);

    const questions = await service.generatePracticeExam(
      7,
      3,
      'برنامه‌نویسی شی‌گرا',
      10,
    );

    expect(questions).toEqual([
      expect.objectContaining({
        id: 11,
        isGenerated: false,
        choices: [
          { id: 101, text: 'پاسخ درست' },
          { id: 102, text: 'پاسخ غلط' },
        ],
      }),
    ]);
  });
});
