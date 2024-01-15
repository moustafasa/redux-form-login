const jsonServer = require("json-server");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");

// Create a server instance
const server = jsonServer.create();

// Get the router and db instances
const router = jsonServer.router("src/app/db.json");
const middlewares = jsonServer.defaults();

const allowedHosts = ["http://localhost:3001"];

const db = router.db;

// Define some constants
const ACESS_SECRET_KEY = `access-secret-key`; // The secret key for signing jwt tokens
const REFRESH_SECRET_KEY = "refresh-secret-key";
const SALT_ROUNDS = 10; // The number of salt rounds for hashing passwords

// A helper function to create a token from a payload
const createToken = (data, type) => {
  const payload = { ...data, date: (new Date() * Math.random()).toString(16) };
  if (type === "access") {
    return jwt.sign(payload, ACESS_SECRET_KEY, { expiresIn: "1m" });
  } else if (type === "refresh") {
    return jwt.sign(payload, REFRESH_SECRET_KEY, { expiresIn: "1h" });
  }
};

const setRefreshToken = (payload, res) => {
  const refresh = createToken(payload, "refresh");
  res.cookie("refreshToken", refresh, { httpOnly: true });
  db.get("users").find({ id: payload.id }).assign({ refresh }).write();
};

// A helper function to verify a token and get the decoded data
const verifyToken = (token, type) => {
  return jwt.verify(
    token,
    type === "access" ? ACESS_SECRET_KEY : REFRESH_SECRET_KEY,
    (err, decode) => (decode !== undefined ? decode : err)
  );
};

// A helper function to check if the user has a specific role
const isUserInRole = (user, role) => {
  return user.roles && user.roles.includes(role);
};

server.use(middlewares);
// A middleware to hash the password before saving a new user
server.use(jsonServer.bodyParser);
server.use(cookieParser());

// Create a middleware function that checks the request origin
const checkOrigin = (req, res, next) => {
  // Get the origin from the request headers
  const origin = req.headers.origin;
  // If the origin is in the allowed hosts, proceed to the next middleware
  if (allowedHosts.includes(origin)) {
    next();
  } else {
    // Otherwise, send a 403 forbidden response
    res.status(403).send("Access denied");
  }
};
// Use the middleware function before the router
server.use(checkOrigin);

server.use((req, res, next) => {
  if (["POST", "PUT"].includes(req.method) && req.path !== "/login") {
    // Hash the password with bcrypt
    bcrypt.hash(req.body.password, SALT_ROUNDS, (err, hash) => {
      if (err) {
        // Handle hashing error
        res.status(500).send(err.message);
      } else {
        // Replace the plain password with the hashed one
        req.body.password = hash;
        next();
      }
    });
  } else {
    next();
  }
});

// A middleware to handle user registration
server.post("/register", (req, res) => {
  // Get the user data from the request body
  const { username, password, roles = ["USER"] } = req.body;

  // Check if the username is already taken
  const existingUser = db.get("users").find({ username }).value();
  if (existingUser) {
    // Return a 409 Conflict response
    res.status(409).send("username already exists");
  } else {
    // Create a new user record
    const payload = {
      id: new Date().getTime().toString(16),
      username,
      roles,
    };
    db.get("users")
      .push({ ...payload, password })
      .write();

    // Create a token for the new user
    const token = createToken(payload, "access");

    setRefreshToken(payload, res);

    // Return a 201 Created response with the token
    res.status(201).json({ accessToken: token });
  }
});

// A middleware to handle user registration
server.post("/users/add", (req, res) => {
  // Get the user data from the request body
  const { username, password, roles = ["USER"] } = req.body;

  // Check if the username is already taken
  const existingUser = db.get("users").find({ username }).value();
  if (existingUser) {
    // Return a 409 Conflict response
    res.status(409).send("username already exists");
  } else {
    // Create a new user record
    const payload = {
      id: new Date().getTime().toString(16),
      username,
      roles,
    };
    db.get("users")
      .push({ ...payload, password })
      .write();

    // Return a 201 Created response with the token
    res.sendStatus(201);
  }
});

// A middleware to handle user login
server.post("/login", (req, res) => {
  // Get the credentials from the request body
  const { username, password } = req.body;

  // Find the user by username
  const user = db.get("users").find({ username }).value();
  if (user) {
    // Compare the password with the hashed one
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        // Handle comparison error
        res.status(500).send(err.message);
      } else {
        if (result) {
          const payload = {
            id: user.id,
            username: user.username,
            roles: user.roles,
          };
          // Passwords match, create a token for the user
          const token = createToken(payload, "access");
          // set refresh token in database and coockie
          setRefreshToken(payload, res);
          // Return a 200 OK response with the token
          res.status(200).json({ accessToken: token });
        } else {
          // Passwords don't match, return a 401 Unauthorized response
          res.status(401).send("Invalid credentials");
        }
      }
    });
  } else {
    // User not found, return a 404 Not Found response
    res.status(404).send("User not found");
  }
});

// A middleware to handle token refresh
server.get("/refresh", (req, res) => {
  // Get the refresh token from the cookie
  const refreshToken = req.cookies.refreshToken;

  // Verify the refresh token
  const decoded = verifyToken(refreshToken, "refresh");

  // Check if the refresh token is valid and not expired
  if (decoded && !decoded.message) {
    // Find the user by id
    const user = db.get("users").find({ id: decoded.id }).value();

    // Check if the refresh token matches the one in the database
    if (user && user.refresh === refreshToken) {
      // Create a new access token
      const accessToken = createToken(
        {
          id: user.id,
          username: user.username,
          roles: user.roles,
        },
        "access"
      );

      // Token is valid, set the user id and roles in the request object
      req.userId = decoded.id;
      req.userRoles = decoded.roles;
      // Return a 200 OK response with the new access token
      res.status(200).json({ accessToken: accessToken });
    } else {
      // Refresh token does not match, return a 401 Unauthorized response
      res.status(401).send("Invalid refresh token");
    }
  } else {
    // Refresh token is invalid or expired, return a 401 Unauthorized response
    res.status(401).send("Invalid refresh token");
  }
});

server.get("/logout", (req, res) => {
  const refresh = req.cookies.refreshToken;
  if (!refresh) {
    res.status(204);
  } else {
    res.clearCookie("refreshToken", { httpOnly: true });
    const user = db.get("users").find({ refresh });
    if (!user.value()) {
      res.sendStatus(204);
    } else {
      const userValue = user.value();
      delete userValue.refresh;
      user.assign({ ...userValue }).write();
      res.sendStatus(204);
    }
  }
});

// A middleware to check the authorization header for a valid token
const checkAuth = (req, res, next) => {
  // Get the authorization header from the request
  const authorization = req.headers.authorization || req.headers.Authorization;

  if (req.path !== "/refresh") {
    // Check if the authorization header is present and has the format 'Bearer token'
    if (authorization && authorization.split(" ")[0] === "Bearer") {
      // Get the token from the authorization header
      const token = authorization.split(" ")[1];

      // Verify the token and get the decoded data
      const decoded = verifyToken(token, "access");
      // Check if the token is valid
      if (decoded && !decoded.message) {
        // Token is valid, set the user id and roles in the request object
        req.userId = decoded.id;
        req.userRoles = decoded.roles;
        next();
      } else {
        // Token is invalid, return a 401 Unauthorized response
        res.status(401).send("Invalid token");
      }
    } else {
      // Authorization header is not present or has a wrong format, return a 401 Unauthorized response
      res.status(401).send("Authorization header required");
    }
  } else {
    next();
  }
};

// A middleware to check the user role for accessing a resource
const checkRole = (role) => {
  return (req, res, next) => {
    // Get the user id and roles from the request object
    const { userId } = req;

    // Find the user by id
    const user = db.get("users").find({ id: userId }).value();

    // Check if the user is the owner of the resource
    const isOwner = req.body.userId === userId || req.params.id === userId;

    // Check if the user has the required role or is the owner of the resource
    if (isUserInRole(user, role) || isOwner) {
      // User has the required role or is the owner, proceed to the next middleware
      next();
    } else {
      // User doesn't have the required role or is not the owner, return a 403 Forbidden response
      res.status(403).send("Forbidden");
    }
  };
};

// Apply the checkAuth middleware to all routes
server.use(checkAuth);

// Apply the checkRole middleware to specific routes
server.use("/users", checkRole("ADMIN")); // Only users with the 'ADMIN' role can access the /users route
server.use("/users/:id", checkRole("ADMIN")); // Only users with the 'USER' role can access the /users/:id route

server.get("/users", (req, res) => {
  const users = db.get("users").value();
  res.status(200).send(JSON.stringify(users));
});

server.get("/user", (req, res) => {
  const user = db.get("users").find({ id: req.userId });
  res.status(200).send(JSON.stringify(user));
});

server.get("/users/:id", (req, res) => {
  console.log("dsjalkfd");
  const { id } = req.params;
  const user = db.get("users").find({ id }).value();
  if (user) {
    res.status(201).send(JSON.stringify(user));
  } else {
    res.status(404).send("user not found");
  }
});

server.put("/users/update/:id", (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  const user = db.get("users").find({ id }).value();
  if (user.username) {
    if (username) {
      if (db.get("users").find({ username }).value()) {
        return res.status(409).send("username already taken");
      } else {
        user.username = username;
      }
    }
    if (password) {
      user.password = password;
    }
    db.write();
    res.status(201).send("user updated successfully");
  } else {
    res.status(404).send("user not found");
  }
});

server.delete("/users/delete/:id", (req, res) => {
  console.log("jkldsajfdsajlk");
  const { id } = req.params;
  const user = db.get("users").find({ id }).value();
  if (user) {
    db.get("users").remove({ id }).write();
    res.status(201).send("deleted");
  } else {
    res.status(404).send("user not found");
  }
});

// Use the default router
server.use(router);

// Start the server
server.listen(3000, () => {
  console.log("JSON Server is running on port 3000");
});
