import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { login } from "../store/auth/thunk";
import { FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Image } from "antd";
import { loginImg } from "../assets";

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth); // Extract loading and error states
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm(); // Setup react-hook-form

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) navigate("/");
  }, []);

  const onSubmit = async (data) => {
    const response = await dispatch(login(data));
    console.log(response);
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
              Login to <strong className="primarycolor mb-0">SB Hotels</strong>
            </h3>
            <p className="mb-4">
              Log in to your SB Hotels account for personalized experiences.
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
                  })}
                />
              </div>
              {errors.username && (
                <p className="invalid-feedback text-red-500 font-medium text-base">
                  {errors.username.message}
                </p>
              )}

              <div className="form-group last mb-3">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className={`rounded-3xl p-2 w-full ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  {...register("password", {
                    required: "Mật khẩu không được trống",
                  })}
                />
              </div>
              {errors.password && (
                <p className="invalid-feedback text-red-500 font-medium text-base">
                  {errors.password.message}
                </p>
              )}

              <Link to="/register">
                You don't have an account? Register here!
              </Link>

              <div className="w-full">
                <button
                  className="w-full rounded-xl py-2 px-3 btn-primary ml-auto my-2"
                  disabled={loading}
                >
                  {loading && (
                    <span className="spinner-border spinner-border-sm"></span>
                  )}
                  <span>Log In </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
