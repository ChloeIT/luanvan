// src/components/common/DarkModeToggle.jsx
import React, { useEffect, useState } from "react";

const DarkModeToggle = ({ className = "" }) => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("theme");
        const systemDark =
            typeof window !== "undefined" &&
            window.matchMedia?.("(prefers-color-scheme: dark)").matches;

        const theme = saved || (systemDark ? "dark" : "light");
        setIsDark(theme === "dark");
        document.documentElement.setAttribute("data-theme", theme);
    }, []);

    const toggle = () => {
        const next = !isDark;
        setIsDark(next);
        const theme = next ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    };

    return (
        <div className={`flex justify-center items-center flex-col ${className}`}>
            {/* nhãn */}
            <p className="text-xs mb-2 select-none" style={{ color: "var(--muted)" }}>
                Theme
            </p>

            {/* nút gạt */}
            <button
                type="button"
                aria-label="Toggle dark mode"
                onClick={toggle}
                className="theme-switch"
                data-ison={isDark}
                title={isDark ? "Switch to Light" : "Switch to Dark"}
            >
                <span className="knob" />
            </button>

            {/* trạng thái */}
            <div className="mt-2 flex justify-center items-center gap-2.5">
                <p className="text-xs select-none" style={{ color: "var(--muted)" }}>
                    Light
                </p>
                <span className="w-1 h-1 rounded-full" style={{ background: "var(--muted)" }} />
                <p className="text-xs select-none" style={{ color: "var(--muted)" }}>
                    Dark
                </p>
            </div>
        </div>
    );
};

export default DarkModeToggle;
