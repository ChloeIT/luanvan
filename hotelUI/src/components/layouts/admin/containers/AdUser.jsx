// src/components/layouts/admin/AdUser.jsx
import { Avatar, Button, Table } from "antd";
import Column from "antd/es/table/Column";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { AdAddUser, AdDeleteUser, AdEditUser } from "./user";

const IMAGE_ROOT = import.meta.env.VITE_IMAGE_URL || "";

export const AdUser = () => {
  const users = useSelector((state) => state.user?.users) || [];

  const [isModalEditVisible, setIsModalEditVisible] = useState(false);
  const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
  const [isModalAddVisible, setIsModalAddVisible] = useState(false);
  const [itemACtion, setItemACtion] = useState(null);

  const [page, setPage] = useState(1);

  const handleEditUser = (user) => {
    setItemACtion(user);
    setIsModalEditVisible(true);
  };

  const handleDeleteUser = (user) => {
    setItemACtion(user);
    setIsModalDeleteVisible(true);
  };

  const handleAddUser = () => setIsModalAddVisible(true);

  // ===== Pagination styles =====
  const pagerBase = useMemo(
    () => ({
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
    }),
    []
  );

  const pagerActive = useMemo(
    () => ({
      backgroundColor: "#155bd6",
      borderColor: "#155bd6",
      color: "#fff",
    }),
    []
  );

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

  // ===== Role pill style =====
  const baseRolePill = useMemo(
    () => ({
      display: "inline-block",
      padding: "4px 12px",
      borderRadius: 9999,
      fontWeight: 700,
      fontSize: 12,
      lineHeight: "20px",
      boxShadow: "0 1px 0 rgba(0,0,0,.06)",
      whiteSpace: "nowrap",
    }),
    []
  );

  const pillStyleByRole = (name) => {
    switch (name) {
      case "ROLE_ADMIN":
        return { backgroundColor: "#FFE8E6", color: "#A8071A", border: "1px solid #FF7875" };
      case "ROLE_MODERATOR":
        return { backgroundColor: "#FFF1D6", color: "#AD4E00", border: "1px solid #FFC069" };
      default:
        return { backgroundColor: "#E9F9D8", color: "#237804", border: "1px solid #95DE64" };
    }
  };

  // ✅ ưu tiên đúng cột DB: full_name
  const getDisplayName = (u) =>
    u?.full_name || u?.fullName || u?.fullname || "";

  const getInitials = (u) => {
    const name = String(getDisplayName(u) || "").trim();
    if (name) {
      return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
    }
    return (u?.username?.[0] || "?").toUpperCase();
  };

  const getAvatarSrc = (u) => (u?.image ? `${IMAGE_ROOT}/users/${u.image}` : null);

  return (
    <div className="p-4">
      <AdEditUser
        isModalEditVisible={isModalEditVisible}
        setIsModalEditVisible={setIsModalEditVisible}
        itemACtion={itemACtion}
      />
      <AdDeleteUser
        isModalDeleteVisible={isModalDeleteVisible}
        setIsModalDeleteVisible={setIsModalDeleteVisible}
        itemACtion={itemACtion}
      />
      <AdAddUser
        isModalAddVisible={isModalAddVisible}
        setIsModalAddVisible={setIsModalAddVisible}
      />

      <div className="mb-3 flex items-center justify-end">
        <Button type="primary" onClick={handleAddUser}>
          Add User
        </Button>
      </div>

      <Table
        dataSource={users}
        rowKey={(u) => u?.id ?? u?.username ?? Math.random()}
        className="themed-table themed-table--center"
        size="middle"
        scroll={{ x: 1100 }}
        pagination={{
          current: page,
          onChange: setPage,
          pageSize: 10,
          showSizeChanger: false,
          itemRender,
        }}
      >
        <Column
          title="Image"
          key="image"
          align="center"
          width={80}
          render={(_, user) => {
            const src = getAvatarSrc(user);
            const initials = getInitials(user);
            return (
              <Avatar src={src || undefined} alt={user?.username || "avatar"}>
                {!src && initials}
              </Avatar>
            );
          }}
        />

        <Column title="Username" dataIndex="username" key="username" align="center" width={140} />

        <Column
          title="Full Name"
          key="fullName"
          align="center"
          width={220}
          render={(_, user) => (
            <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
              {getDisplayName(user)}
            </span>
          )}
        />

        <Column
          title="Gender"
          dataIndex="gender"
          key="gender"
          align="center"
          width={90}
          render={(v) => (v ? String(v) : "")}
        />

        <Column
          title="Phone"
          dataIndex="phone"
          key="phone"
          align="center"
          width={140}
          render={(v) => (v === null || v === undefined ? "" : String(v))}
        />

        <Column
          title="Birth Date"
          dataIndex="birth_date"
          key="birth_date"
          align="center"
          width={130}
          render={(value, user) => {
            const v = value ?? user?.birthDate; // fallback nếu API trả camelCase
            return v ? dayjs(v).format("YYYY-MM-DD") : "";
          }}
        />

        <Column
          title="Roles"
          dataIndex="roles"
          key="roles"
          align="center"
          width={180}
          render={(roles) => (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              {roles?.map((role, i) => (
                <span
                  key={`${role?.name || "role"}-${i}`}
                  style={{ ...baseRolePill, ...pillStyleByRole(role?.name) }}
                >
                  {role?.name}
                </span>
              ))}
            </div>
          )}
        />

        <Column
          title="Address"
          dataIndex="address"
          key="address"
          align="center"
          width={220}
          render={(v) => (v ? String(v) : "")}
        />

        <Column
          title="Action"
          key="action"
          align="center"
          width={140}
          render={(_, user) => (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
              <button
                onClick={() => handleEditUser(user)}
                className="px-3 py-1 rounded-md font-medium text-white bg-blue-500 hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteUser(user)}
                className="px-3 py-1 rounded-md font-medium text-white bg-red-500 hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          )}
        />
      </Table>
    </div>
  );
};

export default AdUser;
