console.log("test");

const TagModel = require("../src/models/tag");
const hobbies = require("../hobbies.json");

exec();
async function exec() {
  for (let i = 0; i < hobbies.length; i++) {
    let tagInDB = await TagModel.findOne({ title: hobbies[i].title }).exec();
    if (tagInDB === null) {
      const tag = {
        title: hobbies[i].title,
        category: hobbies[i].category,
        subCategory: hobbies[i].subCategory,
      };
      await TagModel.create(tag);
    }
  }
}
