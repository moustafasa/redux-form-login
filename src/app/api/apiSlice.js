import { createApi } from "@reduxjs/toolkit/query/react";
import {
  getCurrentToken,
  getCurrentUser,
  logOut,
  setCredentials,
} from "../../features/auth/authSlice";
import axios from "axios";
import { Mutex } from "async-mutex";

const axiosBaseQuery = async (args, { getState }, extra) => {
  const defaultHeaders = {
    "Content-Type": "application/json",
  };
  const baseUrl = `http://localhost:3000`;
  const token = getCurrentToken(getState());

  if (token) defaultHeaders["Authorization"] = `Bearer ${token}`;

  try {
    let res;
    if (typeof args === "string") {
      res = await axios({
        url: baseUrl + args,
        withCredentials: true,
        headers: defaultHeaders,
      });
    } else {
      const { url, method, data, headers } = args;

      res = await axios({
        url: baseUrl + url,
        method,
        data,
        headers: { ...defaultHeaders, ...headers },
        withCredentials: true,
      });
    }
    return {
      data: res.data,
    };
  } catch (axiosErr) {
    console.error(axiosErr);
    return {
      error: {
        status: axiosErr?.response?.status,
        data: axiosErr?.response?.data || axiosErr?.message,
      },
    };
  }
};

const mutex = new Mutex();
const baseQueryReauth = async (args, api, extra) => {
  await mutex.waitForUnlock();
  let res = await axiosBaseQuery(args, api, extra);
  if (res?.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refRes = await axiosBaseQuery("/refresh", api, extra);
        if (refRes.data) {
          const username = getCurrentUser(api.getState());
          api.dispatch(setCredentials({ username, ...refRes.data }));
          res = await axiosBaseQuery(args, api, extra);
        } else {
          api.dispatch(logOut());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      res = await axiosBaseQuery(args, api, extra);
    }
  }

  return res;
};

export const apiSlice = createApi({
  baseQuery: baseQueryReauth,
  endpoints: (builder) => ({}),
});
