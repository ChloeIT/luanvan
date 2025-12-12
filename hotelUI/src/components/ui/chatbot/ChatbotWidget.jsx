// src/components/ui/chatbot/ChatbotWidget.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { FiMessageCircle, FiX, FiSend } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { chatEngine } from "./chatEngine";

const MAX_Z = 2000;
const nowId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export const ChatbotWidget = ({
    right = 45,
    bottom = 90 + 56 + 12,
    size = 56,
    gap = 12,
    margin = 12,
    maxPanelWidth = 300,
    maxPanelHeight = 380,
    headerSafeTop = 80,
}) => {
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");

    // ✅ state để chatEngine hiểu flow
    const [engineState, setEngineState] = useState(() => ({
        intent: null,
        city: null,
        pendingFilter: null,
    }));

    // ✅ gợi ý mặc định (fallback) – bạn có thể đổi theo ý
    const DEFAULT_QUICK = useMemo(
        () => ["Tìm khách sạn ở Cần Thơ", "4-5 sao", "100$ – 200$", "Giá rẻ"],
        []
    );

    const [messages, setMessages] = useState(() => [
        {
            id: nowId(),
            from: "bot",
            text: "Xin chào 👋 Mình là SB Bot. Bạn muốn tìm khách sạn hay cần hỗ trợ đặt phòng?",
            quickReplies: DEFAULT_QUICK,
        },
    ]);

    const listRef = useRef(null);
    const btnRef = useRef(null);

    const [panelPos, setPanelPos] = useState(() => ({
        top: headerSafeTop,
        left: margin,
        width: maxPanelWidth,
        height: maxPanelHeight,
    }));

    // ✅ luôn dưới AntD Modal (Modal của bạn zIndex = MAX_Z - 1)
    const Z_FAB = MAX_Z - 3; // 1997
    const Z_POPUP = MAX_Z - 4; // 1996

    // ✅ EXCLUSIVE: widget khác mở -> chat tự đóng
    useEffect(() => {
        const onExclusive = (e) => {
            if (e?.detail?.name !== "chat") setOpen(false);
        };
        window.addEventListener("ui:exclusive-open", onExclusive);
        return () => window.removeEventListener("ui:exclusive-open", onExclusive);
    }, []);

    // ✅ IMPORTANT: lấy bot message gần nhất CÓ quickReplies (không rỗng)
    const lastQuick = useMemo(() => {
        const last = [...messages]
            .reverse()
            .find(
                (m) =>
                    m.from === "bot" &&
                    Array.isArray(m.quickReplies) &&
                    m.quickReplies.length > 0
            );
        return last?.quickReplies || [];
    }, [messages]);

    // ✅ không bao giờ trống gợi ý
    const quickToShow = lastQuick.length ? lastQuick : DEFAULT_QUICK;

    const runAction = (action) => {
        if (!action) return;

        if (action.type === "NAVIGATE") {
            const { pathname = "/hotel", params = {} } = action.payload || {};
            const sp = new URLSearchParams();

            Object.entries(params).forEach(([k, v]) => {
                if (v === undefined || v === null || v === "") return;
                sp.set(k, String(v));
            });

            const qs = sp.toString();
            navigate(qs ? `${pathname}?${qs}` : pathname);
        }
    };

    const send = (text) => {
        const content = (text ?? input).trim();
        if (!content) return;

        const res = chatEngine(content, engineState);

        setMessages((prev) => [
            ...prev,
            { id: nowId(), from: "user", text: content },
            { id: nowId(), from: "bot", text: res.text, quickReplies: res.quickReplies },
        ]);

        if (res?.nextState) setEngineState(res.nextState);
        runAction(res?.action);

        setInput("");
    };

    const computePanel = () => {
        if (!btnRef.current) return;

        const rect = btnRef.current.getBoundingClientRect();
        const vw = window.innerWidth || 375;
        const vh = window.innerHeight || 700;

        const width = Math.min(maxPanelWidth, vw - margin * 2);
        const height = Math.min(maxPanelHeight, vh - margin * 2);

        // ✅ đáy khung chat ngang hàng với nút chat
        let top = rect.bottom - height;

        // ✅ popup nằm bên trái nút
        let left = rect.left - gap - width;
        if (left < margin) left = rect.right + gap;

        top = clamp(top, headerSafeTop, vh - height - margin);
        left = clamp(left, margin, vw - width - margin);

        setPanelPos({ top, left, width, height });
    };

    useEffect(() => {
        if (!open) return;
        computePanel();

        const onResize = () => computePanel();
        const onScroll = () => computePanel();

        window.addEventListener("resize", onResize);
        window.addEventListener("scroll", onScroll, true);
        return () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("scroll", onScroll, true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, maxPanelWidth, maxPanelHeight, headerSafeTop]);

    useEffect(() => {
        if (!open) return;
        requestAnimationFrame(() => {
            listRef.current?.scrollTo({
                top: listRef.current.scrollHeight,
                behavior: "smooth",
            });
        });
    }, [messages, open]);

    const R = 16;
    const shadow = "0 18px 50px rgba(0,0,0,0.18)";
    const border = "1px solid rgba(0,0,0,0.08)";

    const toggleOpen = () => {
        setOpen((v) => {
            const next = !v;
            if (next) {
                window.dispatchEvent(
                    new CustomEvent("ui:exclusive-open", { detail: { name: "chat" } })
                );
            }
            return next;
        });
    };

    const fab = (
        <button
            ref={btnRef}
            type="button"
            onClick={toggleOpen}
            aria-label="Open chatbot"
            title="SB Bot"
            style={{
                position: "fixed",
                right,
                bottom,
                width: size,
                height: size,
                borderRadius: 999,
                border: "2px solid rgba(255,255,255,0.85)",
                background: "var(--primary, #86B817)",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
                zIndex: Z_FAB,
                cursor: "pointer",
            }}
        >
            {open ? <FiX size={22} /> : <FiMessageCircle size={22} />}
        </button>
    );

    const popup = open && (
        <div
            style={{
                position: "fixed",
                top: panelPos.top,
                left: panelPos.left,
                width: panelPos.width,
                height: panelPos.height,
                background: "#fff",
                borderRadius: R,
                overflow: "hidden",
                boxShadow: shadow,
                border,
                zIndex: Z_POPUP,
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: "10px 12px",
                    background:
                        "linear-gradient(135deg, rgba(134,184,23,1), rgba(115,160,20,1))",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                }}
            >
                <div style={{ lineHeight: 1.15 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>SB Bot</div>
                    <div style={{ fontSize: 11, opacity: 0.92 }}>
                        Hỗ trợ đặt phòng • FAQ nhanh
                    </div>
                </div>

                <button
                    onClick={() => setOpen(false)}
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        border: 0,
                        background: "rgba(255,255,255,0.18)",
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                    }}
                    aria-label="Close"
                >
                    <FiX />
                </button>
            </div>

            {/* Messages */}
            <div
                ref={listRef}
                style={{
                    flex: 1,
                    padding: 10,
                    overflowY: "auto",
                    background: "rgba(134,184,23,0.06)",
                }}
            >
                {messages.map((m) => {
                    const isUser = m.from === "user";
                    return (
                        <div
                            key={m.id}
                            style={{
                                display: "flex",
                                justifyContent: isUser ? "flex-end" : "flex-start",
                                marginBottom: 8,
                            }}
                        >
                            <div
                                style={{
                                    maxWidth: "88%",
                                    padding: "9px 11px",
                                    borderRadius: 14,
                                    background: isUser ? "var(--primary, #86B817)" : "#fff",
                                    color: isUser ? "#fff" : "#1f2937",
                                    border: isUser ? 0 : "1px solid rgba(0,0,0,0.08)",
                                    boxShadow: isUser
                                        ? "0 8px 16px rgba(134,184,23,0.20)"
                                        : "0 8px 16px rgba(0,0,0,0.06)",
                                    whiteSpace: "pre-wrap",
                                    fontSize: 13.5,
                                    lineHeight: 1.35,
                                }}
                                dangerouslySetInnerHTML={
                                    !isUser
                                        ? { __html: m.text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") }
                                        : undefined
                                }
                            >
                                {isUser ? m.text : null}
                            </div>
                        </div>
                    );
                })}

                {/* ✅ Quick replies luôn hiện (giữ từ lần gần nhất hoặc fallback menu) */}
                {quickToShow.length > 0 && (
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                            marginTop: 6,
                        }}
                    >
                        {quickToShow.map((q) => (
                            <button
                                key={q}
                                onClick={() => send(q)}
                                style={{
                                    borderRadius: 999,
                                    padding: "7px 10px",
                                    border: "1px solid rgba(134,184,23,0.32)",
                                    background: "rgba(255,255,255,0.92)",
                                    color: "#1f2a12",
                                    fontSize: 12.5,
                                    cursor: "pointer",
                                    boxShadow: "0 6px 14px rgba(0,0,0,0.05)",
                                }}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Input */}
            <div
                style={{
                    padding: 10,
                    borderTop: "1px solid rgba(0,0,0,0.08)",
                    background: "#fff",
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                }}
            >
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Nhập tin nhắn..."
                    style={{
                        flex: 1,
                        height: 36,
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.12)",
                        padding: "0 10px",
                        outline: "none",
                        fontSize: 13,
                    }}
                />

                <button
                    onClick={() => send()}
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        border: 0,
                        background: "var(--primary, #86B817)",
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                        boxShadow: "0 8px 18px rgba(134,184,23,0.18)",
                    }}
                    aria-label="Send"
                >
                    <FiSend size={16} />
                </button>
            </div>
        </div>
    );

    return typeof document !== "undefined"
        ? ReactDOM.createPortal(
            <>
                {fab}
                {popup}
            </>,
            document.body
        )
        : (
            <>
                {fab}
                {popup}
            </>
        );
};
