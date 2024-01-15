import React, { useEffect, useState } from "react";
import { Alert, Button, Container, Form } from "react-bootstrap";
import { useLoginMutation } from "./authApiSlice";
import { useDispatch } from "react-redux";
import { setCredentials } from "./authSlice";
import { jwtDecode } from "jwt-decode";
import { redirect, useLocation, useNavigate } from "react-router-dom";
import useLocalStorage from "../../hooks/useLocalStorage";
import Feedback from "react-bootstrap/esm/Feedback";

export const loader = (token) => async () => {
  return token ? redirect("/") : null;
};

const LogIn = () => {
  const [validate, setValidate] = useState(false);

  const [email, setEmail] = useState("");
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
    const form = e.currentTarget;
    setValidate(true);
    console.log(form);
    if (form.checkValidity() === true) {
      try {
        const res = await login({ email: email, password: pass }).unwrap();
        dispatch(setCredentials({ user: email, ...res }));
        setEmail("");
        setPass("");
        navigate(from);
      } catch (err) {
        console.log(err);
        if (!err?.status) {
          setErrMsg("connection error");
        } else if (err?.status === 401 || err?.status === 404) {
          setErrMsg("the email or password is invalid");
        } else {
          setErrMsg("login failed");
        }
      }
    }
  };

  useEffect(() => {
    if (errMsg !== "") {
      setErrMsg("");
    }
  }, [email, pass]);

  return (
    <Form
      className="mt-5 mx-sm-auto mx-2  p-4 border rounded"
      style={{ maxWidth: "600px" }}
      onSubmit={submitHandler}
      validated={validate}
      noValidate
    >
      {errMsg && (
        <Alert variant="danger" className="text-capitalize">
          {errMsg}
        </Alert>
      )}
      <h2 className="text-center text-capitalize mb-3">login</h2>
      <Form.Group className="mb-3" controlId="email">
        <Form.Label className="text-capitalize">email</Form.Label>
        <Form.Control
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Feedback type="invalid">please write valid email</Feedback>
      </Form.Group>
      <Form.Group className="mb-3" controlId="password">
        <Form.Label className="text-capitalize">password</Form.Label>
        <Form.Control
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
        />
        <Feedback type="invalid">the password can't be empty</Feedback>
      </Form.Group>
      <Form.Check
        className="text-capitalize"
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
