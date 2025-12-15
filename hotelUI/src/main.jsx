import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { store } from "./store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

/* ✅ CSS order: vendor -> vendor overrides -> theme -> your layers -> legacy last */

/* 1) Vendor */
import "./assets/css/bootstrap.min.css";

/* 2) Template / vendor override (nếu main.css là template thì để ngay sau bootstrap) */
import "./assets/css/main.css";

/* 3) Theme variables phải có trước khi base/components dùng var(--bg) */
import "./assets/css/theme.css";

/* 4) Global base (set nền vàng = var(--bg)) */
import "./assets/css/base.css";

/* 5) Your split files */
import "./assets/css/components.css";
import "./assets/css/sections.css";
import "./assets/css/pages.css";

/* 6) Page-specific (profile cũ) */
import "./assets/css/profile.css";

/* 7) Legacy overrides (chỉ giữ nếu còn rule “cần thiết”) */
import "./assets/css/style.css";

/* 8) index.css: chỉ để cuối nếu nó là “override nhỏ” / hoặc bỏ nếu không cần */
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
);
