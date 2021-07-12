const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");

const config = require("../src/config");
const FileModel = require("../src/models/file");

const images = [
  {
    _id: "60ec51d7e0edf15bb9e1993a",
    mimeType: "image/jpeg",
    data: fs.readFileSync(
      path.join(__dirname, "../import-data/examplepic1.jpg")
    ),
  },
  {
    _id: "60ec52095fd7f45c7aaf7909",
    mimeType: "image/jpeg",
    data: fs.readFileSync(
      path.join(__dirname, "../import-data/examplepic2.jpg")
    ),
  },
  {
    _id: "60ec5220db5ec95c854a253d",
    mimeType: "image/jpeg",
    data: fs.readFileSync(
      path.join(__dirname, "../import-data/examplepic3.jpg")
    ),
  },
];

exec();
async function exec() {
  await mongoose.connect(config.mongoURI);
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const fileInDb = await FileModel.findById(image._id).exec();
    if (fileInDb === null) {
      await FileModel.create(image);
    }
  }
  await mongoose.disconnect();
}
