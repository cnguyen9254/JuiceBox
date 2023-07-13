const express = require("express");
const usersRouter = express.Router();
const { getAllUsers, getUserByUsername, createUser } = require("../db");
const { JWT_SECRET } = process.env;
const jwt = require("jsonwebtoken");

console.log(JWT_SECRET);

// Middleware to log requests to /users
usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");
  next();
});

// Route to get all users
usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.send({ users });
  } catch (error) {
    next(error);
  }
});

// Route for user login
usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and a password",
    });
  }

  try {
    const user = await getUserByUsername(username);

    if (user && user.password === password) {
      const token = jwt.sign({ id: user.id, username, password }, JWT_SECRET);
      res.send({ message: "You're logged in!", token });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    next(error);
  }
});

// Route for user registration
usersRouter.post("/register", async (req, res, next) => {
  const { username, password, name, location } = req.body;

  try {
    const existingUser = await getUserByUsername(username);

    if (existingUser) {
      next({
        name: "UserExistsError",
        message: "Username taken",
      });
    }

    const user = await createUser({ username, password, name, location });

    const token = jwt.sign(
      { id: user.id, username },
      process.env.JWT_SECRET,
      { expiresIn: "1w" }
    );

    res.send({
      message: "Thank you for signing up",
      token,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
