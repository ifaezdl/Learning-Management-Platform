import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { all_routes } from "../../router/all_routes";
import StudentSidebar from "../common/studentSidebar";
import ProfileCard from "../common/profileCard";
import quizService, {
  StudentQuizListItem,
} from "../../../services/quiz.service";

const statusLabel: Record<StudentQuizListItem["status"], string> = {
  upcoming: "هنوز شروع نشده",
  available: "در حال برگزاری",
  closed: "پایان یافته",
};

const StudentQuiz = () => {
  const route = all_routes;
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<StudentQuizListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<number | null>(null);

  useEffect(() => {
    quizService
      .myQuizzes()
      .then(setQuizzes)
      .finally(() => setLoading(false));
  }, []);

  const handleStart = async (q: StudentQuizListItem) => {
    if (q.status === "upcoming") {
      toast.error("این آزمون هنوز شروع نشده است.");
      return;
    }
    if (q.status === "closed") {
      toast.error("مهلت شرکت در این آزمون به پایان رسیده است.");
      return;
    }
    if (q.attempted) {
      toast.error("شما قبلاً در این آزمون شرکت کرده‌اید.");
      return;
    }
    setStarting(q.quizId);
    try {
      const attempt = await quizService.startQuiz(q.courseId);
      navigate(route.studentQuizQuestion, { state: { attempt } });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "شروع آزمون با خطا مواجه شد.",
      );
    } finally {
      setStarting(null);
    }
  };

  return (
    <div className="content mt-5">
      <div className="container">
        <ProfileCard />
        <div className="row">
          <StudentSidebar />
          <div className="col-lg-9">
            <div className="page-title d-flex align-items-center justify-content-between">
              <h5>آزمون های من</h5>
            </div>

            {loading ? (
              <div className="text-center py-5">در حال بارگذاری...</div>
            ) : quizzes.length === 0 ? (
              <div className="text-center text-muted py-5">
                آزمونی برای دوره‌های شما یافت نشد.
              </div>
            ) : (
              quizzes.map((q) => (
                <div
                  key={q.quizId}
                  className="d-flex align-items-center justify-content-between border p-3 mb-3 rounded-2"
                >
                  <div>
                    <h6 className="mb-1">{q.title}</h6>
                    <p className="fs-14 mb-1">{q.courseTitle}</p>
                    <p className="fs-14 mb-0">
                      تعداد سوالات : {q.questionsToShow} &nbsp;|&nbsp;
                      <span
                        className={
                          q.status === "available"
                            ? "text-success"
                            : q.status === "closed"
                              ? "text-danger"
                              : "text-warning"
                        }
                      >
                        {" "}
                        {statusLabel[q.status]}
                      </span>
                      {q.attempted && q.attemptResult && (
                        <span className="ms-2">
                          (نتیجه: {q.attemptResult.score}/
                          {q.attemptResult.maxScore} —{" "}
                          {q.attemptResult.isPassed ? "قبول" : "مردود"})
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={starting === q.quizId || q.attempted}
                      onClick={() => handleStart(q)}
                    >
                      شرکت در آزمون
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQuiz;
