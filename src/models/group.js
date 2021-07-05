"use strict";

const mongoose = require("mongoose");
const TagSchema = require("./tag");

// Define the user schema
const GroupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  how: {
    type: String,
    required: true,
  },
  tags: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  pic: {
    type: String,
    //required: true,
  },
  participants: {
    type: Number,
  },
  date: {
    type: Date,
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
