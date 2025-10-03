import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { Button, Modal } from "antd";
import { FaBalanceScale } from "react-icons/fa";
import { useSelector } from "react-redux";
import { RoomCard } from "@/components/ui/Room/RoomCard";

const MAX_Z = 2000;

// helpers
const safeParse = (text, fallback) => { try { const v = JSON.parse(text); return Array.isArray(v) ? v : fallback; } catch { return fallback; } };
const read = () => (typeof window === "undefined" ? [] : safeParse(localStorage.getItem("compareRooms") || "[]", []));
const write = (list, { silent = false } = {}) => {
  localStorage.setItem("compareRooms", JSON.stringify(list));
  if (!silent) window.dispatchEvent(new Event("compare:changed"));
};

export const CompareButton = () => {
  // 1) Hotels từ Redux
  const hotels = useSelector((s) => s.hotel?.hotels || []);

  // 2) Map hotelId -> name
  const hotelNameById = useMemo(() => new Map(hotels.map(h => [String(h.id), h.name])), [hotels]);

  // 3) Map roomId -> { id: hotelId, name: hotelName }
  const roomToHotel = useMemo(() => {
    const m = new Map();
    for (const h of hotels) {
      for (const r of (h.rooms || [])) {
        m.set(String(r.id), { id: h.id, name: h.name });
      }
    }
    return m;
  }, [hotels]);

  // 4) Vá dữ liệu cũ: chèn hotel_id + hotelName nếu thiếu
  const upgrade = (list) =>
    list.map((r) => {
      let hid = r.hotel_id ?? r.hotelId ?? r?.hotel?.id ?? null;
      if (hid == null) {
        const meta = roomToHotel.get(String(r.id));
        if (meta) hid = meta.id;
      }
      const resolvedName =
        r.hotelName ||
        r?.hotel?.name ||
        (hid != null ? hotelNameById.get(String(hid)) : undefined) ||
        roomToHotel.get(String(r.id))?.name ||
        ""; // để rỗng, sẽ được fill sau khi hotels load
      return { ...r, hotel_id: hid, hotelName: resolvedName };
    });

  const [isOpen, setIsOpen] = useState(false);
  const [compares, setCompares] = useState(() => upgrade(read()));
  const count = compares.length;

  // 5) Khi hotels load/thay đổi: upgrade & ghi "im lặng" (không phát event → tránh vòng lặp)
  useEffect(() => {
    const upgraded = upgrade(read());
    setCompares(upgraded);
    write(upgraded, { silent: true });
  }, [hotelNameById, roomToHotel]);

  // 6) Sync giữa tabs/components: chỉ set state, KHÔNG write ở đây
  useEffect(() => {
    const sync = () => setCompares(upgrade(read()));
    const onStorage = (e) => { if (e.key === "compareRooms") sync(); };
    sync();
    window.addEventListener("storage", onStorage);
    window.addEventListener("compare:changed", sync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("compare:changed", sync);
    };
  }, [hotelNameById, roomToHotel]);

  const open = () => { setCompares(upgrade(read())); setIsOpen(true); };
  const close = () => setIsOpen(false);

  const fab = !isOpen && (
    <button
      type="button"
      onClick={open}
      aria-label="Mở so sánh phòng"
      title="So sánh phòng"
      className="compare-fab"
      style={{ position: "fixed", right: 45, bottom: 90, zIndex: MAX_Z, display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 999, border: "none", boxShadow: "0 6px 18px rgba(0,0,0,.18)", background: "#86B817", color: "#fff", cursor: "pointer" }}
    >
      <FaBalanceScale size={20} aria-hidden />
      {count > 0 && (
        <span style={{ marginLeft: 2, minWidth: 24, height: 24, padding: "0 6px", borderRadius: 999, background: "rgba(0,0,0,.25)", color: "#fff", fontWeight: 700, fontSize: 12, lineHeight: "24px", textAlign: "center" }}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <>
      {typeof document !== "undefined" ? ReactDOM.createPortal(fab, document.body) : fab}

      <Modal
        title="So sánh phòng"
        open={isOpen}
        onCancel={close}
        width={1200}
        destroyOnClose
        centered
        maskClosable
        zIndex={MAX_Z - 1}
        styles={{ mask: { backdropFilter: "blur(2px)" }, body: { background: "#fff", padding: 16, maxHeight: "72vh", overflowY: "auto" }, header: { borderBottom: "1px solid #f0f0f0" }, footer: { borderTop: "1px solid #f0f0f0" }, content: { borderRadius: 12, overflow: "hidden" } }}
        footer={[<Button key="close" onClick={close}>Đóng</Button>]}
      >
        {compares.length === 0 ? (
          <div style={{ textAlign: "center", padding: 24 }}>
            <div style={{ marginBottom: 8 }}><FaBalanceScale size={28} /></div>
            <div style={{ fontWeight: 600 }}>Chưa có phòng để so sánh.</div>
            <div style={{ opacity: 0.8 }}>Hãy nhấn nút <strong>“+ So sánh”</strong> trên card phòng để thêm.</div>
          </div>
        ) : (
          <div className="compare-grid compare-grid--4">
            {compares.map((room) => {
              const byId =
                hotelNameById.get(String(room.hotel_id ?? room.hotelId ?? room?.hotel?.id ?? "")) ||
                roomToHotel.get(String(room.id))?.name ||
                undefined;

              const fallbackName = room.hotelName || byId || room?.hotel?.name || "";

              return (
                <RoomCard
                  key={room.id}
                  room={room}
                  inCompare
                  variant="compact"
                  hotelName={fallbackName}                                      // ← tên KS hiển thị
                  hotelId={room.hotel_id ?? room.hotelId ?? room?.hotel?.id}     // ← id KS nếu cần
                  isFavorite={room.isFavorite || false}
                />
              );
            })}
          </div>
        )}
      </Modal>
    </>
  );
};
