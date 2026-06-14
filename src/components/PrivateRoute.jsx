import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProfile, logout } from "../store/slices/authSlice";

const PrivateRoute = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token, admin } = useSelector((state) => state.auth);
  const storedToken = localStorage.getItem("token");

  const hasToken = Boolean(isAuthenticated || token || storedToken);
  const [verifying, setVerifying] = useState(hasToken && !admin);
  const [tokenValid, setTokenValid] = useState(hasToken);

  useEffect(() => {
    if (!hasToken) return;

    let cancelled = false;
    setVerifying(true);
    dispatch(getProfile())
      .unwrap()
      .then(() => {
        if (!cancelled) setTokenValid(true);
      })
      .catch(() => {
        if (cancelled) return;
        dispatch(logout());
        setTokenValid(false);
      })
      .finally(() => {
        if (!cancelled) setVerifying(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, hasToken]);

  if (!hasToken) return <Navigate to="/login" replace />;

  if (verifying) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tokenValid) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default PrivateRoute;
