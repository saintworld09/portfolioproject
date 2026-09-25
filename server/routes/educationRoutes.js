const express = require("express");

const {
    getMyEducations,
    getEducations,
    createEducation,
    updateEducation,
    deleteEducation,
} = require("../controllers/educationController");

const {
    authenticateToken,
    authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// GET MY EDUCATION
// ========================================
// Protected admin endpoint.
//
// IMPORTANT:
// /me must appear BEFORE /:id.
// ========================================

router.get(
    "/me",
    authenticateToken,
    authorizeAdmin,
    getMyEducations
);

// ========================================
// GET PUBLIC EDUCATION
// ========================================
// Public
//
// Kept for the current public portfolio
// behavior.
//
// Public multi-portfolio filtering will
// later use portfolioSlug.
// ========================================

router.get(
    "/",
    getEducations
);

// ========================================
// CREATE EDUCATION
// ========================================
// Protected
// ========================================

router.post(
    "/",
    authenticateToken,
    authorizeAdmin,
    createEducation
);

// ========================================
// UPDATE EDUCATION
// ========================================
// Protected
// Ownership is checked inside controller.
// ========================================

router.put(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    updateEducation
);

// ========================================
// DELETE EDUCATION
// ========================================
// Protected
// Ownership is checked inside controller.
// ========================================

router.delete(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    deleteEducation
);

module.exports = router;