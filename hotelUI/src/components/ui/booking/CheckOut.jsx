// src/pages/CheckOut.jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";

import { PaypalMain } from "./PaypalMain";
import { PaypalInfoUser } from "./PaypalInfoUser";
import { PaypalInforOrder } from "./PaypalInforOrder";

export const CheckOut = () => {
  const cart = useSelector((s) => s.booking?.cart || []);
  const selectedIds = useSelector((s) => s.booking?.selectedIds || []);

  const selectedItems = useMemo(() => {
    const set = new Set((selectedIds || []).map(String));
    return (cart || []).filter((x) => set.has(String(x.roomId)));
  }, [cart, selectedIds]);

  const totalPrice = useMemo(() => {
    return selectedItems.reduce((sum, it) => sum + (it.totalPrice || 0), 0);
  }, [selectedItems]);

  // Data passed into PaypalInforOrder / PaypalMain
  // Format: { items: [...], totalPrice }
  const data = useMemo(() => {
    if (selectedItems.length) return { items: selectedItems, totalPrice };

    // fallback (in case of refresh before redux hydration)
    try {
      const raw = localStorage.getItem("bookData");
      const parsed = raw ? JSON.parse(raw) : null;
      const items = Array.isArray(parsed?.items) ? parsed.items : [];
      const tp = Number(parsed?.totalPrice || 0);
      return items.length ? { items, totalPrice: tp } : null;
    } catch {
      return null;
    }
  }, [selectedItems, totalPrice]);

  if (!data) {
    return (
      <div className="container-xxl py-5">
        <div className="container">
          <div className="alert alert-warning m-0">
            Missing checkout data. Please select rooms in your booking cart and try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-xxl py-5">
      <div className="container">
        {/* ====== TITLE ====== */}
        <div className="text-center pb-4">
          <div className="sb-heading sb-heading--md mx-auto">
            <span className="sb-heading__lines sb-heading__lines--left">
              <span className="sb-heading__line sb-heading__line--long" />
              <span className="sb-heading__line sb-heading__line--short" />
            </span>

            <h6
              className="sb-heading__label text-uppercase"
              style={{
                fontSize: "26px",
                fontWeight: 900,
                letterSpacing: "0.18em",
                color: "var(--primary, #86B817)",
              }}
            >
              Booking
            </h6>

            <span className="sb-heading__lines sb-heading__lines--right">
              <span className="sb-heading__line sb-heading__line--long" />
              <span className="sb-heading__line sb-heading__line--short" />
            </span>
          </div>

          <h1 className="mb-5" style={{ fontSize: "28px", fontWeight: 700 }}>
            Order payment
          </h1>
        </div>

        {/* ====== CONTENT ====== */}
        <div className="max-w-3xl md:max-w-4xl mx-auto px-3 md:px-5 pb-4">
          <div className="grid grid-cols-12 gap-4 items-stretch">
            {/* LEFT: User information */}
            <div className="col-span-12 lg:col-span-5 lg:row-span-2 self-stretch">
              <section
                className="rounded-2xl p-4 md:p-5 h-full flex flex-col"
                style={{
                  background: "var(--card-yellow)",
                  boxShadow:
                    "0 10px 28px rgba(0,0,0,.16), 0 2px 8px rgba(0,0,0,.08)",
                  border: "1px solid rgba(0,0,0,.06)",
                }}
              >
                <h2
                  className="text-2xl md:text-3xl font-extrabold tracking-wide mb-3 text-center"
                  style={{ color: "var(--primary, #86B817)" }}
                >
                  User information
                </h2>

                <div className="flex-1">
                  <PaypalInfoUser />
                </div>
              </section>
            </div>

            {/* RIGHT 1: Order info */}
            <div className="col-span-12 lg:col-span-7">
              <section
                className="rounded-2xl p-4 md:p-5"
                style={{
                  background: "var(--card-yellow)",
                  boxShadow:
                    "0 10px 28px rgba(0,0,0,.16), 0 2px 8px rgba(0,0,0,.08)",
                  border: "1px solid rgba(0,0,0,.06)",
                }}
              >
                <h2
                  className="text-2xl md:text-3xl font-extrabold tracking-wide mb-3 text-center"
                  style={{ color: "var(--primary, #86B817)" }}
                >
                  Payment
                </h2>

                <PaypalInforOrder order={data} />
              </section>
            </div>

            {/* RIGHT 2: Payment option */}
            <div className="col-span-12 lg:col-span-7">
              <section
                className="rounded-2xl p-4 md:p-5 bg-white"
                style={{
                  boxShadow:
                    "0 10px 28px rgba(0,0,0,.16), 0 2px 8px rgba(0,0,0,.08)",
                  border: "1px solid rgba(0,0,0,.06)",
                }}
              >
                <h2
                  className="text-2xl md:text-3xl font-extrabold tracking-wide mb-3 text-center"
                  style={{ color: "var(--primary, #86B817)" }}
                >
                  Payment option
                </h2>

                <div className="w-full max-w-md md:max-w-lg mx-auto">
                  <PaypalMain order={data} />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
