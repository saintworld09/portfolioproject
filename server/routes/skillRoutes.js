const express = require("express");

const {
    createSkill,
    getMySkills,
    getSkills,
    updateSkill,
    deleteSkill,
} = require("../controllers/skillController");

const {
    authenticateToken,
    authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
=========================================================
PUBLIC
GET SKILLS FOR A SPECIFIC PORTFOLIO
=========================================================

Example:

GET /api/skills?portfolioSlug=user-one

The controller uses portfolioSlug to determine
which user's skills should be returned.
=========================================================
*/

router.get(
    "/",
    getSkills
);

/*
=========================================================
ADMIN
GET AUTHENTICATED USER'S SKILLS
=========================================================
*/

router.get(
    "/me",
    authenticateToken,
    authorizeAdmin,
    getMySkills
);

/*
=========================================================
ADMIN
CREATE SKILL
=========================================================
*/

router.post(
    "/",
    authenticateToken,
    authorizeAdmin,
    createSkill
);

/*
=========================================================
ADMIN
UPDATE SKILL
=========================================================
*/

router.put(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    updateSkill
);

/*
=========================================================
ADMIN
DELETE SKILL
=========================================================
*/

router.delete(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    deleteSkill
);

module.exports = router;