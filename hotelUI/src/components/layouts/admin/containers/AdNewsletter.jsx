import React, { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message } from "antd";
import { newsletterService } from "@/services/newsletter";

export const AdNewsletter = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

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
            message.success("Subscriber deleted.");
        } catch (err) {
            console.error(err);
            message.error("Failed to delete subscriber.");
        }
    };

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

    return (
        <div className="p-4">
            <h2 className="text-2xl font-extrabold text-[#2a2a2a] mb-3">
                Newsletter <span style={{ color: "var(--primary)" }}>Subscribers</span>
            </h2>

            <Table
                rowKey="id"
                dataSource={data}
                columns={columns}
                loading={loading}
                className="themed-table themed-table--center"
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
