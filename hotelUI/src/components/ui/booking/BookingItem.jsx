import React, { useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { bookingAction } from "../../../store/booking";

export const BookingItem = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "";

  const cart = useSelector((s) => s.booking?.cart || []);
  const selectedIds = useSelector((s) => s.booking?.selectedIds || []);
  const message = useSelector((s) => s.booking?.message || "");

  const isSelected = (roomId) =>
    selectedIds.some((id) => String(id) === String(roomId));

  const selectedItems = useMemo(() => {
    const set = new Set((selectedIds || []).map(String));
    return (cart || []).filter((x) => set.has(String(x.roomId)));
  }, [cart, selectedIds]);

  const totalSelected = useMemo(
    () => selectedItems.reduce((sum, it) => sum + (it.totalPrice || 0), 0),
    [selectedItems]
  );

  const totalSelectedNights = useMemo(
    () => selectedItems.reduce((sum, it) => sum + (it.nights || 0), 0),
    [selectedItems]
  );

  const minCheckout = (checkIn) => {
    const d = new Date(checkIn);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const hasInvalidRange = useMemo(
    () => selectedItems.some((it) => (it.nights || 0) <= 0),
    [selectedItems]
  );

  // ✅ Only allow checkout exactly 1 room
  const canProceed = selectedItems.length === 1 && !hasInvalidRange;

  const onProceed = () => {
    if (!canProceed) return;

    const draft = {
      items: selectedItems, // ✅ exactly 1
      totalPrice: totalSelected,
      totalNights: totalSelectedNights,
    };
    localStorage.setItem("bookData", JSON.stringify(draft));
    navigate("/checkout");
  };

  /* ================= Empty cart ================= */
  if (!cart.length) {
    return (
      <div className="container-xxl py-4">
        <div className="container">
          <div className="alert alert-warning m-0">
            Your booking cart is empty. Please add rooms from a hotel page.
          </div>
        </div>
      </div>
    );
  }

  const inputStyle = {
    width: "100%",
    background: "#F9FAFB",
    color: "#111827",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "6px 9px",
    fontSize: 13,
  };

  const pillStyle = {
    background: "#FFFBEB",
    color: "#a16207",
    border: "1px solid #fde68a",
    padding: "3px 10px",
    fontSize: 12,
  };

  return (
    <div className="container-xxl py-4">
      <div className="container" style={{ maxWidth: 1080 }}>
        {/* ✅ System message from slice (ex: different hotel warning) */}
        {!!message && (
          <div className="alert alert-warning mb-3" style={{ borderRadius: 12 }}>
            {message}
          </div>
        )}

        {/* ===== List items ===== */}
        <div className="d-grid" style={{ gap: 12 }}>
          {cart.map((it) => {
            const checked = isSelected(it.roomId);
            const validRange = (it.nights || 0) > 0;

            const hotelId =
              it.hotelId ??
              it.room?.hotelId ??
              it.room?.hotel?.id ??
              it.room?.hotel?.hotelId ??
              null;

            const onToggleSingle = () => {
              // Nếu đang bỏ chọn -> cho toggle bình thường
              if (checked) {
                dispatch(bookingAction.toggleSelect(it.roomId));
                return;
              }

              // Nếu đang chọn room khác -> clear rồi chọn room này (đảm bảo chỉ 1)
              if (selectedItems.length >= 1) {
                dispatch(bookingAction.clearSelected());
              }
              dispatch(bookingAction.toggleSelect(it.roomId));
            };

            return (
              <div
                key={it.roomId}
                style={{
                  background: "var(--card-yellow)",
                  border: "1px solid rgba(0,0,0,.06)",
                  borderRadius: 16,
                  padding: 12,
                  boxShadow: "0 6px 16px rgba(0,0,0,.08)",
                }}
              >
                {/* ===== Checkbox + Remove ===== */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="d-inline-flex align-items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={onToggleSingle}
                    />
                    <span style={{ fontWeight: 800, color: "var(--primary)" }}>
                      Select
                    </span>
                  </label>

                  <button
                    className="btn btn-outline-danger"
                    style={{
                      borderRadius: 9999,
                      padding: "5px 10px",
                      fontSize: 12,
                    }}
                    onClick={() =>
                      dispatch(bookingAction.removeFromCart(it.roomId))
                    }
                  >
                    Remove
                  </button>
                </div>

                <div className="row g-2">
                  {/* ===== Image ===== */}
                  <div className="col-md-4">
                    <img
                      src={`${IMAGE_URL}/rooms/${it.image}`}
                      alt={it.name}
                      style={{
                        width: "100%",
                        height: 160,
                        objectFit: "cover",
                        borderRadius: 12,
                      }}
                    />
                  </div>

                  {/* ===== Info ===== */}
                  <div className="col-md-8">
                    <div
                      style={{
                        background: "rgba(255,255,255,.75)",
                        borderRadius: 14,
                        padding: 12,
                        height: "100%",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "100px 1fr",
                          gap: 8,
                          fontSize: 13,
                        }}
                      >
                        {/* Hotel */}
                        <span style={{ color: "#FFC30B", fontWeight: 800 }}>
                          Hotel:
                        </span>

                        {hotelId ? (
                          <Link
                            to={`/hotel/${hotelId}`}
                            style={{
                              fontWeight: 900,
                              color: "var(--primary)",
                              textDecoration: "none",
                            }}
                            onClick={() =>
                              window.scrollTo({ top: 0, behavior: "smooth" })
                            }
                            title="Go to hotel details"
                          >
                            {it.hotelName}
                            <span
                              style={{
                                marginLeft: 6,
                                fontSize: 12,
                                opacity: 0.7,
                              }}
                            >
                              ↗
                            </span>
                          </Link>
                        ) : (
                          <span style={{ fontWeight: 900, color: "var(--primary)" }}>
                            {it.hotelName || "Unknown"}
                          </span>
                        )}

                        {/* Room */}
                        <span style={{ color: "#FFC30B", fontWeight: 800 }}>
                          Room:
                        </span>
                        <span style={{ fontWeight: 700 }}>{it.name}</span>

                        {/* Price */}
                        <span style={{ color: "#FFC30B", fontWeight: 800 }}>
                          Price:
                        </span>
                        <span style={{ fontWeight: 800 }}>{it.price}$ / night</span>
                      </div>

                      {/* ===== Dates ===== */}
                      <div className="row g-2 mt-2">
                        <div className="col-md-6">
                          <input
                            type="date"
                            value={it.checkIn}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => {
                              const newIn = e.target.value;
                              const newOut =
                                !it.checkOut || it.checkOut <= newIn
                                  ? minCheckout(newIn)
                                  : it.checkOut;

                              dispatch(
                                bookingAction.updateCartDates({
                                  roomId: it.roomId,
                                  checkIn: newIn,
                                  checkOut: newOut,
                                })
                              );
                            }}
                            style={inputStyle}
                          />
                        </div>

                        <div className="col-md-6">
                          <input
                            type="date"
                            value={it.checkOut}
                            min={minCheckout(it.checkIn)}
                            onChange={(e) =>
                              dispatch(
                                bookingAction.updateCartDates({
                                  roomId: it.roomId,
                                  checkIn: it.checkIn,
                                  checkOut: e.target.value,
                                })
                              )
                            }
                            style={inputStyle}
                          />
                        </div>
                      </div>

                      {!validRange && (
                        <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>
                          Check-out must be at least 1 day after check-in.
                        </div>
                      )}

                      {/* ===== Summary ===== */}
                      <div className="mt-2 d-flex gap-2 align-items-center">
                        <span className="rounded-pill" style={pillStyle}>
                          {validRange
                            ? `${it.nights} night${it.nights > 1 ? "s" : ""}`
                            : "—"}
                        </span>
                        <span>
                          Total: <b>{it.totalPrice}$</b>
                        </span>
                      </div>

                      {/* ✅ Hint if user tries to select another room */}
                      {!checked && selectedItems.length === 1 && (
                        <div style={{ marginTop: 10, color: "#b91c1c", fontSize: 13 }}>
                          You can only select 1 room for checkout. Selecting this room will
                          replace the previous selection.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== Footer ===== */}
        <div className="mt-3 d-flex justify-content-between align-items-center">
          {/* Summary pill */}
          <div
            style={{
              background: "#FFFBEB",
              border: "1px solid #FDE68A",
              color: "#92400E",
              borderRadius: 9999,
              padding: "8px 18px",
              fontWeight: 900,
              fontSize: 15,
              letterSpacing: ".3px",
              boxShadow: "0 4px 12px rgba(0,0,0,.08)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>
              {selectedItems.length} room{selectedItems.length > 1 ? "s" : ""}
            </span>
            <span style={{ opacity: 0.5 }}>—</span>
            <span style={{ color: "var(--primary)", fontSize: 16 }}>
              {totalSelected}$
            </span>
          </div>

          <div className="d-flex flex-column align-items-end">
            <button
              className="btn btn-primary"
              onClick={onProceed}
              disabled={!canProceed}
              style={{
                borderRadius: 9999,
                padding: "8px 18px",
                fontWeight: 800,
              }}
            >
              Proceed to checkout
            </button>

            {selectedItems.length === 0 && (
              <div style={{ marginTop: 8, fontSize: 13, color: "#92400E" }}>
                Please select exactly 1 room to continue.
              </div>
            )}

            {selectedItems.length > 1 && (
              <div style={{ marginTop: 8, fontSize: 13, color: "#b91c1c" }}>
                You can only checkout 1 room at a time.
              </div>
            )}

            {selectedItems.length === 1 && hasInvalidRange && (
              <div style={{ marginTop: 8, fontSize: 13, color: "#b91c1c" }}>
                Please fix the date range before proceeding.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
