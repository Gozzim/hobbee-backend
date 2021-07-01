"use strict";

const datefns = require("date-fns");

const NotificationModel = require("../models/notification");

const getUserNotifications = async (req, res) => {
    try {
        const since = datefns.parseISO(req.query.since);
        const response = await NotificationModel.find({
            user: req.userId,
            date: {$gt: since}
        }).select("_id group notificationType date read content").sort("date").exec();

        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            error: "Internal Server Error",
            message: e.message,
        });
    }
}

module.exports = {
    getUserNotifications,
};
