import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import { useAuth } from "../../../context/AuthContext";

const PaymentSuccess = () => {
  const { user } = useAuth();
  const route = all_routes;
  const navigate = useNavigate();
  const location = useLocation();
  const result = (location.state as any)?.result;

  return (
    <div className="content mt-5">
      <div className="container">
        <div className="text-center py-5 mx-auto" style={{ maxWidth: 520 }}>
          <div
            className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4"
            style={{
              width: 96,
              height: 96,
              backgroundColor: "#E7F7EE",
              color: "#1AA053",
              fontSize: 42,
            }}
          >
            ✓
          </div>
          <h3 className="mb-2">پرداخت با موفقیت انجام شد</h3>
          <p className="text-gray-6 mb-4">
            خرید شما با موفقیت ثبت شد و اکنون به دوره‌های خریداری‌شده دسترسی
            دارید.
          </p>

          {result?.orderId && (
            <div className="bg-light rounded-3 border p-3 mb-4 text-start">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-gray-6">شماره سفارش</span>
                <span className="fw-medium">{result.orderId}</span>
              </div>
              {result?.total !== undefined && (
                <div className="d-flex justify-content-between">
                  <span className="text-gray-6">مبلغ پرداخت‌شده</span>
                  <span className="fw-medium">
                    {Number(result.total).toLocaleString("fa-IR")} ریال
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="d-flex gap-3 justify-content-center">
            {user?.roleId === 1 && (
              <Link
                to={route.studentCourses ?? route.courseGrid}
                className="btn btn-secondary rounded-pill px-4"
              >
                مشاهده دوره‌های من
              </Link>
            )}
            {user?.roleId === 2 && (
              <Link
                to={route.instructorCourse ?? route.courseGrid}
                className="btn btn-secondary rounded-pill px-4"
              >
                مشاهده دوره‌های من
              </Link>
            )}
            <Link
              to={route.courseGrid}
              className="btn btn-outline-secondary rounded-pill px-4"
            >
              بازگشت به دوره‌ها
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
