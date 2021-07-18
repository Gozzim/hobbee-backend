"use strict";

const express = require("express");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const helmet = require("helmet");

const middlewares = require("./middlewares");

const auth = require("./routes/auth");
const group = require("./routes/group");
const storage = require("./routes/storage");
const payment = require("./routes/payment");

const api = express();

// Adding Basic Middlewares
api.use(helmet());
api.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);
api.use(bodyParser.json({ limit: "25mb" }));
api.use(bodyParser.urlencoded({ extended: false }));
api.use(middlewares.allowCrossDomain);

// Basic route
api.get("/api", (req, res) => {
  res.json({
    name: "Hobb.ee Backend",
  });
});

// API routes
api.use("/api/auth", auth);
api.use("/api/group", group);
api.use("/api/storage", storage);
api.use("/api/payment", payment);

module.exports = api;
