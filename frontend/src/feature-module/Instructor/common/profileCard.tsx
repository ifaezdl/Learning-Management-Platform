import React from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { useAuth } from "../../../context/AuthContext";
import { api_base_url } from "../../../environment";

const ProfileCard = () => {
  debugger;
  const { user } = useAuth();

  const avatarUrl = user?.avatar
    ? `${api_base_url}${user.avatar}`
    : "assets/img/user/user-02.jpg";

  return (
    <div className="profile-card overflow-hidden bg-blue-gradient2 mb-5 p-5">
      <div className="profile-card-bg">
        <ImageWithBasePath
          src="assets/img/bg/card-bg-01.png"
          className="profile-card-bg-1"
          alt=""
        />
      </div>

      <div className="row align-items-center row-gap-3">
        <div className="col-lg-6">
          <div className="d-flex align-items-center">
            <span className="avatar avatar-xxl avatar-rounded me-3 border border-white border-2 position-relative">
              {user?.avatar ? (
                <img
                  src={avatarUrl}
                  alt={`${user?.firstName || ""} ${user?.lastName || ""}`}
                  className="img-fluid"
                />
              ) : (
                <img
                  src="../assets/img/user/profileavatar.png"
                  alt={`${user?.firstName || ""} ${user?.lastName || ""}`}
                  className="img-fluid"
                />
              )}
            </span>

            <div>
              <h5 className="mb-1 text-white d-inline-flex align-items-center">
                <Link
                  to={all_routes.studentProfile}
                  className="link-light fs-16 ms-2"
                >
                  {user?.firstName} {user?.lastName}
                </Link>
              </h5>

              <p className="text-light">مدرس</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="d-flex align-items-center flex-wrap gap-3 justify-content-md-end">
            <Link
              to={all_routes.addNewCourse}
              className="btn btn-white rounded-pill"
            >
              افزودن دوره جدید
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
