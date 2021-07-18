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
      validator: isValidUsername,
      message: "Invalid Username",
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: isValidEmail,
      message: "Invalid Email",
    },
  },
  password: {
    type: String,
    select: false,
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
    active: {
      type: Boolean,
      default: false,
    },
    subscription: {
      id: {
        type: String,
        unique: true,
        select: false,
      },
      plan: {
        type: String,
        select: false,
      },
      expiration: {
        type: Date,
      },
    },
  },
  groups: [
    // Implicitly defaults to empty array []
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  ],
});

UserSchema.set("versionKey", false);

module.exports = mongoose.model("User", UserSchema);
