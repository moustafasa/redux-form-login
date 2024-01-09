import React, { useEffect, useState } from "react";
import { Alert, Button, Container, Form } from "react-bootstrap";
import { useLoginMutation } from "./authApiSlice";
import { useDispatch } from "react-redux";
import { setCredentials } from "./authSlice";
import { jwtDecode } from "jwt-decode";
import { redirect, useLocation, useNavigate } from "react-router-dom";
import useLocalStorage from "../../hooks/useLocalStorage";

export const loader = (token) => async () => {
  return token ? redirect("/") : null;
};

const LogIn = () => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [errMsg, setErrMsg] = useState();

  const [login] = useLoginMutation();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [persistCheck, setPersistCheck] = useLocalStorage("persist", false);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ username: user, password: pass }).unwrap();
      dispatch(setCredentials({ user, ...res }));
      setUser("");
      setPass("");
      navigate(from);
    } catch (err) {
      console.log(err);
      if (!err?.status) {
        setErrMsg("connection error");
      } else if (err?.status === 401 || err?.status === 404) {
        setErrMsg("the username or password is invalid");
      } else {
        setErrMsg("login failed");
      }
    }
  };

  useEffect(() => {
    if (errMsg !== "") {
      setErrMsg("");
    }
  }, [user, pass]);

  return (
    <Form
      className="mt-5 mx-sm-auto mx-2  p-4 border rounded"
      style={{ maxWidth: "600px" }}
      onSubmit={submitHandler}
    >
      {errMsg && (
        <Alert variant="danger" className="text-capitalize">
          {errMsg}
        </Alert>
      )}
      <h2 className="text-center text-capitalize mb-3">login</h2>
      <Form.Group className="mb-3" controlId="username">
        <Form.Label className="text-capitalize">username</Form.Label>
        <Form.Control
          type="text"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="password">
        <Form.Label className="text-capitalize">password</Form.Label>
        <Form.Control
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
      </Form.Group>
      <Form.Check
        label="trust this device"
        id="trustCheck"
        checked={persistCheck}
        onChange={() => setPersistCheck((persist) => !persist)}
      />
      <Button
        className="d-block mx-auto mt-4 text-capitalize px-5"
        type="submit"
      >
        login
      </Button>
    </Form>
  );
};

export default LogIn;
