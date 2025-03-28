const express = require("express");
const path = require("path");
const router = express.Router();
const { redirectIfAuthenticated, requireAuth } = require('../middlewares/authMiddleware')

router.get("/", (req, res) => {
  res.render('index')
});

router.get("/signIn", redirectIfAuthenticated, (req, res) => {
  res.render('signIn')
});

router.get("/signUp", redirectIfAuthenticated, (req, res) => {
  res.render('signUp')
});

router.get("/profile", requireAuth, (req, res) => {
  res.render('profile')
});

module.exports = router;
