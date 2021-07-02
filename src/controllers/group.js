const GroupModel = require("../models/group");

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

    // create the user in the database
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
module.exports = {
  create,
};
