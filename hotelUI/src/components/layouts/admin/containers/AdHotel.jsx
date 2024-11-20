import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AdAddHotel, AdDeleteHotel, AdEditHotel } from "./hotel";
import { Avatar, Button, Space, Table, Tag } from "antd";
import ColumnGroup from "antd/es/table/ColumnGroup";
import Column from "antd/es/table/Column";

export const AdHotel = () => {
  const { hotels } = useSelector((state) => state.hotel);
  const IMAGES_URL = import.meta.env.VITE_HOTEL_IMAGES;
  const [isModalEditVisible, setIsModalEditVisible] = useState(false);
  const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
  const [isModalAddVisible, setIsModalAddVisible] = useState(false);
  const [itemACtion, setItemACtion] = useState();

  const handleEditHotel = (hotel) => {
    setIsModalEditVisible(true);
    setItemACtion(hotel);
  };

  const handleDeleteHotel = (hotel) => {
    setIsModalDeleteVisible(true);
    setItemACtion(hotel);
  };

  const handleAddHotel = () => {
    setIsModalAddVisible(true);
    setItemACtion();
  };

  console.log(hotels);
  useEffect(() => {
    console.log(itemACtion);
  }, [itemACtion]);

  return (
    <div>
      <AdEditHotel
        isModalEditVisible={isModalEditVisible}
        setIsModalEditVisible={setIsModalEditVisible}
        itemACtion={itemACtion}
      />
      <AdDeleteHotel
        isModalDeleteVisible={isModalDeleteVisible}
        setIsModalDeleteVisible={setIsModalDeleteVisible}
        itemACtion={itemACtion}
      />
      <AdAddHotel
        isModalAddVisible={isModalAddVisible}
        setIsModalAddVisible={setIsModalAddVisible}
        itemACtion={itemACtion}
      />
      <Button onClick={handleAddHotel} className="mb-2"> Add Hotel </Button>
      <Table dataSource={hotels} rowKey="id">
        <ColumnGroup title="Hotels">
          <Column
            title="Image"
            dataIndex="image"
            key="image"
            render={(image) => (
              <Avatar
                src={`${import.meta.env.VITE_IMAGE_URL}/hotels/${image}`}
                alt={`image ${image}`}
              />
            )}
          />
          <Column title="Name" dataIndex="name" key="name" />
          <Column title="Address" dataIndex="address" key="address" />
          <Column
            title="Amenities"
            dataIndex="amenities"
            key="amenities"
            render={(amenities) => (
              <>
                {amenities.split(",").map((amenity, index) => (
                  <Tag key={index} color="green">
                    {amenity.trim()} {/* Trim whitespace if necessary */}
                  </Tag>
                ))}
              </>
            )}
          />{" "}
          <Column title="Rating" dataIndex="rating" key="rating" />
          <Column title="Phone" dataIndex="phone" key="phone" />
          <Column
            title="Rooms"
            dataIndex="rooms"
            key="rooms"
            render={(rooms) => rooms?.length} // Safe access to rooms length
          />
        </ColumnGroup>
        <Column
          title="Action"
          key="action"
          fixed="right"
          render={(_, hotel) => (
            <Space size="middle" key={hotel.id}>
              <a onClick={() => handleEditHotel(hotel)}>Edit</a>
              <a onClick={() => handleDeleteHotel(hotel)}>Delete</a>
              {/* <a onClick={() => handleAddHotel(hotel)}>Add</a> */}
            </Space>
          )}
        />
      </Table>
    </div>
  );
};
