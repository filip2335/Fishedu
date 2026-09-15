import { Navigate, useLocation } from "react-router-dom";
import { SEEN_KEY } from "../pages/Witaj.jsx";

function widzial() {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

export default function WelcomeGate({ children }) {
  const location = useLocation();
  if (!widzial()) {
    return <Navigate to="/witaj" replace state={{ from: location.pathname }} />;
  }
  return children;
}
