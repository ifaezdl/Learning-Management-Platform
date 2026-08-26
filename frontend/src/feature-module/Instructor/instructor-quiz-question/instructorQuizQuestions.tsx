import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from "react-date-object";
import quizService, {
  QuizQuestionItem,
  QuizChoice,
} from "../../../services/quiz.service";
import "./InstructorQuizQuestions.scss";
interface Props {
  courseId: number;
  onPrev?: () => void;
  onNext?: () => void;
}

const emptyChoices = (): QuizChoice[] => [
  { text: "", isCorrect: true },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
];

const makeClientId = () => Math.random().toString(36).slice(2, 10);

const InstructorQuizQuestions: React.FC<Props> = ({
  courseId,
  onPrev,
  onNext,
}) => {
  const [questions, setQuestions] = useState<QuizQuestionItem[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(true);

  const [aiCount, setAiCount] = useState(10);
  const [generating, setGenerating] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [formText, setFormText] = useState("");
  const [formSkillTag, setFormSkillTag] = useState("");
  const [formChoices, setFormChoices] = useState<QuizChoice[]>(emptyChoices());
  const [formScore, setFormScore] = useState(1);

  const [settings, setSettings] = useState<{
    title: string;
    startDateObj: DateObject | null;
    startTime: string;
    endDateObj: DateObject | null;
    endTime: string;
    durationMinutes: number;
    passScore: number;
    questionsToShow: number;
    showAllQuestions: boolean;
    allowPreviousQuestion: boolean;
  }>({
    title: "آزمون دوره",
    startDateObj: null,
    startTime: "09:00",
    endDateObj: null,
    endTime: "23:59",
    durationMinutes: 30,
    passScore: 0,
    questionsToShow: 10,
    showAllQuestions: false,
    allowPreviousQuestion: true,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const quiz = await quizService.getQuiz(courseId);

        if (quiz) {
          setQuestions(
            quiz.QuizQuestions.map((q: any) => ({
              clientId: makeClientId(),
              Id: q.Id,
              questionText: q.QuestionText,
              skillTag: q.SkillTag ?? "",
              isAiGenerated: q.Source,
              score: Number(q.Score) || 1,
              choices: q.QuizChoices.map((c: any) => ({
                Id: c.Id,
                text: c.ChoiceText,
                isCorrect: c.IsCorrect,
              })),
            })),
          );

          setSettings((s) => ({
            ...s,
            title: quiz.Title,
            startDateObj: quiz.StartAt
              ? new DateObject({
                  date: new Date(quiz.StartAt),
                  calendar: persian,
                  locale: persian_fa,
                })
              : null,
            startTime: quiz.StartAt ? quiz.StartAt.slice(11, 16) : "09:00",
            endDateObj: quiz.EndAt
              ? new DateObject({
                  date: new Date(quiz.EndAt),
                  calendar: persian,
                  locale: persian_fa,
                })
              : null,
            endTime: quiz.EndAt ? quiz.EndAt.slice(11, 16) : "23:59",
            durationMinutes: quiz.DurationMinutes ?? 30,
            passScore: Number(quiz.PassScore) || 0,
            questionsToShow: quiz.QuestionsToShow ?? 10,
            showAllQuestions: !!quiz.ShowAllQuestions,
            allowPreviousQuestion: quiz.AllowPreviousQuestion ?? true,
          }));
        }
      } catch {
        // no quiz yet
      } finally {
        setLoadingExisting(false);
      }
    };

    load();
  }, [courseId]);

  const openAddModal = () => {
    setEditingClientId(null);
    setFormText("");
    setFormSkillTag("");
    setFormChoices(emptyChoices());
    setFormScore(1);
    setModalOpen(true);
  };

  const openEditModal = (q: QuizQuestionItem) => {
    setEditingClientId(q.clientId);
    setFormText(q.questionText);
    setFormSkillTag(q.skillTag ?? "");
    setFormChoices(q.choices.map((c) => ({ ...c })));
    setFormScore(q.score ?? 1);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleChoiceTextChange = (index: number, value: string) => {
    setFormChoices((prev) =>
      prev.map((c, i) => (i === index ? { ...c, text: value } : c)),
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
    if (formChoices.length >= 6) return;

    setFormChoices((prev) => [
      ...prev,
      {
        text: "",
        isCorrect: false,
      },
    ]);
  };

  const removeChoiceField = (index: number) => {
    if (formChoices.length <= 2) return;

    setFormChoices((prev) => {
      const next = prev.filter((_, i) => i !== index);

      if (!next.some((c) => c.isCorrect)) {
        next[0].isCorrect = true;
      }

      return next;
    });
  };

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

    if (!formScore || formScore <= 0) {
      toast.error("نمره سوال باید بزرگتر از صفر باشد.");
      return;
    }

    if (editingClientId) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.clientId === editingClientId
            ? {
                ...q,
                questionText: text,
                skillTag: formSkillTag.trim(),
                choices,
                score: formScore,
              }
            : q,
        ),
      );
    } else {
      setQuestions((prev) => [
        ...prev,
        {
          clientId: makeClientId(),
          questionText: text,
          skillTag: formSkillTag.trim(),
          choices,
          score: formScore,
          isAiGenerated: false,
        },
      ]);
    }

    setModalOpen(false);
  };

  const deleteQuestion = (clientId: string) => {
    setQuestions((prev) => prev.filter((q) => q.clientId !== clientId));
  };

  const handleGenerateAi = async () => {
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
        skillTag: q.skillTag ?? "",
        choices: q.choices,
        score: 1,
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

  const handleSaveQuiz = async () => {
    if (questions.length === 0) {
      toast.error("حداقل یک سوال اضافه کنید.");
      return;
    }

    if (!settings.startDateObj || !settings.endDateObj) {
      toast.error("تاریخ شروع و پایان آزمون را مشخص کنید.");
      return;
    }

    if (settings.questionsToShow > questions.length) {
      toast.error(
        "تعداد سوالات نمایشی نمی‌تواند از تعداد کل سوالات بیشتر باشد.",
      );
      return;
    }

    const totalMaxScore = questions.reduce((sum, q) => sum + (q.score ?? 1), 0);

    if (!settings.passScore || settings.passScore <= 0) {
      toast.error("نمره قبولی را وارد کنید.");
      return;
    }

    if (settings.passScore > totalMaxScore) {
      toast.error("نمره قبولی نمی‌تواند از مجموع نمرات سوالات بیشتر باشد.");
      return;
    }

    const startDateJs = settings.startDateObj.toDate();
    const [startH, startM] = settings.startTime.split(":").map(Number);

    startDateJs.setHours(startH, startM, 0, 0);

    const endDateJs = settings.endDateObj.toDate();
    const [endH, endM] = settings.endTime.split(":").map(Number);

    endDateJs.setHours(endH, endM, 0, 0);

    const startAt = startDateJs.toISOString();
    const endAt = endDateJs.toISOString();

    if (new Date(endAt) <= new Date(startAt)) {
      toast.error("زمان پایان باید بعد از زمان شروع باشد.");
      return;
    }

    setSaving(true);

    try {
      await quizService.saveQuiz(courseId, {
        title: settings.title,
        startAt,
        endAt,
        durationMinutes: settings.durationMinutes,
        passScore: settings.passScore,
        questionsToShow: settings.questionsToShow,
        showAllQuestions: settings.showAllQuestions,
        allowPreviousQuestion: settings.allowPreviousQuestion,
        questions: questions.map((q) => ({
          questionText: q.questionText,
          skillTag: q.skillTag ?? "",
          isAiGenerated: q.isAiGenerated,
          score: q.score ?? 1,
          choices: q.choices.map((c) => ({
            text: c.text,
            isCorrect: c.isCorrect,
          })),
        })),
      });

      toast.success("آزمون با موفقیت ذخیره شد.");
      onNext?.();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "ذخیره آزمون با خطا مواجه شد.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingExisting) {
    return (
      <div className="quiz-loading">
        <div className="spinner-border text-primary" />
        <span>در حال بارگذاری آزمون...</span>
      </div>
    );
  }
  return (
    <div className="form-inner wizard-form-card instructor-quiz-page">
      {/* ==================== Quiz Header ==================== */}
      <div className="quiz-page-header">
        <div>
          <div className="quiz-page-title">
            <div className="quiz-title-icon">
              <i className="isax isax-clipboard-text" />
            </div>

            <div>
              <h5>سوالات آزمون</h5>
              <p>مدیریت بانک سوالات و تنظیمات آزمون</p>
            </div>
          </div>

          <div className="quiz-question-count">
            <i className="isax isax-document-text" />
            بانک سوالات:
            <strong>{questions.length}</strong>
          </div>
        </div>

        <div className="quiz-header-actions">
          <div className="ai-generator">
            <input
              type="number"
              min={1}
              max={100}
              value={aiCount}
              onChange={(e) => setAiCount(Number(e.target.value))}
              className="form-control"
            />

            <button
              type="button"
              className="btn quiz-ai-btn"
              onClick={handleGenerateAi}
              disabled={generating}
            >
              <i className="fas fa-magic" />

              {generating ? "در حال تولید..." : "تولید با هوش مصنوعی"}
            </button>
          </div>

          <button
            type="button"
            className="btn quiz-add-btn"
            onClick={openAddModal}
          >
            <i className="fas fa-plus" />
            افزودن سوال
          </button>
        </div>
      </div>

      {/* ==================== Questions ==================== */}
      {questions.length === 0 ? (
        <div className="quiz-empty-state">
          <div className="quiz-empty-icon">
            <i className="isax isax-document-text" />
          </div>

          <h6>هنوز سوالی اضافه نشده است</h6>

          <p>
            می‌توانید سوالات را به‌صورت دستی اضافه کنید یا از هوش مصنوعی برای
            تولید سوال استفاده کنید.
          </p>

          <button
            type="button"
            className="btn quiz-modal-save"
            onClick={openAddModal}
          >
            <i className="fas fa-plus me-1" />
            افزودن اولین سوال
          </button>
        </div>
      ) : (
        <div className="quiz-questions-list">
          {questions.map((q, idx) => (
            <div className="quiz-question-card" key={q.clientId}>
              <div className="quiz-question-top">
                <div className="quiz-question-number">{idx + 1}</div>

                <div className="quiz-question-content">
                  <div className="quiz-question-heading">
                    <h6>{q.questionText}</h6>

                    <div className="quiz-question-badges">
                      <span className="quiz-score-badge">
                        <i className="fas fa-star" />
                        {q.score ?? 1} نمره
                      </span>

                      {q.skillTag && (
                        <span className="quiz-skill-badge">
                          <i className="fas fa-tag" />
                          {q.skillTag}
                        </span>
                      )}

                      {q.isAiGenerated && (
                        <span className="quiz-ai-badge">
                          <i className="fas fa-magic" />
                          AI
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="quiz-choices">
                    {q.choices.map((c, ci) => (
                      <div
                        key={ci}
                        className={`quiz-choice ${
                          c.isCorrect ? "correct" : ""
                        }`}
                      >
                        <span className="quiz-choice-icon">
                          {c.isCorrect ? (
                            <i className="fas fa-check" />
                          ) : (
                            <span>{ci + 1}</span>
                          )}
                        </span>

                        <span>{c.text}</span>

                        {c.isCorrect && <small>پاسخ صحیح</small>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="quiz-question-actions">
                  <button
                    type="button"
                    className="quiz-icon-btn edit"
                    title="ویرایش سوال"
                    onClick={() => openEditModal(q)}
                  >
                    <i className="isax isax-edit-2" />
                  </button>

                  <button
                    type="button"
                    className="quiz-icon-btn delete"
                    title="حذف سوال"
                    onClick={() => deleteQuestion(q.clientId)}
                  >
                    <i className="isax isax-trash" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================== Quiz Settings ==================== */}
      <div className="quiz-settings-card">
        <div className="quiz-section-header">
          <div className="quiz-section-icon">
            <i className="isax isax-setting-2" />
          </div>

          <div>
            <h6>تنظیمات آزمون</h6>
            <span>مشخصات و نحوه برگزاری آزمون را تنظیم کنید</span>
          </div>
        </div>

        <div className="quiz-settings-body">
          <div className="row g-3">
            <div className="col-md-6 col-lg-3">
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

            <div className="col-md-6 col-lg-3">
              <label className="form-label">تاریخ شروع</label>

              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={settings.startDateObj}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    startDateObj: val as DateObject,
                  })
                }
                inputClass="form-control"
                calendarPosition="bottom-right"
                containerStyle={{ width: "100%" }}
              />
            </div>

            <div className="col-md-6 col-lg-3">
              <label className="form-label">تاریخ پایان</label>

              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={settings.endDateObj}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    endDateObj: val as DateObject,
                  })
                }
                inputClass="form-control"
                calendarPosition="bottom-right"
                containerStyle={{ width: "100%" }}
              />
            </div>

            <div className="col-md-6 col-lg-3">
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

            <div className="col-md-6 col-lg-3">
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

            <div className="col-md-6 col-lg-3">
              <label className="form-label">مدت زمان آزمون</label>

              <div className="quiz-input-with-unit">
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

                <span>دقیقه</span>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <label className="form-label">نمره قبولی</label>

              <input
                type="number"
                min={0}
                step={0.25}
                className="form-control"
                value={settings.passScore}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    passScore: Number(e.target.value),
                  })
                }
              />

              <small className="quiz-field-hint">
                از مجموع {questions.reduce((s, q) => s + (q.score ?? 1), 0)}{" "}
                نمره
              </small>
            </div>

            <div className="col-md-6 col-lg-3">
              <label className="form-label">تعداد سوال برای هر کاربر</label>

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

              <small className="quiz-field-hint">
                از {questions.length} سوال
              </small>
            </div>

            <div className="col-md-6 col-lg-6">
              <div className="quiz-setting-option">
                <div>
                  <strong>حالت نمایش سوالات</strong>
                  <small>نحوه نمایش سوالات به شرکت‌کننده</small>
                </div>

                <div className="quiz-radio-group">
                  <label className={!settings.showAllQuestions ? "active" : ""}>
                    <input
                      type="radio"
                      name="show-mode"
                      checked={!settings.showAllQuestions}
                      onChange={() =>
                        setSettings({
                          ...settings,
                          showAllQuestions: false,
                        })
                      }
                    />
                    <span>یکی‌یکی</span>
                  </label>

                  <label className={settings.showAllQuestions ? "active" : ""}>
                    <input
                      type="radio"
                      name="show-mode"
                      checked={settings.showAllQuestions}
                      onChange={() =>
                        setSettings({
                          ...settings,
                          showAllQuestions: true,
                        })
                      }
                    />
                    <span>همه با هم</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-6">
              <div className="quiz-setting-option">
                <div>
                  <strong>امکان بازگشت به سوال قبلی</strong>
                  <small>کاربر بتواند به سوال قبلی برگردد</small>
                </div>

                <label className="quiz-switch">
                  <input
                    type="checkbox"
                    checked={settings.allowPreviousQuestion}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        allowPreviousQuestion: e.target.checked,
                      })
                    }
                  />

                  <span />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== Footer ==================== */}
      <div className="quiz-navigation">
        <button type="button" className="btn quiz-prev-btn" onClick={onPrev}>
          <i className="isax isax-arrow-right-3" />
          قبلی
        </button>

        <button
          type="button"
          className="btn quiz-save-btn"
          onClick={handleSaveQuiz}
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm" />
              در حال ذخیره...
            </>
          ) : (
            <>
              ذخیره آزمون و ادامه
              <i className="isax isax-arrow-left-3" />
            </>
          )}
        </button>
      </div>

      {/* ==================== Question Modal ==================== */}
      {modalOpen && (
        <>
          <div className="quiz-modal-backdrop" onClick={closeModal} />

          <div className="quiz-modal-wrapper" role="dialog" aria-modal="true">
            <div className="quiz-modal">
              <div className="quiz-modal-header">
                <div className="quiz-modal-title">
                  <div className="quiz-modal-icon">
                    <i
                      className={
                        editingClientId ? "isax isax-edit-2" : "fas fa-plus"
                      }
                    />
                  </div>

                  <div>
                    <h5>{editingClientId ? "ویرایش سوال" : "افزودن سوال"}</h5>

                    <span>متن سوال و گزینه‌های پاسخ را وارد کنید</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="quiz-modal-close"
                  onClick={closeModal}
                >
                  <i className="fas fa-times" />
                </button>
              </div>

              <div className="quiz-modal-body">
                <div className="quiz-modal-field">
                  <label className="form-label">
                    متن سوال
                    <span className="text-danger">*</span>
                  </label>

                  <textarea
                    className="form-control"
                    rows={3}
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    placeholder="متن سوال را وارد کنید..."
                  />
                </div>

                <div className="quiz-modal-field">
                  <label className="form-label">
                    برچسب مهارتی
                    <span className="text-muted fs-12 ms-1">(اختیاری)</span>
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    maxLength={200}
                    value={formSkillTag}
                    onChange={(e) => setFormSkillTag(e.target.value)}
                    placeholder="مثلاً: حلقه‌های تکرار، مدیریت حافظه، شی‌گرایی"
                  />

                  <small className="text-muted">
                    این برچسب برای تحلیل شکاف مهارتی دانشجو استفاده می‌شود.
                  </small>
                </div>

                <div className="quiz-modal-score">
                  <label className="form-label">نمره سوال</label>

                  <input
                    type="number"
                    min={0}
                    step={0.25}
                    className="form-control"
                    value={formScore}
                    onChange={(e) => setFormScore(Number(e.target.value))}
                  />
                </div>

                <div className="quiz-choices-header">
                  <div>
                    <h6>گزینه‌های پاسخ</h6>
                    <span>گزینه صحیح را انتخاب کنید</span>
                  </div>

                  <span className="quiz-choice-count">
                    {formChoices.length} گزینه
                  </span>
                </div>

                <div className="quiz-modal-choices">
                  {formChoices.map((c, i) => (
                    <div className="quiz-choice-row" key={i}>
                      <label className="quiz-choice-radio">
                        <input
                          type="radio"
                          name="correct-choice"
                          checked={c.isCorrect}
                          onChange={() => handleCorrectChange(i)}
                        />
                        <span className="quiz-radio-circle" />
                      </label>

                      <div className="quiz-choice-number">{i + 1}</div>

                      <input
                        type="text"
                        className="form-control quiz-choice-input"
                        placeholder={`گزینه ${i + 1}`}
                        value={c.text}
                        onChange={(e) =>
                          handleChoiceTextChange(i, e.target.value)
                        }
                      />

                      <button
                        type="button"
                        className="quiz-choice-delete"
                        onClick={() => removeChoiceField(i)}
                        disabled={formChoices.length <= 2}
                        title="حذف گزینه"
                      >
                        <i className="isax isax-trash" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="quiz-add-choice-btn"
                    onClick={addChoiceField}
                    disabled={formChoices.length >= 6}
                  >
                    <i className="fas fa-plus me-1" />
                    افزودن گزینه
                  </button>
                </div>
              </div>

              <div className="quiz-modal-footer">
                <button
                  type="button"
                  className="btn quiz-modal-cancel"
                  onClick={closeModal}
                >
                  انصراف
                </button>

                <button
                  type="button"
                  className="btn quiz-modal-save"
                  onClick={saveQuestionFromModal}
                >
                  <i className="fas fa-check" />
                  ذخیره سوال
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InstructorQuizQuestions;
