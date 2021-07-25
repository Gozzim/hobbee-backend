"use strict";

const mongoose = require("mongoose");
const { isValidGroupName, isValidDate } = require("../validators/group");

// Define the user schema
const GroupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
    validate: {
      validator: isValidGroupName,
      message: "Invalid Groupname",
    },
  },
  groupOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  groupMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  city: {
    type: String,
    required: true,
  },
  onOffline: {
    type: String,
    enum: ["online", "offline", "both"],
    required: true,
  },
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
      required: true,
    },
  ],
  pic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
    required: true,
  },
  maxMembers: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    validate: {
      validator: isValidDate,
      message: "Invalid Date",
    },
  },
  location: String,
  description: {
    type: String,
    maxlength: 1000,
  },
  chat: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatMessage",
      required: true,
    },
  ],
  feedbackSent: {
    type: Boolean,
    default: false,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
});

GroupSchema.set("versionKey", false);

module.exports = mongoose.model("Group", GroupSchema);
