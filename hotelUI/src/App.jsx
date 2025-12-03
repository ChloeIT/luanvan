import { useLocation, useRoutes } from "react-router-dom"
import { router } from "./router"
import { useEffect } from "react";
import { linkpage } from "./contant/link";

function App() {
  const location = useLocation();
  useEffect(() => {
    const currentLink = linkpage.find((link) => link.to === location.pathname);
    if (currentLink) {
      document.title = `Hotel - ${currentLink.name}`;
    } else {
      document.title = "Hotel";
    }
  }, [location]);

  return <>{useRoutes(router)}</>;
}

export default App;
