import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoutes({ children, roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.role) {
    // If user role is null or undefined, return unauthorized
    console.log("Unauthorized Access!");
    return <Navigate to="/unauthorized" />;
  }

  if (roles && !roles.includes(user.role)) {
    console.log("Unauthorized Access!");
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

export default PrivateRoutes;
