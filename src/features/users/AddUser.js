import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { FaCircleInfo } from "react-icons/fa6";
import { useRegisterMutation } from "../auth/authApiSlice";
import { setCredentials } from "../auth/authSlice";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  useAddUserMutation,
  useEditUserMutation,
  useGetUserQuery,
} from "./usersApiSlice";

const AddUser = () => {
  const NAME_RGX = /^[a-zA-Z][a-zA-Z0-9]{3,23}$/;
  const PASS_RGX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%/]).{8,24}$/;
  const userRef = useRef();
  const errorRef = useRef();

  const [user, setUser] = useState("");
  const [userValid, setUserValid] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [pass, setPass] = useState("");
  const [passValid, setPassValid] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  const [passConfirm, setPassConfirm] = useState("");
  const [passConfirmValid, setPassConfirmValid] = useState(false);
  const [passConfirmFocus, setPassConfirmFocus] = useState(false);

  const [errMsg, setErrMsg] = useState();
  const [addUser] = useAddUserMutation();

  const navigator = useNavigate();

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  useEffect(() => {
    if (errMsg) {
      errorRef.current?.focus();
    }
  }, [errMsg]);

  useEffect(() => {
    setUserValid(NAME_RGX.test(user));
  }, [user]);

  useEffect(() => {
    setPassValid(PASS_RGX.test(pass));
    setPassConfirmValid(pass === passConfirm && pass);
  }, [pass, passConfirm]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!NAME_RGX.test(user) || !PASS_RGX.test(pass)) {
      setErrMsg("invalid Entry");
      return;
    }
    try {
      await addUser({ username: user, password: pass }).unwrap();
    } catch (err) {
      if (!err.status) {
        setErrMsg("network err");
      } else if (err.status === 409) {
        setErrMsg("the username is already exist");
      } else {
        setErrMsg("register failed");
      }
    }
    setPass("");
    setPassConfirm("");
    navigator("/dashboard/users");
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
      <h2 className="text-center mb-3">add user</h2>
      <Form.Group className="mb-3" controlId="username">
        <Form.Label>username</Form.Label>
        <Form.Control
          type="text"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          onBlur={() => setUserFocus(false)}
          onFocus={() => setUserFocus(true)}
          isInvalid={userFocus && !userValid && user}
          isValid={userValid}
          autoComplete="off"
          ref={userRef}
        />
        <Form.Control.Feedback type="invalid">
          the username should contain only letters or number and should start
          with letter and it contain 4-23 characters
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
        <Form.Control.Feedback type="invalid">
          password should contain capital and small letters , numbers ,
          @#$%^&+/= and should be between 8 to 20 character
        </Form.Control.Feedback>
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
        <Form.Control.Feedback type="invalid">
          confirm password should match the first password
        </Form.Control.Feedback>
      </Form.Group>
      <Button
        type="submit"
        className="text-capitalize d-block mx-auto mt-4 px-3"
        disabled={!passValid || !userValid || !passConfirmValid}
      >
        add
      </Button>
    </Form>
  );
};

export default AddUser;
