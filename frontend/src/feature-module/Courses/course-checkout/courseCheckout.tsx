import React, { useEffect, useState } from "react";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { Link, useNavigate } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import cartService, { CartItem } from "../../../services/cart.service";
import paymentService from "../../../services/payment.service";
import { useDispatch } from "react-redux";
import { refreshCartCount } from "../../../core/redux/cartSlice";
import { api_base_url } from "../../../environment";
import toast from "react-hot-toast";

// درگاه‌های پرداخت نمایشی (فقط جهت انتخاب بصری - هیچ تراکنش واقعی رخ نمی‌دهد)
const paymentGateways = [
  { id: "zarinpal", name: "زرین‌پال", color: "#F8C300", textColor: "#1a1a1a" },
  { id: "mellat", name: "به‌پرداخت ملت", color: "#EF3E36", textColor: "#fff" },
  {
    id: "saman",
    name: "سامان کیش (سداد)",
    color: "#00A99D",
    textColor: "#fff",
  },
  { id: "parsian", name: "پارسیان", color: "#0B5AA5", textColor: "#fff" },
  {
    id: "asanpardakht",
    name: "آسان‌پرداخت",
    color: "#2E9CCA",
    textColor: "#fff",
  },
  { id: "idpay", name: "آیدی‌پی", color: "#3AAE2D", textColor: "#fff" },
  { id: "payping", name: "پی‌پینگ", color: "#6C5CE7", textColor: "#fff" },
  { id: "vandar", name: "وندار", color: "#FF6B35", textColor: "#fff" },
];

const CourseCheckout = () => {
  const route = all_routes;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<string>(
    paymentGateways[0].id,
  );

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cartService.getCart();
      setCartItems(data);
    } catch (err: any) {
      setError("خطا در دریافت اطلاعات سبد خرید");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (courseId: number) => {
    try {
      await cartService.removeFromCart(courseId);
      setCartItems((prev) =>
        prev.filter((item) => item.Course_Id !== courseId),
      );
      dispatch(refreshCartCount() as any);
      toast.success("دوره باموفقیت از سبد خرید شما حذف شد.");
    } catch (err) {
      setError("خطا در حذف دوره از سبد خرید");
    }
  };

  const getPrice = (item: CartItem) => {
    const course = item.Courses;
    return course.DiscountPrice ?? course.Price;
  };

  const subTotal = cartItems.reduce(
    (sum, item) => sum + Number(getPrice(item)),
    0,
  );
  // Simulated checkout: no real tax engine, this project has no payment gateway.
  const total = subTotal;

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    try {
      setPaying(true);
      setError(null);
      const result = await paymentService.checkout();
      // Checkout clears the cart on the server, so resync the badge.
      dispatch(refreshCartCount() as any);
      navigate(route.paymentSuccess, { state: { result } });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "پرداخت با مشکل مواجه شد. دوباره تلاش کنید.";
      setError(message);
      navigate(route.paymentFailure, { state: { message } });
    } finally {
      setPaying(false);
    }
  };
  if (loading) {
    return (
      <>
        <div className="content mt-5">
          <div className="container text-center py-5">
            <p>در حال بارگذاری سبد خرید...</p>
          </div>
        </div>
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <div className="content mt-5">
          <div className="container text-center py-5">
            <h5 className="mb-3">سبد خرید شما خالی است</h5>
            <Link
              to={route.courseGrid}
              className="btn btn-secondary rounded-pill"
            >
              مشاهده دوره‌ها
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <>
        {/* Checkout */}
        <div className="content mt-5">
          <div className="container">
            <div className="checkout-content">
              {error && (
                <div className="alert alert-danger mb-4" role="alert">
                  {error}
                </div>
              )}
              <div className="row">
                {/* ستون سبد خرید - بزرگ‌تر شده */}
                <div className="col-lg-8">
                  <div className="checkout-item-1 bg-light p-4 rounded-3 border mb-4">
                    <div className="border-bottom pb-3 mb-4">
                      <h4 className="mb-1">سبد خرید</h4>
                      <p className="text-gray-6 mb-0">
                        {cartItems.length} دوره در سبد خرید شما
                      </p>
                    </div>

                    {cartItems.map((item, index) => (
                      <div
                        className={`d-flex align-items-center p-3 rounded-3 bg-white border ${index !== cartItems.length - 1 ? "mb-3" : ""
                          }`}
                        key={item.Id}
                      >
                        <div
                          className="position-relative flex-shrink-0 me-4"
                          style={{
                            width: 160,
                            height: 110,
                            borderRadius: 12,
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={
                              `${api_base_url}${item.Courses.Thumbnail}` ||
                              "assets/img/course/course-01.jpg"
                            }
                            alt="img"
                            className="w-100 h-100"
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div className="flex-grow-1">
                          <h5 className="mb-2">
                            <Link
                              to={route.courseDetails.replace(
                                ":id",
                                String(item.Course_Id),
                              )}
                            >
                              {item.Courses.Title}
                            </Link>
                          </h5>
                          <h5 className="text-secondary mb-0">
                            {Number(getPrice(item)).toLocaleString("fa-IR")}{" "}
                            ریال
                          </h5>
                        </div>
                        <button
                          type="button"
                          className="btn btn-light rounded-circle p-2 flex-shrink-0"
                          onClick={() => handleRemoveItem(item.Course_Id)}
                          aria-label="حذف از سبد خرید"
                          style={{ width: 42, height: 42 }}
                        >
                          <i className="isax isax-trash text-danger" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* درگاه‌های پرداخت (نمایشی) */}
                  <div className="checkout-payment bg-light p-4 rounded-3 border">
                    <div className="border-bottom pb-3 mb-4">
                      <h5 className="mb-1">روش پرداخت</h5>
                      <p className="text-gray-6 mb-0">
                        یکی از درگاه‌های زیر را انتخاب کنید
                      </p>
                    </div>
                    <div className="row g-3">
                      {paymentGateways.map((gw) => {
                        const isSelected = selectedGateway === gw.id;
                        return (
                          <div className="col-md-3 col-6" key={gw.id}>
                            <button
                              type="button"
                              onClick={() => setSelectedGateway(gw.id)}
                              className="w-100 border-0 p-0 bg-transparent"
                              style={{ cursor: "pointer" }}
                            >
                              <div
                                className="d-flex flex-column align-items-center justify-content-center rounded-3 p-3"
                                style={{
                                  border: isSelected
                                    ? "2px solid #0B5AA5"
                                    : "2px solid #e5e7eb",
                                  backgroundColor: "#fff",
                                  transition: "all 0.15s ease",
                                  position: "relative",
                                  minHeight: 90,
                                }}
                              >
                                {isSelected && (
                                  <span
                                    className="d-flex align-items-center justify-content-center rounded-circle"
                                    style={{
                                      position: "absolute",
                                      top: 6,
                                      left: 6,
                                      width: 20,
                                      height: 20,
                                      backgroundColor: "#0B5AA5",
                                      color: "#fff",
                                      fontSize: 12,
                                    }}
                                  >
                                    ✓
                                  </span>
                                )}
                                <div
                                  className="rounded-2 d-flex align-items-center justify-content-center mb-2"
                                  style={{
                                    width: 48,
                                    height: 32,
                                    backgroundColor: gw.color,
                                    color: gw.textColor,
                                    fontSize: 11,
                                    fontWeight: 700,
                                  }}
                                >
                                  {gw.name.slice(0, 2)}
                                </div>
                                <span
                                  className="text-center"
                                  style={{ fontSize: 13, color: "#1a1a1a" }}
                                >
                                  {gw.name}
                                </span>
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <p
                      className="text-gray-6 mt-3 mb-0"
                      style={{ fontSize: 13 }}
                    >
                      * انتخاب درگاه صرفاً جهت نمایش است و بر فرآیند پرداخت
                      آزمایشی تأثیری ندارد.
                    </p>
                  </div>

                  <div className="mt-4">
                    <h6>پرداخت آزمایشی</h6>
                    <p className="text-gray-6 mb-0">
                      این یک درگاه پرداخت واقعی نیست. با کلیک روی دکمه «پرداخت»،
                      خرید شما به‌صورت آزمایشی موفق ثبت می‌شود، در دوره‌های
                      انتخابی ثبت‌نام می‌شوید و بلافاصله به محتوای آموزشی دسترسی
                      خواهید داشت.
                    </p>
                  </div>
                </div>

                {/* ستون خلاصه سفارش */}
                <div className="col-lg-4">
                  <div className="checkout-item-2">
                    <div className="pb-3 border-bottom mb-3">
                      <h5 className="mb-0">جزئیات سفارش</h5>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <p className="mb-0">جمع جزء</p>
                      <p className="text-gray-9 fw-medium mb-0">
                        {subTotal.toLocaleString("fa-IR")} ریال
                      </p>
                    </div>
                    <div className="total d-flex align-items-center justify-content-between border-top pt-3 mb-3">
                      <h6 className="mb-0">مبلغ قابل پرداخت</h6>
                      <h4 className="mb-0">
                        {total.toLocaleString("fa-IR")} ریال
                      </h4>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary rounded-pill w-100"
                      onClick={handleCheckout}
                      disabled={paying}
                    >
                      {paying ? "در حال پردازش..." : "پرداخت"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /Checkout */}
      </>
    </>
  );
};
export default CourseCheckout;
