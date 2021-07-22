"use strict";

const mongoose = require("mongoose");

// Define the user schema
const UserReportSchema = new mongoose.Schema({
    sendingUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    inappropriateUsername: Boolean,
    threatsEtc: Boolean,
    hateSpeechEtc: Boolean,
    spamEtc: Boolean,
    inappropriateContent: Boolean,
    noShow: Boolean,
    other: Boolean,
    comment: String,
});

UserReportSchema.set("versionKey", false);

module.exports = mongoose.model("UserReport", UserReportSchema);
