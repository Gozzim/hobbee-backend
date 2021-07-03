const GroupModel = require("../models/group");
const TagModel = require("../models/tag");

const create = async (req, res) => {
  console.log(req.body);

  try {
    const group = {
      groupName: req.body.groupName,
      city: req.body.city,
      how: req.body.how,
      tags: req.body.tags,
      pic: req.body.pic,
      participants: req.body.participants || 0,
      date: req.body.date,
      location: req.body.location,
      description: req.body.description,
    };

    let retGroup = await GroupModel.create(group);
    console.log(retGroup);
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

module.exports = {
  create,
  getTags,
};
