import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import practiceExamsService from "../../../services/practice-exams.service";
import { getApiErrorMessage } from "../../../services/api-error";
import "./practice-exams.scss";

interface Question {
  id: number;
  questionText: string;
  skillTag: string;
  choices: Array<{ id: number; text: string }>;
  score: number;
  correctChoiceIndex?: number; // Index of the correct choice for AI-generated questions
  isGenerated?: boolean;
}

interface Answer {
  questionId: number;
  choiceId: number | null;
  questionText?: string;
  correctChoiceIndex?: number;
  choices?: Array<{ id: number; text: string }>;
}

const PracticeExamTake = () => {
  const { practiceExamId } = useParams<{ practiceExamId: string }>();
  const navigate = useNavigate();

  // State management
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [skillTag, setSkillTag] = useState<string | null>(null);

  // Load practice exam on mount
  useEffect(() => {
    loadPracticeExam();
  }, [practiceExamId]);

  const loadPracticeExam = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get practice exam from location state or localStorage
      const storedData = localStorage.getItem("practiceExamData");
      if (!storedData || !practiceExamId) {
        setError("آزمون تمرینی یافت نشد");
        return;
      }

      const examData = JSON.parse(storedData);
      const practiceQuestions = examData.questions || [];

      // بررسی حداقل 1 سوال (برای آزمون‌های تولید شده با AI)
      if (practiceQuestions.length < 1) {
        setError(
          `برای ایجاد آزمون تمرینی، حداقل ۱ سوال نیاز است. فقط ${practiceQuestions.length} سوال دردسترس است.`,
        );
        return;
      }

      setQuestions(practiceQuestions);
      setCourseId(examData.courseId);
      setSkillTag(examData.skillTag);

      // Initialize answers - handling both DB and AI-generated questions
      const initialAnswers: Answer[] = practiceQuestions.map((q: Question) => ({
        questionId: q.id,
        choiceId: null,
        questionText: q.questionText,
        // برای سوالات توسط AI، استفاده از correctChoiceIndex از داده‌های سوال
        correctChoiceIndex: q.correctChoiceIndex,
        choices: q.choices,
      }));
      setAnswers(initialAnswers);
    } catch (err: any) {
      setError(err.message || "خطایی در بارگذاری آزمون رخ داد");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (choiceId: number) => {
    const updatedAnswers = [...answers];
    // Preserve the generated-question metadata used by the API for grading and
    // for rebuilding the answer sheet after submission.
    updatedAnswers[currentQuestionIndex] = {
      ...updatedAnswers[currentQuestionIndex],
      choiceId,
    };
    setAnswers(updatedAnswers);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (!courseId) {
        setError("اطلاعات دوره یافت نشد");
        return;
      }

      // فیلتر کردن جواب‌های مختار (بدون null) و فرماتینگ برای تحت API
      const validAnswers = answers
        .map((answerData, questionIndex) => ({ answerData, questionIndex }))
        .filter(({ answerData }) => answerData.choiceId !== null)
        .map(({ answerData, questionIndex }) => {
          const questionData = questions[questionIndex];

          return {
            questionId: answerData.questionId,
            choiceId: answerData.choiceId as number,
            questionText: questionData.questionText,
            // برای سوالات توسط AI، شامل اطلاعات اضافی
            ...(questionData?.isGenerated && {
              correctChoiceIndex: questionData.correctChoiceIndex,
              // ارسال تمام گزینه‌ها برای سوالات AI
              choices:
                questionData.choices?.map((choice, idx) => ({
                  id: choice.id,
                  text: choice.text,
                  choiceIndex: idx,
                })) || [],
            }),
          };
        });

      const response = await practiceExamsService.submitPracticeExam(
        courseId,
        validAnswers,
        skillTag || undefined,
      );

      // Navigate to results page
      navigate(`/student/practice-exams/result/${response.id}`);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "خطایی در ثبت نتایج رخ داد"));
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">درحال بارگذاری...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid mt-5">
        <div className="alert alert-danger">
          <i className="isax isax-close-circle me-2"></i>
          <strong>خطا:</strong> {error}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/student/practice-exams")}
        >
          <i className="isax isax-arrow-left me-2"></i>
          بازگشت
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container-fluid mt-5">
        <div className="alert alert-warning">
          <i className="isax isax-info-circle me-2"></i>
          هیچ سوالی برای این آزمون وجود ندارد
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];
  const answeredCount = answers.filter((a) => a.choiceId !== null).length;

  return (
    <div className="container-fluid pt-5 d-flex flex-column align-items-center">
      {/* Header */}
      <div className="practice-exams-header mb-4 mt-5 ms-5 me-5 col-8">
        <div className="row align-items-center flex-column">
          <div className="col">
            <h2 style={{ color: "white" }}>
              <i className="isax isax-book-square me-2"></i>
              آزمون تمرینی - {skillTag}
            </h2>
            <p className="mb-0 p-2" style={{ color: "#fff" }}>
              سوال {currentQuestionIndex + 1} از {questions.length}
            </p>
          </div>
          <div className="col">
            <div className="progress" style={{ height: "10px" }}>
              <div
                className="progress-bar"
                style={{
                  background: "#49b887",
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12">
        {/* Question */}
        <div className="row">
          <div className="col-lg-8 mx-auto mb-4">
            <div className="card">
              <div className="card-body">
                {/* Question Text */}
                <div className="mb-4">
                  <h5 className="card-title text-start">
                    <span className="badge bg-primary me-2">
                      سوال {currentQuestionIndex + 1}
                    </span>
                  </h5>
                  <p className="text-start fs-15">
                    {currentQuestion.questionText}
                  </p>
                </div>

                {/* Choices */}
                <div className="choices-container">
                  {currentQuestion.choices.map((choice) => (
                    <div key={choice.id} className="mb-3">
                      <label className="form-check form-check-lg">
                        <input
                          type="radio"
                          className="form-check-input"
                          name={`question-${currentQuestion.id}`}
                          value={choice.id}
                          checked={currentAnswer.choiceId === choice.id}
                          onChange={() => handleAnswerChange(choice.id)}
                        />
                        <span className="form-check-label text-end ms-2">
                          {choice.text}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="row mt-5 pt-3 border-top">
                  <div className="col">
                    <button
                      className="btn btn-outline-primary d-flex align-items-center"
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                    >
                      <i className="isax isax-arrow-right me-2"></i>
                      سوال قبلی
                    </button>
                  </div>
                  <div className="col text-center">
                    <small className="text-muted">
                      {answeredCount} از {questions.length} سوال پاسخ داده شده
                    </small>
                  </div>
                  <div className="col text-end" style={{ direction: "ltr" }}>
                    {currentQuestionIndex === questions.length - 1 ? (
                      <button
                        className="btn btn-success"
                        onClick={handleSubmit}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            درحال ثبت...
                          </>
                        ) : (
                          <>
                            <i className="isax isax-check-circle me-2"></i>
                            تکمیل و ارسال
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary d-flex align-items-center"
                        onClick={handleNext}
                        disabled={submitting}
                      >
                        <i className="isax isax-arrow-left ms-2"></i>
                        سوال بعدی
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Preview Sidebar */}
        <div className="row">
          <div className="col-lg-8 mx-auto mb-4">
            <div className="card">
              <div className="card-body">
                <h6 className="card-title mb-3">خلاصه سوالات</h6>
                <div className="row">
                  {questions.map((q, index) => (
                    <div key={q.id} className="col-auto mb-2">
                      <button
                        className={`btn btn-sm ${
                          answers[index].choiceId !== null
                            ? "btn-success"
                            : "btn-outline-secondary"
                        } ${currentQuestionIndex === index ? "active" : ""}`}
                        onClick={() => setCurrentQuestionIndex(index)}
                      >
                        {index + 1}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeExamTake;
