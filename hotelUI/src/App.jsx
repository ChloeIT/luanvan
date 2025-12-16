// src/App.jsx
import { useEffect } from "react";
import { useLocation, useRoutes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { router } from "./router";
import { linkpage } from "./contant/link";

// ✅ thêm thunk
import { ensureMyFavorite } from "@/store/favorite/thunk";

function App() {
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((s) => s.auth?.user || null);

  // ===== set title =====
  useEffect(() => {
    const currentLink = linkpage.find((link) => link.to === location.pathname);
    document.title = currentLink ? `Hotel - ${currentLink.name}` : "Hotel";
  }, [location]);

  // ✅ đảm bảo myFavorite luôn tồn tại (có id) để bấm tim được
  useEffect(() => {
    if (user?.id) {
      dispatch(ensureMyFavorite(user.id));
    }
  }, [dispatch, user?.id]);

  return <>{useRoutes(router)}</>;
}

export default App;
