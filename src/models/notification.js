"use strict";

const mongoose = require("mongoose");

const NotificationsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectID,
        ref: "User",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    unread: {
        type: Boolean,
        default: true
    },
    content: {
        type: {
            notificationType: {
                type: String,
                enum: ["Chat", "Reminder", "Feedback"],
                required: true
            }
        },
        notificationContent: {
            type: String,
            required: true
        },
        required: true
    }
});

NotificationsSchema.set("timestamps", true);
NotificationsSchema.set("versionKey", false);

module.exports = mongoose.model("Notifications", NotificationsSchema);
