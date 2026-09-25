const express = require("express");

const {
    getSocialLinks,
    getMySocialLinks,
    createSocialLink,
    updateSocialLink,
    deleteSocialLink,
} = require("../controllers/socialLinkController");

const {
    authenticateToken,
    authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
=========================================================
PUBLIC
GET SOCIAL LINKS FOR A SPECIFIC PORTFOLIO
=========================================================

Example:

GET /api/social-links?portfolioSlug=user-one

The controller uses portfolioSlug to determine
which user's social links are returned.
=========================================================
*/

router.get(
    "/",
    getSocialLinks
);

/*
=========================================================
ADMIN
GET AUTHENTICATED USER'S SOCIAL LINKS
=========================================================
*/

router.get(
    "/me",
    authenticateToken,
    authorizeAdmin,
    getMySocialLinks
);

/*
=========================================================
ADMIN
CREATE SOCIAL LINK
=========================================================
*/

router.post(
    "/",
    authenticateToken,
    authorizeAdmin,
    createSocialLink
);

/*
=========================================================
ADMIN
UPDATE SOCIAL LINK
=========================================================
*/

router.put(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    updateSocialLink
);

/*
=========================================================
ADMIN
DELETE SOCIAL LINK
=========================================================
*/

router.delete(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    deleteSocialLink
);

module.exports = router;