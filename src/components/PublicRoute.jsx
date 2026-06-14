import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Check if token exists in localStorage as fallback
  const storedToken = localStorage.getItem("token");

  if (isAuthenticated || storedToken) {
    // Redirect to dashboard if already authenticated
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
