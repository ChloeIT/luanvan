// src/pages/RoomsPage.jsx
import React, { useMemo } from "react";
import { RoomCard } from "@/components/ui/Room/RoomCard";
import { CompareButton } from "@/components/ui/compare";

export default function RoomsPage({ rooms: roomsProp }) {
    const rooms = useMemo(() => roomsProp ?? [], [roomsProp]);

    return (
        <>
            <div className="container-xxl py-5">
                <div className="container">
                    {/* Lưới 4 cột, dùng CSS Grid để kiểm soát khoảng cách */}
                    <div className="rooms-grid">
                        {rooms.map((room, idx) => (
                            <div
                                className="room-cell wow fadeInUp"
                                data-wow-delay={`${0.1 + idx * 0.05}s`}
                                key={room.id}
                            >
                                <div className="inner">
                                    <RoomCard room={room} isFavorite={room.isFavorite} />
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            <CompareButton />
        </>
    );
}
