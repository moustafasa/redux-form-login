import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentToken, logOut } from "../features/auth/authSlice";
import { useLogOutMutation } from "../features/auth/authApiSlice";

const NavBar = () => {
  const token = useSelector(getCurrentToken);
  const [logout] = useLogOutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logOutHandler = async () => {
    try {
      await logout().unwrap();
      dispatch(logOut());
      navigate("/");
    } catch (err) {}
  };

  const navContent = (
    <Navbar.Collapse className={`text-capitalize `}>
      {token ? (
        <>
          <Nav className="gap-sm-2 me-auto">
            <Nav.Link as={Link} to={"/"}>
              home
            </Nav.Link>
            <Nav.Link as={Link} to={"/dashboard"}>
              dashboard
            </Nav.Link>
            <Nav.Link as={Link} to={"/profile"}>
              profile
            </Nav.Link>
          </Nav>
          <Nav className="gap-sm-2">
            <Button variant="primary" onClick={logOutHandler}>
              signOut
            </Button>
          </Nav>
        </>
      ) : (
        <>
          <Nav className="me-auto">
            <Nav.Link as={Link} to={"/"}>
              home
            </Nav.Link>{" "}
          </Nav>
          <Nav className="gap-2">
            <Link to={"/login"} className="btn btn-primary  text-capitalize">
              log in
            </Link>
            <Link to={"/register"} className="btn btn-primary text-capitalize">
              register
            </Link>
          </Nav>
        </>
      )}
    </Navbar.Collapse>
  );
  return (
    <Navbar
      className="border-bottom"
      expand={"sm"}
      bg="dark"
      data-bs-theme="dark"
    >
      <Container className="gap-3">
        <Navbar.Brand as={Link} to={"/"} className="text-capitalize m-0">
          moustafa
        </Navbar.Brand>
        <Navbar.Toggle />
        {navContent}
      </Container>
    </Navbar>
  );
};

export default NavBar;
