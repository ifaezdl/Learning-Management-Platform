import React, { useEffect, useState } from "react";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import StudentSidebar from "../common/studentSidebar";
import userService from "../../../services/user.service";
import toast from "react-hot-toast";
import ProfileCard from "../common/profileCard";
interface UserProfile {
  id: number;
  FirstName: string;
  LastName: string;
  UserName: string;
  Email: string;
  Mobile: string;
  Sex_Id: number;
  Avatar: string;
  Role_Id: number;
}
const StudentProfile = () => {
  const route = all_routes;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProfile, setEditProfile] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    mobile: "",
    sexId: 1,
    avatar: "",
  });
  useEffect(() => {
    const loadProfile = async () => {
      debugger;
      try {
        const data = await userService.getProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);
  const handleUpdateProfile = async () => {
    debugger;
    try {
      const updatedUser = await userService.updateProfile(editProfile);

      setProfile(updatedUser?.user);
      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");

      // Update with new values
      const updatedUserData = {
        ...existingUser,
        firstName: updatedUser?.user?.FirstName,
        lastName: updatedUser?.user?.LastName,
        email: updatedUser?.user?.Email,
        mobile: updatedUser?.user?.Mobile,
        userName: updatedUser?.user?.UserName,
      };

      // Store the updated object back
      localStorage.setItem("user", JSON.stringify(updatedUserData));
      setShowEditModal(false);
      toast.success("Update Successfull");
    } catch (err) {
      console.error(err);
    }
  };
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <div className="content mt-5">
        <div className="container">
          {/* profile box */}
          <ProfileCard />
          {/* profile box */}
          <div className="row">
            {/* sidebar */}
            <StudentSidebar />
            {/* sidebar */}
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5 className="fw-bold">پروفایل من</h5>
                <button
                  type="button"
                  className="edit-profile-icon border-0 bg-transparent"
                  onClick={() => {
                    if (!profile) return;

                    setEditProfile({
                      firstName: profile.FirstName,
                      lastName: profile.LastName,
                      userName: profile.UserName,
                      email: profile.Email,
                      mobile: profile.Mobile,
                      sexId: profile.Sex_Id,
                      avatar: profile.Avatar,
                    });

                    setShowEditModal(true);
                  }}
                >
                  <i className="isax isax-edit-2" />
                </button>
              </div>
              <div className="card mb-0">
                <div className="card-body">
                  <h6 className="fs-18 page-title fw-bold">
                    Basic Information
                  </h6>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>First Name</h6>
                        <span>{profile?.FirstName}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Last Name</h6>
                        <span>{profile?.LastName}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>User Name</h6>
                        <span>{profile?.UserName} </span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Phone Number</h6>
                        <span>{profile?.Mobile}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Email</h6>
                        <span>{profile?.Email}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Gender</h6>
                        <span>{profile?.Sex_Id === 5 ? "Male" : "Female"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showEditModal && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Edit Profile</h5>
                <div>
                  <button
                    className="btn-close"
                    onClick={() => setShowEditModal(false)}
                  />
                </div>
              </div>

              <div className="modal-body">
                {/* First Name */}

                <div className="mb-3">
                  <label>First Name</label>

                  <input
                    className="form-control"
                    value={editProfile.firstName}
                    onChange={(e) =>
                      setEditProfile({
                        ...editProfile,
                        firstName: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Last Name */}

                <div className="mb-3">
                  <label>Last Name</label>

                  <input
                    className="form-control"
                    value={editProfile.lastName}
                    onChange={(e) =>
                      setEditProfile({
                        ...editProfile,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Username */}

                <div className="mb-3">
                  <label>Username</label>

                  <input
                    className="form-control"
                    value={editProfile.userName}
                    onChange={(e) =>
                      setEditProfile({
                        ...editProfile,
                        userName: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Email */}

                <div className="mb-3">
                  <label>Email</label>

                  <input
                    className="form-control"
                    value={editProfile.email}
                    onChange={(e) =>
                      setEditProfile({
                        ...editProfile,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Mobile */}

                <div className="mb-3">
                  <label>Mobile</label>

                  <input
                    className="form-control"
                    value={editProfile.mobile}
                    onChange={(e) =>
                      setEditProfile({
                        ...editProfile,
                        mobile: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Gender */}

                <div className="mb-3">
                  <label>Gender</label>

                  <select
                    className="form-select"
                    value={editProfile.sexId}
                    onChange={(e) =>
                      setEditProfile({
                        ...editProfile,
                        sexId: Number(e.target.value),
                      })
                    }
                  >
                    <option value={5}>Male</option>
                    <option value={6}>Female</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-primary"
                  onClick={handleUpdateProfile}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentProfile;
