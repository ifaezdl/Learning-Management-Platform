import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { all_routes } from "../../router/all_routes";

const PaymentFailure = () => {
  const route = all_routes;
  const navigate = useNavigate();
  const location = useLocation();
  const errorMessage =
    (location.state as any)?.message || "پرداخت با مشکل مواجه شد.";

  return (
    <div className="content mt-5">
      <div className="container">
        <div className="text-center py-5 mx-auto" style={{ maxWidth: 520 }}>
          <div
            className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4"
            style={{
              width: 96,
              height: 96,
              backgroundColor: "#FDECEC",
              color: "#E4423F",
              fontSize: 42,
            }}
          >
            ✕
          </div>
          <h3 className="mb-2">پرداخت ناموفق بود</h3>
          <p className="text-gray-6 mb-4">{errorMessage}</p>

          <div className="d-flex gap-3 justify-content-center">
            <button
              type="button"
              className="btn btn-secondary rounded-pill px-4"
              onClick={() => navigate(route.courseCheckout)}
            >
              تلاش مجدد
            </button>
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

export default PaymentFailure;
