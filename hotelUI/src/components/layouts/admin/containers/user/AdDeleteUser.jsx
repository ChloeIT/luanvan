import { Modal, message } from "antd";
import React, { useState } from "react";
import { userServices } from "../../../../../services";
import { useDispatch, useSelector } from "react-redux";
import { userAction } from "../../../../../store/user/slice";

export const AdDeleteUser = ({
  isModalDeleteVisible,
  setIsModalDeleteVisible,
  itemACtion,
}) => {
  const { users } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleModalOk = async () => {
    try {
      setLoading(true);
      await userServices.delete(itemACtion.id);

      dispatch(
        userAction.setUsers(users.filter((u) => u.id !== itemACtion.id))
      );

      message.success("User deleted successfully");
      setIsModalDeleteVisible(false);
    } catch (error) {
      console.error("Error delete user", error);
      message.error(
        error?.response?.data?.message || "Failed to delete user"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Delete User"
      open={isModalDeleteVisible}
      onCancel={() => setIsModalDeleteVisible(false)}
      onOk={handleModalOk}
      confirmLoading={loading}
    >
      Are you sure you want to delete this user?
    </Modal>
  );
};
