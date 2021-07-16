"use strict";

const mongoose = require("mongoose");
const FileSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    data: {
      type: Buffer,
      required: true,
    },
  },
  { _id: false }
);

FileSchema.set("versionKey", false);

module.exports = mongoose.model("File", FileSchema);
