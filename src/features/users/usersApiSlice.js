import { apiSlice } from "../../app/api/apiSlice";

const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/users",
      providesTags: (data) => [
        "Users",
        ...data.map((user) => ({ type: "Users", id: user.id })),
      ],
    }),
    getUser: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (data) => [{ type: "Users", id: data.id }],
    }),
    editUser: builder.mutation({
      query: ({ user, data }) => ({
        url: `/users/update/${user}`,
        method: "put",
        data,
      }),
      invalidatesTags: (data, err, args) => [{ type: "Users", id: args.user }],
    }),
    addUser: builder.mutation({
      query: (data) => ({
        url: "/users/add",
        method: "post",
        data,
      }),
      invalidatesTags: ["Users"],
    }),
    deleteUser: builder.mutation({
      query: (id) => {
        console.log(id);
        return {
          url: `/users/delete/${id}`,
          method: "delete",
        };
      },
      invalidatesTags: (data, err, id) => [{ type: "Users", id }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useEditUserMutation,
  useAddUserMutation,
  useDeleteUserMutation,
} = usersApiSlice;
