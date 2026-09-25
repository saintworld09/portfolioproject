const express = require("express");

const {
getAccomplishments,
createAccomplishment,
updateAccomplishment,
deleteAccomplishment,
} = require("../controllers/accomplishmentController");

const {
authenticateToken,
authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// PUBLIC
// ========================================

router.get(
"/",
getAccomplishments
);

// ========================================
// ADMIN ONLY
// ========================================

router.post(
"/",
authenticateToken,
authorizeAdmin,
createAccomplishment
);

router.put(
"/:id",
authenticateToken,
authorizeAdmin,
updateAccomplishment
);

router.delete(
"/:id",
authenticateToken,
authorizeAdmin,
deleteAccomplishment
);

module.exports = router;
