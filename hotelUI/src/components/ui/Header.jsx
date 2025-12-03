// src/components/layouts/Header.jsx
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
  const { user } = useSelector((s) => s.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  const [openToggle, setOpenToggle] = useState(false);
  const [title, setTitle] = useState("");

  // ========== Cập nhật title theo route ==========
  useEffect(() => {
    const path = location.pathname;

    // Trang my-bookings: không nằm trong linkpage nhưng vẫn muốn có title
    if (path === "/my-bookings") {
      setTitle("My bookings");
      return;
    }

    const found = linkpage.find((x) => x.to === path);
    setTitle(found?.name ?? "");
  }, [location.pathname]);

  // ========== Dropdown items ==========
  const roles = Array.isArray(user?.roles) ? user.roles : [];

  const items = [
    { key: "profile", label: <Link to="/profile">Profile</Link> },

    // NEW: My bookings
    { key: "my-bookings", label: <Link to="/my-bookings">My bookings</Link> },

    ...(roles.includes("ROLE_ADMIN")
      ? [{ key: "admin", label: <Link to="/admin">Admin Panel</Link> }]
      : []),
    ...(roles.includes("ROLE_MODERATOR")
      ? [{ key: "moderator", label: <Link to="/moderator">Mod Panel</Link> }]
      : []),
    {
      key: "logout",
      label: (
        <span
          onClick={() => {
            dispatch(authAction.setUser(null));
            authServices.logout();
          }}
        >
          Logout
        </span>
      ),
    },
  ];

  return (
    <div className="position-relative p-0">
      {/* ===== HEADER FIXED, NỀN TỐI MỜ ===== */}
      <div className="site-header">
        <div className="container-fluid p-0">
          <nav className="navbar navbar-expand-lg px-4 px-lg-5 py-3 site-header-bar">
            {/* Logo */}
            <Link to="/" className="navbar-brand p-0">
              <h1 className="m-0" style={{ color: "#86B817" }}>
                SB Hotels
              </h1>
            </Link>

            {/* Toggle mobile */}
            <Button
              className="navbar-toggler border-0"
              type="button"
              onClick={() => setOpenToggle((p) => !p)}
            >
              <TiThMenuOutline color="white" />
            </Button>

            <div
              className={`collapse navbar-collapse ${openToggle ? "show" : ""
                }`}
            >
              {/* MENU LINKS */}
              <div className="navbar-nav ms-auto py-0">
                {linkpage.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    className={({ isActive }) =>
                      `nav-item nav-link header-link ${isActive ? "active" : ""
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>

              {/* SEARCH */}
              <div className="ms-3">
                <SearchInput />
              </div>

              {/* USER / LOGIN */}
              <div className="ms-3">
                {user ? (
                  <Dropdown menu={{ items }} placement="bottomRight">
                    <a onClick={(e) => e.preventDefault()}>
                      <Space>
                        <span className="header-user">{user.username}</span>
                      </Space>
                    </a>
                  </Dropdown>
                ) : (
                  <Link
                    to="/login"
                    className="btn btn-success rounded-pill px-4"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* ===== HERO TITLE + BACKGROUND ===== */}
      <div className="container-fluid hero-header" id="background">
        <div className="container hero-title-wrapper">
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center text-white fw-bold hero-title">
              {title}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
