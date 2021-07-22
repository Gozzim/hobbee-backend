"use strict";

const bcrypt = require("bcryptjs");

const UserModel = require("../models/user");
const { generateToken } = require("../shared/helpers");
const { renewSubscription } = require("./payment");
const { ERRORS } = require("../shared/Constants");
const { isValidEmail } = require("../validators/auth");
const { errorHandler } = require("../middlewares");
const { sendAccountConfirmation } = require("../services/mail");
const { isValidPassword } = require("../validators/auth");

const login = async (req, res) => {
  // Check if body contains required properties
  const error = errorHandler(req, res, ["username", "password"]);
  if (error) {
    return error;
  }

  try {
    // Check if user is logging in with Email or Username
    const isEmail = await isValidEmail(req.body.username);
    let user;
    if (isEmail) {
      user = await UserModel.findOne({
        email: req.body.username,
      }).select(
        "username password premium.active premium.subscription.expiration premium.subscription.id"
      );
    } else {
      user = await UserModel.findOne({
        username: req.body.username,
      }).select(
        "username password premium.active premium.subscription.expiration premium.subscription.id"
      );
    }

    // check if the password is valid
    const isPasswordValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).send({ token: null });
    }

    // check if premium has expired
    if (user.premium.active) {
      const premiumExpiration = Date.parse(
        user.premium.subscription.expiration
      );
      if (Date.now() > premiumExpiration) {
        user.premium = await renewSubscription(user.premium.subscription.id);
        await user.save();
      }
    }

    const token = await generateToken(user);

    return res.status(200).json({
      token: token,
    });
  } catch (err) {
    return res.status(404).json({
      error: "Not Found",
      message: err.message,
    });
  }
};

const register = async (req, res) => {
  // Check if body contains required properties
  const error = errorHandler(req, res, [
    "username",
    "email",
    "password",
    "dateOfBirth",
    "city",
  ]);
  if (error) {
    return error;
  }

  try {
    // Check case insensitive username and email
    const usernameExists = await UserModel.findOne({
      username: req.body.username,
    }).collation({
      locale: "en",
      strength: 2,
    });
    const emailExists = await UserModel.findOne({
      email: req.body.email,
    }).collation({ locale: "en", strength: 2 });

    // Password validation before hashing
    const isPassValid = await isValidPassword(req.body.password);

    if (!isPassValid || usernameExists || emailExists) {
      return res.status(400).json({
        error: "Bad Request",
        message: ERRORS.invalidCredentials,
      });
    }

    // hash the password before storing it in the database
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);

    // create a user object
    const user = {
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      dateOfBirth: req.body.dateOfBirth,
      hobbies: req.body.hobbies,
      city: req.body.city,
    };

    // create the user in the database
    let retUser = await UserModel.create(user);

    // Send Email to user
    await sendAccountConfirmation(user);

    // create a token
    const token = await generateToken(retUser);
    res.status(200).json({
      token: token,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        error: ERRORS.userAlreadyExists,
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

const isUsernameAvailable = async (req, res) => {
  // Check if body contains required properties
  const error = errorHandler(req, res, ["username"]);
  if (error) {
    return error;
  }

  try {
    // Find user with requested username, ignoring case sensitivity
    const user = await UserModel.findOne({
      username: req.body.username,
    }).collation({ locale: "en", strength: 2 });

    return res.status(200).json({
      isUsernameAvailable: !user,
    });
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
  isUsernameAvailable,
};
