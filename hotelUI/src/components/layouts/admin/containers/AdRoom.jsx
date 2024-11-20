import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AdEditRoom } from "./room/AdEditRoom";
import { Avatar, Button, Space, Table, Tag } from "antd";
import ColumnGroup from "antd/es/table/ColumnGroup";
import Column from "antd/es/table/Column";
import { AdDeleteRoom } from "./room/AdDeleteRoom";
import { AdAddRoom } from "./room/AdAddRoom";

export const AdRoom = () => {
  const { rooms } = useSelector((state) => state.room);
  const IMAGES_URL = import.meta.env.VITE_HOTEL_IMAGES;
  const [isModalEditVisible, setIsModalEditVisible] = useState(false);
  const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
  const [isModalAddVisible, setIsModalAddVisible] = useState(false);
  const [itemACtion, setItemACtion] = useState();

  const handleEditRoom = (room) => {
    setIsModalEditVisible(true);
    setItemACtion(room);
  };

  const handleDeleteRoom = (room) => {
    setIsModalDeleteVisible(true);
    setItemACtion(room);
  };

  const handleAddRoom = () => {
    setIsModalAddVisible(true);
    setItemACtion();
  };

  return (
    <div>
      <AdEditRoom
        isModalEditVisible={isModalEditVisible}
        setIsModalEditVisible={setIsModalEditVisible}
        itemACtion={itemACtion}
      />
      <AdDeleteRoom
        isModalDeleteVisible={isModalDeleteVisible}
        setIsModalDeleteVisible={setIsModalDeleteVisible}
        itemACtion={itemACtion}
      />
      <AdAddRoom
        isModalAddVisible={isModalAddVisible}
        setIsModalAddVisible={setIsModalAddVisible}
      />
      <Button onClick={handleAddRoom} className="mb-2">
        {" "}
        Add Room{" "}
      </Button>

      <Table dataSource={rooms} rowKey="id">
        <ColumnGroup title="Rooms">
          <Column
            title="Image"
            dataIndex="image"
            key="image"
            render={(image) => (
              <Avatar
                src={`${import.meta.env.VITE_IMAGE_URL}/rooms/${image}`} // Sử dụng VITE_IMAGE_URL từ biến môi trường
                alt={`image ${image}`}
              />
            )}
          />

          <Column title="name" dataIndex="name" key="name" />
          <Column title="price" dataIndex="price" key="price" />
          <Column title="capacity" dataIndex="capacity" key="capacity" />
          <Column
            title="type"
            dataIndex="type"
            key="type"
            render={(type) => (
              <>
                {type.split(",").map((type, index) => (
                  <Tag key={index} color="pink">
                    {type.trim()}
                  </Tag>
                ))}
              </>
            )}
          />
          <Column
            title="availability"
            dataIndex="availability"
            key="availability"
          />
          <Column title="create_at" dataIndex="create_at" key="create_at" />
          <Column title="update_at" dataIndex="update_at" key="update_at" />
        </ColumnGroup>
        <Column
          title="Action"
          key="action"
          fixed="right"
          render={(_, room) => (
            <Space size="middle" key={room.id}>
              <a onClick={() => handleEditRoom(room)}>Edit</a>
              <a onClick={() => handleDeleteRoom(room)}>Delete</a>
            </Space>
          )}
        />
      </Table>
    </div>
  );
};
