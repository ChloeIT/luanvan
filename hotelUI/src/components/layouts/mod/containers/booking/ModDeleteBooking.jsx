// src/components/layouts/mod/containers/booking/ModDeleteBooking.jsx
import React from "react";
import { Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { bookingServices } from "../../../../../services";
import { bookingAction } from "../../../../../store/booking/slice";

export const ModDeleteBooking = ({
    isModalDeleteVisible,
    setIsModalDeleteVisible,
    itemACtion,
    onDeleted,   // callback từ ModBookings (fetchBookings)
}) => {
    const { bookings } = useSelector((state) => state.booking);
    const dispatch = useDispatch();

    const handleModalOk = async () => {
        if (!itemACtion?.id) return;
        try {
            await bookingServices.delete(itemACtion.id);
            setIsModalDeleteVisible(false);

            if (onDeleted) {
                onDeleted();
            } else {
                // fallback: xoá local
                dispatch(
                    bookingAction.setBookings(
                        bookings.filter((b) => b.id !== itemACtion.id)
                    )
                );
            }
        } catch (error) {
            console.error("Error delete booking (MOD)", error);
        }
    };

    return (
        <Modal
            title="Delete Booking"
            open={isModalDeleteVisible}
            onCancel={() => setIsModalDeleteVisible(false)}
            onOk={handleModalOk}
            okText="Delete"
            cancelText="Cancel"
        >
            <p>Are you sure you want to delete this booking?</p>
        </Modal>
    );
};

export default ModDeleteBooking;
