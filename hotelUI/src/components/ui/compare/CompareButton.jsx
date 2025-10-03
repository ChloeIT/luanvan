import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { Button, Modal } from "antd";
import { FaBalanceScale } from "react-icons/fa";
import { RoomCard } from "@/components/ui/Room/RoomCard";

const MAX_Z = 2147483000;

// helpers
const safeParse = (text, fallback) => {
  try { const v = JSON.parse(text); return Array.isArray(v) ? v : fallback; }
  catch { return fallback; }
};
const getCompareList = () =>
  typeof window === "undefined"
    ? []
    : safeParse(localStorage.getItem("compareRooms") || "[]", []);
const setCompareList = (list) => {
  localStorage.setItem("compareRooms", JSON.stringify(list));
  window.dispatchEvent(new Event("compare:changed"));
};

export const CompareButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [compares, setCompares] = useState(getCompareList);
  const count = useMemo(() => compares.length, [compares]);

  useEffect(() => {
    const sync = () => setCompares(getCompareList());
    const onStorage = (e) => { if (e.key === "compareRooms") sync(); };
    sync();
    window.addEventListener("storage", onStorage);
    window.addEventListener("compare:changed", sync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("compare:changed", sync);
    };
  }, []);

  const open = () => { setCompares(getCompareList()); setIsOpen(true); };
  const close = () => setIsOpen(false);

  // Floating button
  const fab = !isOpen && (
    <button
      type="button"
      onClick={open}
      aria-label="Mở so sánh phòng"
      title="So sánh phòng"
      className="compare-fab"
      style={{
        position: "fixed",
        right: 45,
        bottom: 90,
        zIndex: MAX_Z,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 999,
        border: "none",
        boxShadow: "0 6px 18px rgba(0,0,0,.18)",
        background: "#86B817",
        color: "#fff",
        cursor: "pointer",
      }}
    >
      <FaBalanceScale size={20} aria-hidden />
      {count > 0 && (
        <span
          style={{
            marginLeft: 2,
            minWidth: 24,
            height: 24,
            padding: "0 6px",
            borderRadius: 999,
            background: "rgba(0,0,0,.25)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 12,
            lineHeight: "24px",
            textAlign: "center",
          }}
        >
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
        width={1200}                 // rộng hơn để đủ 4 cột
        destroyOnClose
        centered
        maskClosable
        zIndex={MAX_Z - 1}
        styles={{
          mask: { backdropFilter: "blur(2px)" },
          body: { background: "#fff", padding: 16, maxHeight: "72vh", overflowY: "auto" },
          header: { borderBottom: "1px solid #f0f0f0" },
          footer: { borderTop: "1px solid #f0f0f0" },
          content: { borderRadius: 12, overflow: "hidden" },
        }}
        footer={[<Button key="close" onClick={close}>Đóng</Button>]}
      >
        {compares.length === 0 ? (
          <div style={{ textAlign: "center", padding: 24 }}>
            <div style={{ marginBottom: 8 }}><FaBalanceScale size={28} /></div>
            <div style={{ fontWeight: 600 }}>Chưa có phòng để so sánh.</div>
            <div style={{ opacity: 0.8 }}>
              Hãy nhấn nút <strong>“+ So sánh”</strong> trên card phòng để thêm.
            </div>
          </div>
        ) : (
          // 👉 4 cột cố định (co về 3/2/1 theo CSS)
          <div className="compare-grid compare-grid--4">
            {compares.map((room) => (
              <RoomCard key={room.id} room={room} isFavorite={room.isFavorite} inCompare />
            ))}
          </div>
        )}
      </Modal>
    </>
  );
};
