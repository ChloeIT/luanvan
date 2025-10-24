// src/components/layouts/admin/Sidebar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { HiOutlineMenu } from "react-icons/hi";
import { RiCloseLine } from "react-icons/ri";
import { routeAdmin } from "../../../../contant/linkadmin";
import DarkModeToggle from "@/components/common/DarkModeToggle";

const BrandTitle = () => (
    <div
        role="heading"
        aria-level={2}
        style={{
            fontFamily: "'Nunito', system-ui, -apple-system, Segoe UI, Roboto, Arial",
            fontWeight: 900,               // đậm nhất
            fontSize: "34px",              // to rõ rệt
            lineHeight: 1.05,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            textAlign: "center",
            color: "#fff",
            textShadow: "0 0 6px rgba(255,255,255,.6), 0 2px 4px rgba(0,0,0,.35)",
            marginBottom: "0.75rem",
        }}
    >
        SB HOTEL
    </div>
);

const NavLinks = ({ handleClick }) => {
    return (
        <nav className="mt-6" aria-label="Admin navigation">
            {routeAdmin.map((item) => (
                <NavLink
                    key={item.name}
                    to={item.path}
                    end
                    onClick={() => handleClick && handleClick()}
                    className={({ isActive }) =>
                        [
                            "flex items-center gap-2 px-3 py-2 my-2 rounded-md text-sm font-medium transition-colors",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                            isActive
                                ? "bg-white/15 text-white"
                                : "text-white/85 hover:text-white hover:bg-white/10",
                        ].join(" ")
                    }
                >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="truncate">{item.name}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export const Sidebar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const closeMobile = () => setMobileMenuOpen(false);

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className="md:flex hidden h-screen flex-col w-[260px] py-6 px-4"
                style={{ background: "var(--primary)" }}
                role="complementary"
                aria-label="Sidebar"
            >
                {/* ĐÃ SỬA: tiêu đề desktop */}
                <BrandTitle />

                <NavLinks />

                {/* bottom tools */}
                <div className="mt-auto pt-4 border-t border-white/20">
                    <DarkModeToggle />
                </div>
            </aside>

            {/* Mobile top-right toggle button */}
            <button
                type="button"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="absolute md:hidden block top-6 right-3 z-20"
            >
                {mobileMenuOpen ? (
                    <RiCloseLine className="w-7 h-7 text-primary" />
                ) : (
                    <HiOutlineMenu className="w-7 h-7 text-primary" />
                )}
            </button>

            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 md:hidden z-10"
                    onClick={closeMobile}
                    aria-hidden="true"
                />
            )}

            {/* Mobile Drawer */}
            <aside
                className={[
                    "fixed top-0 left-0 h-screen w-2/3 max-w-[280px] md:hidden z-20 p-6",
                    "transition-all duration-300 ease-out",
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
                ].join(" ")}
                style={{ background: "var(--primary)" }}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile menu"
            >
                {/* ĐÃ SỬA: tiêu đề mobile */}
                <BrandTitle />

                <NavLinks handleClick={closeMobile} />

                <div className="mt-6">
                    <DarkModeToggle />
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
