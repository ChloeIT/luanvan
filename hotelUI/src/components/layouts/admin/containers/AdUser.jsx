// src/components/layouts/admin/AdUser.jsx
import { Avatar, Button, Table } from "antd";
import Column from "antd/es/table/Column";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { AdAddUser, AdDeleteUser, AdEditUser } from "./user";

const IMAGE_ROOT = import.meta.env.VITE_IMAGE_URL || "";

export const AdUser = () => {
  const { users } = useSelector((state) => state.user);

  const [isModalEditVisible, setIsModalEditVisible] = useState(false);
  const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
  const [isModalAddVisible, setIsModalAddVisible] = useState(false);
  const [itemACtion, setItemACtion] = useState();

  // Pagination state
  const [page, setPage] = useState(1);

  const handleEditUser = (user) => {
    setIsModalEditVisible(true);
    setItemACtion(user);
  };

  const handleDeleteUser = (user) => {
    setIsModalDeleteVisible(true);
    setItemACtion(user);
  };

  const handleAddUser = () => {
    setIsModalAddVisible(true);
  };

  // Style nút phân trang
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

  // Base pill cho role
  const baseRolePill = {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: 9999,
    fontWeight: 700,
    fontSize: 12,
    lineHeight: "20px",
    boxShadow: "0 1px 0 rgba(0,0,0,.06)",
    whiteSpace: "nowrap",
  };
  const pillStyleByRole = (name) => {
    switch (name) {
      case "ROLE_ADMIN":
        return {
          backgroundColor: "#FFE8E6",
          color: "#A8071A",
          border: "1px solid #FF7875",
        };
      case "ROLE_MODERATOR":
        return {
          backgroundColor: "#FFF1D6",
          color: "#AD4E00",
          border: "1px solid #FFC069",
        };
      default:
        return {
          backgroundColor: "#E9F9D8",
          color: "#237804",
          border: "1px solid #95DE64",
        };
    }
  };

  return (
    <div className="p-4">
      {/* Modals */}
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

      {/* Actions */}
      <div className="mb-3 flex items-center justify-end">
        <Button type="primary" onClick={handleAddUser}>
          Add User
        </Button>
      </div>

      {/* Table */}
      <Table
        dataSource={users}
        rowKey="id"
        className="themed-table themed-table--center"
        size="middle"
        scroll={{ x: 1050 }} // cho phép kéo ngang trên màn nhỏ
        pagination={{
          current: page,
          onChange: setPage,
          pageSize: 10,
          showSizeChanger: false,
          itemRender,
        }}
      >
        {/* Avatar */}
        <Column
          title="Image"
          dataIndex="image"
          key="image"
          align="center"
          width={80}
          render={(image, user) => {
            const src = image ? `${IMAGE_ROOT}/users/${image}` : null;
            const initials =
              user?.fullName?.trim()?.split(" ")?.map((w) => w[0])?.join("") ??
              user?.username?.[0]?.toUpperCase() ??
              "?";
            return (
              <Avatar src={src} alt={user?.username || "avatar"}>
                {!src && initials}
              </Avatar>
            );
          }}
        />

        {/* Username */}
        <Column
          title="Username"
          dataIndex="username"
          key="username"
          align="center"
          width={140}
        />

        {/* Full name */}
        <Column
          title="Full Name"
          dataIndex="fullName"
          key="fullName"
          align="center"
          width={180}
          responsive={["sm"]}
        />

        {/* Gender */}
        <Column
          title="Gender"
          dataIndex="gender"
          key="gender"
          align="center"
          width={90}
          responsive={["sm"]}
        />

        {/* Phone */}
        <Column
          title="Phone"
          dataIndex="phone"
          key="phone"
          align="center"
          width={140}
          responsive={["sm"]}
        />

        {/* Birth Date – dạng YYYY-MM-DD */}
        <Column
          title="Birth Date"
          dataIndex="birthDate"
          key="birthDate"
          align="center"
          width={130}
          responsive={["md"]}
          render={(value) =>
            value ? dayjs(value).format("YYYY-MM-DD") : ""
          }
        />

        {/* Roles */}
        <Column
          title="Roles"
          dataIndex="roles"
          key="roles"
          align="center"
          width={170}
          responsive={["md"]}
          render={(roles) => (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              {roles?.map((role, i) => (
                <span
                  key={i}
                  style={{
                    ...baseRolePill,
                    ...pillStyleByRole(role.name),
                  }}
                >
                  {role.name}
                </span>
              ))}
            </div>
          )}
        />

        {/* Address */}
        <Column
          title="Address"
          dataIndex="address"
          key="address"
          align="center"
          width={220}
          responsive={["md"]}
        />

        {/* Action */}
        <Column
          title="Action"
          key="action"
          align="center"
          width={140}
          render={(_, user) => (
            <div
              key={user.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                alignItems: "center",
              }}
            >
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
