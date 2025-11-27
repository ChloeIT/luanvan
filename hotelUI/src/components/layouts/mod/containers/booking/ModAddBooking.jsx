// src/components/layouts/mod/containers/booking/ModAddBooking.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Modal, DatePicker, Input, Select, message } from "antd";
import dayjs from "dayjs";
import { bookingServices } from "../../../../../services";

const { Option } = Select;

export const ModAddBooking = ({
    isModalAddVisible,
    setIsModalAddVisible,
    onCreated,
}) => {
    const { hotels } = useSelector((state) => state.hotel);
    const { rooms } = useSelector((state) => state.room);
    const { user } = useSelector((state) => state.auth);

    // chỉ hotel của MOD
    const myHotels = useMemo(() => {
        if (!hotels || !user) return [];
        return hotels.filter((h) => h.ownerId === user.id);
    }, [hotels, user]);

    const [hotelId, setHotelId] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const [checkIn, setCheckIn] = useState(null);
    const [checkOut, setCheckOut] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const [payment, setPayment] = useState(null); // "paid" | "notpaid"

    // nếu MOD chỉ có 1 hotel -> auto chọn
    useEffect(() => {
        if (myHotels.length === 1 && !hotelId) {
            setHotelId(myHotels[0].id);
        }
    }, [myHotels, hotelId]);

    const roomsForSelectedHotel = useMemo(() => {
        if (!hotelId || !rooms?.length) return [];
        return rooms.filter((r) => String(r.hotel?.id) === String(hotelId));
    }, [rooms, hotelId]);

    const selectedRoom = useMemo(
        () => roomsForSelectedHotel.find((r) => r.id === roomId),
        [roomsForSelectedHotel, roomId]
    );

    useEffect(() => {
        if (!checkIn || !checkOut || !selectedRoom) {
            setTotalPrice(0);
            return;
        }

        const nights = dayjs(checkOut).startOf("day").diff(
            dayjs(checkIn).startOf("day"),
            "day"
        );

        if (nights <= 0) {
            setTotalPrice(0);
            return;
        }

        const pricePerNight = selectedRoom.price || 0;
        setTotalPrice(pricePerNight * nights);
    }, [checkIn, checkOut, selectedRoom]);

    const resetForm = () => {
        // nếu muốn giữ hotel đã chọn thì bỏ reset hotelId
        setRoomId(null);
        setCheckIn(null);
        setCheckOut(null);
        setTotalPrice(0);
        setPayment(null);
    };

    const handleCancel = () => {
        resetForm();
        setIsModalAddVisible(false);
    };

    const handleOk = async () => {
        if (!hotelId) {
            message.warning("Please choose a hotel.");
            return;
        }
        if (!roomId) {
            message.warning("Please choose a room.");
            return;
        }
        if (!checkIn || !checkOut) {
            message.warning("Please choose check-in and check-out date.");
            return;
        }

        if (
            !dayjs(checkOut).startOf("day").isAfter(
                dayjs(checkIn).startOf("day"),
                "day"
            )
        ) {
            message.warning("Check-out must be after check-in (at least 1 day).");
            return;
        }

        if (!payment) {
            message.warning("Please choose payment status.");
            return;
        }

        const payload = {
            checkIn: checkIn.startOf("day").format("YYYY-MM-DDTHH:mm:ss"),
            checkOut: checkOut.startOf("day").format("YYYY-MM-DDTHH:mm:ss"),
            totalPrice: Number(totalPrice) || 0,
            payment: payment === "paid",
            roomIds: [roomId],
        };

        try {
            const res = await bookingServices.create(payload);
            message.success("Booking created successfully");

            if (onCreated && res?.data) {
                onCreated(res.data);
            }

            resetForm();
            setIsModalAddVisible(false);
        } catch (err) {
            console.error("Error creating booking (MOD):", err);
            message.error("Error creating booking");
        }
    };

    const disabledCheckInDate = (current) => {
        return current && current.startOf("day").isBefore(dayjs().startOf("day"));
    };

    const disabledCheckOutDate = (current) => {
        if (!current) return false;
        const isBeforeToday = current.startOf("day").isBefore(dayjs().startOf("day"));

        if (!checkIn) {
            return isBeforeToday;
        }

        const isNotAfterCheckIn = !current
            .startOf("day")
            .isAfter(checkIn.startOf("day"), "day");

        return isBeforeToday || isNotAfterCheckIn;
    };

    const handleChangeCheckIn = (value) => {
        setCheckIn(value);
        if (
            value &&
            checkOut &&
            !checkOut.startOf("day").isAfter(value.startOf("day"), "day")
        ) {
            setCheckOut(null);
        }
    };

    return (
        <Modal
            title="Add Booking"
            open={isModalAddVisible}
            onCancel={handleCancel}
            onOk={handleOk}
            okText="OK"
            cancelText="Cancel"
            width={540}
        >
            {/* Hotel (chỉ hotel của MOD) */}
            <div className="mb-4">
                <label className="block font-medium mb-1">Hotel</label>
                <Select
                    placeholder="Choose hotel"
                    value={hotelId}
                    onChange={(val) => {
                        setHotelId(val);
                        setRoomId(null);
                    }}
                    className="w-full"
                    showSearch
                    optionFilterProp="children"
                >
                    {myHotels.map((h) => (
                        <Option key={h.id} value={h.id}>
                            {h.name} {`(#${h.id})`}
                        </Option>
                    ))}
                </Select>
            </div>

            {/* Room */}
            <div className="mb-2">
                <label className="block font-medium mb-1">Room</label>
                <Select
                    placeholder={
                        hotelId ? "Select room for this booking" : "Choose hotel first"
                    }
                    value={roomId}
                    onChange={setRoomId}
                    className="w-full"
                    disabled={!hotelId}
                >
                    {hotelId && roomsForSelectedHotel.length === 0 && (
                        <Option disabled value="__no_room">
                            No room for this hotel
                        </Option>
                    )}

                    {roomsForSelectedHotel.map((r) => (
                        <Option key={r.id} value={r.id}>
                            {r.name} {`(#${r.id})`} – {r.price}$
                        </Option>
                    ))}
                </Select>

                {selectedRoom && (
                    <p className="text-xs text-gray-600 mt-1">
                        Price per night:{" "}
                        <span className="font-semibold">{selectedRoom.price}$</span>
                    </p>
                )}
            </div>

            {/* Check In */}
            <div className="mb-4 mt-3">
                <label className="block font-medium mb-1">Check In</label>
                <DatePicker
                    format="YYYY-MM-DD"
                    placeholder="Choose check-in date"
                    value={checkIn}
                    onChange={handleChangeCheckIn}
                    className="w-full"
                    allowClear
                    disabledDate={disabledCheckInDate}
                />
            </div>

            {/* Check Out */}
            <div className="mb-4">
                <label className="block font-medium mb-1">Check Out</label>
                <DatePicker
                    format="YYYY-MM-DD"
                    placeholder="Choose check-out date"
                    value={checkOut}
                    onChange={setCheckOut}
                    className="w-full"
                    allowClear
                    disabledDate={disabledCheckOutDate}
                />
            </div>

            {/* Total Price */}
            <div className="mb-4">
                <label className="block font-medium mb-1">Total Price</label>
                <Input
                    type="number"
                    value={totalPrice}
                    readOnly
                    className="w-full bg-gray-50 cursor-not-allowed"
                />
            </div>

            {/* Payment */}
            <div className="mb-2">
                <label className="block font-medium mb-1">Payment</label>
                <Select
                    placeholder="Choose payment status"
                    value={payment}
                    onChange={setPayment}
                    className="w-full"
                >
                    <Option value="paid">paid</Option>
                    <Option value="notpaid">not yet paid</Option>
                </Select>
            </div>
        </Modal>
    );
};

export default ModAddBooking;
