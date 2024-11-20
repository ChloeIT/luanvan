import Column from "antd/es/table/Column";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AdEditBooking } from "./booking/AdEditBooking";
import { Button, Space, Table, Tag } from "antd";
import ColumnGroup from "antd/es/table/ColumnGroup";
import { AdDeleteBooking } from "./booking/AdDeleteBooking";
import { AdAddBooking } from "./booking/AdAddBooking";

export const AdBooking = () => {
  const { bookings } = useSelector((state) => state.booking);
  const IMAGES_URL = import.meta.env.VITE_HOTEL_IMAGES;
  const [isModalEditVisible, setIsModalEditVisible] = useState(false);
  const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
  const [isModalAddVisible, setIsModalAddVisible] = useState(false);
  const [itemACtion, setItemACtion] = useState();

  const handleEditBooking = (booking) => {
    setIsModalEditVisible(true);
    setItemACtion(booking);
  };

  const handleDeleteBooking = (booking) => {
    setIsModalDeleteVisible(true);
    setItemACtion(booking);
  };

  const handleAddBooking = () => {
    setIsModalAddVisible(true);
    setItemACtion();
  };

  useEffect(() => {
    console.log(itemACtion);
  }, [itemACtion]);

  return (
    <div>
      <AdEditBooking
        isModalEditVisible={isModalEditVisible}
        setIsModalEditVisible={setIsModalEditVisible}
        itemACtion={itemACtion}
      />
      <AdDeleteBooking
        isModalDeleteVisible={isModalDeleteVisible}
        setIsModalDeleteVisible={setIsModalDeleteVisible}
        itemACtion={itemACtion}
      />
      <AdAddBooking
        isModalAddVisible={isModalAddVisible}
        setIsModalAddVisible={setIsModalAddVisible}
        itemACtion={itemACtion}
      />
      <Button onClick={handleAddBooking} className="mb-2">
        {" "}
        Add Booking{" "}
      </Button>
      <Table dataSource={bookings} rowKey="id">
        <ColumnGroup title="Bookings">
          <Column title="Check In" dataIndex="checkIn" key="checkIn" />
          <Column title="Check Out" dataIndex="checkOut" key="checkOut" />
          <Column title="TotalPrice" dataIndex="totalPrice" key="totalPrice" />
          <Column
            title="Payment"
            dataIndex="payment"
            key="payment"
            render={(payment) => (
              <Tag color={payment ? "purple" : "orange"}>
                {payment ? "paid" : "not yet paid"}
              </Tag>
            )}
          />
        </ColumnGroup>
        <Column
          title="Action"
          key="action"
          fixed="right"
          render={(_, booking) => (
            <Space size="middle" key={booking.id}>
              <a onClick={() => handleEditBooking(booking)}>Edit</a>
              <a onClick={() => handleDeleteBooking(booking)}>Delete</a>
            </Space>
          )}
        />
      </Table>
    </div>
  );
};
