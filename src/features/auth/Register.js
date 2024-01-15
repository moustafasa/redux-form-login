import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Container, Form } from "react-bootstrap";
import { FaCircleInfo } from "react-icons/fa6";
import Feedback from "react-bootstrap/esm/Feedback";
import { useRegisterMutation } from "./authApiSlice";
import { setCredentials } from "./authSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

const Register = () => {
  const NAME_RGX = /^(?=.{4,24}$)[a-zA-Z]+(\s[a-zA-Z]*)*$/;
  const EMAIL_RGX = /^[a-zA-Z0-9]+@[a-zA-Z]+[.][a-zA-Z]+$/;
  const PASS_RGX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%/]).{8,24}$/;
  const nameRef = useRef();
  const errorRef = useRef();

  const [name, setName] = useState("");
  const [nameValid, setNameValid] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);

  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [pass, setPass] = useState("");
  const [passValid, setPassValid] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  const [passConfirm, setPassConfirm] = useState("");
  const [passConfirmValid, setPassConfirmValid] = useState(false);
  const [passConfirmFocus, setPassConfirmFocus] = useState(false);

  const [errMsg, setErrMsg] = useState();

  const [register] = useRegisterMutation();
  const dispatch = useDispatch();

  const navigator = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    if (errMsg) {
      errorRef.current?.focus();
    }
  }, [errMsg]);

  useEffect(() => {
    setNameValid(NAME_RGX.test(name));
  }, [name]);

  useEffect(() => {
    setEmailValid(EMAIL_RGX.test(email));
  }, [email]);

  useEffect(() => {
    setPassValid(PASS_RGX.test(pass));
    setPassConfirmValid(pass === passConfirm && pass);
  }, [pass, passConfirm]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (
      !NAME_RGX.test(name) ||
      !PASS_RGX.test(pass) ||
      !EMAIL_RGX.test(email)
    ) {
      setErrMsg("invalid Entry");
      return;
    }
    try {
      const res = await register({ name, email, password: pass }).unwrap();
      dispatch(setCredentials({ user: email, ...res }));
      navigator(from, { replace: true });
    } catch (err) {
      if (!err.status) {
        setErrMsg("network err");
      } else if (err.status === 409) {
        setErrMsg("the username is already exist");
      } else {
        setErrMsg("register failed");
      }
    }
    setName("");
    setPass("");
    setPassConfirm("");
  };

  return (
    <Form
      className="mx-auto mt-5 rounded border p-4 text-capitalize"
      style={{ maxWidth: "600px" }}
      onSubmit={submitHandler}
    >
      {errMsg && (
        <Alert variant="danger">
          <FaCircleInfo
            className="position-relative"
            style={{ bottom: "1px" }}
          />{" "}
          <span className="text-capitalize"> {errMsg}</span>
        </Alert>
      )}
      <h2 className="text-center mb-3">register</h2>
      <Form.Group className="mb-3" controlId="name">
        <Form.Label>name</Form.Label>
        <Form.Control
          type="text"
          value={name}
          onChange={(e) =>
            setName(e.target.value.replace(/\s{2,}/g, " ").trimStart())
          }
          onBlur={() => setNameFocus(false)}
          onFocus={() => setNameFocus(true)}
          isInvalid={nameFocus && !nameValid && name}
          isValid={nameValid}
          autoComplete="off"
          ref={nameRef}
        />
        <Form.Control.Feedback type="invalid">
          the name should contain only letters or space and should start with
          letter and contain 4-23 characters
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3" controlId="email">
        <Form.Label>email</Form.Label>
        <Form.Control
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailFocus(false)}
          onFocus={() => setEmailFocus(true)}
          isInvalid={emailFocus && !emailValid && email}
          isValid={emailValid}
          autoComplete="off"
          required
        />
        <Form.Control.Feedback type="invalid">
          please write a valid email
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3" controlId="pass">
        <Form.Label>password</Form.Label>
        <Form.Control
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          onBlur={() => setPassFocus(false)}
          onFocus={() => setPassFocus(true)}
          isInvalid={passFocus && !passValid && pass}
          isValid={passValid}
        />
        <Feedback type="invalid">
          password should contain capital and small letters , numbers ,
          @#$%^&+/= and should be between 8 to 20 character
        </Feedback>
      </Form.Group>
      <Form.Group className="mb-3" controlId="confirm-pass">
        <Form.Label>confirm password</Form.Label>
        <Form.Control
          type="password"
          value={passConfirm}
          onChange={(e) => setPassConfirm(e.target.value)}
          onBlur={() => setPassConfirmFocus(false)}
          onFocus={() => setPassConfirmFocus(true)}
          isInvalid={passConfirmFocus && !passConfirmValid && passConfirm}
          isValid={passConfirmValid}
        />
        <Feedback type="invalid">
          confirm password should match the first password
        </Feedback>
      </Form.Group>
      <Button
        type="submit"
        className="text-capitalize d-block mx-auto mt-4 px-3"
      >
        sign up
      </Button>
    </Form>
  );
};

export default Register;
