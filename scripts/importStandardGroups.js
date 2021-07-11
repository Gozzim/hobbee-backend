const config = require("../src/config");
const mongoose = require("mongoose");
const GroupModel = require("../src/models/Group");

exec();
async function exec() {
  await mongoose.connect(config.mongoURI);
  for (let i = 0; i < 9; i++) {
    let groupInDB = await GroupModel.findOne({ title: "DefaultGroup"+[i] }).exec();
    if (groupInDB === null) {
      const group = {
        groupName: "DefaultGroup"+[i],
        city: "Munich",
        how: "Offline",
      };
      await GroupModel.create(group);
    }
  }
  mongoose.disconnect(config.mongoURI);
}
