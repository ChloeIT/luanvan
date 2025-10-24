import { Avatar, Button, Table } from "antd";
import Column from "antd/es/table/Column";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AdAddUser, AdDeleteUser, AdEditUser } from "./user";

export const AdUser = () => {
  const { users } = useSelector((state) => state.user);
  const [isModalEditVisible, setIsModalEditVisible] = useState(false);
  const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
  const [isModalAddVisible, setIsModalAddVisible] = useState(false);
  const [itemACtion, setItemACtion] = useState();

  // 👉 Pagination state để biết trang hiện tại (để tô active)
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

  useEffect(() => {
    console.log(itemACtion);
  }, [itemACtion]);

  // 👉 Style nút phân trang (JSX-only, không cần CSS)
  const pagerBase = {
    backgroundColor: "#1677ff",
    border: "1px solid #1677ff",
    color: "#fff",
    height: 28,
    minWidth: 28,
    padding: "0 10px",
    lineHeight: "26px",
    borderRadius: 999, // pill tròn
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
    // Giữ event/logic gốc, chỉ override style + children
    if (type === "page") {
      const isActive = pageNum === page;
      return React.cloneElement(original, {
        style: { ...pagerBase, ...(isActive ? pagerActive : null) },
        children: pageNum,
      });
    }
    if (type === "prev" || type === "next") {
      return React.cloneElement(original, {
        style: pagerBase,
      });
    }
    return original;
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
        // 👉 Pagination JSX-only style
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
          dataIndex="image"
          key="image"
          align="center"
          render={(image) => (
            <Avatar
              src={`${import.meta.env.VITE_IMAGE_URL}/users/${image}`}
              alt={`image ${image}`}
            />
          )}
        />
        <Column title="Username" dataIndex="username" key="username" align="center" />
        <Column title="Full Name" dataIndex="fullName" key="fullName" align="center" />
        <Column title="Gender" dataIndex="gender" key="gender" align="center" />
        <Column title="Phone" dataIndex="phone" key="phone" align="center" />
        <Column title="Birth Date" dataIndex="birthDate" key="birthDate" align="center" />

        <Column
          title="Roles"
          dataIndex="roles"
          key="roles"
          align="center"
          render={(roles) => {
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

            const basePill = {
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: 9999,
              fontWeight: 700,
              fontSize: 12,
              lineHeight: "20px",
              boxShadow: "0 1px 0 rgba(0,0,0,.06)",
              whiteSpace: "nowrap",
            };

            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {roles?.map((role, i) => (
                  <span key={i} style={{ ...basePill, ...pillStyleByRole(role.name) }}>
                    {role.name}
                  </span>
                ))}
              </div>
            );
          }}
        />

        <Column title="Address" dataIndex="address" key="address" align="center" />

        <Column
          title="Action"
          key="action"
          align="center"
          fixed="right"
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
              <a
                onClick={() => handleEditUser(user)}
                className="px-3 py-1 rounded-md font-medium text-white bg-blue-500 hover:bg-blue-600"
              >
                Edit
              </a>
              <a
                onClick={() => handleDeleteUser(user)}
                className="px-3 py-1 rounded-md font-medium text-white bg-red-500 hover:bg-red-600"
              >
                Delete
              </a>
            </div>
          )}
        />
      </Table>
    </div>
  );
};

export default AdUser;
