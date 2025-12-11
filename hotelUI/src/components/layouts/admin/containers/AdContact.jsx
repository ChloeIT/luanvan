// src/components/layouts/admin/containers/AdContact.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Table, Select, message } from "antd";
import { adminContactService } from "@/services/adminContact";

// màu cho từng trạng thái
const STATUS_STYLES = {
    PENDING: {
        backgroundColor: "#E6F4FF",
        border: "1px solid #91CAFF",
        color: "#0958D9",
    },
    IN_PROGRESS: {
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

    if (t.startsWith("booking")) return "BOOKING";
    if (t.startsWith("payment")) return "PAYMENT";
    if (t.startsWith("loyalty")) return "LOYALTY";
    if (t.includes("technical") || t.includes("support")) return "SUPPORT";
    if (!t || t === "other") return "OTHER";

    // fallback
    return "OTHER";
};

// Lấy label đẹp cho topic
const getTopicLabel = (raw = "") => {
    const code = normalizeTopic(raw);
    const found = CONTACT_TOPICS.find((t) => t.value === code);
    return found?.label || "Other";
};

export const AdContact = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // filter theo topic (dropdown phía trên)
    const [topicFilter, setTopicFilter] = useState("ALL");

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const res = await adminContactService.getAll();
            setData(res.data || []);
        } catch (err) {
            console.error(err);
            message.error("Failed to load contacts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleChangeStatus = async (id, status) => {
        try {
            const res = await adminContactService.updateStatus(id, status);
            const newStatus = res.data?.status || status;

            setData((prev) =>
                prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
            );
            message.success("Status updated.");
        } catch (err) {
            console.error(err);
            message.error("Failed to update status.");
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
            title: "ID",
            dataIndex: "id",
            width: 60,
            align: "center",
            responsive: ["md"],
        },
        {
            title: "Name",
            dataIndex: "name",
            width: 120,
            align: "center",
            responsive: ["sm"],
        },
        {
            title: "Email",
            dataIndex: "email",
            width: 260,
            ellipsis: true,
        },
        {
            title: "Subject",
            dataIndex: "subject",
            width: 220,
            ellipsis: true,
            responsive: ["sm"],
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
            width: 190,
            align: "center",
            render: (value, record) => {
                const status = value || "PENDING";
                const style = STATUS_STYLES[status] || STATUS_STYLES.PENDING;

                return (
                    <Select
                        size="small"
                        value={status}
                        onChange={(val) => handleChangeStatus(record.id, val)}
                        options={[
                            { value: "PENDING", label: "PENDING" },
                            { value: "IN_PROGRESS", label: "IN_PROGRESS" },
                            { value: "DONE", label: "DONE" },
                        ]}
                        dropdownMatchSelectWidth={false}
                        style={{
                            width: 150,
                            borderRadius: 999,
                            fontWeight: 600,
                            textAlign: "center",
                            ...style,
                        }}
                        bordered={false}
                    />
                );
            },
        },
    ];

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
                scroll={{ x: 1000 }}
            />
        </div>
    );
};
