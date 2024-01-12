import React from "react";
import { useGetUsersQuery } from "./usersApiSlice";
import { Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";

const Users = () => {
  const { data: users = [] } = useGetUsersQuery();

  return (
    <div>
      <Table
        striped
        responsive
        className="align-middle text-center text-capitalize vertical-middle"
      >
        <thead>
          <tr>
            <th>#</th>
            <th>username</th>
            <th>options</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, id) => (
            <tr key={user.id}>
              <td>{id + 1}</td>
              <td>{user.username}</td>
              <td>
                <div className="d-flex align-items-center justify-content-center gap-3">
                  <Button
                    as={Link}
                    to={`${user.id}`}
                    className="text-capitalize"
                    variant="success"
                  >
                    edit
                  </Button>
                  <Button className="text-capitalize" variant="danger">
                    delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Users;
