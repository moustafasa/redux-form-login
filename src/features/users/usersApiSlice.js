import { apiSlice } from "../../app/api/apiSlice";

const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/users",
    }),
    getUser: builder.query({
      query: (id) => `/users/${id}`,
    }),
    editUser: builder.mutation({
      query: ({ user, data }) => ({
        url: `/user/${user}`,
        method: "put",
        data,
      }),
    }),
  }),
});

export const { useGetUsersQuery, useGetUserQuery, useEditUserMutation } =
  apiSlice;
