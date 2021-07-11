"use strict";

const mongoose = require("mongoose");
const { isValidEmail, isValidUsername } = require("../validators/auth");

// Define the user schema
const UserSchema = new mongoose.Schema({
  username: {
    // TODO: check if username exists with lowerCase to avoid Testname and testname for example
    type: String,
    unique: true,
    required: true,
    validate: {
      // Temporary place
      isAsync: true,
      validator: isValidUsername,
      message: "Invalid Username",
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      // Temporary place
      isAsync: true,
      validator: isValidEmail,
      message: "Invalid Email",
    },
  },
  password: {
    type: String,
    //select: false, //TODO
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  avatar: String,
  hobbies: [
    // Implicitly defaults to empty array []
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
    },
  ],
  premium: {
    type: Boolean,
    default: false,
  },
});

UserSchema.set("versionKey", false);

module.exports = mongoose.model("User", UserSchema);
