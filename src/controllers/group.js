const GroupModel = require("../models/group");
const TagModel = require("../models/tag");
const jwt = require("jsonwebtoken");
const config = require("../config");

const create = async (req, res) => {
  if (!Object.prototype.hasOwnProperty.call(req.body, "groupName"))
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body must contain a groupName property",
    });

  if (!Object.prototype.hasOwnProperty.call(req.body, "city"))
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body must contain a city property",
    });
  if (!Object.prototype.hasOwnProperty.call(req.body, "onOffline"))
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body must contain a onOffline property",
    });

  if (
    !Object.prototype.hasOwnProperty.call(req.body, "tags") ||
    !Array.isArray(req.body.tags)
  )
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body must contain a tags property",
    });
  if (!Object.prototype.hasOwnProperty.call(req.body, "pic"))
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body must contain a pic property",
    });

  try {
    const group = {
      groupName: req.body.groupName,
      groupOwner: req.userId,
      groupMembers: [req.userId],
      city: req.body.city,
      onOffline: req.body.onOffline,
      tags: req.body.tags,
      pic: req.body.pic,
      participants: req.body.participants || 0,
      date: req.body.date ? [req.body.date] : [],
      location: req.body.location,
      description: req.body.description,
    };

    await GroupModel.create(group);
    return res.status(200).json({});
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

const getTags = async (req, res) => {
  try {
    const tags = await TagModel.find({}).exec();
    return res.status(200).json(tags);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

const getGroups = async (req, res) => {
  try {
    const groups = await GroupModel.find().exec();
    return res.status(200).json(groups);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

const getGroup = async (req, res) => {
  const id = req.params.groupId;
  let userId;

  if (req.headers.authorization) {
    let token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, config.JwtSecret, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          error: "Unauthorized",
          message: "Failed to authenticate token.",
        });
      }
      userId = decoded._id;
    });
  }

  try {
    const group = await GroupModel.findOne({ _id: id }).exec();
    if (userId) {
      const extendedGroup = await GroupModel.findOne({
        _id: id,
        groupMembers: userId,
      }).exec();
      if (extendedGroup) {
        return res.status(200).json(group);
      }
    }
    const answer = {
      _id: group._id,
      groupName: group.groupName,
      city: group.city,
      onOffline: group.onOffline,
      tags: group.tags,
      pic: group.pic,
      date: group.date,
      description: group.description || null,
    };
    return res.status(200).json(answer);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

module.exports = {
  create,
  getTags,
  getGroups,
  getGroup,
};
