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
