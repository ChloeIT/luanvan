import { Modal } from "antd";
import React from "react";
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
  const handleModalOk = async () => {
    try {
      await userServices.delete(itemACtion.id);
      setIsModalDeleteVisible(false);
      dispatch(
        userAction.setUsers(users.filter((user) => user.id != itemACtion.id))
      );
    } catch (error) {
      console.error("Error delete user", error);
    }
  };

  return (
    <Modal
      title="Delete User"
      open={isModalDeleteVisible}
      onCancel={() => setIsModalDeleteVisible(false)}
      onOk={handleModalOk}
    ></Modal>
  );
};
