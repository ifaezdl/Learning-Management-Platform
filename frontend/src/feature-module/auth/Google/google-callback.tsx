import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import userService from "../../../services/user.service";

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const handleGoogleLogin = async () => {
            const token = searchParams.get("token");
            const refreshToken = searchParams.get("refreshToken");

            if (!token || !refreshToken) {
                navigate(all_routes.login);
                return;
            }

            // اول توکن‌ها رو ذخیره کن تا userService بتونه ازشون استفاده کنه
            localStorage.setItem("accessToken", token);
            localStorage.setItem("refreshToken", refreshToken);

            try {
                const profile = await userService.getProfile();

                const user = {
                    id: profile.Id,
                    firstName: profile.FirstName,
                    lastName: profile.LastName,
                    userName: profile.UserName,
                    email: profile.Email,
                    mobile: profile.Mobile,
                    avatar: profile.Avatar,
                    sexId: profile.Sex_Id,
                    roleId: profile.Role_Id,
                };

                localStorage.setItem("user", JSON.stringify(user));

                // reload کامل تا AuthContext با اطلاعات کامل initialize بشه
                window.location.href = all_routes.homeone;
            } catch (error) {
                console.error("Failed to load user profile:", error);

                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");

                navigate(all_routes.login);
            }
        };

        handleGoogleLogin();
    }, [searchParams, navigate]);

    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "100vh" }}
        >
            <p>در حال ورود به حساب کاربری...</p>
        </div>
    );
};

export default GoogleCallback;