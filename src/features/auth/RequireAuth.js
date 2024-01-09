import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getCurrentToken } from "./authSlice";
import { jwtDecode } from "jwt-decode";

const RequireAuth = ({ allowedRoles }) => {
  const location = useLocation();
  const token = useSelector(getCurrentToken);
  const decoded = token ? jwtDecode(token) : undefined;
  const roles = decoded?.roles;
  const navigate = (pathname) => (
    <Navigate to={pathname} state={{ from: location }} replace />
  );

  return token ? (
    roles.find((role) => allowedRoles.includes(role)) ? (
      <Outlet />
    ) : (
      navigate("/unAuthorized")
    )
  ) : (
    navigate("/login")
  );
};

export default RequireAuth;
