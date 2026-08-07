import React, { useEffect, useState } from "react";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import cartService, { CartItem } from "../../../services/cart.service";

const CourseCart = () => {
  const route = all_routes;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    debugger;
    try {
      setLoading(true);
      setError(null);
      const data = await cartService.getCart();
      setCartItems(data);
    } catch (err: any) {
      console.log("Status:", err.response?.status);
      console.log("Data:", err.response?.data);
      console.log("Headers:", err.response?.headers);
      console.log(err);
      setError("خطا در دریافت اطلاعات سبد خرید");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (courseId: number) => {
    try {
      setRemovingId(courseId);
      await cartService.removeFromCart(courseId);
      setCartItems((prev) =>
        prev.filter((item) => item.Course_Id !== courseId),
      );
    } catch {
      setError("خطا در حذف دوره از سبد خرید");
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      setClearing(true);
      await cartService.clearCart();
      setCartItems([]);
    } catch {
      setError("خطا در خالی کردن سبد خرید");
    } finally {
      setClearing(false);
    }
  };

  const getPrice = (item: CartItem) =>
    item.Courses.DiscountPrice ?? item.Courses.Price;
  const subTotal = cartItems.reduce(
    (sum, item) => sum + Number(getPrice(item)),
    0,
  );

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

  return (
    <>
      <>
        {/* Cart */}
        <div className="content mt-5">
          <div className="container">
            {error && (
              <div className="alert alert-danger mb-4" role="alert">
                {error}
              </div>
            )}
            <div className="cart-cover">
              <div className="cart-items">
                <div>
                  <div className="cart-head border-bottom d-flex justify-content-between align-items-center pb-4">
                    <h5 className="mb-0">{cartItems.length} دوره</h5>
                    {cartItems.length > 0 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-danger-ghost mb-0"
                        onClick={handleClearCart}
                        disabled={clearing}
                      >
                        <i className="isax isax-close-circle me-1" />
                        {clearing
                          ? "در حال خالی کردن..."
                          : "خالی کردن سبد خرید"}
                      </button>
                    )}
                  </div>

                  {cartItems.length === 0 ? (
                    <div className="text-center py-5">
                      <h6 className="mb-3">سبد خرید شما خالی است</h6>
                      <Link
                        to={route.courseGrid}
                        className="btn continue-shopping-btn rounded-pill"
                      >
                        مشاهده دوره‌ها
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="row row-gap-3 pb-3 mb-3 border-bottom">
                        {cartItems.map((item) => (
                          <div className="col-md-12" key={item.Id}>
                            <div className="cart-item mb-0">
                              <div className="row align-items-center row-gap-3">
                                <div className="col-md-3">
                                  <div className="cart-img">
                                    <Link
                                      to={route.courseDetails.replace(
                                        ":id",
                                        String(item.Course_Id),
                                      )}
                                    >
                                      <ImageWithBasePath
                                        src={
                                          item.Courses.Thumbnail ||
                                          "assets/img/course/course-01.jpg"
                                        }
                                        alt="img"
                                        className="img-fluid w-100"
                                      />
                                    </Link>
                                  </div>
                                </div>
                                <div className="col-md-9">
                                  <div className="row align-items-center justify-content-between">
                                    <div className="col-md-9">
                                      <div className="mb-2">
                                        <h6 className="fs-18 mb-0">
                                          <Link
                                            to={route.courseDetails.replace(
                                              ":id",
                                              String(item.Course_Id),
                                            )}
                                          >
                                            {item.Courses.Title}
                                          </Link>
                                        </h6>
                                      </div>
                                      {item.Courses.ShortDescription && (
                                        <p className="mb-0 text-muted fs-14">
                                          {item.Courses.ShortDescription}
                                        </p>
                                      )}
                                    </div>
                                    <div className="col-md-3">
                                      <div className="d-flex align-items-center justify-content-end gap-4 cart-trash">
                                        <h5 className="text-secondary">
                                          ${Number(getPrice(item)).toFixed(2)}
                                        </h5>
                                        <button
                                          type="button"
                                          className="trash-btn btn p-0 border-0 bg-transparent"
                                          onClick={() =>
                                            handleRemove(item.Course_Id)
                                          }
                                          disabled={
                                            removingId === item.Course_Id
                                          }
                                          aria-label="حذف از سبد خرید"
                                        >
                                          <i className="isax isax-trash4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-light border rounded-2 p-3 mb-4">
                        <div className="row align-items-center justify-content-between row-gap-3">
                          <div className="col-md-6">
                            <h6 className="mb-1">جمع جزء</h6>
                            <p className="mb-0">
                              تمام دوره‌ها شامل{" "}
                              <span className="text-gray-9 fw-medium mx-1">
                                ۳۰ روز
                              </span>
                              ضمانت بازگشت وجه هستند
                            </p>
                          </div>
                          <div className="col-md-6 text-end">
                            <h5>${subTotal.toFixed(2)}</h5>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center justify-content-end flex-wrap">
                        <Link
                          to={route.courseGrid}
                          className="btn continue-shopping-btn rounded-pill me-2"
                        >
                          ادامه خرید
                        </Link>
                        <Link
                          to={route.courseCheckout}
                          className="btn checkout-btn rounded-pill"
                        >
                          تسویه حساب
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /Cart */}
      </>
    </>
  );
};

export default CourseCart;
