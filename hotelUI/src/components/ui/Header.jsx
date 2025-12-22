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
import { FiSun, FiMoon } from "react-icons/fi";
import { bookingAction } from "../../store/booking";


export const Header = () => {
  const { user } = useSelector((s) => s.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  const [openToggle, setOpenToggle] = useState(false);
  const [title, setTitle] = useState("");

  // ===== theme (icon-only toggle) =====
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const systemDark =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches;

    const theme = saved || (systemDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
    setIsDark(theme === "dark");
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    const theme = next ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  // ===== title theo route =====
  useEffect(() => {
    const path = location.pathname;

    if (path === "/my-bookings") return setTitle("My bookings");
    if (path === "/profile") return setTitle("Profile");

    const found = linkpage.find((x) => x.to === path);
    setTitle(found?.name ?? "");
  }, [location.pathname]);

  // ✅ route change -> close menu
  useEffect(() => {
    if (openToggle) setOpenToggle(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const closeMobileMenu = () => setOpenToggle(false);

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

    const admin = roles.includes("ROLE_ADMIN")
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

    const mod = roles.includes("ROLE_MODERATOR")
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

              // ✅ Clear booking redux state ngay lập tức (không cần reload)
              dispatch(bookingAction.clearCart());

              // ✅ Clear auth + localStorage (auth slice đã clear booking persist nếu bạn làm)
              dispatch(authAction.logout());

              // optional
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
            {/* brand */}
            <Link to="/" className="navbar-brand p-0" onClick={closeMobileMenu}>
              <h1
                className="m-0 header-brand"
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <span style={{ color: "var(--primary)" }}>SB</span>
                <span style={{ color: "#EAF5C3", fontWeight: 800 }}>Hotels</span>
              </h1>
            </Link>

            {/* toggle mobile */}
            <Button
              className="navbar-toggler border-0"
              type="button"
              onClick={() => setOpenToggle((p) => !p)}
              aria-label="Toggle navigation"
            >
              <TiThMenuOutline color="white" />
            </Button>

            {/* collapse */}
            <div
              className={`collapse navbar-collapse header-collapse ${openToggle ? "show" : ""
                }`}
            >
              {/* MENU LINKS */}
              <div className="navbar-nav ms-auto py-0 header-menu">
                {linkpage.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `nav-item nav-link header-link ${isActive ? "active" : ""}`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>

              {/* SEARCH */}
              <div
                className={`header-right header-search-wrap ${openToggle ? "mt-3" : ""
                  }`}
              >
                <SearchInput />
              </div>

              {/* THEME ICON-ONLY */}
              <div
                className={`header-right header-theme-wrap ${openToggle ? "mt-3" : ""
                  }`}
              >
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="header-theme-btn"
                  aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
                  title={isDark ? "Light mode" : "Dark mode"}
                >
                  {isDark ? (
                    <FiSun className="header-theme-ico" />
                  ) : (
                    <FiMoon className="header-theme-ico" />
                  )}
                  <span className="header-theme-text">
                    {isDark ? "Light" : "Dark"}
                  </span>
                </button>
              </div>

              {/* USER / LOGIN */}
              <div
                className={`header-right header-user-wrap ${openToggle ? "mt-3" : ""
                  }`}
              >
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

      {/* ✅ CSS inline (bạn có thể chuyển sang file css) */}
      <style>{`
        .header-brand{
          font-size:34px;
          font-weight:900;
          letter-spacing:.04em;
          cursor:pointer;
          display:flex;
          align-items:center;
          gap:2px;
          transition:transform .25s ease;
        }

        /* CỐT LÕI: căn hàng dọc cho cả thanh */
        .site-header-bar{
          display:flex;
          align-items:center;
        }

        .header-collapse{
          justify-content:flex-end;
          align-items:center;
        }

        /* Desktop: tất cả cùng 1 hàng */
        @media (min-width: 1200px){
          .header-collapse{
            display:flex !important;
            gap:14px;
            flex-wrap:nowrap;
          }
          .header-menu{
            display:flex;
            align-items:center;
          }
          .header-right{
            display:flex;
            align-items:center;
          }
        }

        /* Mobile/Tablet: dropdown theo cột, text-end cho đẹp */
        @media (max-width: 1199.98px){
          .header-collapse{
            text-align:right;
          }
          .header-search-wrap, .header-user-wrap, .header-theme-wrap{
            display:flex;
            justify-content:flex-end;
          }
        }

        /* đồng bộ height nav-link */
        .site-header-bar .navbar-nav .nav-link{
          display:flex;
          align-items:center;
          height:44px;
          padding-top:0;
          padding-bottom:0;
        }

        .header-user{
          display:inline-flex;
          align-items:center;
          height:44px;
          color:#fff;
          font-weight:700;
        }

        /* ===== SearchInput styles ===== */
        .header-search{ width: 260px; }

        /* ===== Theme button (icon-only, primary-based) ===== */
        .header-theme-btn{
          height:44px;
          display:inline-flex;
          align-items:center;
          gap:8px;
          padding:0 12px;
          border-radius:999px;
          border:1px solid rgba(255,255,255,.28);
          background: rgba(255,255,255,.12);
          color:#fff;
          transition: transform .15s ease, background .2s ease, border-color .2s ease;
          backdrop-filter: blur(6px);
        }
        .header-theme-btn:hover{
          background: rgba(255,255,255,.18);
          border-color: rgba(255,255,255,.38);
          transform: translateY(-1px);
        }
        .header-theme-btn:active{
          transform: translateY(0px);
        }
        .header-theme-ico{
          font-size:18px;
          color: var(--primary);
          filter: drop-shadow(0 2px 8px rgba(0,0,0,.25));
        }
        .header-theme-text{
          font-size:12px;
          font-weight:800;
          letter-spacing:.02em;
          color:#fff;
        }

        /* Mobile: chỉ icon, ẩn chữ */
        @media (max-width: 575.98px){
          .header-theme-btn{
            padding:0 10px;
          }
          .header-theme-text{
            display:none;
          }
        }

        /* dropdown search etc (giữ nguyên code bạn đang có) */
        .header-search-pill{
          width:100%;
          height:44px;
          display:flex;
          align-items:center;
          gap:10px;
          padding:0 14px;
          background:#fff;
          border:1px solid rgba(0,0,0,.15);
          border-radius:999px;
          box-shadow:0 6px 18px rgba(0,0,0,.06);
        }
        .header-search-icon{ font-size:20px; color:#6b7280; }
        .header-search-input{
          width:100%;
          height:100%;
          border:none;
          outline:none;
          background:transparent;
          font-size:14px;
          color:#374151;
        }
        .header-search-dropdown{
          position:absolute;
          left:0;
          top:calc(100% + 8px);
          width:100%;
          max-height:320px;
          overflow:auto;
          background:#fff;
          border-radius:12px;
          box-shadow:0 16px 30px rgba(0,0,0,.12);
          z-index:9999;
        }
        .header-search-dropdown-head{
          padding:10px 12px;
          background:#f3f4f6;
          border-top-left-radius:12px;
          border-top-right-radius:12px;
          font-size:13px;
          font-weight:700;
          color:#4b5563;
        }
        .header-search-item{
          display:flex;
          align-items:center;
          gap:10px;
          padding:10px 12px;
          text-decoration:none;
        }
        .header-search-item:hover{ background:#f3f4f6; }
        .header-search-item-text{ min-width:0; }
        .header-search-item-name{
          font-size:14px;
          font-weight:800;
          color:#86B817;
          line-height:1.2;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .header-search-item-sub{
          font-size:12px;
          color:#6b7280;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .header-search-empty{
          padding:14px 12px;
          text-align:center;
          color:#6b7280;
          font-size:13px;
        }
      `}</style>
    </div>
  );
};

export default Header;
