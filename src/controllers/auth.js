"use strict";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const config = require("../config");
const UserModel = require("../models/user");
const { isValidPassword } = require("../validators/auth");

const login = async (req, res) => {
  // check if the body of the request contains all necessary properties
  if (!Object.prototype.hasOwnProperty.call(req.body, "password"))
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body must contain a password property",
    });

  if (!Object.prototype.hasOwnProperty.call(req.body, "username"))
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body must contain a username property",
    });

  // handle the request
  try {
    // get the user form the database
    let user = await UserModel.findOne({
      username: req.body.username,
    }).exec();

    // check if the password is valid
    const isPasswordValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );
    if (!isPasswordValid) return res.status(401).send({ token: null });

    // if user is found and password is valid
    // create a token
    const token = jwt.sign(
      { _id: user._id, username: user.username, hasPremium: user.premium },
      config.JwtSecret,
      {
        expiresIn: 86400, // expires in 24 hours
      }
    );

    return res.status(200).json({
      token: token,
    });
  } catch (err) {
    return res.status(404).json({
      error: "User Not Found",
      message: err.message,
    });
  }
};

const register = async (req, res) => {
  // check if the body of the request contains all necessary properties
  if (!Object.prototype.hasOwnProperty.call(req.body, "password"))
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body must contain a password property",
    });

  if (!Object.prototype.hasOwnProperty.call(req.body, "username"))
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body must contain a username property",
    });

  // Temporary Pass Handling
  try {
    const isPassValid = await isValidPassword(req.body.password);
    if (!isPassValid) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid Password",
      });
    }
  } catch (err) {
    return res.status(422).json({
      error: "Bad Request",
      message: err.message,
    });
  }

  // handle the request
  try {
    // hash the password before storing it in the database
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);

    // create a user object
    const user = {
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      dateOfBirth: req.body.dateOfBirth,
      hobbies: req.body.hobbies,
      premium: false,
    };

    // create the user in the database
    let retUser = await UserModel.create(user);

    // if user is registered without errors
    // create a token
    const token = jwt.sign(
      {
        _id: retUser._id,
        username: retUser.username,
        hasPremium: retUser.premium
      },
      config.JwtSecret,
      {
        expiresIn: 86400, // expires in 24 hours
      }
    );

    // return generated token
    res.status(200).json({
      token: token,
    });
  } catch (err) {
    if (err.code == 11000) {
      return res.status(400).json({
        error: "User exists",
        message: err.message,
      });
    } else {
      return res.status(500).json({
        error: "Internal server error",
        message: err.message,
      });
    }
  }
};

const me = async (req, res) => {
  try {
    // get own user from database
    let user = await UserModel.findById(req.userId).select("username email dateOfBirth avatar hobbies premium").exec();

    if (!user)
      return res.status(404).json({
        error: "Not Found",
        message: `User not found`,
      });

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

const logout = (req, res) => {
  res.status(200).send({ token: null });
};

module.exports = {
  login,
  register,
  logout,
  me,
};
