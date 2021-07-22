"use strict";

const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  ratings: [{
    type: Number,
    min: 0,
    max: 5,
  }],
  comment: {
    type: String,
    default: "",
  },
  completed: {
    type: Boolean,
    default: false,
  }
});

FeedbackSchema.set("versionKey", false);

module.exports = mongoose.model("Feedback", FeedbackSchema);
