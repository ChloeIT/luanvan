// src/components/layouts/mod/containers/booking/ModDeleteBooking.jsx
import React, { useMemo, useState } from "react";
import { Modal, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { bookingServices } from "../../../../../services";
import { bookingAction } from "../../../../../store/booking/slice";

export const ModDeleteBooking = ({
    isModalDeleteVisible,
    setIsModalDeleteVisible,
    itemACtion,
    onDeleted, // callback từ ModBookings (fetchBookings)
}) => {
    const { bookings } = useSelector((state) => state.booking);
    const dispatch = useDispatch();

    const [deleting, setDeleting] = useState(false);

    const bookingId = useMemo(() => itemACtion?.id, [itemACtion]);

    const handleClose = () => {
        if (deleting) return; // tránh đóng khi đang xoá
        setIsModalDeleteVisible(false);
    };

    const handleModalOk = async () => {
        if (!bookingId) {
            message.warning("Booking is missing.");
            return;
        }

        if (deleting) return;

        try {
            setDeleting(true);

            await bookingServices.delete(bookingId);

            message.success("Booking deleted successfully");

            setIsModalDeleteVisible(false);

            // ưu tiên callback để fetch lại list (đúng nhất)
            if (onDeleted) {
                onDeleted();
            } else {
                // fallback: xoá local
                dispatch(
                    bookingAction.setBookings(
                        Array.isArray(bookings)
                            ? bookings.filter((b) => b.id !== bookingId)
                            : []
                    )
                );
            }
        } catch (error) {
            console.error("Error delete booking (MOD)", error);
            message.error("Error deleting booking");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Modal
            title="Delete Booking"
            open={isModalDeleteVisible}
            onCancel={handleClose}
            onOk={handleModalOk}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            confirmLoading={deleting}
            maskClosable={!deleting}
            keyboard={!deleting}
        >
            <p>
                Are you sure you want to delete this booking{" "}
                <b>{bookingId ? `#${bookingId}` : ""}</b>?
            </p>
        </Modal>
    );
};

export default ModDeleteBooking;
