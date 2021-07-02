"use strict";

const mongoose = require("mongoose");
const TagSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
});

TagSchema.set("versionKey", false);

module.exports = TagSchema;
