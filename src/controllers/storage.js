"use strict";

const datefns = require("date-fns");
const mongoose = require("mongoose");

const FileModel = require("../models/file");
const NotificationModel = require("../models/notification");

const getUserNotifications = async (req, res) => {
  try {
    const since = datefns.parseISO(req.query.since);
    const response = await NotificationModel.find({
      user: req.userId,
      date: { $gt: since },
    })
      .lean()
      .populate("group", "groupName")
      .sort("date")
      .exec();

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: e.message,
    });
  }
};

const uploadFile = async (req, res) => {
  try {
    const file = await FileModel.create({
      _id: new mongoose.Types.ObjectId().toString(),
      mimeType: req.files.file.mimetype,
      data: req.files.file.data,
    });
    return res.status(200).send({ id: file._id });
  } catch (e) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: e.message,
    });
  }
};

const viewFile = async (req, res) => {
  const id = req.params.fileId;

  try {
    const file = await FileModel.findById(id).exec();
    res.set("Content-Type", file.mimeType);
    res.set("Content-Disposition", "inline;");
    return res.status(200).send(file.data);
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

module.exports = {
  getUserNotifications,
  uploadFile,
  viewFile,
};
