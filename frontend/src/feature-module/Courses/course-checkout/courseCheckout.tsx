import React, { useEffect, useState } from "react";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { Link, useNavigate } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import cartService, { CartItem } from "../../../services/cart.service";
import paymentService from "../../../services/payment.service";

const CourseCheckout = () => {
  const route = all_routes;
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // Pass the result forward so the success page can show a summary
      // without making another request.
      // navigate(route.paymentSuccess, { state: { result } })
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "پرداخت با مشکل مواجه شد. دوباره تلاش کنید.",
      );
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <>
        <Breadcrumb title="تسویه حساب" />
        <div className="content">
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
        <Breadcrumb title="تسویه حساب" />
        <div className="content">
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
      <Breadcrumb title="تسویه حساب" />
      <>
        {/* Checkout */}
        <div className="content">
          <div className="container">
            <div className="checkout-content">
              {error && (
                <div className="alert alert-danger mb-4" role="alert">
                  {error}
                </div>
              )}
              <div className="row">
                <div className="col-lg-8">
                  <div className="checkout-item-1">
                    <div className="border-bottom pb-3 mb-3">
                      <h5>پرداخت آزمایشی</h5>
                    </div>
                    <p className="text-gray-6 mb-0">
                      این یک درگاه پرداخت واقعی نیست. با کلیک روی دکمه «پرداخت»،
                      خرید شما به‌صورت آزمایشی موفق ثبت می‌شود، در دوره‌های
                      انتخابی ثبت‌نام می‌شوید و بلافاصله به محتوای آموزشی دسترسی
                      خواهید داشت.
                    </p>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="checkout-item-2">
                    <div className="pb-3 border-bottom mb-3">
                      <h5 className="mb-0">جزئیات سفارش</h5>
                    </div>
                    <div className="checkout-item-3 bg-light p-3 rounded-3 border mb-3">
                      {cartItems.map((item, index) => (
                        <div
                          className={`row row-gap-2 ${index !== cartItems.length - 1 ? "mb-3" : ""
                            }`}
                          key={item.Id}
                        >
                          <div className="col-md-12 d-flex align-items-center">
                            <div className="order-img flex-shrink-0 me-3">
                              <ImageWithBasePath
                                src={
                                  item.Courses.Thumbnail ||
                                  "assets/img/course/course-01.jpg"
                                }
                                alt="img"
                                className="img-fluid h-100 w-100"
                              />
                              <button
                                type="button"
                                className="btn p-1 rounded-circle"
                                onClick={() => handleRemoveItem(item.Course_Id)}
                                aria-label="حذف از سبد خرید"
                              >
                                <i className="isax isax-trash" />
                              </button>
                            </div>
                            <div>
                              <h6 className="mb-2">
                                <Link
                                  to={route.courseDetails.replace(
                                    ":id",
                                    String(item.Course_Id),
                                  )}
                                >
                                  {item.Courses.Title}
                                </Link>
                              </h6>
                              <h6 className="text-secondary">
                                ${Number(getPrice(item)).toFixed(2)}
                              </h6>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <p className="mb-0">جمع جزء</p>
                      <p className="text-gray-9 fw-medium mb-0">
                        ${subTotal.toFixed(2)}
                      </p>
                    </div>
                    <div className="total d-flex align-items-center justify-content-between border-top pt-3 mb-3">
                      <h6 className="mb-0">مبلغ قابل پرداخت</h6>
                      <h4 className="mb-0">${total.toFixed(2)}</h4>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary rounded-pill w-100"
                      onClick={handleCheckout}
                      disabled={paying}
                    >
                      {paying
                        ? "در حال پردازش..."
                        : `پرداخت $${total.toFixed(2)}`}
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
