// src/pages/Service.jsx
import React, { useEffect, useState } from "react";
import { AiOutlineGlobal } from "react-icons/ai";
import { FaHotel } from "react-icons/fa";
import { IoPersonSharp, IoSettingsSharp } from "react-icons/io5";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { loyaltyService } from "../services/loyalty";

export const Service = () => {
  const { user } = useSelector((state) => state.auth || {});
  const [loyalty, setLoyalty] = useState({ points: 0, tier: "BRONZE" });

  useEffect(() => {
    if (!user) return;
    loyaltyService
      .getMyLoyalty()
      .then((data) => {
        setLoyalty({
          points: data.points ?? 0,
          tier: data.tier ?? "BRONZE",
        });
      })
      .catch((err) => {
        console.error("Failed to load loyalty", err);
      });
  }, [user]);

  // heading-line pair (nhỏ giống các page khác)
  const pairStyle = {
    "--pair-gap": "3px",
    "--pair-mt": "10px",
    "--pair-mb": "10px",
  };

  // ===== TÍNH PROGRESS TỚI TIER TIẾP THEO =====
  let progressText = "";
  if (loyalty.points >= 100) {
    progressText =
      "You are already at the highest tier GOLD. Thank you for being a loyal guest of SB Hotel!";
  } else if (loyalty.points >= 10) {
    const need = 100 - loyalty.points;
    progressText = `You need ${need} more points to reach GOLD tier.`;
  } else {
    const need = Math.max(0, 10 - loyalty.points);
    progressText = `You need ${need} more points to reach SILVER tier.`;
  }

  const services = [
    {
      icon: <AiOutlineGlobal size={40} color="white" />,
      title: (
        <span
          style={{
            fontWeight: 900,
            fontSize: 20,
            letterSpacing: "0.4px",
          }}
        >
          Loyalty program
        </span>
      ),
      desc: (
        <>
          <p>Thank you for choosing SB Hotel!</p>
          <p>
            Our loyalty program rewards you with{" "}
            <strong>BRONZE</strong>, <strong>SILVER</strong> and{" "}
            <strong>GOLD</strong> tiers based on your total points,
            giving you more benefits the more you stay with us.
          </p>
        </>
      ),
      delay: "0.1s",
    },
    {
      icon: <FaHotel size={40} color="white" />,
      title: (
        <span
          style={{
            fontWeight: 900,
            fontSize: 20,
            letterSpacing: "0.4px",
          }}
        >
          Accumulate points
        </span>
      ),
      desc: (
        <>
          <p>
            Every completed, paid booking earns you loyalty points calculated
            from the room rate.
          </p>
          <p>
            Under 10 points: <strong>Bronze</strong> · 10–99:{" "}
            <strong>Silver</strong> · From 100:{" "}
            <strong>Gold</strong> with special privileges and discounts.
          </p>
        </>
      ),
      delay: "0.3s",
    },
    {
      icon: <IoPersonSharp size={40} color="white" />,
      title: (
        <span
          style={{
            fontWeight: 900,
            fontSize: 20,
            letterSpacing: "0.4px",
          }}
        >
          24/7 Customer Support
        </span>
      ),
      desc: (
        <>
          <p>
            Our professional and enthusiastic support team is ready to assist
            you anytime, from booking to check-out.
          </p>
          <p>Please contact us whenever you need help!</p>
        </>
      ),
      delay: "0.5s",
    },
    {
      icon: <IoSettingsSharp size={40} color="white" />,
      title: (
        <span
          style={{
            fontWeight: 900,
            fontSize: 20,
            letterSpacing: "0.4px",
          }}
        >
          Promotions and offers
        </span>
      ),
      desc: (
        <p>
          Enjoy brilliant promotions and surprisingly good prices, with extra
          offers unlocked at higher loyalty tiers.
        </p>
      ),
      delay: "0.7s",
    },

  ];

  return (
    <div className="container-xxl py-4">
      <div className="container">
        {/* ====== LOYALTY CARD – DỮ LIỆU THẬT ====== */}
        {user && (
          <div className="row justify-content-center mb-4">
            <div className="col-lg-8">
              <div className="h-full rounded-3xl bg-amber-100/90 border border-amber-200/70 p-4 p-md-4 text-center shadow-sm">
                <h3
                  className="mb-2 text-primary text-uppercase"
                  style={{
                    fontSize: "22px",
                    fontWeight: 900,
                    letterSpacing: "0.6px",
                    textShadow: "0 1px 0 rgba(0,0,0,0.08)", // 👈 nhẹ, sang
                  }}
                >
                  Your Loyalty Program
                </h3>

                <p className="mb-1" style={{ fontSize: "14px" }}>
                  Hello{" "}
                  <span className="fw-bold">
                    {user.fullName || user.username}
                  </span>
                  , you currently have{" "}
                  <span className="fw-bold text-primary">
                    {loyalty.points} points
                  </span>{" "}
                  – tier{" "}
                  <span className="fw-bold text-uppercase">
                    {loyalty.tier}
                  </span>
                  .
                </p>

                <p className="mb-1 small text-muted">{progressText}</p>

                <p className="mb-0 small text-muted">
                  Each completed, paid booking will earn you loyalty points
                  based on the room rate. Under 10 points you are BRONZE, from
                  10 to 99 you become SILVER, and from 100 points you enjoy GOLD
                  member benefits with more rewards and special discounts.
                </p>

                <div className="mt-3">
                  <Link
                    to="/my-bookings"
                    className="btn btn-primary rounded-pill px-4 py-2"
                    style={{ fontSize: "14px" }}
                  >
                    View my bookings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====== TIÊU ĐỀ ====== */}
        <div className="text-center">
          <div className="sb-heading sb-heading--md mx-auto">
            {/* lines left */}
            <span className="sb-heading__lines sb-heading__lines--left">
              <span className="sb-heading__line sb-heading__line--long" />
              <span className="sb-heading__line sb-heading__line--short" />
            </span>

            <h6
              className="sb-heading__label"
              style={{
                fontSize: "26px",      // 👈 TO hơn
                fontWeight: 900,       // 👈 ĐẬM
                letterSpacing: "0.18em"
              }}
            >
              Services
            </h6>


            {/* lines right */}
            <span className="sb-heading__lines sb-heading__lines--right">
              <span className="sb-heading__line sb-heading__line--long" />
              <span className="sb-heading__line sb-heading__line--short" />
            </span>
          </div>

          <h1 className="mb-4" style={{ fontSize: "28px" }}>
            Our Services
          </h1>
        </div>


        {/* ====== 4 Ô DỊCH VỤ ====== */}
        <div className="row gy-4 gx-3 justify-content-center align-items-stretch">
          {services.map((s, i) => (
            <div
              key={i}
              className="col-lg-3 col-sm-6 text-center pt-3 d-flex"
              data-wow-delay={s.delay}
            >
              <div className="position-relative border border-primary pt-5 pb-3 px-3 w-100 h-100 d-flex flex-column">
                <div
                  className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle position-absolute top-0 start-50 translate-middle shadow"
                  style={{ width: "80px", height: "80px" }}
                >
                  {s.icon}
                </div>

                <h5
                  className="mt-3 mb-1 d-flex align-items-center justify-content-center text-center"
                  style={{ minHeight: "52px", fontSize: "17px" }}
                >
                  {s.title}
                </h5>
                <div className="sb-pair">
                  <span className="sb-pair__line sb-pair__line--top" />
                  <span className="sb-pair__line sb-pair__line--bot" />
                </div>


                <div className="flex-grow-1" style={{ fontSize: "14px" }}>
                  {s.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
