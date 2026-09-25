const prisma = require("../prisma");
const fs = require("fs");
const path = require("path");

// ========================================
// HELPER — GET AUTHENTICATED USER ID
// ========================================

const getAuthenticatedUserId = (req) => {
    const userId = Number(req.user?.userId);

    if (
        !req.user ||
        !Number.isInteger(userId) ||
        userId <= 0
    ) {
        return null;
    }

    return userId;
};

// ========================================
// HELPER — DELETE PROFILE IMAGE
// ========================================

const deleteProfileImage = (imageUrl) => {
    if (!imageUrl) {
        return;
    }

    const fileName = path.basename(imageUrl);

    const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        "profile",
        fileName
    );

    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error(
            "Error deleting profile image:",
            error
        );
    }
};

// ========================================
// GET PUBLIC PROFILE BY PORTFOLIO SLUG
// ========================================
//
// Example:
//
// GET /api/profile/babatunde
//
// Public endpoint.
//
// The portfolio slug belongs to User.
// We retrieve that user's Profile.
//
// ========================================

const getProfile = async (req, res) => {
    try {
        const { portfolioSlug } = req.params;

        if (
            !portfolioSlug ||
            !portfolioSlug.trim()
        ) {
            return res.status(400).json({
                message:
                    "Portfolio slug is required",
            });
        }

        const normalizedSlug =
            portfolioSlug.trim().toLowerCase();

        // ----------------------------------------
        // FIND USER BY PORTFOLIO SLUG
        // ----------------------------------------

        const user =
            await prisma.user.findUnique({
                where: {
                    portfolioSlug:
                        normalizedSlug,
                },

                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    portfolioSlug: true,

                    profile: true,
                },
            });

        if (!user) {
            return res.status(404).json({
                message:
                    "Portfolio not found",
            });
        }

        // ----------------------------------------
        // CHECK PROFILE
        // ----------------------------------------

        if (!user.profile) {
            return res.status(404).json({
                message:
                    "Profile not found",
            });
        }

        // ----------------------------------------
        // RETURN PROFILE
        // ----------------------------------------

        return res.status(200).json({
            profile: user.profile,

            portfolio: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                portfolioSlug:
                    user.portfolioSlug,
            },
        });
    } catch (error) {
        console.error(
            "Error fetching public profile:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch profile",
        });
    }
};

// ========================================
// GET AUTHENTICATED USER PROFILE
// ========================================
//
// Protected endpoint.
//
// GET /api/profile/me
//
// The authenticated user's ID comes from
// the JWT.
//
// This prevents one admin from seeing
// another admin's profile.
//
// ========================================

const getMyProfile = async (req, res) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        // ----------------------------------------
        // FIND PROFILE BELONGING TO USER
        // ----------------------------------------

        const profile =
            await prisma.profile.findUnique({
                where: {
                    userId,
                },
            });

        // ----------------------------------------
        // PROFILE DOES NOT EXIST
        // ----------------------------------------

        if (!profile) {
            return res.status(404).json({
                message:
                    "Profile not found",
            });
        }

        // ----------------------------------------
        // RETURN PROFILE
        // ----------------------------------------

        return res.status(200).json({
            profile,
        });
    } catch (error) {
        console.error(
            "Error fetching authenticated profile:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch profile",
        });
    }
};

// ========================================
// CREATE PROFILE
// ========================================
//
// Protected endpoint.
//
// POST /api/profile
//
// The user ID ALWAYS comes from the JWT.
//
// It must NOT come from req.body.
//
// ========================================

const createProfile = async (req, res) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const {
            fullName,
            headline,
            bio,
            location,
            email,
            phone,
            resumeUrl,
            linkedinUrl,
        } = req.body;

        // ----------------------------------------
        // VALIDATION
        // ----------------------------------------

        if (
            !fullName ||
            !fullName.trim() ||
            !headline ||
            !headline.trim() ||
            !bio ||
            !bio.trim()
        ) {
            return res.status(400).json({
                message:
                    "Full name, headline, and bio are required",
            });
        }

        // ----------------------------------------
        // CHECK AUTHENTICATED USER
        // ----------------------------------------

        const user =
            await prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });

        if (!user) {
            return res.status(404).json({
                message:
                    "Authenticated user not found",
            });
        }

        // ----------------------------------------
        // CHECK EXISTING PROFILE
        // ----------------------------------------

        const existingProfile =
            await prisma.profile.findUnique({
                where: {
                    userId,
                },
            });

        if (existingProfile) {
            return res.status(409).json({
                message:
                    "Profile already exists for this user",
            });
        }

        // ----------------------------------------
        // GET UPLOADED IMAGE
        // ----------------------------------------

        const profileImage = req.file
            ? `/uploads/profile/${req.file.filename}`
            : null;

        // ----------------------------------------
        // CREATE PROFILE
        // ----------------------------------------

        const profile =
            await prisma.profile.create({
                data: {
                    fullName:
                        fullName.trim(),

                    headline:
                        headline.trim(),

                    bio:
                        bio.trim(),

                    location:
                        location?.trim() || null,

                    email:
                        email?.trim() || null,

                    phone:
                        phone?.trim() || null,

                    profileImage,

                    resumeUrl:
                        resumeUrl?.trim() || null,

                    linkedinUrl:
                        linkedinUrl?.trim() || null,

                    userId,
                },
            });

        return res.status(201).json({
            message:
                "Profile created successfully",

            profile,
        });
    } catch (error) {
        console.error(
            "Error creating profile:",
            error
        );

        // ----------------------------------------
        // DELETE UPLOADED IMAGE IF CREATE FAILED
        // ----------------------------------------

        if (req.file) {
            deleteProfileImage(
                `/uploads/profile/${req.file.filename}`
            );
        }

        // ----------------------------------------
        // HANDLE UNIQUE CONSTRAINT
        // ----------------------------------------

        if (error.code === "P2002") {
            return res.status(409).json({
                message:
                    "Profile already exists for this user",
            });
        }

        return res.status(500).json({
            message:
                "Failed to create profile",
        });
    }
};

// ========================================
// UPDATE PROFILE
// ========================================
//
// Protected endpoint.
//
// PUT /api/profile/:id
//
// The profile must belong to the
// authenticated user.
//
// ========================================

const updateProfile = async (req, res) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const profileId =
            Number(req.params.id);

        // ----------------------------------------
        // VALIDATE PROFILE ID
        // ----------------------------------------

        if (
            !Number.isInteger(profileId) ||
            profileId <= 0
        ) {
            if (req.file) {
                deleteProfileImage(
                    `/uploads/profile/${req.file.filename}`
                );
            }

            return res.status(400).json({
                message:
                    "Invalid profile ID",
            });
        }

        const {
            fullName,
            headline,
            bio,
            location,
            email,
            phone,
            resumeUrl,
            linkedinUrl,
        } = req.body;

        // ----------------------------------------
        // FIND PROFILE
        // ----------------------------------------

        const existingProfile =
            await prisma.profile.findUnique({
                where: {
                    id: profileId,
                },
            });

        if (!existingProfile) {
            if (req.file) {
                deleteProfileImage(
                    `/uploads/profile/${req.file.filename}`
                );
            }

            return res.status(404).json({
                message:
                    "Profile not found",
            });
        }

        // ----------------------------------------
        // OWNERSHIP CHECK
        // ----------------------------------------

        if (
            existingProfile.userId !== userId
        ) {
            if (req.file) {
                deleteProfileImage(
                    `/uploads/profile/${req.file.filename}`
                );
            }

            return res.status(403).json({
                message:
                    "You do not have permission to update this profile",
            });
        }

        // ----------------------------------------
        // VALIDATION
        // ----------------------------------------

        if (
            !fullName ||
            !fullName.trim() ||
            !headline ||
            !headline.trim() ||
            !bio ||
            !bio.trim()
        ) {
            if (req.file) {
                deleteProfileImage(
                    `/uploads/profile/${req.file.filename}`
                );
            }

            return res.status(400).json({
                message:
                    "Full name, headline, and bio are required",
            });
        }

        // ----------------------------------------
        // DETERMINE PROFILE IMAGE
        // ----------------------------------------

        let profileImage =
            existingProfile.profileImage;

        if (req.file) {
            profileImage =
                `/uploads/profile/${req.file.filename}`;
        }

        // ----------------------------------------
        // UPDATE PROFILE
        // ----------------------------------------

        const updatedProfile =
            await prisma.profile.update({
                where: {
                    id: profileId,
                },

                data: {
                    fullName:
                        fullName.trim(),

                    headline:
                        headline.trim(),

                    bio:
                        bio.trim(),

                    location:
                        location?.trim() || null,

                    email:
                        email?.trim() || null,

                    phone:
                        phone?.trim() || null,

                    profileImage,

                    resumeUrl:
                        resumeUrl?.trim() || null,

                    linkedinUrl:
                        linkedinUrl?.trim() || null,
                },
            });

        // ----------------------------------------
        // DELETE OLD IMAGE
        // ----------------------------------------

        if (
            req.file &&
            existingProfile.profileImage
        ) {
            deleteProfileImage(
                existingProfile.profileImage
            );
        }

        // ----------------------------------------
        // RETURN UPDATED PROFILE
        // ----------------------------------------

        return res.status(200).json({
            message:
                "Profile updated successfully",

            profile:
                updatedProfile,
        });
    } catch (error) {
        console.error(
            "Error updating profile:",
            error
        );

        // ----------------------------------------
        // DELETE NEW IMAGE IF UPDATE FAILED
        // ----------------------------------------

        if (req.file) {
            deleteProfileImage(
                `/uploads/profile/${req.file.filename}`
            );
        }

        return res.status(500).json({
            message:
                "Failed to update profile",
        });
    }
};

// ========================================
// EXPORT CONTROLLERS
// ========================================

module.exports = {
    getProfile,
    getMyProfile,
    createProfile,
    updateProfile,
};