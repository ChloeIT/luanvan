import React, { useEffect, useState } from "react";
import { linkpage } from "../../contant/link";
import { Link, NavLink, useLocation } from "react-router-dom";
import { TiThMenuOutline } from "react-icons/ti";
import { Button, Dropdown, Space } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { authServices } from "../../services/auth";
import { authAction } from "../../store";
import { SearchInput } from "./search/SearchInput";

export const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const [openToggle, setOpenToggle] = useState(false);
  const [title, setTitle] = useState("");
  const location = useLocation();
  const dispatch = useDispatch();

  // 📌 Lấy roles của user
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const isAdmin = roles.includes("ROLE_ADMIN");
  const isModerator = roles.includes("ROLE_MODERATOR");

  // 📌 Update title khi đổi trang
  useEffect(() => {
    const found = linkpage.find((link) => link.to === location.pathname);
    setTitle(found?.name ?? "");
  }, [location.pathname]);

  // 📌 Logout
  const handleLogOut = () => {
    dispatch(authAction.setUser(null));
    authServices.logout();
  };

  // 📌 Dropdown items
  const items = [
    { key: "profile", label: <Link to="/profile">Profile</Link> },

    ...(isAdmin
      ? [
        {
          key: "admin",
          label: <Link to="/admin">Admin Panel</Link>,
        },
      ]
      : []),

    ...(isModerator
      ? [
        {
          key: "moderator",
          label: <Link to="/moderator">Mod Panel</Link>,
        },
      ]
      : []),

    {
      key: "logout",
      label: (
        <span onClick={handleLogOut} role="button">
          Logout
        </span>
      ),
    },
  ];

  // 📌 Toggle menu mobile
  const clickMenu = () => {
    setOpenToggle((prev) => !prev);
  };

  return (
    <div className="container-fluid z-50 position-relative p-0">
      {/* NAVBAR */}
      <div className="navbar navbar-expand-lg navbar-light px-4 px-lg-5 py-3 py-lg-0">
        <Link to="/" className="navbar-brand p-0">
          <h1 className="text-primary m-0">SB Hotels</h1>
        </Link>

        <Button className="navbar-toggler" type="button">
          <TiThMenuOutline onClick={clickMenu} />
        </Button>

        <div
          className={`collapse navbar-collapse ${openToggle ? "show" : ""}`}
          id="navbarCollapse"
        >
          {/* NAVIGATIONS */}
          <div className="navbar-nav ms-auto py-0">
            {linkpage.map((item) => (
              <NavLink key={item.name} className="nav-item nav-link" to={item.to}>
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* SEARCH */}
          <div className="fixed top-20 right-5">
            <SearchInput />
          </div>

          {/* USER DROPDOWN */}
          {user ? (
            <Dropdown menu={{ items }} placement="bottomRight">
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  <span className={`${openToggle ? "nav-item nav-link" : ""} cursor-pointer`}>
                    {user?.username}
                  </span>
                </Space>
              </a>
            </Dropdown>
          ) : (
            <Link to="/login" className="btn btn-primary rounded-pill py-2 px-4">
              Login
            </Link>
          )}
        </div>
      </div>

      {/* HERO TITLE */}
      <div className="container-fluid bg-primary py-5 mb-5 hero-header" id="background">
        <div className="container py-5">
          <div className="row justify-content-center py-5">
            <div className="col-lg-10 pt-lg-5 mt-lg-5 font-extrabold text-6xl text-center text-white">
              {title}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
