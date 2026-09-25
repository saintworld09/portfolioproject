const express = require("express");

const {
    getMyExperiences,
    getExperiences,
    createExperience,
    updateExperience,
    deleteExperience,
} = require("../controllers/experienceController");

const {
    authenticateToken,
    authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// GET MY EXPERIENCES
// ========================================
// Protected admin endpoint.
// IMPORTANT:
// Must appear BEFORE /:id.
// ========================================

router.get(
    "/me",
    authenticateToken,
    authorizeAdmin,
    getMyExperiences
);

// ========================================
// GET PUBLIC EXPERIENCES
// ========================================
// Public endpoint.
//
// This is kept for the existing public
// portfolio behavior for now.
//
// Multi-portfolio public filtering will
// be handled through portfolioSlug later.
// ========================================

router.get(
    "/",
    getExperiences
);

// ========================================
// CREATE EXPERIENCE
// ========================================
// Protected
// ========================================

router.post(
    "/",
    authenticateToken,
    authorizeAdmin,
    createExperience
);

// ========================================
// UPDATE EXPERIENCE
// ========================================
// Protected
// Ownership is checked inside controller.
// ========================================

router.put(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    updateExperience
);

// ========================================
// DELETE EXPERIENCE
// ========================================
// Protected
// Ownership is checked inside controller.
// ========================================

router.delete(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    deleteExperience
);

module.exports = router;