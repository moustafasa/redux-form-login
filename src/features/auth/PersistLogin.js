import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentToken, getCurrentUser, setCredentials } from "./authSlice";
import { useRefreshMutation } from "./authApiSlice";
import { Outlet } from "react-router-dom";
import useLocalStorage from "../../hooks/useLocalStorage";

const PersistLogin = () => {
  const user = useSelector(getCurrentUser);
  const token = useSelector(getCurrentToken);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh] = useRefreshMutation();
  const dispatch = useDispatch();
  const [persist] = useLocalStorage("persist", false);

  useEffect(() => {
    let isMounted = true;
    const getToken = async () => {
      try {
        const data = await refresh().unwrap();
        dispatch(setCredentials({ user, ...data }));
      } catch (err) {
        // console.log(err);
      } finally {
        isMounted && setIsLoading(false);
      }
    };

    !token && persist ? getToken() : setIsLoading(false);
    return () => {
      isMounted = false;
    };
  }, []);

  return !persist ? <Outlet /> : isLoading ? <p>loading...</p> : <Outlet />;
};

export default PersistLogin;
