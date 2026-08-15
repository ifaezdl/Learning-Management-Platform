import React, { useState } from "react";
import ProfileCard from "../common/profileCard";

import CircleProgress from "../../Instructor/instructor-dashboard/circleProgress";
import { Link } from "react-router-dom";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";
import AdminSidebar from "../common/adminSidebar";

const AdminDashboard = () => {
  const [selectedItems, setSelectedItems] = useState(Array(4).fill(false));
  const handleItemClick = (index: number) => {
    setSelectedItems((prevSelectedItems) => {
      const updatedSelectedItems = [...prevSelectedItems];
      updatedSelectedItems[index] = !updatedSelectedItems[index];
      return updatedSelectedItems;
    });
  };
  return (
    <>
      <div className="content mt-5">
        <div className="container">
          {/* profile box */}
          <ProfileCard />
          {/* profile box */}
          <div className="row">
            {/* sidebar */}
            <AdminSidebar />
            {/* sidebar */}
            <div className="col-lg-9">
              <div className="row">
                <div className="col-md-6 col-xl-4">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-primary-transparent me-2 me-xxl-3 flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/icon/graduation.svg"
                            alt=""
                          />
                        </span>
                        <div>
                          <span className="d-block">Enrolled Courses</span>
                          <h4 className="fs-24 mt-1">12</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-xl-4">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-secondary-transparent me-2 me-xxl-3 flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/icon/book.svg"
                            alt=""
                          />
                        </span>
                        <div>
                          <span className="d-block">Active Courses</span>
                          <h4 className="fs-24 mt-1">03</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-xl-4">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-success-transparent me-2 me-xxl-3 flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/icon/bookmark.svg"
                            alt=""
                          />
                        </span>
                        <div>
                          <span className="d-block">Completed Courses</span>
                          <h4 className="fs-24 mt-1">10</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
