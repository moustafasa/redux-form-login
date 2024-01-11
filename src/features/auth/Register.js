import React, { useState } from "react";
import { Form } from "react-bootstrap";

const Register = () => {
  const [username, setUserName] = useState();
  const [pass, setPass] = useState();
  const [passConfirm, setPassConfirm] = useState();
  const [errMsg, setErrMsg] = useState();

  return (
    <Form>
      <Form.Group></Form.Group>
    </Form>
  );
};

export default Register;
