// src/components/layouts/admin/AdNewsletter.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, Popconfirm, message } from "antd";
import { newsletterService } from "@/services/newsletter";
import { FiMail, FiSend, FiUsers } from "react-icons/fi";

export const AdNewsletter = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [sending, setSending] = useState(false);

    const totalSubscribers = data.length;

    const fetchSubscribers = async () => {
        try {
            setLoading(true);
            const res = await newsletterService.getAllAdmin();
            setData(res.data || []);
        } catch (err) {
            console.error(err);
            message.error("Failed to load subscribers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const handleDelete = async (id) => {
        try {
            await newsletterService.deleteAdmin(id);
            setData((prev) => prev.filter((item) => item.id !== id));
            setSelectedRowKeys((prev) => prev.filter((key) => key !== id));
            message.success("Subscriber deleted.");
        } catch (err) {
            console.error(err);
            message.error("Failed to delete subscriber.");
        }
    };

    // ===== Gửi mail khuyến mãi =====
    const handleSendPromo = async () => {
        const sub = subject.trim();
        const body = content.trim();

        if (!sub || !body) {
            message.warning("Please enter both subject and content.");
            return;
        }
        if (!totalSubscribers) {
            message.warning("No subscribers to send.");
            return;
        }

        try {
            setSending(true);

            const payload = {
                subject: sub,
                content: body,
                ids: selectedRowKeys, // [] => gửi ALL
            };

            const res = await newsletterService.sendPromo(payload);
            message.success(res?.data || "Promotion email sent.");
        } catch (err) {
            console.error(err);
            const msg =
                err?.response?.data ||
                err?.response?.data?.message ||
                "Failed to send promotion email.";
            message.error(msg);
        } finally {
            setSending(false);
        }
    };

    // ===== Info text dưới form =====
    const selectionText = useMemo(() => {
        if (!totalSubscribers) return "No subscribers yet.";

        if (selectedRowKeys.length > 0) {
            return `Sending to ${selectedRowKeys.length} of ${totalSubscribers} subscribers.`;
        }
        return `No subscriber selected – email will be sent to ALL ${totalSubscribers} subscribers.`;
    }, [selectedRowKeys, totalSubscribers]);

    // ===== Pagination style giống Rooms =====
    const pagerBase = {
        backgroundColor: "#1677ff",
        border: "1px solid #1677ff",
        color: "#fff",
        height: 28,
        minWidth: 28,
        padding: "0 10px",
        lineHeight: "26px",
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 1px 0 rgba(0,0,0,.06)",
    };
    const pagerActive = {
        backgroundColor: "#155bd6",
        borderColor: "#155bd6",
        color: "#fff",
    };
    const itemRender = (pageNum, type, original) => {
        if (type === "page") {
            const isActive = pageNum === page;
            return React.cloneElement(original, {
                style: { ...pagerBase, ...(isActive ? pagerActive : null) },
                children: pageNum,
            });
        }
        if (type === "prev" || type === "next") {
            return React.cloneElement(original, { style: pagerBase });
        }
        return original;
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            width: 80,
            align: "center",
        },
        {
            title: "Email",
            dataIndex: "email",
            align: "center",
        },
        {
            title: "Subscribed At",
            dataIndex: "createdAt",
            width: 220,
            align: "center",
            render: (v) => (v ? v.replace("T", " ").substring(0, 19) : ""),
        },
        {
            title: "Action",
            key: "action",
            width: 140,
            align: "center",
            render: (_, record) => (
                <Popconfirm
                    title="Delete this subscriber?"
                    onConfirm={() => handleDelete(record.id)}
                >
                    <Button danger size="small">
                        Delete
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-extrabold text-[#2a2a2a] mb-3 flex items-center gap-2">
                <FiMail size={26} style={{ color: "var(--primary)" }} />
                <span>
                    Newsletter{" "}
                    <span style={{ color: "var(--primary)" }}>Subscribers</span>
                </span>
            </h2>

            {/* ===== Card soạn newsletter ===== */}
            <div
                className="mb-4"
                style={{
                    background:
                        "linear-gradient(135deg, rgba(255,255,255,0.98), #fffde8)",
                    borderRadius: 18,
                    boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
                    border: "1px solid rgba(255,255,255,0.5)",
                    padding: "18px 20px 20px",
                }}
            >
                {/* Header trong card */}
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                    <div className="d-flex align-items-center gap-2">
                        <div
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: 999,
                                backgroundColor: "rgba(134,184,23,0.12)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <FiSend size={18} style={{ color: "var(--primary)" }} />
                        </div>
                        <div>
                            <div className="fw-semibold" style={{ fontSize: 15 }}>
                                Send promotion email
                            </div>
                            <div
                                style={{ fontSize: 12, color: "#777", marginTop: 2 }}
                                className="text-muted"
                            >
                                Write a short, friendly message to your subscribers.
                            </div>
                        </div>
                    </div>

                    {/* Chip tổng số subscribers */}
                    <div
                        className="d-flex align-items-center gap-1 px-3 py-1 rounded-pill"
                        style={{
                            backgroundColor: "rgba(134,184,23,0.08)",
                            border: "1px solid rgba(134,184,23,0.35)",
                            fontSize: 12,
                            color: "#4b5b20",
                        }}
                    >
                        <FiUsers size={14} />
                        <span>
                            {totalSubscribers} subscriber
                            {totalSubscribers === 1 ? "" : "s"}
                        </span>
                    </div>
                </div>

                {/* Subject */}
                <div className="mb-3">
                    <label className="form-label mb-1 fw-semibold small d-flex align-items-center gap-1">
                        <FiMail size={14} />
                        <span>Subject</span>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        style={{ fontSize: "14px", padding: "8px 10px" }}
                        placeholder="Subject..."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                    {/* Example nhỏ bên dưới */}
                    <div
                        style={{
                            fontSize: 12,
                            color: "#999",
                            marginTop: 4,
                        }}
                    >
                        Example: Winter promotion – 20% OFF for all bookings...
                    </div>
                </div>

                {/* Content */}
                <div className="mb-2">
                    <label className="form-label mb-1 fw-semibold small">Content</label>
                    <textarea
                        className="form-control"
                        rows={4}
                        style={{ fontSize: "14px", padding: "8px 10px" }}
                        placeholder="Write your promotion content here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    {/* Example nhỏ bên dưới */}
                    <div
                        style={{
                            fontSize: 12,
                            color: "#999",
                            marginTop: 4,
                            whiteSpace: "pre-line",
                        }}
                    >
                        {"Example: Hi from SB Hotel! Enjoy 20% off for stays this weekend.\nUse code SBH20 when booking on our website."}
                    </div>
                </div>

                {/* Footer card: info + button */}
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-2">
                    <div
                        className="small"
                        style={{
                            color: "#6c757d",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <span
                            style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                backgroundColor: "var(--primary)",
                                display: "inline-block",
                            }}
                        />
                        {selectionText}
                    </div>

                    <Button
                        type="primary"
                        onClick={handleSendPromo}
                        loading={sending}
                        disabled={loading || !totalSubscribers}
                        style={{
                            borderRadius: 999,
                            paddingInline: 22,
                            fontWeight: 600,
                            backgroundColor: "var(--primary)",
                            borderColor: "var(--primary)",
                            boxShadow: "0 8px 18px rgba(134,184,23,0.35)",
                        }}
                    >
                        Send promotion
                    </Button>
                </div>
            </div>

            {/* ===== Bảng subscribers ===== */}
            <Table
                rowKey="id"
                dataSource={data}
                columns={columns}
                loading={loading}
                className="themed-table themed-table--center"
                rowSelection={rowSelection}
                pagination={{
                    current: page,
                    onChange: setPage,
                    pageSize: 10,
                    showSizeChanger: false,
                    itemRender,
                }}
                size="middle"
            />
        </div>
    );
};
