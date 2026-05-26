const express = require("express");
const routes = express.Router();
const { getHealth } = require("../controller/healthController");

routes.get("/health", getHealth);

module.exports = routes;
