import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import { useSelector } from "react-redux";
import { getCurrentToken } from "../features/auth/authSlice";
import classNames from "classnames";

const LayOut = () => {
  return (
    <div className="min-vh-10">
      <NavBar />
      <Outlet />
    </div>
  );
};

export default LayOut;
