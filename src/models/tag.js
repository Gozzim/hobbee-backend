"use strict";

const mongoose = require("mongoose");
const TagSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  subCategory: {
    type: String,
  },
});

TagSchema.set("versionKey", false);

module.exports = mongoose.model("Tag", TagSchema);
