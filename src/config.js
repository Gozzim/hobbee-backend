"use strict";

// Configuration variables
const port = process.env.PORT || "4000";
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/hobbee";
const JwtSecret = process.env.JWT_SECRET || "OJ7syYo9hDcFni4LuAQHW6JkeJpOkbc8";

module.exports = {
  port,
  mongoURI,
  JwtSecret,
};
