// src/components/layouts/Header.jsx
import React, { useEffect, useMemo, useState } from "react";
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

    if (path === "/my-bookings") {
      setTitle("My bookings");
      return;
    }

    if (path === "/profile") {
      setTitle("Profile");
      return;
    }

    const found = linkpage.find((x) => x.to === path);
    setTitle(found?.name ?? "");
  }, [location.pathname]);

  // ✅ Auto-close mobile menu whenever route changes
  useEffect(() => {
    if (openToggle) setOpenToggle(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const closeMobileMenu = () => setOpenToggle(false);

  // ========== Dropdown items ==========
  const roles = Array.isArray(user?.roles) ? user.roles : [];

  const items = useMemo(() => {
    const base = [
      {
        key: "profile",
        label: (
          <Link to="/profile" onClick={closeMobileMenu}>
            Profile
          </Link>
        ),
      },
      {
        key: "my-bookings",
        label: (
          <Link to="/my-bookings" onClick={closeMobileMenu}>
            My bookings
          </Link>
        ),
      },
    ];

    const admin =
      roles.includes("ROLE_ADMIN")
        ? [
          {
            key: "admin",
            label: (
              <Link to="/admin" onClick={closeMobileMenu}>
                Admin Panel
              </Link>
            ),
          },
        ]
        : [];

    const mod =
      roles.includes("ROLE_MODERATOR")
        ? [
          {
            key: "moderator",
            label: (
              <Link to="/moderator" onClick={closeMobileMenu}>
                Mod Panel
              </Link>
            ),
          },
        ]
        : [];

    const logout = [
      {
        key: "logout",
        label: (
          <span
            onClick={() => {
              closeMobileMenu();
              dispatch(authAction.setUser(null));
              authServices.logout();
            }}
            style={{ cursor: "pointer" }}
          >
            Logout
          </span>
        ),
      },
    ];

    return [...base, ...admin, ...mod, ...logout];
  }, [roles, dispatch]);

  return (
    <div className="position-relative p-0">
      {/* ===== HEADER FIXED ===== */}
      <div className="site-header">
        <div className="container-fluid p-0">
          <nav className="navbar navbar-expand-xl px-4 px-lg-5 py-3 site-header-bar">
            <Link to="/" className="navbar-brand p-0" onClick={closeMobileMenu}>
              <h1
                className="m-0"
                style={{
                  fontSize: "34px",
                  fontWeight: 900,
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                  transition: "transform .25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <span style={{ color: "#86B817" }}>SB</span>
                <span style={{ color: "#EAF5C3", fontWeight: 800 }}>Hotels</span>
              </h1>
            </Link>

            {/* Toggle mobile */}
            <Button
              className="navbar-toggler border-0"
              type="button"
              onClick={() => setOpenToggle((p) => !p)}
              aria-label="Toggle navigation"
            >
              <TiThMenuOutline color="white" />
            </Button>

            <div className={`collapse navbar-collapse ${openToggle ? "show text-end" : ""}`}>
              {/* MENU LINKS */}
              <div className="navbar-nav ms-auto py-0">
                {linkpage.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    onClick={closeMobileMenu} // ✅ click là đóng menu
                    className={({ isActive }) =>
                      `nav-item nav-link header-link ${isActive ? "active" : ""}`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>

              {/* SEARCH */}
              <div className={`ms-3 ${openToggle ? "mt-3" : ""}`}>
                <SearchInput />
              </div>

              {/* USER / LOGIN */}
              <div className={`ms-4 d-flex align-items-center ${openToggle ? "mt-3" : ""}`}>
                {user ? (
                  <Dropdown menu={{ items }} placement="bottomRight">
                    <a
                      onClick={(e) => e.preventDefault()}
                      style={{ textDecoration: "none" }}
                    >
                      <Space>
                        <span className="header-user">{user.username}</span>
                      </Space>
                    </a>
                  </Dropdown>
                ) : (
                  <Link
                    to="/login"
                    className="btn btn-success rounded-pill px-4"
                    onClick={closeMobileMenu}
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
            <div className="col-lg-10 text-center text-white hero-title">
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "56px",
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textShadow: "0 8px 30px rgba(0,0,0,.55)",
                  display: "inline-block",
                }}
              >
                {title}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
