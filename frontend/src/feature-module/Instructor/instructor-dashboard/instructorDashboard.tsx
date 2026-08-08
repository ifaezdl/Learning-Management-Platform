import React, { useState } from "react";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ProfileCard from "../common/profileCard";
import InstructorSidebar from "../common/instructorSidebar";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import PredefinedDateRanges from "../../../core/common/range-picker/datePicker";
import ReactApexChart from "react-apexcharts";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
const InstructorDashboard = () => {
  const [toursChart] = useState<any>({
    chart: {
      height: 290,
      type: "bar",
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
            offsetX: -10,
            offsetY: 0,
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        borderRadius: 5,
        horizontal: false,
        endingShape: "rounded",
      },
    },
    series: [
      {
        name: "Earnings",
        data: [80, 100, 70, 110, 80, 90, 85, 85, 110, 30, 100, 90],
      },
    ],
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      labels: {
        style: {
          colors: "#4D4D4D",
          fontSize: "13px",
        },
      },
    },
    yaxis: {
      labels: {
        offsetX: -15,
        style: {
          colors: "#4D4D4D",
          fontSize: "13px",
        },
      },
    },
    grid: {
      borderColor: "#4D4D4D",
      strokeDashArray: 5,
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false, // Disable data labels
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "linear",
        shadeIntensity: 0.35,
        gradientToColors: ["#392C7D"], // Second gradient color
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
        angle: 90, // This sets the gradient direction from top to bottom
      },
    },
  });
  return (
    <>
      <div className="content mt-5">
        <div className="container">
          <ProfileCard />

          <div className="row">
            {/* Sidebar */}
            <InstructorSidebar />
            {/* /Sidebar */}
            <div className="col-lg-9">
              <div className="row">
                <div className="col-md-6 col-xl-4">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-purple-transparent me-2 me-xxl-3 flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/icon/money-add.svg"
                            alt=""
                          />
                        </span>
                        <div>
                          <span className="d-block">مجموع دوره ها</span>
                          <h4 className="fs-24 mt-1"> 486 ریال</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-xl-4">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-info-transparent me-2 me-xxl-3 flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/icon/user-octagon.svg"
                            alt=""
                          />
                        </span>
                        <div>
                          <span className="d-block">دوره های پیش نویس</span>
                          <h4 className="fs-24 mt-1">17</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-xl-4">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-blue-transparent me-2 me-xxl-3 flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/icon/book-2.svg"
                            alt=""
                          />
                        </span>
                        <div>
                          <span className="d-block">دوه های منتشر شده</span>
                          <h4 className="fs-24 mt-1">11</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center flex-wrap gap-3 justify-content-between border-bottom mb-2 pb-3">
                    <h5 className="fw-bold">میزان درآمد سال</h5>
                    <div className="input-icon position-relative input-range-picker">
                      <span className="input-icon-addon">
                        <i className="isax isax-calendar" />
                      </span>
                      <PredefinedDateRanges />
                    </div>
                  </div>
                  <div id="earnnings_chart" />

                  <ReactApexChart
                    options={toursChart}
                    series={toursChart.series}
                    type="bar"
                    height={290}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorDashboard;
