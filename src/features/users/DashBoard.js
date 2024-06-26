import React from "react";
import { Container, Nav } from "react-bootstrap";
import { NavLink, Outlet } from "react-router-dom";

const DashBoard = () => {
  return (
    <Container fluid className="row" style={{ minHeight: "100vh" }}>
      <aside className="border-end col-3 p-3">
        <Nav className="flex-column gap-2 text-capitalize" variant="pills">
          <Nav.Item>
            <Nav.Link as={NavLink} to={"users"} end>
              users
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={NavLink} to={"users/addUser"}>
              addUser
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </aside>
      <div className="col p-3">
        <Outlet />
      </div>
    </Container>
  );
};

export default DashBoard;
