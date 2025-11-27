// src/components/layouts/mod/containers/room/ModDeleteRoom.jsx
import React from "react";
import { Modal, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { roomServices } from "../../../../../services";
import { roomAction } from "../../../../../store/room/slice";

export const ModDeleteRoom = ({
    isModalDeleteVisible,
    setIsModalDeleteVisible,
    itemACtion,
    onDeleted, // callback: ModRooms -> fetchRooms
}) => {
    const { rooms } = useSelector((state) => state.room);
    const dispatch = useDispatch();

    const handleModalOk = async () => {
        if (!itemACtion?.id) return;

        try {
            await roomServices.delete(itemACtion.id);
            message.success("Room deleted successfully");

            if (onDeleted) {
                onDeleted();
            } else {
                // fallback: update redux local
                dispatch(
                    roomAction.setRooms(
                        rooms.filter((room) => room.id !== itemACtion.id)
                    )
                );
            }

            setIsModalDeleteVisible(false);
        } catch (error) {
            console.error("Error delete room (MOD)", error);
            message.error("Error deleting room");
        }
    };

    return (
        <Modal
            title="Delete Room"
            open={isModalDeleteVisible}
            onCancel={() => setIsModalDeleteVisible(false)}
            onOk={handleModalOk}
            okText="Delete"
            cancelText="Cancel"
        >
            <p>Are you sure you want to delete this room?</p>
        </Modal>
    );
};

export default ModDeleteRoom;
