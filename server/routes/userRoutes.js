const express = require("express");

const { createUser } = require("../controllers/userController");

const {
    authenticateToken,
    authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/",
    authenticateToken,
    authorizeAdmin,
    createUser
);

module.exports = router;