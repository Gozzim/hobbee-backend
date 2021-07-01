"use strict";

const mongoose = require("mongoose");

const NotificationsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
    },
    notificationType: {
        type: String,
        enum: ["Chat", "Reminder", "Feedback"],
    },
    date: {
        type: Date,
        default: Date.now,
    },
    read: {
        type: Boolean,
        default: false
    },
    content: {
        type: String,
        required: true
    },
});

NotificationsSchema.set("timestamps", true);
NotificationsSchema.set("versionKey", false);

module.exports = mongoose.model("Notifications", NotificationsSchema);
