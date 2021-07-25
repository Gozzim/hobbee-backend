"use strict";

const mongoose = require("mongoose");

// Define the user schema
const ChatMessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    message: {
        type: String,
        maxlength: 500,
        required: true,
    },
    timestamp: {
        type: Date,
    },
    isSystemMessage: {
        type: Boolean,
        default: false,
    },
});

ChatMessageSchema.set("versionKey", false);

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
