"use strict";

const mongoose = require("mongoose");

// Define the user schema
const GroupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
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
    type: String,
    //required: true,
  },
  participants: {
    type: Number,
    default: 0,
  },
  date: {
    type: [Date],
    default: [],
  },
  location: {
    type: String,
  },
  description: {
    type: String,
  },
});

GroupSchema.set("versionKey", false);

module.exports = mongoose.model("Group", GroupSchema);
