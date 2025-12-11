// src/components/layouts/admin/containers/AdContact.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Select, Table, message as antdMessage } from "antd";
import { contactServices } from "@/services/contact";
import {
    FiCalendar,
    FiFileText,
    FiFlag,
    FiMail,
    FiMessageCircle,
    FiTag,
    FiUser,
} from "react-icons/fi";

// ===== Màu cho từng trạng thái (chỉ PENDING / DONE) =====
const STATUS_STYLES = {
    PENDING: {
        backgroundColor: "#FFF7E6",
        border: "1px solid #FFD591",
        color: "#AD6800",
    },
    DONE: {
        backgroundColor: "#F6FFED",
        border: "1px solid #B7EB8F",
        color: "#237804",
    },
};

const STATUS_LABELS = {
    PENDING: "PENDING",
    DONE: "DONE",
};

// Các topic giống bên Contact page
const CONTACT_TOPICS = [
    { value: "BOOKING", label: "Booking & Reservation" },
    { value: "PAYMENT", label: "Payment & Refund" },
    { value: "LOYALTY", label: "Loyalty Points" },
    { value: "SUPPORT", label: "Technical Support" },
    { value: "OTHER", label: "Other" },
];

// Chuẩn hoá topic trả về từ BE
const normalizeTopic = (raw = "") => {
    const t = String(raw).trim().toLowerCase();

    if (t.startsWith("booking") || t === "booking") return "BOOKING";
    if (t.startsWith("payment") || t === "payment") return "PAYMENT";
    if (t.startsWith("loyalty") || t === "loyalty") return "LOYALTY";
    if (t.includes("technical") || t.includes("support") || t === "support")
        return "SUPPORT";
    if (!t || t === "other") return "OTHER";

    return "OTHER";
};

// Lấy label đẹp cho topic
const getTopicLabel = (raw = "") => {
    const code = normalizeTopic(raw);
    const found = CONTACT_TOPICS.find((t) => t.value === code);
    return found?.label || "Other";
};

// ô label bên trái trong modal
const LabelCell = ({ icon, text }) => (
    <div
        className="flex items-center gap-2 font-semibold"
        style={{ color: "#444" }}
    >
        {icon}
        <span>{text}</span>
    </div>
);

export const AdContact = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // filter theo topic (dropdown phía trên)
    const [topicFilter, setTopicFilter] = useState("ALL");

    // modal xem chi tiết + reply
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailRecord, setDetailRecord] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [sendingReply, setSendingReply] = useState(false);

    // ===== LOAD DATA =====
    const fetchContacts = async () => {
        try {
            setLoading(true);
            const res = await contactServices.getAllAdmin();
            setData(res.data || []);
        } catch (err) {
            console.error(err);
            antdMessage.error("Failed to load contacts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    // mở modal khi click Subject
    const handleOpenDetail = (record) => {
        setDetailRecord(record);
        setReplyText(record.adminReply || "");
        setDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setDetailRecord(null);
        setReplyText("");
        setSendingReply(false);
    };

    // gửi reply → BE lưu adminReply + set DONE
    const handleSendReply = async () => {
        if (!detailRecord) return;
        if (!replyText.trim()) {
            antdMessage.warning("Please enter your reply before sending.");
            return;
        }

        try {
            setSendingReply(true);
            const res = await contactServices.replyAdmin(
                detailRecord.id,
                replyText.trim()
            );
            const updated = res.data || {};

            // cập nhật lại list trên bảng
            setData((prev) =>
                prev.map((c) =>
                    c.id === detailRecord.id
                        ? {
                            ...c,
                            status: updated.status || "DONE",
                            adminReply: updated.adminReply || replyText.trim(),
                            repliedAt: updated.repliedAt,
                        }
                        : c
                )
            );

            antdMessage.success("Reply sent and status set to DONE.");
            handleCloseDetail();
        } catch (err) {
            console.error(err);
            antdMessage.error("Failed to send reply.");
            setSendingReply(false);
        }
    };

    // data sau khi filter theo topic
    const filteredData = useMemo(() => {
        if (topicFilter === "ALL") return data;
        return (data || []).filter(
            (c) => normalizeTopic(c.topic) === topicFilter
        );
    }, [data, topicFilter]);

    const columns = [
        {
            title: "Email",
            dataIndex: "email",
            width: 260,
            ellipsis: true,
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            width: 180,
            align: "center",
            responsive: ["sm"],
            render: (v) => (v ? v.replace("T", " ").substring(0, 19) : ""),
        },
        {
            title: "Status",
            dataIndex: "status",
            width: 160,
            align: "center",
            render: (value) => {
                const status = value || "PENDING";
                const style = STATUS_STYLES[status] || STATUS_STYLES.PENDING;

                // 🔹 chỉ hiển thị badge, không còn dropdown
                return (
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 999,
                            padding: "4px 14px",
                            fontSize: 12,
                            fontWeight: 600,
                            ...style,
                        }}
                    >
                        {STATUS_LABELS[status] || status}
                    </span>
                );
            },
        },
        {
            title: "Subject",
            dataIndex: "subject",
            width: 260,
            ellipsis: true,
            responsive: ["sm"],
            render: (subject, record) => (
                <button
                    type="button"
                    onClick={() => handleOpenDetail(record)}
                    className="text-blue-600 hover:underline"
                    style={{
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                    }}
                >
                    {subject || "(no subject)"}
                </button>
            ),
        },
    ];

    const currentStatus = detailRecord?.status || "PENDING";
    const currentStatusStyle =
        STATUS_STYLES[currentStatus] || STATUS_STYLES.PENDING;
    const isPending = currentStatus === "PENDING";

    return (
        <div className="p-4">
            {/* Header + Topic filter */}
            <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-extrabold text-[#2a2a2a]">
                    Contact <span style={{ color: "var(--primary)" }}>Messages</span>
                </h2>

                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-700">Topic:</span>
                    <Select
                        size="small"
                        style={{ width: 230 }}
                        value={topicFilter}
                        onChange={setTopicFilter}
                        options={[
                            { value: "ALL", label: "All topics" },
                            ...CONTACT_TOPICS.map((t) => ({
                                value: t.value,
                                label: t.label,
                            })),
                        ]}
                    />
                </div>
            </div>

            <Table
                rowKey="id"
                dataSource={filteredData}
                columns={columns}
                loading={loading}
                pagination={{ pageSize: 10 }}
                size="middle"
                className="themed-table themed-table--center"
                scroll={{ x: 900 }}
            />

            {/* Modal xem chi tiết + reply */}
            <Modal
                open={detailOpen}
                onCancel={handleCloseDetail}
                width={620}
                footer={
                    isPending
                        ? [
                            <button
                                key="cancel"
                                type="button"
                                onClick={handleCloseDetail}
                                className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>,
                            <button
                                key="reply"
                                type="button"
                                onClick={handleSendReply}
                                disabled={sendingReply}
                                className="px-4 py-1 rounded-md bg-[var(--primary)] text-white font-semibold hover:opacity-90"
                            >
                                {sendingReply ? "Sending..." : "Send reply & mark done"}
                            </button>,
                        ]
                        : [
                            <button
                                key="close"
                                type="button"
                                onClick={handleCloseDetail}
                                className="px-4 py-1 rounded-md bg-[var(--primary)] text-white font-semibold hover:opacity-90"
                            >
                                Close
                            </button>,
                        ]
                }
                title={
                    <span
                        style={{
                            fontWeight: 700,
                            fontSize: "18px",
                            color: "var(--primary)",
                        }}
                    >
                        Contact message details
                    </span>
                }
            >
                {detailRecord && (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "150px 1fr",
                            rowGap: "14px",
                            columnGap: "10px",
                            fontSize: "15px",
                            paddingTop: "5px",
                        }}
                    >
                        {/* NAME */}
                        <LabelCell icon={<FiUser size={16} />} text="Name:" />
                        <div>{detailRecord.name || "—"}</div>

                        {/* EMAIL */}
                        <LabelCell icon={<FiMail size={16} />} text="Email:" />
                        <div>{detailRecord.email || "—"}</div>

                        {/* CREATED AT */}
                        <LabelCell icon={<FiCalendar size={16} />} text="Created at:" />
                        <div>
                            {detailRecord.createdAt
                                ? detailRecord.createdAt.replace("T", " ").substring(0, 19)
                                : "—"}
                        </div>

                        {/* TOPIC */}
                        <LabelCell icon={<FiTag size={16} />} text="Topic:" />
                        <div>{getTopicLabel(detailRecord.topic)}</div>

                        {/* SUBJECT */}
                        <LabelCell icon={<FiMessageCircle size={16} />} text="Subject:" />
                        <div>{detailRecord.subject || "(No subject)"}</div>

                        {/* STATUS */}
                        <LabelCell icon={<FiFlag size={16} />} text="Status:" />
                        <div>
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 999,
                                    padding: "4px 14px",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    ...currentStatusStyle,
                                }}
                            >
                                {STATUS_LABELS[currentStatus] || currentStatus}
                            </span>
                        </div>

                        {/* MESSAGE */}
                        <LabelCell icon={<FiFileText size={16} />} text="Message:" />
                        <div
                            style={{
                                background: "rgba(0,0,0,0.03)",
                                padding: "12px 14px",
                                borderRadius: 8,
                                border: "1px solid rgba(0,0,0,0.08)",
                                whiteSpace: "pre-wrap",
                                lineHeight: "1.55",
                            }}
                        >
                            {detailRecord.message || "(No content)"}
                        </div>

                        {/* REPLY */}
                        <LabelCell icon={<FiMessageCircle size={16} />} text="Reply:" />
                        {isPending ? (
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={4}
                                style={{
                                    width: "100%",
                                    resize: "vertical",
                                    padding: "8px 10px",
                                    borderRadius: 8,
                                    border: "1px solid #d9d9d9",
                                    outline: "none",
                                }}
                                placeholder="Type your reply to the customer..."
                            />
                        ) : (
                            <div
                                style={{
                                    background: "#f6ffed",
                                    padding: "12px 14px",
                                    borderRadius: 8,
                                    border: "1px solid #b7eb8f",
                                    whiteSpace: "pre-wrap",
                                    lineHeight: "1.55",
                                }}
                            >
                                {detailRecord.adminReply || "No reply content."}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};
