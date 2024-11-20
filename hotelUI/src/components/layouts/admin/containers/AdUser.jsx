import { Avatar, Button, Modal, Space, Table, Tag } from "antd";
import Column from "antd/es/table/Column";
import ColumnGroup from "antd/es/table/ColumnGroup";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AdAddUser, AdDeleteUser, AdEditUser } from "./user";

export const AdUser = () => {
  const { users } = useSelector((state) => state.user);
  const IMAGES_URL = import.meta.env.VITE_HOTEL_IMAGES;
  const [isModalEditVisible, setIsModalEditVisible] = useState(false);
  const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
  const [isModalAddVisible, setIsModalAddVisible] = useState(false);
  const [itemACtion, setItemACtion] = useState();

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

  return (
    <div>
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
      <Button onClick={handleAddUser} className="mb-2"> Add User </Button>
      <Table dataSource={users} rowKey="id">
        <ColumnGroup title="Users">
          <Column
            title="Image"
            dataIndex="image"
            key="image"
            render={(image) => (
              <Avatar
                src={`${import.meta.env.VITE_IMAGE_URL}/users/${image}`} // Sử dụng VITE_IMAGE_URL từ biến môi trường
                alt={`image ${image}`}
              />
            )}
          />

          <Column title="Username" dataIndex="username" key="username" />
          <Column title="Full name" dataIndex="fullName" key="fullName" />
          <Column title="Gender" dataIndex="gender" key="gender" />
          <Column title="Phone" dataIndex="phone" key="phone" />
          <Column title="Birth date" dataIndex="birthDate" key="birthDate" />
          <Column
            title="Roles"
            dataIndex="roles"
            key="roles"
            render={(roles) => (
              <>
                {roles.map((role, index) => (
                  <Tag key={index} color="blue">
                    {role.name}
                  </Tag>
                ))}
              </>
            )}
          />
          <Column title="Address" dataIndex="address" key="address" />
        </ColumnGroup>
        <Column
          title="Action"
          key="action"
          fixed="right"
          render={(_, user) => (
            <Space size="middle" key={user.id}>
              <a onClick={() => handleEditUser(user)}>Edit</a>
              <a onClick={() => handleDeleteUser(user)}>Delete</a>
            </Space>
          )}
        />
      </Table>
    </div>
  );
};
