// src/pages/CheckOut.jsx
import React from "react";
import { PaypalMain } from "./PaypalMain";
import { PaypalInfoUser } from "./PaypalInfoUser";
import { PaypalInforOrder } from "./PaypalInforOrder";

export const CheckOut = () => {
  const data = JSON.parse(localStorage.getItem("bookData"));

  // Card base: bo góc + padding + transition
  const elevate = "rounded-2xl p-4 md:p-5 transition-shadow duration-200";
  // Bóng mạnh + viền rất mỏng để tách nền
  const shadowStyle = {
    boxShadow: "0 10px 28px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.06)",
  };
  const title = "text-2xl md:text-3xl font-extrabold tracking-wide mb-3 text-center";

  return (
    <div>
      {/* Header giữ nguyên */}
      <div className="text-center pb-4">
        <div className="heading-line mx-auto" style={{ "--heading-gap": "14px" }}>
          <span style={{ display: "grid", justifyItems: "end", gap: "6px", marginRight: "2px" }}>
            <span className="divider" style={{ "--w": "120px" }} />
            <span className="divider" style={{ "--w": "60px", "--alpha": 0.45 }} />
          </span>
          <h6 className="heading-text text-3xl text-primary text-uppercase">Booking</h6>
          <span style={{ display: "grid", justifyItems: "start", gap: "6px", marginLeft: "2px" }}>
            <span className="divider" style={{ "--w": "120px" }} />
            <span className="divider" style={{ "--w": "60px", "--alpha": 0.45 }} />
          </span>
        </div>
        <h1 className="mb-5">Order payment</h1>
      </div>

      <div className="max-w-3xl md:max-w-4xl mx-auto px-3 md:px-5 pb-4">
        <div className="grid grid-cols-12 gap-4 items-stretch">
          {/* LEFT: User information — nền vàng + shadow mạnh */}
          <div className="col-span-12 lg:col-span-5 lg:row-span-2 self-stretch">
            <section
              className="rounded-2xl p-4 md:p-5 transition-shadow duration-200 h-full flex flex-col"
              style={{
                background: "var(--card-yellow)",
                boxShadow: "0 10px 28px rgba(0,0,0,.16), 0 2px 8px rgba(0,0,0,.08)",
                border: "1px solid rgba(0,0,0,.06)",
              }}
            >
              <h2
                className="text-2xl md:text-3xl font-extrabold tracking-wide mb-3 text-center"
                style={{ color: "var(--primary, #86B817)" }}
              >
                User information
              </h2>

              {/* body cần flex-1 để kéo giãn card trái */}
              <div className="flex-1">
                <PaypalInfoUser />
              </div>
            </section>

          </div>

          {/* RIGHT 1: Payment */}
          <div className="col-span-12 lg:col-span-7">
            <section
              className="rounded-2xl p-4 md:p-5 transition-shadow duration-200"
              style={{
                background: "var(--card-yellow)",
                boxShadow: "0 10px 28px rgba(0,0,0,.16), 0 2px 8px rgba(0,0,0,.08)",
                border: "1px solid rgba(0,0,0,.06)",
              }}
            >
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-wide mb-3 text-center"
                style={{ color: "var(--primary, #86B817)" }}>
                Payment
              </h2>
              <PaypalInforOrder order={data} />
            </section>
          </div>

          {/* RIGHT 2: Payment option */}
          <div className="col-span-12 lg:col-span-7">
            <section
              className="rounded-2xl p-4 md:p-5 bg-white transition-shadow duration-200"
              style={{
                boxShadow: "0 10px 28px rgba(0,0,0,.16), 0 2px 8px rgba(0,0,0,.08)",
                border: "1px solid rgba(0,0,0,.06)",
              }}
            >
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-wide mb-3 text-center"
                style={{ color: "var(--primary, #86B817)" }}>
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
  );
};
