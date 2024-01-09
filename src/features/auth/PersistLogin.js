import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentToken, getCurrentUser, setCredentials } from "./authSlice";
import { useRefreshMutation } from "./authApiSlice";
import { Outlet } from "react-router-dom";
import useLocalStorage from "../../hooks/useLocalStorage";

const PersistLogin = () => {
  const user = useSelector(getCurrentUser);
  const token = useSelector(getCurrentToken);
  const [refresh, { isLoading }] = useRefreshMutation();
  const dispatch = useDispatch();
  const [persist] = useLocalStorage("persist", false);

  useEffect(() => {
    console.log("done");
    const getToken = async () => {
      try {
        const data = await refresh().unwrap();
        dispatch(setCredentials({ user, ...data }));
      } catch (err) {
        console.log(err);
      }
    };

    !token && persist && getToken();
  }, []);

  return !persist ? <Outlet /> : isLoading ? <p>loading...</p> : <Outlet />;
};

export default PersistLogin;
