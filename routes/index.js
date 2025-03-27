const express = require("express");
const path = require("path");
const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/index.html"));
});

router.get("/signIn", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/signIn.html"));
});

router.get("/signUp", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/signUp.html"));
});

router.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/profile.html"));
});

module.exports = router;
