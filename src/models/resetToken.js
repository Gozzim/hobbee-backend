"use strict";

const mongoose = require("mongoose");

const ResetTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600,
  },
});

ResetTokenSchema.set("versionKey", false);

module.exports = mongoose.model("ResetToken", ResetTokenSchema);