// routes/firebase.routes.js
const express = require("express");
const router = express.Router();

const { firebaseLogin } = require("../controllers/firebaseLogin");

router.post("/login", firebaseLogin);

module.exports = router;