import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import practiceExamsService from "../../../services/practice-exams.service";
import "./practice-exams.scss";

interface Question {
  id: number;
  questionText: string;
  skillTag: string;
  choices: Array<{ id: number; text: string }>;
  score: number;
}

interface Answer {
  questionId: number;
  choiceId: number | null;
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

      // بررسی حداقل 10 سوال
      if (practiceQuestions.length < 10) {
        setError(
          `برای ایجاد آزمون تمرینی، حداقل ۱۰ سوال نیاز است. فقط ${practiceQuestions.length} سوال دردسترس است.`,
        );
        return;
      }

      setQuestions(practiceQuestions);
      setCourseId(examData.courseId);
      setSkillTag(examData.skillTag);

      // Initialize answers
      const initialAnswers: Answer[] = practiceQuestions.map(
        (q: Question) => ({
          questionId: q.id,
          choiceId: null,
        }),
      );
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
    updatedAnswers[currentQuestionIndex] = {
      questionId: questions[currentQuestionIndex].id,
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

      // فیلتر کردن جواب‌های مختار (بدون null)
      const validAnswers = answers
        .filter((a) => a.choiceId !== null)
        .map((a) => ({
          questionId: a.questionId,
          choiceId: a.choiceId as number,
        }));

      const response = await practiceExamsService.submitPracticeExam(
        courseId,
        validAnswers,
        skillTag || undefined,
      );

      // Navigate to results page
      navigate(`/student/practice-exams/result/${response.id}`);
    } catch (err: any) {
      setError(err.message || "خطایی در ثبت نتایج رخ داد");
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
    <div className="container-fluid">
      {/* Header */}
      <div className="practice-exams-header mb-4">
        <div className="row align-items-center">
          <div className="col">
            <h2>
              <i className="isax isax-book-square me-2"></i>
              آزمون تمرینی - {skillTag}
            </h2>
            <p className="mb-0">
              سوال {currentQuestionIndex + 1} از {questions.length}
            </p>
          </div>
          <div className="col-auto">
            <div className="progress" style={{ width: "200px", height: "8px" }}>
              <div
                className="progress-bar"
                style={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="row">
        <div className="col-lg-8 mx-auto mb-4">
          <div className="card">
            <div className="card-body">
              {/* Question Text */}
              <div className="mb-4">
                <h5 className="card-title text-end">
                  <span className="badge bg-primary me-2">
                    سوال {currentQuestionIndex + 1}
                  </span>
                </h5>
                <p className="text-end fs-5">{currentQuestion.questionText}</p>
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
                    className="btn btn-outline-primary"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    <i className="isax isax-arrow-left me-2"></i>
                    سوال قبلی
                  </button>
                </div>
                <div className="col text-center">
                  <small className="text-muted">
                    {answeredCount} از {questions.length} سوال پاسخ داده شده
                  </small>
                </div>
                <div className="col text-end">
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
                      className="btn btn-primary"
                      onClick={handleNext}
                      disabled={submitting}
                    >
                      سوال بعدی
                      <i className="isax isax-arrow-right ms-2"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Preview Sidebar */}
      <div className="row mt-4">
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
                      } ${
                        currentQuestionIndex === index ? "active" : ""
                      }`}
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
  );
};

export default PracticeExamTake;
