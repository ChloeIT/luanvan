import { Button, Modal, Card } from "antd";
import React, { useEffect, useState } from "react";
import { CiCircleMinus } from "react-icons/ci"; // Thêm biểu tượng loại bỏ phòng khỏi danh sách so sánh
import { RoomCard } from "../Room";

export const CompareButton = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Lấy danh sách phòng so sánh từ localStorage
  const data = JSON.parse(localStorage.getItem("compareRooms")) || [];
  const [compares, setCompares] = useState(data);

  useEffect(() => {
    // Chỉ cập nhật lại state nếu dữ liệu so sánh trong localStorage thay đổi
    if (data.length !== compares.length) {
      setCompares(data);
    }
  }, [data, compares.length]); // Thêm compares.length vào dependency array để ngăn lặp vô tận

  const open = () => {
    setIsModalVisible(true);
  };

  const close = () => {
    setIsModalVisible(false);
  };

  const removeFromCompare = (roomId) => {
    const updatedCompareList = compares.filter((room) => room.id !== roomId);
    localStorage.setItem("compareRooms", JSON.stringify(updatedCompareList));
    setCompares(updatedCompareList); // Cập nhật state
  };

  return (
    <>
      <Button onClick={open} className="fixed bottom-5 right-5 btn btn-primary">
        Compare
      </Button>
      <Modal
        title="Hotel Compare"
        open={isModalVisible}
        style={{backgroundColor: "#000 !important"}}
        onCancel={close}
        width={1000}
        footer={[
          <Button key="cancel" onClick={close}>
            Close
          </Button>,
        ]}
      >
        {/* Nếu không có phòng nào để so sánh */}
        {compares.length === 0 ? (
          <p>No rooms to compare.</p>
        ) : (
          <div className="flex flex-wrap justify-around gap-2">
            {compares.map((room) => {
              return <RoomCard key={room.id} room={room} />;
            })}
          </div>
        )}
      </Modal>
    </>
  );
};
