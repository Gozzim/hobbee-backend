"use strict";

const mongoose = require("mongoose");
const { isValidEmail, isValidUsername, isValidDateOfBirth } = require("../validators/auth");

// Define the user schema
const UserSchema = new mongoose.Schema({
  username: {
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
    select: false,
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
    select: false,
    validate: {
      validator: isValidDateOfBirth,
      message: "Invalid date of birth"
    },
  },
  city: {
    type: String,
    required: true,
    select: false,
  },
  avatar: String,
  hobbies: [
    // Implicitly defaults to empty array []
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
      required: true,
    },
  ],
  premium: {
    active: {
      type: Boolean,
      default: false,
    },
    cancelled: Boolean,
    subscription: {
      id: {
        type: String,
        unique: true,
        sparse: true,
        select: false,
      },
      plan: {
        type: String,
        select: false,
      },
      expiration: Date,
    },
  },
});

UserSchema.set("versionKey", false);

module.exports = mongoose.model("User", UserSchema);
