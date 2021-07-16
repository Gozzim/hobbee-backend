"use strict";

const mongoose = require("mongoose");
const { isValidEmail, isValidUsername } = require("../validators/auth");

// Define the user schema
const ChatMessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    message: {
        type: String,
        required: true,
    },
    timestamp: {
        type: [Date],
    },
    isSystemMessage: {
        type: Boolean,
        default: false,
    },
});

ChatMessageSchema.set("versionKey", false);

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
