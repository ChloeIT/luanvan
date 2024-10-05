import React from "react";
import { linkpage } from "../../contant/link";
import { NavLink } from "react-router-dom";
import { TiThMenuOutline } from "react-icons/ti";
import {Button} from 'antd'

export const Header = () => {
  return (
    <div className="container-fluid position-relative p-0">
      <div className="navbar navbar-expand-lg navbar-light px-4 px-lg-5 py-3 py-lg-0">
        <a href="" className="navbar-brand p-0">
          <h1 className="text-primary m-0">
            <i className="fa fa-map-marker-alt me-3"></i>SB Hotels
          </h1>
        </a>

        <Button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarCollapse"

        >
          <TiThMenuOutline />
        </Button>
        <div className="collapse navbar-collapse" id="navbarCollapse">
          <div className="navbar-nav ms-auto py-0">
            {linkpage.map((item) => (
              <NavLink
                className="nav-item nav-link"
                key={item.name}
                to={item.to}
              >
                {item.name}
              </NavLink>
            ))}
          </div>
          <div className="nav-item dropdown {{ Request::is('profile*') || Request::is('logout*') ? 'active' : '' }}">
            <a
              href="#"
              className="nav-link dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              username
            </a>
            <div className="dropdown-menu m-0">
              <a
                href="/profile"
                className="dropdown-item {{ Request::is('profile') ? 'active' : '' }}"
              >
                Profile
              </a>
              <a href="" className="dropdown-item">
                Log Out
              </a>
            </div>
          </div>
          <a
            href="{{ route('login') }}"
            className="btn btn-primary rounded-pill py-2 px-4"
          >
            Login
          </a>
        </div>
      </div>
      <div className="container-fluid bg-primary py-5 mb-5 hero-header" id="background">  
            <div className="container py-5">
                <div className="row justify-content-center py-5">
                    <div className="col-lg-10 pt-lg-5 mt-lg-5 text-center">
                        @yield('navbar')
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
