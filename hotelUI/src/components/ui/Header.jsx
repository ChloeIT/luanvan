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

  const pathAfterSlash = location.pathname;
  useEffect(() => {
    linkpage.find((link) => {
      link.to == pathAfterSlash ? setTitle(link.name) : null;
    });
  }, [pathAfterSlash]);

  const handleLogOut = () => {
    dispatch(authAction.setUser(null));
    authServices.logout();
  };

  const items = [
    {
      key: "1",
      label: <Link to="/profile">Profile</Link>,
    },
    {
      key: "2",
      label: <Link onClick={handleLogOut}>Logout</Link>,
    },
  ];

  const clickMenu = () => {
    setOpenToggle((prev) => !prev); // Correctly toggle state
  };
  return (
    <div className="container-fluid z-50 position-relative p-0">
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
          <div className={`navbar-nav ms-auto py-0 `}>
            {linkpage.map((item) => (
              <NavLink
                className="nav-item nav-link "
                key={item.name}
                to={item.to}
              >
                {item.name}
              </NavLink>
            ))}
          </div>
          <div className="fixed top-20 right-5">
            <SearchInput />
          </div>
          <Dropdown
            menu={{
              items,
            }}
            placement="bottomRight"
          >
            <a
              onClick={(e) => e.preventDefault()}
              className={`${openToggle ? "nav-item nav-link" : ""}`}
            >
              <Space>
                <span className="nav-item nav-link cursor-pointer">
                  {user?.username}
                </span>
              </Space>
            </a>
          </Dropdown>
          {!user && (
            <Link
              to="/login"
              className="btn btn-primary rounded-pill py-2 px-4"
            >
              Login
            </Link>
          )}
        </div>
      </div>
      <div
        className="container-fluid bg-primary py-5 mb-5 hero-header"
        id="background"
      >
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
