"use strict";

const mongoose = require("mongoose");

// Define the user schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    validate: function (username) {
      return true; // placeholder isValidUsername
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: function (mail) {
      return true; // placeholder isValidEmail
    },
  },
  password: {
    type: String,
    //select: false, //TODO
    required: true,
    validate: function (pass) {
      return true; // placeholder isValidPassword
    },
  },
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
