import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

const LayOut = () => {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <NavBar />
      <Outlet />
    </div>
  );
};

export default LayOut;
