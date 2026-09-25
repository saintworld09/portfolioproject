const express = require("express");

const {
    getAboutContent,

    getAboutProcess,
    createAboutProcess,
    updateAboutProcess,
    deleteAboutProcess,

    getAboutSkills,
    createAboutSkill,
    updateAboutSkill,
    deleteAboutSkill,

    getAboutFocus,
    createAboutFocus,
    updateAboutFocus,
    deleteAboutFocus,
} = require("../controllers/aboutController");

const {
    authenticateToken,
    authorizeAdmin,
} = require("../middleware/authMiddleware");

const uploadAboutIcon = require("../middleware/aboutUpload");

const router = express.Router();

// =========================================================
// PUBLIC ABOUT CONTENT
// =========================================================

// Get public About content for a specific portfolio
//
// Expected request:
// GET /api/about?portfolioSlug=example-slug
//
// The controller uses portfolioSlug to identify the
// portfolio owner and returns only that user's content.
router.get(
    "/",
    getAboutContent
);

// =========================================================
// ABOUT PROCESS
// =========================================================

// Get the logged-in admin's Process items
router.get(
    "/process",
    authenticateToken,
    authorizeAdmin,
    getAboutProcess
);

// Create Process item
router.post(
    "/process",
    authenticateToken,
    authorizeAdmin,
    uploadAboutIcon.single("icon"),
    createAboutProcess
);

// Update Process item
router.put(
    "/process/:id",
    authenticateToken,
    authorizeAdmin,
    uploadAboutIcon.single("icon"),
    updateAboutProcess
);

// Delete Process item
router.delete(
    "/process/:id",
    authenticateToken,
    authorizeAdmin,
    deleteAboutProcess
);

// =========================================================
// ABOUT SKILLS
// =========================================================

// Get the logged-in admin's Skills
router.get(
    "/skills",
    authenticateToken,
    authorizeAdmin,
    getAboutSkills
);

// Create Skill item
router.post(
    "/skills",
    authenticateToken,
    authorizeAdmin,
    uploadAboutIcon.single("icon"),
    createAboutSkill
);

// Update Skill item
router.put(
    "/skills/:id",
    authenticateToken,
    authorizeAdmin,
    uploadAboutIcon.single("icon"),
    updateAboutSkill
);

// Delete Skill item
router.delete(
    "/skills/:id",
    authenticateToken,
    authorizeAdmin,
    deleteAboutSkill
);

// =========================================================
// ABOUT FOCUS
// =========================================================

// Get the logged-in admin's Focus items
router.get(
    "/focus",
    authenticateToken,
    authorizeAdmin,
    getAboutFocus
);

// Create Focus item
router.post(
    "/focus",
    authenticateToken,
    authorizeAdmin,
    uploadAboutIcon.single("icon"),
    createAboutFocus
);

// Update Focus item
router.put(
    "/focus/:id",
    authenticateToken,
    authorizeAdmin,
    uploadAboutIcon.single("icon"),
    updateAboutFocus
);

// Delete Focus item
router.delete(
    "/focus/:id",
    authenticateToken,
    authorizeAdmin,
    deleteAboutFocus
);

module.exports = router;