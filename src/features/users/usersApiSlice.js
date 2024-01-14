import { apiSlice } from "../../app/api/apiSlice";

const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/users",
      providesTags: (data) => {
        console.log(data);
        return [];
      },
    }),
    getUser: builder.query({
      query: (id) => `/users/${id}`,
    }),
    editUser: builder.mutation({
      query: ({ user, data }) => ({
        url: `/users/${user}`,
        method: "put",
        data,
      }),
    }),
  }),
});

export const { useGetUsersQuery, useGetUserQuery, useEditUserMutation } =
  usersApiSlice;
