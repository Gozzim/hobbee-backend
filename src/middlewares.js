"use strict";

const jwt = require("jsonwebtoken");
const config = require("./config");
const { ERRORS } = require("./shared/Constants");

const allowCrossDomain = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "*");

  // intercept OPTIONS method
  if ("OPTIONS" == req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
};

const checkToken = async (req, res, next, token) => {
  jwt.verify(token, config.JwtSecret, (err, decoded) => {
    if (err)
      return res.status(401).send({
        error: "Unauthorized",
        message: ERRORS.invalidToken,
      });

    if (Date.now() > decoded.exp * 1000) {
      return res.status(401).send({
        error: "Unauthorized",
        message: ERRORS.expiredToken,
      });
    }

    // if everything is good, save to request for use in other routes
    req.userId = decoded._id;
    req.hasPremium = decoded.hasPremium;
    next();
  });
};

const extractUserId = async (req, res, next) => {
  let token = "";
  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next();
  }

  return await checkToken(req, res, next, token);
};

const checkAuthentication = async (req, res, next) => {
  // check header or url parameters or post parameters for token
  let token = "";
  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token)
    return res.status(401).send({
      error: "Unauthorized",
      message: ERRORS.invalidToken,
    });

  // verifies secret and checks exp
  return await checkToken(req, res, next, token);
};

const errorHandler = (req, res, requiredProps) => {
  return requiredProps.reduce((err, item) => {
    if (err) {
      return err;
    }
    if (!Object.prototype.hasOwnProperty.call(req.body, item))
      return res.status(400).json({
        error: "Bad Request",
        message: "The request body must contain a " + item + " property",
      });
    return null;
  }, null)
};

module.exports = {
  extractUserId,
  allowCrossDomain,
  checkAuthentication,
  errorHandler,
};
