import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { register as registerUser } from "../store/auth/thunk";
import { Image } from "antd";
import { loginImg } from "../assets";

export const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) navigate("/");
  }, []);

  const onSubmit = async (data) => {
    const response = await dispatch(registerUser(data));
    if (!response.error) {
      setTimeout(() => {
        navigate("/");
      }, 700);
    }
  };

  return (
    <div className="d-lg-flex items-center half">
      <div className="bg w-full order-1 order-md-2">
        <img
          className="object-cover"
          style={{ height: "100vh", width: "100%" }}
          src={loginImg}
          alt="Login Background"
        />
      </div>
      <div className="contents items-center order-2 order-md-1">
        <div
          className="container d-flex justify-content-center align-items-center"
          style={{ minHeight: "100vh" }}
        >
          <div className="col-md-7">
            <h3>
              Register for{" "}
              <strong className="primarycolor mb-0">SB Hotels</strong>
            </h3>
            <p className="mb-4">
              Create an account to enjoy personalized experiences.
            </p>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group first">
                <label>Username</label>
                <input
                  type="text"
                  className={`rounded-3xl p-2 w-full ${
                    errors.username ? "is-invalid" : ""
                  }`}
                  {...register("username", {
                    required: "Username cannot be empty",
                    minLength: {
                      value: 6,
                      message: "Username must have at least 6 characters",
                    },
                    maxLength: {
                      value: 200,
                      message: "Username must not exceed 200 characters",
                    },
                  })}
                />
              </div>
              {errors.username && (
                <p className="invalid-feedback text-red-500 font-medium text-base">
                  {errors.username.message}
                </p>
              )}

              <div className="form-group first mb-3">
                <label>Email</label>
                <input
                  type="email"
                  className={`rounded-3xl p-2 w-full ${
                    errors.email ? "is-invalid" : ""
                  }`}
                  {...register("email", {
                    required: "Email không được trống",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Email không hợp lệ",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="invalid-feedback text-red-500 font-medium text-base">
                  {errors.email.message}
                </p>
              )}

              <div className="form-group last mb-3">
                <label>Password</label>
                <input
                  type="password"
                  className={`rounded-3xl p-2 w-full${
                    errors.password ? "is-invalid" : ""
                  }`}
                  {...register("password", {
                    required: "Mật khẩu không được trống",
                    minLength: {
                      value: 6,
                      message: "Mật khẩu phải có ít nhất 6 ký tự",
                    },
                    maxLength: {
                      value: 200,
                      message: "Mật khẩu không được vượt quá 200 ký tự",
                    },
                  })}
                />
              </div>
              {errors.password && (
                <p className="invalid-feedback text-red-500 font-medium text-base">
                  {errors.password.message}
                </p>
              )}

              <div className="form-group last mb-3">
                <label>Confirm Password</label>
                <input
                  type="password"
                  className={`rounded-3xl p-2 w-full${
                    errors.confirmPassword ? "is-invalid" : ""
                  }`}
                  {...register("confirmPassword", {
                    required: "Vui lòng xác nhận mật khẩu",
                    validate: (value) =>
                      value === watch("password") || "Mật khẩu không khớp",
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="invalid-feedback text-red-500 font-medium text-base">
                  {errors.confirmPassword.message}
                </p>
              )}

              {error && (
                <p className="text-red-500 text-sm font-medium">{error}</p>
              )}
              <Link to="/login">You have an account? Log in here!</Link>

              <div className="form-group flex flex-wrap">
                <button
                  className="w-full rounded-xl py-2 px-3 btn-primary ml-auto my-2"
                  disabled={loading}
                >
                  {loading && (
                    <span className="spinner-border spinner-border-sm"></span>
                  )}
                  <span>Sign Up</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
