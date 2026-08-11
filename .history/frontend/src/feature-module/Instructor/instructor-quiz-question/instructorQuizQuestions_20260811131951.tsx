import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

import quizService, {
  QuizQuestionItem,
  QuizChoice,
} from "../../../services/quiz.service";

const emptyChoices = (): QuizChoice[] => [
  { text: "", isCorrect: true },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
];

const makeClientId = () => Math.random().toString(36).slice(2, 10);

const InstructorQuizQuestions = () => {
  debugger;
  const { courseId: courseIdParam } = useParams<{
    courseId: string;
  }>();

  const courseId = courseIdParam ? Number(courseIdParam) : NaN;

  const [questions, setQuestions] = useState<QuizQuestionItem[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(true);

  const [aiCount, setAiCount] = useState(10);
  const [generating, setGenerating] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  const [formText, setFormText] = useState("");
  const [formChoices, setFormChoices] = useState<QuizChoice[]>(emptyChoices());

  const [settings, setSettings] = useState({
    title: "آزمون دوره",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "23:59",
    durationMinutes: 30,
    scorePerQuestion: 1,
    questionsToShow: 10,
  });

  const [saving, setSaving] = useState(false);

  // --------------------------------------------------
  // Load existing quiz
  // --------------------------------------------------

  useEffect(() => {
    const load = async () => {
      // courseId doesn't exist in URL
      if (!courseIdParam) {
        setLoadingExisting(false);
        return;
      }

      // courseId is not a valid number
      if (Number.isNaN(courseId)) {
        setLoadingExisting(false);
        return;
      }

      try {
        const quiz = await quizService.getQuiz(courseId);

        if (quiz) {
          setQuestions(
            quiz.QuizQuestions.map((q: any) => ({
              clientId: makeClientId(),
              Id: q.Id,
              questionText: q.QuestionText,
              isAiGenerated: q.Source,
              choices: q.QuizChoices.map((c: any) => ({
                Id: c.Id,
                text: c.ChoiceText,
                isCorrect: c.IsCorrect,
              })),
            })),
          );

          setSettings((s) => ({
            ...s,
            title: quiz.Title ?? "آزمون دوره",

            startDate: quiz.StartAt ? quiz.StartAt.slice(0, 10) : "",

            startTime: quiz.StartAt ? quiz.StartAt.slice(11, 16) : "09:00",

            endDate: quiz.EndAt ? quiz.EndAt.slice(0, 10) : "",

            endTime: quiz.EndAt ? quiz.EndAt.slice(11, 16) : "23:59",

            durationMinutes: quiz.DurationMinutes ?? 30,

            scorePerQuestion:
              quiz.ScorePerQuestion != null ? Number(quiz.ScorePerQuestion) : 1,

            questionsToShow: quiz.QuestionsToShow ?? 10,
          }));
        }
      } catch (err) {
        // If quiz doesn't exist yet, that's okay.
        console.log("No existing quiz found.", err);
      } finally {
        setLoadingExisting(false);
      }
    };

    load();
  }, [courseIdParam, courseId]);

  // --------------------------------------------------
  // Modal
  // --------------------------------------------------

  const openAddModal = () => {
    setEditingClientId(null);
    setFormText("");
    setFormChoices(emptyChoices());
    setModalOpen(true);
  };

  const openEditModal = (q: QuizQuestionItem) => {
    setEditingClientId(q.clientId);
    setFormText(q.questionText);
    setFormChoices(q.choices.map((c) => ({ ...c })));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // --------------------------------------------------
  // Choices
  // --------------------------------------------------

  const handleChoiceTextChange = (index: number, value: string) => {
    setFormChoices((prev) =>
      prev.map((c, i) =>
        i === index
          ? {
              ...c,
              text: value,
            }
          : c,
      ),
    );
  };

  const handleCorrectChange = (index: number) => {
    setFormChoices((prev) =>
      prev.map((c, i) => ({
        ...c,
        isCorrect: i === index,
      })),
    );
  };

  const addChoiceField = () => {
    if (formChoices.length >= 6) {
      return;
    }

    setFormChoices((prev) => [
      ...prev,
      {
        text: "",
        isCorrect: false,
      },
    ]);
  };

  const removeChoiceField = (index: number) => {
    if (formChoices.length <= 2) {
      return;
    }

    setFormChoices((prev) => {
      const next = prev.filter((_, i) => i !== index);

      if (!next.some((c) => c.isCorrect)) {
        next[0].isCorrect = true;
      }

      return next;
    });
  };

  // --------------------------------------------------
  // Save question from modal
  // --------------------------------------------------

  const saveQuestionFromModal = () => {
    const text = formText.trim();

    const choices = formChoices.map((c) => ({
      ...c,
      text: c.text.trim(),
    }));

    if (!text) {
      toast.error("متن سوال را وارد کنید.");
      return;
    }

    if (choices.some((c) => !c.text)) {
      toast.error("متن همه گزینه‌ها را وارد کنید.");
      return;
    }

    if (choices.filter((c) => c.isCorrect).length !== 1) {
      toast.error("دقیقاً یک گزینه صحیح انتخاب کنید.");
      return;
    }

    // Edit existing question
    if (editingClientId) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.clientId === editingClientId
            ? {
                ...q,
                questionText: text,
                choices,
              }
            : q,
        ),
      );
    }

    // Add new question
    else {
      setQuestions((prev) => [
        ...prev,
        {
          clientId: makeClientId(),
          questionText: text,
          choices,
          isAiGenerated: false,
        },
      ]);
    }

    setModalOpen(false);
  };

  // --------------------------------------------------
  // Delete question
  // --------------------------------------------------

  const deleteQuestion = (clientId: string) => {
    setQuestions((prev) => prev.filter((q) => q.clientId !== clientId));
  };

  // --------------------------------------------------
  // Generate questions with AI
  // --------------------------------------------------

  const handleGenerateAi = async () => {
    if (!courseIdParam || Number.isNaN(courseId)) {
      toast.error("شناسه دوره معتبر نیست.");
      return;
    }

    if (aiCount < 1 || aiCount > 100) {
      toast.error("تعداد سوال باید بین ۱ تا ۱۰۰ باشد.");
      return;
    }

    setGenerating(true);

    try {
      const generated = await quizService.generateQuestions(courseId, aiCount);

      const mapped: QuizQuestionItem[] = generated.map((q) => ({
        clientId: makeClientId(),
        questionText: q.questionText,
        choices: q.choices,
        isAiGenerated: true,
      }));

      setQuestions((prev) => [...prev, ...mapped]);

      toast.success(`${mapped.length} سوال با موفقیت تولید شد.`);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "تولید سوالات با خطا مواجه شد.",
      );
    } finally {
      setGenerating(false);
    }
  };

  // --------------------------------------------------
  // Save quiz
  // --------------------------------------------------

  const handleSaveQuiz = async () => {
    if (!courseIdParam || Number.isNaN(courseId)) {
      toast.error("شناسه دوره معتبر نیست.");
      return;
    }

    if (questions.length === 0) {
      toast.error("حداقل یک سوال اضافه کنید.");
      return;
    }

    if (!settings.title.trim()) {
      toast.error("عنوان آزمون را وارد کنید.");
      return;
    }

    if (!settings.startDate || !settings.endDate) {
      toast.error("تاریخ شروع و پایان آزمون را مشخص کنید.");
      return;
    }

    if (settings.durationMinutes <= 0) {
      toast.error("مدت زمان آزمون باید بیشتر از صفر باشد.");
      return;
    }

    if (settings.scorePerQuestion < 0) {
      toast.error("نمره هر سوال نمی‌تواند منفی باشد.");
      return;
    }

    if (settings.questionsToShow < 1) {
      toast.error("حداقل یک سوال باید نمایش داده شود.");
      return;
    }

    if (settings.questionsToShow > questions.length) {
      toast.error(
        "تعداد سوالات نمایشی نمی‌تواند از تعداد کل سوالات بیشتر باشد.",
      );
      return;
    }

    const startAt = new Date(
      `${settings.startDate}T${settings.startTime}:00`,
    ).toISOString();

    const endAt = new Date(
      `${settings.endDate}T${settings.endTime}:00`,
    ).toISOString();

    if (
      Number.isNaN(new Date(startAt).getTime()) ||
      Number.isNaN(new Date(endAt).getTime())
    ) {
      toast.error("تاریخ یا ساعت واردشده معتبر نیست.");
      return;
    }

    if (new Date(endAt) <= new Date(startAt)) {
      toast.error("زمان پایان باید بعد از زمان شروع باشد.");
      return;
    }

    setSaving(true);

    try {
      await quizService.saveQuiz(courseId, {
        title: settings.title.trim(),

        startAt,

        endAt,

        durationMinutes: settings.durationMinutes,

        scorePerQuestion: settings.scorePerQuestion,

        questionsToShow: settings.questionsToShow,

        questions: questions.map((q) => ({
          questionText: q.questionText,
          isAiGenerated: q.isAiGenerated,

          choices: q.choices.map((c) => ({
            text: c.text,
            isCorrect: c.isCorrect,
          })),
        })),
      });

      toast.success("آزمون با موفقیت ذخیره شد.");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "ذخیره آزمون با خطا مواجه شد.",
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loadingExisting) {
    return <div className="text-center py-5">در حال بارگذاری آزمون...</div>;
  }

  // --------------------------------------------------
  // Invalid course ID
  // --------------------------------------------------

  if (!courseIdParam) {
    return (
      <div className="text-center py-4 text-muted">
        شناسه دوره مشخص نشده است.
      </div>
    );
  }

  if (Number.isNaN(courseId)) {
    return (
      <div className="text-center py-4 text-muted">شناسه دوره معتبر نیست.</div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="form-inner wizard-form-card">
      {/* Header */}
      <div className="title d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 className="mb-0">سوالات آزمون (بانک سوالات: {questions.length})</h5>

        <div className="d-flex align-items-center gap-2">
          <input
            type="number"
            min={1}
            max={100}
            value={aiCount}
            onChange={(e) => setAiCount(Number(e.target.value))}
            className="form-control"
            style={{ width: 80 }}
          />

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleGenerateAi}
            disabled={generating}
          >
            <i className="fas fa-magic me-1" />

            {generating ? "در حال تولید..." : "تولید با هوش مصنوعی"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={openAddModal}
          >
            <i className="fas fa-plus me-1" />
            افزودن سوال
          </button>
        </div>
      </div>

      {/* Questions */}
      {questions.length === 0 ? (
        <div className="text-center text-muted py-5">
          هنوز سوالی اضافه نشده.
          <br />
          با هوش مصنوعی تولید کنید یا به‌صورت دستی اضافه کنید.
        </div>
      ) : (
        <div className="d-flex flex-column gap-3 my-3">
          {questions.map((q, idx) => (
            <div className="card" key={q.clientId}>
              <div className="card-body">
                <div className="d-flex align-items-start justify-content-between">
                  <h6 className="mb-2">
                    {idx + 1}. {q.questionText}{" "}
                    {q.isAiGenerated && (
                      <span className="badge bg-secondary-transparent text-secondary ms-1">
                        AI
                      </span>
                    )}
                  </h6>

                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => openEditModal(q)}
                    >
                      <i className="isax isax-edit-2" />
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteQuestion(q.clientId)}
                    >
                      <i className="isax isax-trash" />
                    </button>
                  </div>
                </div>

                <ul className="list-unstyled mb-0">
                  {q.choices.map((c, ci) => (
                    <li
                      key={ci}
                      className={
                        c.isCorrect ? "text-success fw-medium" : "text-muted"
                      }
                    >
                      {c.isCorrect ? (
                        <i className="fas fa-check-circle me-1" />
                      ) : (
                        "○ "
                      )}

                      {c.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quiz Settings */}
      <div className="card">
        <div className="card-body">
          <h6 className="mb-3">تنظیمات آزمون</h6>

          <div className="row g-3">
            {/* Title */}
            <div className="col-md-3">
              <label className="form-label">عنوان آزمون</label>

              <input
                className="form-control"
                value={settings.title}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    title: e.target.value,
                  })
                }
              />
            </div>

            {/* Start Date */}
            <div className="col-md-3">
              <label className="form-label">تاریخ شروع</label>

              <input
                type="date"
                className="form-control"
                value={settings.startDate}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    startDate: e.target.value,
                  })
                }
              />
            </div>

            {/* End Date */}
            <div className="col-md-3">
              <label className="form-label">تاریخ پایان</label>

              <input
                type="date"
                className="form-control"
                value={settings.endDate}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    endDate: e.target.value,
                  })
                }
              />
            </div>

            {/* Start Time */}
            <div className="col-md-3">
              <label className="form-label">ساعت شروع</label>

              <input
                type="time"
                className="form-control"
                value={settings.startTime}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    startTime: e.target.value,
                  })
                }
              />
            </div>

            {/* End Time */}
            <div className="col-md-3">
              <label className="form-label">ساعت پایان</label>

              <input
                type="time"
                className="form-control"
                value={settings.endTime}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    endTime: e.target.value,
                  })
                }
              />
            </div>

            {/* Duration */}
            <div className="col-md-3">
              <label className="form-label">مدت زمان آزمون (دقیقه)</label>

              <input
                type="number"
                min={1}
                className="form-control"
                value={settings.durationMinutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    durationMinutes: Number(e.target.value),
                  })
                }
              />
            </div>

            {/* Score */}
            <div className="col-md-3">
              <label className="form-label">نمره هر سوال</label>

              <input
                type="number"
                min={0}
                step={0.25}
                className="form-control"
                value={settings.scorePerQuestion}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    scorePerQuestion: Number(e.target.value),
                  })
                }
              />
            </div>

            {/* Questions To Show */}
            <div className="col-md-3">
              <label className="form-label">
                تعداد سوال نمایش داده‌شده به هر کاربر (از بین {questions.length}{" "}
                سوال)
              </label>

              <input
                type="number"
                min={1}
                max={questions.length || 1}
                className="form-control"
                value={settings.questionsToShow}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    questionsToShow: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="add-form-btn widget-next-btn submit-btn mt-3">
        <div className="btn-left ms-auto">
          <button
            type="button"
            className="btn btn-secondary main-btn"
            onClick={handleSaveQuiz}
            disabled={saving}
          >
            {saving ? "در حال ذخیره..." : "ذخیره آزمون"}
          </button>
        </div>
      </div>

      {/* Question Modal */}
      {modalOpen && (
        <>
          <div className="modal-backdrop fade show" onClick={closeModal} />

          <div className="modal fade show d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                {/* Modal Header */}
                <div className="modal-header">
                  <h5 className="fw-bold">
                    {editingClientId ? "ویرایش سوال" : "افزودن سوال"}
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                  />
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">
                      متن سوال <span className="text-danger">*</span>
                    </label>

                    <textarea
                      className="form-control"
                      rows={2}
                      value={formText}
                      onChange={(e) => setFormText(e.target.value)}
                    />
                  </div>

                  {formChoices.map((c, i) => (
                    <div
                      className="mb-2 d-flex align-items-center gap-2"
                      key={i}
                    >
                      <input
                        type="radio"
                        name="correct-choice"
                        checked={c.isCorrect}
                        onChange={() => handleCorrectChange(i)}
                      />

                      <input
                        type="text"
                        className="form-control"
                        placeholder={`گزینه ${i + 1}`}
                        value={c.text}
                        onChange={(e) =>
                          handleChoiceTextChange(i, e.target.value)
                        }
                      />

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeChoiceField(i)}
                        disabled={formChoices.length <= 2}
                      >
                        <i className="isax isax-trash" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary mt-1"
                    onClick={addChoiceField}
                    disabled={formChoices.length >= 6}
                  >
                    <i className="fas fa-plus me-1" />
                    افزودن گزینه
                  </button>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn bg-gray-100 rounded-pill me-2"
                    onClick={closeModal}
                  >
                    انصراف
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill"
                    onClick={saveQuestionFromModal}
                  >
                    ذخیره سوال
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InstructorQuizQuestions;
