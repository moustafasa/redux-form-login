import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import LayOut from "./components/LayOut";
import LogIn, { loader as loginLoader } from "./features/auth/LogIn";
import Register from "./features/auth/Register";
import Home from "./features/users/Home";
import RequireAuth from "./features/auth/RequireAuth";
import Profile from "./features/users/Profile";
import DashBoard from "./features/users/DashBoard";
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentToken,
  getCurrentUser,
  setCredentials,
} from "./features/auth/authSlice";
import { useEffect } from "react";
import { useRefreshMutation } from "./features/auth/authApiSlice";
import PersistLogin from "./features/auth/PersistLogin";
import UnAuthorized from "./features/auth/UnAuthorized";
import Users from "./features/users/Users";
import AddUser from "./features/users/AddUser";
import EditUser from "./features/users/EditUser";

function App() {
  const token = useSelector(getCurrentToken);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<PersistLogin />}>
        <Route path="/" element={<LayOut />}>
          {/* public Routes */}
          <Route index={true} element={<Home />} />
          <Route
            path="/login"
            element={<LogIn />}
            loader={loginLoader(token)}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/unAuthorized" element={<UnAuthorized />} />
          {/* protected routes */}
          <Route element={<RequireAuth allowedRoles={["USER", "ADMIN"]} />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route element={<RequireAuth allowedRoles={["ADMIN"]} />}>
            <Route path="/dashboard" element={<DashBoard />}>
              <Route index element={<Users />} />
              <Route path="addUser" element={<AddUser />} />
              <Route path=":id" element={<EditUser />} />
            </Route>
          </Route>
        </Route>
      </Route>
    )
  );
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
