const express = require("express");
const path = require("path");
const router = express.Router();

router.get("/", (req, res) => {
  res.render('index')
});

router.get("/signIn", (req, res) => {
  res.render('signIn')
});

router.get("/signUp", (req, res) => {
  res.render('signUp')
});

router.get("/profile", (req, res) => {
  res.render('profile')
});

module.exports = router;
