const { apiSlice } = require("../../app/api/apiSlice");

const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        data: credentials,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: "/register",
        method: "POST",
        data,
      }),
    }),
    refresh: builder.mutation({
      query: () => "/refresh",
    }),
    logOut: builder.mutation({
      query: () => "/logout",
    }),
  }),
});

export const {
  useLoginMutation,
  useGetUserQuery,
  useGetUsersQuery,
  useRefreshMutation,
  useLogOutMutation,
} = authApiSlice;
