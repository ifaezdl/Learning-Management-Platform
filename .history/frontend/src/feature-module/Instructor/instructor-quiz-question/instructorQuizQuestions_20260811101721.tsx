import React, { useState } from "react";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import InstructorSidebar from "../common/instructorSidebar";
import ProfileCard from "../common/profileCard";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import CustomSelect from "../../../core/common/commonSelect";

const InstructorQuizQuestions = () => {
  const options = [
    { label: "چند انتخابی", value: "1" },
    { label: "صحیح و غلط", value: "2" },
  ];

  const [items, setItems] = useState<string[]>([]);

  const addNewItem = () => {
    setItems([...items, ""]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  return (
    <>
      <div className="content">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="card bg-light">
                <div className="card-body">
                  <div className="row align-items-center gy-3">
                    <div className="col-xl-8">
                      <div>
                        <div className="d-sm-flex align-items-center">
                          <div className="quiz-img me-3 mb-2 mb-sm-0">
                            <ImageWithBasePath
                              src="assets/img/students/quiz.jpg"
                              alt=""
                            />
                          </div>
                          <div>
                            <h5 className="mb-2">
                              <Link to="#">
                                Information About UI/UX Design Degree
                              </Link>
                            </h5>
                            <div className="question-info d-flex align-items-center">
                              <p className="d-flex align-items-center fs-14 me-2 pe-2 border-end mb-0">
                                <i className="isax isax-message-question5 text-primary-soft me-2"></i>
                                25 Questions
                              </p>
                              <p className="d-flex align-items-center fs-14 mb-0">
                                <i className="isax isax-clock5 text-secondary-soft me-2"></i>
                                30 Minutes
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-4">
                      <div className="d-flex align-items-center justify-content-sm-end">
                        {/* <Link
                          to={all_routes.instructorQuizResult}
                          className="text-info text-decoration-underline fs-12 fw-medium me-3"
                        >
                          View Results
                        </Link> */}
                        <Link
                          to="#"
                          className="btn btn-secondary"
                          data-bs-toggle="modal"
                          data-bs-target="#add_question"
                        >
                          افزودن سوال
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6>Which of the following is a principle of UX design?</h6>
                    <div className="d-flex align-items-center justify-content-end">
                      <Link
                        to="#"
                        className="d-inline-flex fs-14 me-2 action-icon"
                        data-bs-toggle="modal"
                        data-bs-target="#edit_question"
                      >
                        <i className="isax isax-edit-2"></i>
                      </Link>
                      <Link
                        to="#"
                        className="d-inline-flex fs-14 action-icon"
                        data-bs-toggle="modal"
                        data-bs-target="#delete_modal"
                      >
                        <i className="isax isax-trash"></i>
                      </Link>
                    </div>
                  </div>
                  <div>
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="qusetion-1"
                        id="Radio-sm-1"
                      />
                      <label className="form-check-label" htmlFor="Radio-sm-1">
                        Minimalistic Design
                      </label>
                    </div>
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="qusetion-1"
                        id="Radio-sm-2"
                        checked
                      />
                      <label className="form-check-label" htmlFor="Radio-sm-2">
                        User-Centered Design
                      </label>
                    </div>
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="qusetion-1"
                        id="Radio-sm-3"
                      />
                      <label className="form-check-label" htmlFor="Radio-sm-3">
                        Gradient Usage
                      </label>
                    </div>
                    <div className="form-check mb-0">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="qusetion-1"
                        id="Radio-sm-4"
                      />
                      <label className="form-check-label" htmlFor="Radio-sm-4">
                        Typography Hierarchy
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Link to="#" className="btn btn-secondary">
                  Load More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <>
        {/* Add Question */}
        <div className="modal fade" id="add_question">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="fw-bold">Add New Question</h5>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="isax isax-close-circle5" />
                </button>
              </div>
              <form>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">
                      Question <span className="text-danger"> *</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Question Type <span className="text-danger"> *</span>
                    </label>
                    <CustomSelect className="select" options={options} />
                  </div>
                  <h6 className="mb-3">Answer</h6>
                  <div className="add-choice-data">
                    <div className="mb-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <label className="form-label">
                          Choice 1 <span className="text-danger"> *</span>
                        </label>
                        <div className="form-check form-switch form-switch-end">
                          <label
                            className="form-check-label"
                            htmlFor="switch-sm"
                          >
                            Correct Answer
                          </label>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="switch-sm"
                            defaultChecked
                          />
                        </div>
                      </div>
                      <input type="text" className="form-control" />
                    </div>

                    {items.map((item, index) => (
                      <>
                        <div className="mb-3 extra-choice-row" key={index}>
                          <div className="d-flex align-items-end justify-content-between">
                            <div className="flex-fill">
                              <div className="d-flex align-items-center justify-content-between">
                                <label className="form-label">
                                  Choice {2 + index}{" "}
                                  <span className="text-danger"> *</span>
                                </label>
                                <div className="form-check form-switch form-switch-end">
                                  <label
                                    className="form-check-label"
                                    htmlFor="switch-sm2"
                                  >
                                    Correct Answer
                                  </label>
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id="switch-sm2"
                                  />
                                </div>
                              </div>
                              <input type="text" className="form-control" />
                            </div>
                            <Link
                              onClick={(e) => {
                                e.preventDefault();
                                removeItem(index);
                              }}
                              to="#"
                              className="delete-item ms-4"
                            >
                              <i className="isax isax-trash" />
                            </Link>
                          </div>
                        </div>
                      </>
                    ))}
                  </div>
                  <Link
                    to="#"
                    className="text-secondary d-inline-flex align-items-center fw-medium add-choice"
                    onClick={addNewItem}
                  >
                    <i className="isax isax-add me-1" />
                    Add New
                  </Link>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn bg-gray-100 rounded-pill me-2"
                    type="button"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-secondary rounded-pill"
                    type="button"
                    data-bs-dismiss="modal"
                  >
                    Add Question
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Add Question */}
        {/* Add Question */}
        <div className="modal fade" id="edit_question">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="fw-bold">ویرایش سوال</h5>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="isax isax-close-circle5" />
                </button>
              </div>
              <form>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">
                      Question <span className="text-danger"> *</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="Which of the following is a principle of UX design?"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Question Type <span className="text-danger"> *</span>
                    </label>
                    <CustomSelect
                      className="select"
                      options={options}
                      defaultValue={options[0]}
                    />
                  </div>
                  <h6 className="mb-3">Answer</h6>
                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <label className="form-label">
                        Choice 1 <span className="text-danger"> *</span>
                      </label>
                      <div className="form-check form-switch form-switch-end">
                        <label
                          className="form-check-label correct-ans"
                          htmlFor="switch-sm3"
                        >
                          Correct Answer
                        </label>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="switch-sm3"
                          defaultChecked
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="Minimalistic Design"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <label className="form-label">
                        Choice 2 <span className="text-danger"> *</span>
                      </label>
                      <div className="form-check form-switch form-switch-end">
                        <label
                          className="form-check-label"
                          htmlFor="switch-sm4"
                        >
                          Correct Answer
                        </label>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="switch-sm4"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="User-Centered Design"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <label className="form-label">
                        Choice 3 <span className="text-danger"> *</span>
                      </label>
                      <div className="form-check form-switch form-switch-end">
                        <label
                          className="form-check-label"
                          htmlFor="switch-sm5"
                        >
                          Correct Answer
                        </label>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="switch-sm5"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="Gradient Usage"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <label className="form-label">
                        Choice 4 <span className="text-danger"> *</span>
                      </label>
                      <div className="form-check form-switch form-switch-end">
                        <label
                          className="form-check-label"
                          htmlFor="switch-sm6"
                        >
                          Correct Answer
                        </label>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="switch-sm6"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="Typography Hierarchy"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn bg-gray-100 rounded-pill me-2"
                    type="button"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-secondary rounded-pill"
                    type="button"
                    data-bs-dismiss="modal"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Add Question */}
        {/* Delete Modal */}
        <div className="modal fade" id="delete_modal">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body text-center custom-modal-body">
                <span className="avatar avatar-lg bg-secondary-transparent rounded-circle mb-2">
                  <i className="isax isax-trash fs-24 text-danger" />
                </span>
                <div>
                  <h4 className="mb-2">Delete Quiz</h4>
                  <p className="mb-3">
                    Are you sure you want to delete Quiz “Information About
                    UI/UX Design Degree”?
                  </p>
                  <div className="d-flex align-items-center justify-content-center">
                    <Link
                      to="#"
                      className="btn bg-gray-100 rounded-pill me-2"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </Link>
                    <Link
                      to="#"
                      className="btn btn-secondary rounded-pill"
                      data-bs-dismiss="modal"
                    >
                      Yes, Delete
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /Delete Modal */}
      </>
    </>
  );
};

export default InstructorQuizQuestions;
