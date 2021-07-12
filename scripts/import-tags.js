const config = require("../src/config");
const mongoose = require("mongoose");
const TagModel = require("../src/models/tag");
const hobbies = require("../import-data/hobbies.json");

exec();
async function exec() {
  await mongoose.connect(config.mongoURI);
  for (let i = 0; i < hobbies.length; i++) {
    const tagInDB = await TagModel.findOne({ title: hobbies[i].title }).exec();
    if (tagInDB === null) {
      const tag = {
        title: hobbies[i].title,
        category: hobbies[i].category,
        subCategory: hobbies[i].subCategory,
      };
      await TagModel.create(tag);
    }
  }
  await mongoose.disconnect();
}
